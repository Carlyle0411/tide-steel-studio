import assetManifest from "../../../projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json";
import keyframeManifest from "../../../projects/tide-steel-soul/EP01/EP01_KEYFRAME_MANIFEST.json";
import { listLocalAssets } from "../localAssetGenerator/LocalAssetManifest";
import { buildEP01SegmentedKlingPrompt } from "../videoWorkspace/EP01SegmentedPrompt";

export type EP01AssetManifest = typeof assetManifest;
export type EP01Keyframe = (typeof keyframeManifest.keyframes)[number];

export function getEP01AssetManifest(): EP01AssetManifest {
  return assetManifest;
}

export function getEP01Keyframes(): EP01Keyframe[] {
  return keyframeManifest.keyframes;
}

export function getTideSteelStudioStats() {
  const localAssets = listLocalAssets();
  const keyframes = getEP01Keyframes();
  const assetProgress = {
    characters: countGenerated(assetManifest.characters),
    mechas: countGenerated(assetManifest.mechas),
    creatures: countGenerated(assetManifest.creatures),
    environment: countGenerated(assetManifest.environment),
    keyframes: {
      done: keyframes.filter((item) => item.approved_image || item.draft_image).length,
      total: keyframes.length
    },
    klingPrompts: {
      done: keyframes.length,
      total: keyframes.length
    }
  };

  return {
    localAssets: localAssets.length,
    assetProgress,
    reviewAssets: localAssets.filter((asset) => asset.status === "review").length,
    approvedAssets: localAssets.filter((asset) => asset.status === "approved").length
  };
}

export function buildEP01KlingPrompt(keyframe: EP01Keyframe) {
  return buildEP01SegmentedKlingPrompt({
    id: keyframe.shot,
    keyframeId: keyframe.id,
    title: keyframe.title,
    description: keyframe.purpose,
    purpose: keyframe.purpose,
    required_assets: keyframe.required_assets
  }, keyframe.required_assets);
}

export function buildAllEP01KlingPrompts() {
  return getEP01Keyframes().map((keyframe) => ({
    shot: keyframe.shot,
    title: keyframe.title,
    prompt: buildEP01KlingPrompt(keyframe)
  }));
}

function countGenerated(items: Array<{ assets: string[]; generated: string[] }>) {
  const total = items.reduce((sum, item) => sum + item.assets.length, 0);
  const done = items.reduce((sum, item) => sum + item.generated.length, 0);
  return { done, total };
}
