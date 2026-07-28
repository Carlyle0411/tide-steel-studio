import type { IPBible } from "../types";
import { assertSupabaseRow, raiseOnSupabaseError, requireAuthenticatedClient, toServiceResult } from "./serviceClient";

export interface SaveIPBibleInput {
  rawMarkdown: string;
  worldRules?: Record<string, unknown>;
  visualRules?: Record<string, unknown>;
  characterRules?: Record<string, unknown>;
  sceneRules?: Record<string, unknown>;
  forbiddenRules?: Record<string, unknown>;
}

async function getProjectOrganization(projectId: string): Promise<string> {
  const { client } = await requireAuthenticatedClient();
  const { data, error } = await client
    .from("projects")
    .select("organization_id")
    .eq("id", projectId)
    .single();

  raiseOnSupabaseError(error, "读取项目所属工作空间失败。");
  return assertSupabaseRow(data).organization_id;
}

export const IpBibleService = {
  getIPBible: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("ip_bibles")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .maybeSingle();

      raiseOnSupabaseError(error, "读取 IP 圣经失败。");
      return data as IPBible | null;
    }),

  saveIPBible: (projectId: string, input: SaveIPBibleInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const organizationId = await getProjectOrganization(projectId);

      const { data, error } = await client
        .from("ip_bibles")
        .upsert(
          {
            organization_id: organizationId,
            project_id: projectId,
            raw_markdown: input.rawMarkdown,
            world_rules: input.worldRules ?? {},
            visual_rules: input.visualRules ?? {},
            character_rules: input.characterRules ?? {},
            scene_rules: input.sceneRules ?? {},
            forbidden_rules: input.forbiddenRules ?? {},
            created_by: user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "project_id" }
        )
        .select("*")
        .single();

      raiseOnSupabaseError(error, "保存 IP 圣经失败。");
      return assertSupabaseRow(data) as IPBible;
    }),

  buildPromptContext: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("ip_bibles")
        .select("raw_markdown, world_rules, visual_rules, character_rules, scene_rules, forbidden_rules")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .maybeSingle();

      raiseOnSupabaseError(error, "读取 Prompt 上下文失败。");

      if (!data) {
        return {
          systemContext: "",
          sections: {},
        };
      }

      return {
        systemContext: [
          "【IP圣经】",
          data.raw_markdown,
          "【视觉规则】",
          JSON.stringify(data.visual_rules ?? {}),
          "【角色规则】",
          JSON.stringify(data.character_rules ?? {}),
          "【场景规则】",
          JSON.stringify(data.scene_rules ?? {}),
          "【禁止项】",
          JSON.stringify(data.forbidden_rules ?? {}),
        ]
          .filter(Boolean)
          .join("\n"),
        sections: data,
      };
    }),
};
