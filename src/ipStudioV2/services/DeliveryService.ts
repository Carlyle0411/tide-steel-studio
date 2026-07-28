import type { DeliveryManifest } from "../types";
import { assertSupabaseRow, raiseOnSupabaseError, requireAuthenticatedClient, toServiceResult } from "./serviceClient";

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

export const DeliveryService = {
  buildDeliveryManifest: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data: assets, error: assetError } = await client
        .from("assets")
        .select("id, asset_code, name, asset_type, master_version_id")
        .eq("project_id", projectId)
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("asset_code", { ascending: true });

      raiseOnSupabaseError(assetError, "读取已批准资产失败。");

      const { data: shots, error: shotError } = await client
        .from("shots")
        .select("id, shot_code, title, duration_seconds")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      raiseOnSupabaseError(shotError, "读取镜头清单失败。");

      const manifest: DeliveryManifest = {
        projectId,
        generatedAt: new Date().toISOString(),
        approvedAssets: (assets ?? []).map((asset) => ({
          id: asset.id,
          code: asset.asset_code,
          name: asset.name,
          type: asset.asset_type,
          masterVersionId: asset.master_version_id,
        })),
        shots: (shots ?? []).map((shot) => ({
          id: shot.id,
          code: shot.shot_code,
          title: shot.title,
          durationSeconds: shot.duration_seconds,
        })),
      };

      return manifest;
    }),

  createDeliveryPackage: (projectId: string, name: string, packageType = "asset_package") =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const organizationId = await getProjectOrganization(projectId);
      const manifestResult = await DeliveryService.buildDeliveryManifest(projectId);

      if (manifestResult.error || !manifestResult.data) {
        throw new Error(manifestResult.error?.message ?? "生成交付 Manifest 失败。");
      }

      const { data, error } = await client
        .from("delivery_packages")
        .insert({
          organization_id: organizationId,
          project_id: projectId,
          name,
          package_type: packageType,
          status: "draft",
          manifest: manifestResult.data,
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(error, "创建交付包失败。");
      return assertSupabaseRow(data);
    }),
};
