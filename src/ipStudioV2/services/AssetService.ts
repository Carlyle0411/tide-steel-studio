import type { AssetStatus, AssetType, IPAsset } from "../types";
import {
  IPStudioServiceError,
  assertSupabaseRow,
  raiseOnSupabaseError,
  requireAuthenticatedClient,
  toServiceResult,
} from "./serviceClient";

export interface CreateAssetInput {
  projectId: string;
  assetGroupId?: string | null;
  assetCode: string;
  name: string;
  assetType: AssetType | string;
  tags?: string[];
  consistencyFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ListAssetFilters {
  assetType?: string;
  status?: AssetStatus;
  groupId?: string;
  search?: string;
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

export const AssetService = {
  listAssets: (projectId: string, filters: ListAssetFilters = {}) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      let query = client
        .from("assets")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (filters.assetType) query = query.eq("asset_type", filters.assetType);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.groupId) query = query.eq("asset_group_id", filters.groupId);
      if (filters.search?.trim()) {
        query = query.or(`name.ilike.%${filters.search.trim()}%,asset_code.ilike.%${filters.search.trim()}%`);
      }

      const { data, error } = await query;
      raiseOnSupabaseError(error, "读取资产失败。");
      return (data ?? []) as IPAsset[];
    }),

  createAssetShell: (input: CreateAssetInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      if (!input.assetCode.trim() || !input.name.trim()) {
        throw new IPStudioServiceError("VALIDATION_ERROR", "资产编号和名称不能为空。");
      }

      const organizationId = await getProjectOrganization(input.projectId);
      const { data, error } = await client
        .from("assets")
        .insert({
          organization_id: organizationId,
          project_id: input.projectId,
          asset_group_id: input.assetGroupId ?? null,
          asset_code: input.assetCode.trim(),
          name: input.name.trim(),
          asset_type: input.assetType,
          tags: input.tags ?? [],
          consistency_fields: input.consistencyFields ?? {},
          metadata: input.metadata ?? {},
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建资产失败。");
      return assertSupabaseRow(data) as IPAsset;
    }),

  updateAsset: (assetId: string, patch: Partial<Omit<CreateAssetInput, "projectId"> & { status: AssetStatus }>) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.assetGroupId !== undefined) updatePayload.asset_group_id = patch.assetGroupId;
      if (patch.assetCode !== undefined) updatePayload.asset_code = patch.assetCode.trim();
      if (patch.name !== undefined) updatePayload.name = patch.name.trim();
      if (patch.assetType !== undefined) updatePayload.asset_type = patch.assetType;
      if (patch.status !== undefined) updatePayload.status = patch.status;
      if (patch.tags !== undefined) updatePayload.tags = patch.tags;
      if (patch.consistencyFields !== undefined) updatePayload.consistency_fields = patch.consistencyFields;
      if (patch.metadata !== undefined) updatePayload.metadata = patch.metadata;

      const { data, error } = await client
        .from("assets")
        .update(updatePayload)
        .eq("id", assetId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "更新资产失败。");
      return assertSupabaseRow(data) as IPAsset;
    }),

  softDeleteAsset: (assetId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("assets")
        .update({
          status: "archived",
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", assetId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "删除资产失败。");
      return assertSupabaseRow(data) as IPAsset;
    }),

  setMasterReference: (assetId: string, assetVersionRowId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data: asset, error: assetError } = await client
        .from("assets")
        .select("id, project_id")
        .eq("id", assetId)
        .single();
      raiseOnSupabaseError(assetError, "读取资产失败。");
      const savedAsset = assertSupabaseRow(asset);

      const { error: resetError } = await client
        .from("asset_versions")
        .update({ status: "APPROVED", updated_at: new Date().toISOString() })
        .eq("asset_table_id", savedAsset.id)
        .eq("project_id", savedAsset.project_id)
        .neq("id", assetVersionRowId);
      raiseOnSupabaseError(resetError, "重置资产版本状态失败。");

      const { error: versionError } = await client
        .from("asset_versions")
        .update({ status: "MASTER_REFERENCE", updated_at: new Date().toISOString() })
        .eq("id", assetVersionRowId);
      raiseOnSupabaseError(versionError, "设置 Master Reference 失败。");

      const { data, error } = await client
        .from("assets")
        .update({
          status: "approved",
          is_master_reference: true,
          master_version_id: assetVersionRowId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assetId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "更新资产 Master Reference 失败。");
      return assertSupabaseRow(data) as IPAsset;
    }),

  linkAssets: (projectId: string, sourceAssetId: string, targetAssetId: string, relationType: string, note?: string) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const organizationId = await getProjectOrganization(projectId);

      const { data, error } = await client
        .from("asset_relations")
        .upsert(
          {
            organization_id: organizationId,
            project_id: projectId,
            source_asset_id: sourceAssetId,
            target_asset_id: targetAssetId,
            relation_type: relationType,
            note: note ?? null,
            created_by: user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "source_asset_id,target_asset_id,relation_type" }
        )
        .select("*")
        .single();

      raiseOnSupabaseError(error, "保存资产关系失败。");
      return assertSupabaseRow(data);
    }),
};
