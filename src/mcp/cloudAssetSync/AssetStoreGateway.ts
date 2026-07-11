import {
  addPromptVersion as addLocalPromptVersion,
  approveVersion as approveLocalVersion,
  deleteAssetVersion as deleteLocalAssetVersion,
  deleteAssetVersions as deleteLocalAssetVersions,
  deleteManyAssetVersions as deleteManyLocalAssetVersions,
  importAssetFiles as importLocalAssetFiles,
  loadAssetStore as loadLocalAssetStore,
  markRegenerate as markLocalRegenerate,
  rejectVersion as rejectLocalVersion,
  setMasterVersion as setLocalMasterVersion,
  subscribeManualAssetStore,
  updateChecklist as updateLocalChecklist,
  updateRating as updateLocalRating,
  buildAssetImagePrompt,
  type AssetRating,
  type ConsistencyChecklist,
  type ManualAssetStore,
  type ManualAssetVersion
} from "../manualAssetImport/ManualAssetImport";
import { getMasterAssets, type MasterAsset } from "../masterAssetLibrary/MasterAssetLibraryData";
import {
  addCloudPromptVersion,
  approveCloudVersion,
  deleteCloudAssetVersion,
  deleteCloudAssetVersions,
  deleteManyCloudAssetVersions,
  getCloudSession,
  importCloudAssetFiles,
  isCloudAssetSyncEnabled,
  loadCloudAssetStore,
  markCloudRegenerate,
  rejectCloudVersion,
  setCloudMasterVersion,
  subscribeCloudAssetStore,
  updateCloudChecklist,
  updateCloudRating,
  updateCloudVersionStatus
} from "./CloudAssetRepository";

async function cloudMode() {
  return isCloudAssetSyncEnabled();
}

export async function loadAssetStore(): Promise<ManualAssetStore> {
  return (await cloudMode()) ? loadCloudAssetStore() : loadLocalAssetStore();
}

export function subscribeAssetStore(callback: () => void) {
  return isCloudAssetSyncEnabled() ? subscribeCloudAssetStore(callback) : subscribeManualAssetStore(callback);
}

export async function importAssetFiles(asset: MasterAsset, files: FileList | File[]) {
  return (await cloudMode())
    ? importCloudAssetFiles(asset, files, buildAssetImagePrompt(asset))
    : importLocalAssetFiles(asset, files);
}

export async function deleteAssetVersion(assetId: string, versionId: string) {
  return (await cloudMode()) ? deleteCloudAssetVersion(assetId, versionId) : deleteLocalAssetVersion(assetId, versionId);
}

export async function deleteAssetVersions(assetId: string) {
  return (await cloudMode()) ? deleteCloudAssetVersions(assetId) : deleteLocalAssetVersions(assetId);
}

export async function deleteManyAssetVersions(assetIds: string[]) {
  return (await cloudMode()) ? deleteManyCloudAssetVersions(assetIds) : deleteManyLocalAssetVersions(assetIds);
}

export async function approveVersion(assetId: string, versionId: string) {
  return (await cloudMode()) ? approveCloudVersion(assetId, versionId) : approveLocalVersion(assetId, versionId);
}

export async function rejectVersion(assetId: string, versionId: string) {
  return (await cloudMode()) ? rejectCloudVersion(assetId, versionId) : rejectLocalVersion(assetId, versionId);
}

export async function markRegenerate(assetId: string, versionId: string) {
  return (await cloudMode()) ? markCloudRegenerate(assetId, versionId) : markLocalRegenerate(assetId, versionId);
}

export async function setMasterVersion(assetId: string, versionId: string) {
  return (await cloudMode()) ? setCloudMasterVersion(assetId, versionId) : setLocalMasterVersion(assetId, versionId);
}

export async function updateChecklist(assetId: string, versionId: string, checklist: ConsistencyChecklist) {
  return (await cloudMode()) ? updateCloudChecklist(assetId, versionId, checklist) : updateLocalChecklist(assetId, versionId, checklist);
}

export async function updateRating(assetId: string, versionId: string, rating: AssetRating) {
  return (await cloudMode()) ? updateCloudRating(assetId, versionId, rating) : updateLocalRating(assetId, versionId, rating);
}

export async function addPromptVersion(assetId: string, versionId: string, prompt: string, reason: string) {
  return (await cloudMode()) ? addCloudPromptVersion(assetId, versionId, prompt, reason) : addLocalPromptVersion(assetId, versionId, prompt, reason);
}

export async function migrateCurrentBrowserAssetsToCloud() {
  if (!isCloudAssetSyncEnabled()) throw new Error("云端资产库尚未配置。");
  const session = await getCloudSession();
  if (!session) throw new Error("请先登录云端资产库。");
  const local = await loadLocalAssetStore();
  const cloud = await loadCloudAssetStore();
  const assetsById = new Map(getMasterAssets().map((asset) => [asset.id, asset]));
  let migrated = 0;

  for (const [assetId, versions] of Object.entries(local)) {
    if (cloud[assetId]?.length) continue;
    const asset = assetsById.get(assetId);
    if (!asset) continue;
    for (const version of versions) {
      const file = await dataUrlToFile(version.dataUrl, version.fileName, version.mediaType);
      const [created] = await importCloudAssetFiles(asset, [file], version.metadata.prompt || buildAssetImagePrompt(asset));
      if (!created) continue;
      await updateCloudChecklist(assetId, created.versionId, version.checklist);
      await updateCloudRating(assetId, created.versionId, version.rating);
      if (version.status === "MASTER_REFERENCE") await setCloudMasterVersion(assetId, created.versionId);
      else if (version.status !== "REVIEW") await updateCloudVersionStatus(assetId, created.versionId, version.status);
      migrated += 1;
    }
  }
  return migrated;
}

async function dataUrlToFile(dataUrl: string, fileName: string, mediaType: ManualAssetVersion["mediaType"]) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const type = blob.type || (mediaType === "video" ? "video/mp4" : "image/png");
  return new File([blob], fileName, { type });
}
