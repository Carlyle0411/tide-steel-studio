import type { AssetGroup } from "../types";
import {
  IPStudioServiceError,
  assertSupabaseRow,
  raiseOnSupabaseError,
  requireAuthenticatedClient,
  toServiceResult,
} from "./serviceClient";

export interface CreateAssetGroupInput {
  projectId: string;
  name: string;
  groupType: string;
  description?: string;
  requiredSlots?: unknown[];
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

export const AssetGroupService = {
  listGroups: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("asset_groups")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      raiseOnSupabaseError(error, "读取资产组失败。");
      return (data ?? []) as AssetGroup[];
    }),

  createGroup: (input: CreateAssetGroupInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      if (!input.name.trim()) {
        throw new IPStudioServiceError("VALIDATION_ERROR", "资产组名称不能为空。");
      }

      const organizationId = await getProjectOrganization(input.projectId);
      const { data, error } = await client
        .from("asset_groups")
        .insert({
          organization_id: organizationId,
          project_id: input.projectId,
          name: input.name.trim(),
          group_type: input.groupType,
          description: input.description ?? null,
          required_slots: input.requiredSlots ?? [],
          sort_order: input.sortOrder ?? 0,
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建资产组失败。");
      return assertSupabaseRow(data) as AssetGroup;
    }),

  updateGroup: (groupId: string, patch: Partial<Omit<CreateAssetGroupInput, "projectId">>) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.name !== undefined) updatePayload.name = patch.name.trim();
      if (patch.groupType !== undefined) updatePayload.group_type = patch.groupType;
      if (patch.description !== undefined) updatePayload.description = patch.description;
      if (patch.requiredSlots !== undefined) updatePayload.required_slots = patch.requiredSlots;
      if (patch.sortOrder !== undefined) updatePayload.sort_order = patch.sortOrder;

      const { data, error } = await client
        .from("asset_groups")
        .update(updatePayload)
        .eq("id", groupId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "更新资产组失败。");
      return assertSupabaseRow(data) as AssetGroup;
    }),

  softDeleteGroup: (groupId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("asset_groups")
        .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", groupId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "删除资产组失败。");
      return assertSupabaseRow(data) as AssetGroup;
    }),

  getGroupCompleteness: (groupId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data: group, error: groupError } = await client
        .from("asset_groups")
        .select("required_slots")
        .eq("id", groupId)
        .single();
      raiseOnSupabaseError(groupError, "读取资产组完整度失败。");

      const requiredSlots = (group?.required_slots ?? []) as Array<{ key?: string; name?: string }>;
      const { data: assets, error: assetError } = await client
        .from("assets")
        .select("metadata")
        .eq("asset_group_id", groupId)
        .is("deleted_at", null);
      raiseOnSupabaseError(assetError, "读取资产组资产失败。");

      const filledKeys = new Set(
        (assets ?? [])
          .map((asset) => (asset.metadata as Record<string, unknown> | null)?.slotKey)
          .filter((slotKey): slotKey is string => typeof slotKey === "string")
      );

      const missingSlots = requiredSlots.filter((slot) => slot.key && !filledKeys.has(slot.key));
      return {
        total: requiredSlots.length,
        completed: requiredSlots.length - missingSlots.length,
        missingSlots,
      };
    }),
};
