import assetManifest from "../../../projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json";
import { trilogyStoryboardShots } from "../trilogy/TrilogyStoryData";
import { listLocalAssets } from "../localAssetGenerator/LocalAssetManifest";
import { buildEP01SegmentedKlingPrompt } from "../videoWorkspace/EP01SegmentedPrompt";

export type EP01AssetManifest = typeof assetManifest;

export type EP01Keyframe = {
  id: string;
  shot: string;
  title: string;
  purpose: string;
  required_assets: string[];
  status: "planning" | "review" | "approved";
  approved_image?: string;
  draft_image?: string;
  project_image?: string;
  review_gate?: string;
  updatedAt?: string;
};

export function getEP01AssetManifest(): EP01AssetManifest {
  return assetManifest;
}

export function getEP01Keyframes(): EP01Keyframe[] {
  return trilogyStoryboardShots.map((shot) => ({
    id: shot.keyframeId,
    shot: shot.id,
    title: shot.title,
    purpose: shot.description,
    required_assets: inferRequiredAssets(shot.character, shot.environment),
    status: "planning",
    review_gate: "trilogy_storyboard_only",
    updatedAt: "2026-07-13T00:00:00.000Z"
  }));
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

function inferRequiredAssets(character: string, environment: string) {
  const assets = new Set<string>();
  const text = `${character} ${environment}`;
  if (text.includes("林舟")) assets.add("linzhou");
  if (text.includes("许燃")) assets.add("xuran");
  if (text.includes("陈牧")) assets.add("chenmu");
  if (text.includes("AI澜")) assets.add("lan");
  if (text.includes("赤霆")) assets.add("chiting01");
  if (text.includes("白潮")) assets.add("white_tide");
  if (text.includes("潮门")) assets.add("tide_gate");
  if (text.includes("杭州湾") || text.includes("海防")) assets.add("hangzhou_bay");
  if (text.includes("深蓝基地") || text.includes("机库") || text.includes("驾驶舱")) assets.add("deep_blue_base");
  return Array.from(assets);
}

function countGenerated(items: Array<{ assets: string[]; generated: string[] }>) {
  const total = items.reduce((sum, item) => sum + item.assets.length, 0);
  const done = items.reduce((sum, item) => sum + item.generated.length, 0);
  return { done, total };
}
