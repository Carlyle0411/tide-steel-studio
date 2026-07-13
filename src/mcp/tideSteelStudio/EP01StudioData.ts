import assetManifest from "../../../projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json";
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

const ep01Keyframes: EP01Keyframe[] = [
  ["KF01", "EP01_KF01", "2042杭州湾未来海防线", "在异常出现前建立仍然正常运转的杭州湾海防世界。", ["hangzhou_bay"]],
  ["KF02", "EP01_KF02", "白潮首次显现", "让巨大生命只改变暴雨海面，不以怪兽登场方式完整出现。", ["white_tide", "hangzhou_bay"]],
  ["KF03", "EP01_KF03", "深蓝基地进入警戒", "基地先对异常作出反应，而人还没有理解发生了什么。", ["deep_blue_base"]],
  ["KF04", "EP01_KF04", "陈牧察觉低频信号", "陈牧比自动系统更早相信自己的海防经验。", ["chenmu", "deep_blue_base"]],
  ["KF05", "EP01_KF05", "林舟收到召回通知", "警戒通知把林舟重新拉向赤霆，也拉回三年前的伤口。", ["linzhou"]],
  ["KF06", "EP01_KF06", "林舟进入深蓝基地", "让人的故事进入庞大的海防工业系统。", ["linzhou", "deep_blue_base"]],
  ["KF07", "EP01_KF07", "赤霆01首次露出", "赤霆第一次出现必须呈现重量和危险，而不是救世主登场。", ["chiting01", "deep_blue_base"]],
  ["KF08", "EP01_KF08", "背部驾驶舱开启", "驾驶舱像一道阈限，而不是普通载具入口。", ["chiting01", "cockpit"]],
  ["KF09", "EP01_KF09", "林舟进入驾驶舱", "林舟不是走向荣耀，而是走回自己最害怕的地方。", ["linzhou", "chiting01", "cockpit"]],
  ["KF10", "EP01_KF10", "许燃同步失败", "让赤霆系统证明力量并不是立刻可用的答案。", ["xuran", "cockpit"]],
  ["KF11", "EP01_KF11", "白潮撞击防线", "白潮的接近被人类误读为攻击，防线开始承受真实压力。", ["white_tide", "hangzhou_bay"]],
  ["KF12", "EP01_KF12", "赤霆01启动", "赤霆启动像一次危险选择，而不是英雄装备亮相。", ["chiting01"]],
  ["KF13", "EP01_KF13", "赤霆01走向海面", "机甲进入海洋尺度，让观众感到人类工程仍然渺小。", ["chiting01", "hangzhou_bay"]],
  ["KF14", "EP01_KF14", "赤霆01首次交锋", "第一次接触遵循空间、意图、接触、后果，而不是炫技战斗。", ["chiting01", "white_tide"]],
  ["KF15", "EP01_KF15", "白潮与赤霆对峙", "让观众第一次怀疑双方并不只是敌人与武器的关系。", ["chiting01", "white_tide"]],
  ["KF16", "EP01_KF16", "白潮释放未知信号", "把冲突从战斗推向无法解释的交流。", ["white_tide"]],
  ["KF17", "EP01_KF17", "潮门裂口出现", "揭示海洋下方存在未知生态入口，而不是普通战场。", ["tide_gate", "hangzhou_bay"]],
  ["KF18", "EP01_KF18", "黑潮母体睁眼", "第一集结束在更深未知被唤醒，而不是战斗胜利。", ["black_tide_mother", "tide_gate"]]
].map(([id, shot, title, purpose, required_assets]) => ({
  id: id as string,
  shot: shot as string,
  title: title as string,
  purpose: purpose as string,
  required_assets: required_assets as string[],
  status: "planning" as const,
  review_gate: "ep01_story_locked",
  updatedAt: "2026-07-13T00:00:00.000Z"
}));

export function getEP01AssetManifest(): EP01AssetManifest {
  return assetManifest;
}

export function getEP01Keyframes(): EP01Keyframe[] {
  return ep01Keyframes;
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
