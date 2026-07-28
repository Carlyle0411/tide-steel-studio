import type { GenerationTask, TaskStatus, TaskType } from "../types";
import {
  IPStudioServiceError,
  assertSupabaseRow,
  raiseOnSupabaseError,
  requireAuthenticatedClient,
  toServiceResult,
} from "./serviceClient";

export interface CreateGenerationTaskInput {
  projectId: string;
  taskName: string;
  taskType: TaskType;
  assetId?: string | null;
  shotId?: string | null;
  prompt?: string;
  negativePrompt?: string;
  referenceAssetIds?: string[];
  modelProvider?: string;
  modelName?: string;
  modelParams?: Record<string, unknown>;
  estimatedCost?: number;
  idempotencyKey?: string;
}

async function getProjectOrganization(projectId: string): Promise<string> {
  const { client } = await requireAuthenticatedClient();
  const { data, error } = await client
    .from("projects")
    .select("organization_id")
    .eq("id", projectId)
    .single();

  raiseOnSupabaseError(error, "读取项目失败。");
  return assertSupabaseRow(data).organization_id;
}

export const TaskService = {
  listTasks: (projectId: string, status?: TaskStatus) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      let query = client
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      raiseOnSupabaseError(error, "读取任务列表失败。");
      return (data ?? []) as GenerationTask[];
    }),

  createTask: (input: CreateGenerationTaskInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      if (!input.taskName.trim()) {
        throw new IPStudioServiceError("VALIDATION_ERROR", "任务名称不能为空。");
      }

      if (!input.modelProvider) {
        throw new IPStudioServiceError(
          "PROVIDER_NOT_CONFIGURED",
          "当前任务没有配置模型服务。请先在集成设置中配置服务，再创建生成任务。"
        );
      }

      const organizationId = await getProjectOrganization(input.projectId);
      const { data, error } = await client
        .from("tasks")
        .insert({
          organization_id: organizationId,
          project_id: input.projectId,
          asset_id: input.assetId ?? null,
          shot_id: input.shotId ?? null,
          task_name: input.taskName.trim(),
          task_type: input.taskType,
          status: "draft",
          progress: 0,
          input_prompt: input.prompt ?? null,
          negative_prompt: input.negativePrompt ?? null,
          reference_asset_ids: input.referenceAssetIds ?? [],
          model_provider: input.modelProvider,
          model_name: input.modelName ?? null,
          model_params: input.modelParams ?? {},
          estimated_cost: input.estimatedCost ?? 0,
          idempotency_key: input.idempotencyKey ?? null,
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建任务失败。");
      return assertSupabaseRow(data) as GenerationTask;
    }),

  updateTaskStatus: (taskId: string, status: TaskStatus, patch: { progress?: number; errorMessage?: string } = {}) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const now = new Date().toISOString();
      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: now,
      };

      if (patch.progress !== undefined) updatePayload.progress = patch.progress;
      if (patch.errorMessage !== undefined) updatePayload.error_message = patch.errorMessage;
      if (status === "processing") updatePayload.started_at = now;
      if (status === "succeeded" || status === "failed" || status === "approved" || status === "rejected") {
        updatePayload.completed_at = now;
      }
      if (status === "cancelled") updatePayload.cancelled_at = now;

      const { data, error } = await client
        .from("tasks")
        .update(updatePayload)
        .eq("id", taskId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "更新任务状态失败。");
      return assertSupabaseRow(data) as GenerationTask;
    }),

  retryTask: (taskId: string) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const { data: original, error: originalError } = await client
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      raiseOnSupabaseError(originalError, "读取原任务失败。");
      const originalTask = assertSupabaseRow(original) as GenerationTask;

      const { data, error } = await client
        .from("tasks")
        .insert({
          organization_id: originalTask.organization_id,
          project_id: originalTask.project_id,
          parent_task_id: originalTask.id,
          asset_id: originalTask.asset_id,
          shot_id: originalTask.shot_id,
          task_name: `${originalTask.task_name} / Retry ${originalTask.attempt + 1}`,
          task_type: originalTask.task_type,
          status: "draft",
          progress: 0,
          input_prompt: originalTask.input_prompt,
          negative_prompt: originalTask.negative_prompt,
          reference_asset_ids: originalTask.reference_asset_ids,
          model_provider: originalTask.model_provider,
          model_name: originalTask.model_name,
          model_params: originalTask.model_params,
          estimated_cost: originalTask.estimated_cost,
          attempt: originalTask.attempt + 1,
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "重试任务创建失败。");
      return assertSupabaseRow(data) as GenerationTask;
    }),

  cancelTask: (taskId: string) => TaskService.updateTaskStatus(taskId, "cancelled", { progress: 0 }),
};
