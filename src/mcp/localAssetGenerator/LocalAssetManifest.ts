import manifest from "../../../projects/tide-steel-soul/assets/asset-library.json";
import type { LocalAssetRecord } from "./LocalAssetTypes";

export function listLocalAssets(): LocalAssetRecord[] {
  return (manifest.assets as LocalAssetRecord[]).filter((asset) => Boolean(asset.relativePath));
}

export function localAssetUrl(asset: LocalAssetRecord) {
  const workspaceRoot = "D:/OneDrive/桌面/潮汐钢魂";
  return `/@fs/${workspaceRoot}/projects/tide-steel-soul/assets/${asset.relativePath.replace(/\\/g, "/")}`;
}
