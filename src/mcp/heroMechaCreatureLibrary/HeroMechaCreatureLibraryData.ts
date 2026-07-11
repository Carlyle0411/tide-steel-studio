import manifest from "../../../projects/tide-steel-soul/hero-mecha-creature-library/MECHA_CREATURE_ASSET_MANIFEST.json";
import rules from "../../../projects/tide-steel-soul/hero-mecha-creature-library/MECHA_CREATURE_REFERENCE_RULES.json";

export type HeroMechaCreatureAsset = (typeof manifest.assets)[number];

export function getHeroMechaCreatureManifest() {
  return manifest;
}

export function getHeroMechaCreatureAssets(): HeroMechaCreatureAsset[] {
  return manifest.assets;
}

export function getHeroMechaCreatureRules() {
  return rules.rules;
}

export function getHeroMechaCreatureStats() {
  return {
    total: manifest.total,
    landedImages: manifest.landedImages,
    generatedImages: manifest.generatedImages,
    pending: manifest.total - manifest.landedImages,
    mecha: manifest.assets.filter((asset) => asset.domain === "机甲").length,
    creature: manifest.assets.filter((asset) => asset.domain === "怪兽").length
  };
}

export function getHeroAssetsByDomain(domain: "机甲" | "怪兽") {
  return manifest.assets.filter((asset) => asset.domain === domain);
}

export function searchHeroMechaCreatureAssets(query: string, domain?: "机甲" | "怪兽") {
  const q = query.trim().toLowerCase();
  return manifest.assets.filter((asset) => {
    const domainOk = domain ? asset.domain === domain : true;
    const text = [asset.assetId, asset.name, asset.variant, asset.prompt, ...asset.tags].join(" ").toLowerCase();
    return domainOk && (!q || text.includes(q));
  });
}

export function heroMechaCreatureAssetUrl(asset: HeroMechaCreatureAsset) {
  if (!asset.status.includes("审核") && !asset.status.includes("通过")) return "";
  const workspaceRoot = "D:/OneDrive/桌面/潮汐钢魂";
  return `/@fs/${workspaceRoot}/${asset.imagePath.replace(/\\/g, "/")}`;
}
