import manifest from "../../../projects/tide-steel-soul/asset-bible/ASSET_BIBLE_MANIFEST.json";
import shotLibrary from "../../../projects/tide-steel-soul/asset-bible/SHOT_LIBRARY.json";
import videoClipLibrary from "../../../projects/tide-steel-soul/asset-bible/VIDEO_CLIP_LIBRARY.json";
import klingPrompts from "../../../projects/tide-steel-soul/asset-bible/KlingPrompt.json";
import { listLocalAssets } from "../localAssetGenerator/LocalAssetManifest";

export function getAssetBibleManifest() {
  return manifest;
}

export function getAssetBibleShots() {
  return shotLibrary.shots;
}

export function getAssetBibleVideoClips() {
  return videoClipLibrary.clips;
}

export function getAssetBibleKlingPrompts() {
  return klingPrompts.prompts;
}

export function searchReusableAssets(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return listLocalAssets().filter((asset) => {
    const text = [asset.name, asset.category, asset.prompt, asset.relativePath].join(" ").toLowerCase();
    return text.includes(q);
  });
}

export function getAssetBibleStats() {
  return {
    categories: manifest.categories.length,
    shotTemplates: shotLibrary.count,
    videoClips: videoClipLibrary.count,
    klingPrompts: klingPrompts.count,
    localAssets: listLocalAssets().length
  };
}
