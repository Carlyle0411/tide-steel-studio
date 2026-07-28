import type { Episode, Scene, Shot } from "../types";
import {
  IPStudioServiceError,
  assertSupabaseRow,
  raiseOnSupabaseError,
  requireAuthenticatedClient,
  toServiceResult,
} from "./serviceClient";

export interface CreateEpisodeInput {
  projectId: string;
  episodeCode: string;
  title: string;
  logline?: string;
  synopsis?: string;
  sortOrder?: number;
}

export interface CreateSceneInput {
  projectId: string;
  episodeId: string;
  sceneCode: string;
  title: string;
  description?: string;
  location?: string;
  timeOfDay?: string;
  sortOrder?: number;
}

export interface CreateShotInput {
  projectId: string;
  episodeId?: string | null;
  sceneId?: string | null;
  storyboardId?: string | null;
  shotCode: string;
  title: string;
  description?: string;
  dialogue?: string;
  voiceOver?: string;
  durationSeconds?: number;
  lens?: string;
  cameraAngle?: string;
  cameraMovement?: string;
  composition?: string;
  lighting?: string;
  emotion?: string;
  imagePrompt?: string;
  videoPrompt?: string;
  sortOrder?: number;
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

export const StoryboardService = {
  listEpisodes: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("episodes")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      raiseOnSupabaseError(error, "读取分集失败。");
      return (data ?? []) as Episode[];
    }),

  createEpisode: (input: CreateEpisodeInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      if (!input.episodeCode.trim() || !input.title.trim()) {
        throw new IPStudioServiceError("VALIDATION_ERROR", "集编号和标题不能为空。");
      }

      const organizationId = await getProjectOrganization(input.projectId);
      const { data, error } = await client
        .from("episodes")
        .insert({
          organization_id: organizationId,
          project_id: input.projectId,
          episode_code: input.episodeCode.trim(),
          title: input.title.trim(),
          logline: input.logline ?? null,
          synopsis: input.synopsis ?? null,
          sort_order: input.sortOrder ?? 0,
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建分集失败。");
      return assertSupabaseRow(data) as Episode;
    }),

  listScenes: (episodeId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("scenes")
        .select("*")
        .eq("episode_id", episodeId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      raiseOnSupabaseError(error, "读取场次失败。");
      return (data ?? []) as Scene[];
    }),

  createScene: (input: CreateSceneInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const organizationId = await getProjectOrganization(input.projectId);
      const { data, error } = await client
        .from("scenes")
        .insert({
          organization_id: organizationId,
          project_id: input.projectId,
          episode_id: input.episodeId,
          scene_code: input.sceneCode.trim(),
          title: input.title.trim(),
          description: input.description ?? null,
          location: input.location ?? null,
          time_of_day: input.timeOfDay ?? null,
          sort_order: input.sortOrder ?? 0,
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建场次失败。");
      return assertSupabaseRow(data) as Scene;
    }),

  listShots: (projectId: string, episodeId?: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      let query = client
        .from("shots")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (episodeId) query = query.eq("episode_id", episodeId);

      const { data, error } = await query;
      raiseOnSupabaseError(error, "读取 Shot 失败。");
      return (data ?? []) as Shot[];
    }),

  createShot: (input: CreateShotInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      if (!input.shotCode.trim() || !input.title.trim()) {
        throw new IPStudioServiceError("VALIDATION_ERROR", "Shot 编号和标题不能为空。");
      }

      const organizationId = await getProjectOrganization(input.projectId);
      const { data, error } = await client
        .from("shots")
        .insert({
          organization_id: organizationId,
          project_id: input.projectId,
          episode_id: input.episodeId ?? null,
          scene_id: input.sceneId ?? null,
          storyboard_id: input.storyboardId ?? null,
          shot_code: input.shotCode.trim(),
          title: input.title.trim(),
          description: input.description ?? null,
          dialogue: input.dialogue ?? null,
          voice_over: input.voiceOver ?? null,
          duration_seconds: input.durationSeconds ?? null,
          lens: input.lens ?? null,
          camera_angle: input.cameraAngle ?? null,
          camera_movement: input.cameraMovement ?? null,
          composition: input.composition ?? null,
          lighting: input.lighting ?? null,
          emotion: input.emotion ?? null,
          image_prompt: input.imagePrompt ?? null,
          video_prompt: input.videoPrompt ?? null,
          sort_order: input.sortOrder ?? 0,
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建 Shot 失败。");
      return assertSupabaseRow(data) as Shot;
    }),

  updateShot: (shotId: string, patch: Partial<CreateShotInput> & { status?: string }) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.title !== undefined) updatePayload.title = patch.title.trim();
      if (patch.description !== undefined) updatePayload.description = patch.description;
      if (patch.dialogue !== undefined) updatePayload.dialogue = patch.dialogue;
      if (patch.voiceOver !== undefined) updatePayload.voice_over = patch.voiceOver;
      if (patch.durationSeconds !== undefined) updatePayload.duration_seconds = patch.durationSeconds;
      if (patch.lens !== undefined) updatePayload.lens = patch.lens;
      if (patch.cameraAngle !== undefined) updatePayload.camera_angle = patch.cameraAngle;
      if (patch.cameraMovement !== undefined) updatePayload.camera_movement = patch.cameraMovement;
      if (patch.composition !== undefined) updatePayload.composition = patch.composition;
      if (patch.lighting !== undefined) updatePayload.lighting = patch.lighting;
      if (patch.emotion !== undefined) updatePayload.emotion = patch.emotion;
      if (patch.imagePrompt !== undefined) updatePayload.image_prompt = patch.imagePrompt;
      if (patch.videoPrompt !== undefined) updatePayload.video_prompt = patch.videoPrompt;
      if (patch.sortOrder !== undefined) updatePayload.sort_order = patch.sortOrder;
      if (patch.status !== undefined) updatePayload.status = patch.status;

      const { data, error } = await client
        .from("shots")
        .update(updatePayload)
        .eq("id", shotId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "更新 Shot 失败。");
      return assertSupabaseRow(data) as Shot;
    }),

  bindAssetToShot: (projectId: string, shotId: string, assetId: string, assetRole = "reference") =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const organizationId = await getProjectOrganization(projectId);
      const { data, error } = await client
        .from("shot_assets")
        .upsert(
          {
            organization_id: organizationId,
            project_id: projectId,
            shot_id: shotId,
            asset_id: assetId,
            asset_role: assetRole,
            created_by: user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "shot_id,asset_id,asset_role" }
        )
        .select("*")
        .single();

      raiseOnSupabaseError(error, "绑定 Shot 资产失败。");
      return assertSupabaseRow(data);
    }),
};
