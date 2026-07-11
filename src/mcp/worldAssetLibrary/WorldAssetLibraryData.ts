import manifest from "../../../projects/tide-steel-soul/world-asset-library/WORLD_ASSET_MANIFEST.json";
import rules from "../../../projects/tide-steel-soul/world-asset-library/WORLD_REFERENCE_RULES.json";

export type WorldAsset = (typeof manifest.assets)[number];

export function getWorldAssetManifest() {
  return manifest;
}

export function getWorldAssets(): WorldAsset[] {
  return manifest.assets;
}

export function getWorldReferenceRules() {
  return rules.rules;
}

export function getWorldAssetStats() {
  return {
    total: manifest.total,
    landedImages: manifest.landedImages,
    generatedImages: manifest.generatedImages,
    pending: manifest.total - manifest.landedImages,
    categories: Array.from(new Set(manifest.assets.map((asset) => asset.category))).length
  };
}

export function searchWorldAssets(query: string, category = "全部") {
  const q = query.trim().toLowerCase();
  return manifest.assets.filter((asset) => {
    const categoryOk = category === "全部" || asset.category === category;
    const text = [asset.assetId, asset.category, asset.variant, asset.prompt, ...asset.tags].join(" ").toLowerCase();
    return categoryOk && (!q || text.includes(q));
  });
}

export function worldAssetUrl(asset: WorldAsset) {
  if (!asset.status.includes("审核") && !asset.status.includes("通过")) return "";
  const workspaceRoot = "D:/OneDrive/桌面/潮汐钢魂";
  return `/@fs/${workspaceRoot}/${asset.imagePath.replace(/\\/g, "/")}`;
}
