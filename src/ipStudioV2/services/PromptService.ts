import type { PromptTemplate } from "../types";
import {
  IPStudioServiceError,
  assertSupabaseRow,
  nextVersionLabel,
  raiseOnSupabaseError,
  requireAuthenticatedClient,
  toServiceResult,
} from "./serviceClient";

export interface CreatePromptInput {
  projectId: string;
  assetId?: string | null;
  shotId?: string | null;
  name: string;
  promptType: string;
  model?: string | null;
  body: string;
  negativePrompt?: string;
  variables?: Record<string, unknown>;
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

export function renderPromptVariables(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
    const value = key.split(".").reduce<unknown>((current, segment) => {
      if (current && typeof current === "object" && segment in current) {
        return (current as Record<string, unknown>)[segment];
      }
      return undefined;
    }, variables);

    return value === undefined || value === null ? "" : String(value);
  });
}

export const PromptService = {
  listPrompts: (projectId: string, promptType?: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      let query = client
        .from("prompts")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (promptType) {
        query = query.eq("prompt_type", promptType);
      }

      const { data, error } = await query;
      raiseOnSupabaseError(error, "读取 Prompt 失败。");
      return (data ?? []) as PromptTemplate[];
    }),

  createPrompt: (input: CreatePromptInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      if (!input.name.trim() || !input.body.trim()) {
        throw new IPStudioServiceError("VALIDATION_ERROR", "Prompt 名称和正文不能为空。");
      }

      const organizationId = await getProjectOrganization(input.projectId);
      const { data, error } = await client
        .from("prompts")
        .insert({
          organization_id: organizationId,
          project_id: input.projectId,
          asset_id: input.assetId ?? null,
          shot_id: input.shotId ?? null,
          name: input.name.trim(),
          prompt_type: input.promptType,
          model: input.model ?? null,
          body: input.body,
          negative_prompt: input.negativePrompt ?? "",
          variables: input.variables ?? {},
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建 Prompt 失败。");
      const prompt = assertSupabaseRow(data) as PromptTemplate;

      const { error: versionError } = await client.from("prompt_versions").insert({
        organization_id: organizationId,
        project_id: input.projectId,
        prompt_id: prompt.id,
        version: "V001",
        body: prompt.body,
        negative_prompt: prompt.negative_prompt,
        change_reason: "初始版本",
        created_by: user.id,
      });
      raiseOnSupabaseError(versionError, "保存 Prompt 初始版本失败。");

      return prompt;
    }),

  updatePrompt: (promptId: string, patch: Partial<CreatePromptInput> & { changeReason?: string }) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const { data: current, error: currentError } = await client
        .from("prompts")
        .select("*")
        .eq("id", promptId)
        .single();
      raiseOnSupabaseError(currentError, "读取 Prompt 失败。");
      const savedPrompt = assertSupabaseRow(current) as PromptTemplate;

      const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.name !== undefined) updatePayload.name = patch.name.trim();
      if (patch.promptType !== undefined) updatePayload.prompt_type = patch.promptType;
      if (patch.model !== undefined) updatePayload.model = patch.model;
      if (patch.body !== undefined) updatePayload.body = patch.body;
      if (patch.negativePrompt !== undefined) updatePayload.negative_prompt = patch.negativePrompt;
      if (patch.variables !== undefined) updatePayload.variables = patch.variables;

      const { data, error } = await client
        .from("prompts")
        .update(updatePayload)
        .eq("id", promptId)
        .select("*")
        .single();
      raiseOnSupabaseError(error, "更新 Prompt 失败。");

      const { count, error: countError } = await client
        .from("prompt_versions")
        .select("id", { count: "exact", head: true })
        .eq("prompt_id", promptId);
      raiseOnSupabaseError(countError, "读取 Prompt 版本数量失败。");

      const updatedPrompt = assertSupabaseRow(data) as PromptTemplate;
      const { error: versionError } = await client.from("prompt_versions").insert({
        organization_id: savedPrompt.organization_id,
        project_id: savedPrompt.project_id,
        prompt_id: promptId,
        version: nextVersionLabel(count ?? 0),
        body: updatedPrompt.body,
        negative_prompt: updatedPrompt.negative_prompt,
        change_reason: patch.changeReason ?? "编辑 Prompt",
        created_by: user.id,
      });
      raiseOnSupabaseError(versionError, "保存 Prompt 新版本失败。");

      return updatedPrompt;
    }),

  renderPrompt: (promptId: string, variables: Record<string, unknown>) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("prompts")
        .select("*")
        .eq("id", promptId)
        .single();
      raiseOnSupabaseError(error, "读取 Prompt 失败。");

      const prompt = assertSupabaseRow(data) as PromptTemplate;
      return {
        prompt,
        finalPrompt: renderPromptVariables(prompt.body, {
          ...(prompt.variables ?? {}),
          ...variables,
        }),
        negativePrompt: renderPromptVariables(prompt.negative_prompt, variables),
      };
    }),
};
