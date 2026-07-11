import { AssetType, MediaAsset } from "../types";
import { deleteAsset, getAllAssets, getAllGroups, saveAsset } from "./idb";

const validTypes: AssetType[] = ["image", "video", "audio"];

export type RepairReport = {
  checked: number;
  broken: number;
  repaired: number;
  deleted: number;
  message: string;
};

export function isBrokenAsset(asset: any) {
  if (!asset || typeof asset !== "object") return true;
  if (!asset.id || !asset.projectId) return true;
  if (!validTypes.includes(asset.type)) return true;
  if (!Array.isArray(asset.groupIds) && !Array.isArray(asset.groups)) return true;
  if (!Array.isArray(asset.tags)) return true;
  if (Number.isNaN(new Date(asset.createdAt ?? asset.uploadedAt).getTime())) return true;
  if (asset.fileBlob && !(asset.fileBlob instanceof Blob)) return true;
  if (asset.thumbUrl && typeof asset.thumbUrl !== "string") return true;
  return false;
}

export async function findBrokenAssets(projectId?: string) {
  const assets = await getAllAssets();
  return assets.filter((asset) => (!projectId || asset.projectId === projectId) && isBrokenAsset(asset));
}

export async function repairBrokenAssets(projectId?: string): Promise<RepairReport> {
  const assets = await getAllAssets();
  const groups = await getAllGroups();
  let repaired = 0;
  let broken = 0;
  const now = new Date().toISOString();
  for (const raw of assets as any[]) {
    if (projectId && raw.projectId !== projectId) continue;
    const wasBroken = isBrokenAsset(raw);
    if (wasBroken) broken += 1;
    if (!raw?.id) continue;
    const projectGroups = groups.filter((group) => group.projectId === raw.projectId);
    const validGroupIds = new Set(projectGroups.map((group) => group.id));
    const groupIds = Array.isArray(raw.groupIds) ? raw.groupIds : Array.isArray(raw.groups) ? raw.groups : [];
    const cleanGroupIds = Array.from(new Set(groupIds.filter((id: string) => validGroupIds.has(id))));
    const type: AssetType = validTypes.includes(raw.type) ? raw.type : "image";
    const fixed: MediaAsset = {
      id: raw.id,
      projectId: raw.projectId || "__recovered__",
      name: raw.name || "已修复素材",
      type,
      dataUrl: typeof raw.dataUrl === "string" ? raw.dataUrl : undefined,
      fileBlob: raw.fileBlob instanceof Blob ? raw.fileBlob : undefined,
      objectUrl: undefined,
      thumbUrl: typeof raw.thumbUrl === "string" ? raw.thumbUrl : "",
      duration: Number.isFinite(raw.duration) ? raw.duration : undefined,
      width: Number.isFinite(raw.width) ? raw.width : undefined,
      height: Number.isFinite(raw.height) ? raw.height : undefined,
      size: Number.isFinite(raw.size) ? raw.size : raw.fileBlob?.size ?? 0,
      groupIds: cleanGroupIds,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      note: typeof raw.note === "string" ? raw.note : "",
      usageType: raw.usageType || "风格参考",
      linkedCharacterIds: Array.isArray(raw.linkedCharacterIds) ? raw.linkedCharacterIds : [],
      favorite: Boolean(raw.favorite),
      createdAt: Number.isNaN(new Date(raw.createdAt).getTime()) ? now : raw.createdAt,
      updatedAt: now,
      uploadedAt: Number.isNaN(new Date(raw.uploadedAt).getTime()) ? now : raw.uploadedAt,
      lastUsedAt: raw.lastUsedAt
    };
    if (wasBroken || cleanGroupIds.length !== groupIds.length) {
      await saveAsset(fixed);
      repaired += 1;
    }
  }
  return { checked: assets.length, broken, repaired, deleted: 0, message: `检查 ${assets.length} 个素材，发现 ${broken} 个异常，修复 ${repaired} 个。` };
}

export async function deleteBrokenAssets(projectId?: string): Promise<RepairReport> {
  const broken = await findBrokenAssets(projectId);
  await Promise.all(broken.filter((asset) => asset.id).map((asset) => deleteAsset(asset.id)));
  return { checked: broken.length, broken: broken.length, repaired: 0, deleted: broken.length, message: `已删除 ${broken.length} 个损坏素材。` };
}

export async function cleanRecentUploadedAssets(limit: number, projectId?: string): Promise<RepairReport> {
  const assets = await getAllAssets();
  const recent = assets
    .filter((asset) => !projectId || asset.projectId === projectId)
    .sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""))
    .slice(0, limit);
  await Promise.all(recent.map((asset) => deleteAsset(asset.id)));
  return { checked: recent.length, broken: 0, repaired: 0, deleted: recent.length, message: `已清理最近上传的 ${recent.length} 个素材。` };
}

export async function clearCurrentProjectAssets(projectId: string): Promise<RepairReport> {
  const assets = await getAllAssets();
  const scoped = assets.filter((asset) => asset.projectId === projectId);
  await Promise.all(scoped.map((asset) => deleteAsset(asset.id)));
  return { checked: scoped.length, broken: 0, repaired: 0, deleted: scoped.length, message: `已清空当前项目 ${scoped.length} 个素材。` };
}

export async function exportLocalBackup() {
  const [assets, groups] = await Promise.all([getAllAssets(), getAllGroups()]);
  return {
    exportedAt: new Date().toISOString(),
    localStorage: { ...localStorage },
    groups,
    assets: assets.map((asset) => ({
      ...asset,
      fileBlob: asset.fileBlob ? { size: asset.fileBlob.size, type: asset.fileBlob.type } : undefined,
      dataUrl: asset.dataUrl ? "[legacy-data-url-omitted]" : undefined
    }))
  };
}
