import assetManifest from "../../../projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json";
import keyframeManifest from "../../../projects/tide-steel-soul/EP01/EP01_KEYFRAME_MANIFEST.json";
import { listLocalAssets } from "../localAssetGenerator/LocalAssetManifest";

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
  const baseNegative = "动漫、二次元、游戏CG、虚假物理、塑料表面、过度饱和、文字、logo、水印、人物换脸、机甲设计改变";
  return [
    `镜头：${keyframe.shot}《${keyframe.title}》`,
    "时长：5秒",
    "摄影机：电影级真实摄影，镜头运动克制，保持物理重量",
    "焦段：24mm建立尺度，35mm建立环境，50mm处理人物与机甲关系，85mm用于情绪细节",
    "运动：缓慢推进或稳定跟拍，禁止短视频式晃动",
    `动作：${keyframe.purpose}`,
    `环境：《潮汐钢魂》EP01湿冷海防世界；绑定母资产：${keyframe.required_assets.join("、")}`,
    "光线：低饱和暴风雨光线与冷蓝工业光，只使用真实光源逻辑",
    "情绪：未知压迫，人类尺度面对海洋尺度",
    "声音：深海低频、远处金属震动、克制机械细节",
    `禁止：${baseNegative}`
  ].join("\n");
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
