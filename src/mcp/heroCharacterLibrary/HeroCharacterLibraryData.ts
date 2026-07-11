import bible from "../../../projects/tide-steel-soul/hero-character-library/CHARACTER_BIBLE.json";
import manifest from "../../../projects/tide-steel-soul/hero-character-library/CHARACTER_ASSET_MANIFEST.json";
import rules from "../../../projects/tide-steel-soul/hero-character-library/CHARACTER_REFERENCE_RULES.json";

export type HeroCharacter = (typeof bible.characters)[number];
export type HeroCharacterAsset = (typeof manifest.assets)[number];

export function getHeroCharacterBible() {
  return bible;
}

export function getHeroCharacterAssets(): HeroCharacterAsset[] {
  return manifest.assets;
}

export function getHeroCharacterRules() {
  return rules.rules;
}

export function getHeroCharacterStats() {
  return {
    characters: bible.characters.length,
    requiredImages: manifest.total,
    landedImages: manifest.landedImages,
    generatedImages: manifest.generatedImages,
    pending: manifest.total - manifest.landedImages
  };
}

export function getAssetsForCharacter(characterName: string) {
  return getHeroCharacterAssets().filter((asset) => asset.character === characterName);
}

export function searchHeroCharacterAssets(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return getHeroCharacterAssets();
  return getHeroCharacterAssets().filter((asset) => {
    const text = [asset.assetId, asset.character, asset.englishName, asset.variant, asset.prompt, ...asset.tags].join(" ").toLowerCase();
    return text.includes(q);
  });
}

export function heroCharacterAssetUrl(asset: HeroCharacterAsset) {
  if (!asset.status.includes("审核") && !asset.status.includes("通过")) return "";
  const workspaceRoot = "D:/OneDrive/桌面/潮汐钢魂";
  return `/@fs/${workspaceRoot}/${asset.imagePath.replace(/\\/g, "/")}`;
}
