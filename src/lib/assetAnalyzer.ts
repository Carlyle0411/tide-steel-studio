import { analyzeAssetWithAI, getAISettings } from "./aiProvider";
import { AssetAnalysis, AssetGroup, AssetUsage, MediaAsset } from "../types";

export type DetailedAssetAnalysis = AssetAnalysis & {
  jimengPrompt: string;
  suitableShotTypes: string[];
  canBeFirstFrame: boolean;
  canBeSceneReference: boolean;
  canBeCharacterReference: boolean;
  providerNote: string;
};

export function analyzeAssetLocal(asset: MediaAsset, groups: AssetGroup[] = []): DetailedAssetAnalysis {
  const text = `${asset.name} ${asset.tags.join(" ")} ${asset.note} ${asset.usageType}`.toLowerCase();
  const tags = new Set(asset.tags);
  let recommendedGroup = "故事版";
  let usage: AssetUsage = "镜头参考";
  let summary = `该素材适合用作镜头参考。当前仅基于文件名、类型、标签、备注分析，暂未启用视觉识别。`;

  if (/赤霆|机甲|驾驶舱|机器人|装甲|角色|主角|人物|阿墨|产品|三视图|表情|设定|服装|道具|character|protagonist|mecha|product/.test(text)) {
    recommendedGroup = "角色图";
    usage = /产品|product/.test(text) ? "产品参考" : "主体一致性参考";
    ["角色设定", "主体一致性", "外观参考"].forEach((tag) => tags.add(tag));
    if (/赤霆|机甲|驾驶舱|机器人|装甲/.test(text)) ["机甲", "角色设定", "工业机械", "驾驶舱", "科幻"].forEach((tag) => tags.add(tag));
    if (/阿墨|猫/.test(text)) ["阿墨", "奶牛猫", "宠物IP"].forEach((tag) => tags.add(tag));
    summary = /赤霆|机甲|驾驶舱|机器人|装甲/.test(text)
      ? "该素材适合作为赤霆01机甲设定参考，用于保持机甲比例、结构、背部隐藏式驾驶舱和工业细节一致。"
      : "该素材适合作为角色/主体设定参考，用于保持主体比例、结构、标志特征和外观一致。";
  }

  if (/门店|试衣镜|桂花糖|女装|场景|背景|环境|空间|室内|外景|光影|氛围|咖啡馆|scene|background|environment|space/.test(text)) {
    recommendedGroup = "场景图";
    usage = /光影|氛围/.test(text) ? "光影氛围参考" : "场景参考";
    ["场景参考", "光影氛围", "环境空间"].forEach((tag) => tags.add(tag));
    if (/桂花糖|女装|门店|试衣镜/.test(text)) ["女装", "门店", "试衣镜", "高级感", "品牌氛围"].forEach((tag) => tags.add(tag));
    summary = "该素材适合作为场景参考，用于保持环境、空间、光线、氛围和背景一致。";
  }

  if (/首帧|尾帧|分镜|镜头|可灵|即梦|海螺|生成结果|storyboard|shot|frame|video|clip/.test(text) || asset.type === "video") {
    recommendedGroup = "故事版";
    usage = /尾帧|last/.test(text) ? "尾帧参考" : /首帧|first/.test(text) ? "首帧参考" : asset.type === "video" ? "已生成结果参考" : "镜头参考";
    ["故事版", "镜头参考", "画面连续性"].forEach((tag) => tags.add(tag));
    summary = "该素材适合作为故事版/镜头结果参考，用于保持构图、动作节奏、首尾帧衔接和画面连续性。";
  }

  const groupExists = groups.some((group) => group.name === recommendedGroup);
  return {
    suitableUsages: [usage, "首帧参考", "场景参考"],
    recommendedTags: Array.from(tags),
    recommendedGroupNames: groupExists ? [recommendedGroup] : [],
    klingPrompt: `参考素材《${asset.name}》，保持${summary.replace(/^该素材适合作为/, "").replace(/。$/, "")}，主体稳定，构图清晰，避免变形和风格漂移。`,
    jimengPrompt: `以《${asset.name}》为视觉参考，提炼${Array.from(tags).slice(0, 5).join("、")}，画面清晰、质感统一、无文字水印。`,
    recommendedShotUsage: usage,
    suitableShotTypes: recommendedGroup === "角色图" ? ["角色登场", "主体特写", "动作镜头"] : recommendedGroup === "场景图" ? ["开场环境", "氛围空镜", "品牌空间"] : ["首帧", "尾帧", "连续镜头"],
    canBeFirstFrame: asset.type === "image" && recommendedGroup !== "场景图",
    canBeSceneReference: recommendedGroup === "场景图",
    canBeCharacterReference: asset.type === "image" && recommendedGroup === "角色图",
    styleDescription: summary,
    summary,
    providerNote: "当前基于文件名、类型、标签、备注分析，暂未启用视觉识别。"
  };
}

export async function analyzeAssetWithProvider(asset: MediaAsset, groups: AssetGroup[] = []): Promise<DetailedAssetAnalysis> {
  const settings = getAISettings();
  const local = analyzeAssetLocal(asset, groups);
  if (settings.provider === "local" || !settings.apiKey.trim()) return local;
  try {
    const remote = await analyzeAssetWithAI(asset);
    return {
      ...local,
      ...remote,
      jimengPrompt: local.jimengPrompt,
      providerNote: "已调用 AI API；如未启用视觉模型，则仍主要基于文件名、标签和备注分析。"
    };
  } catch {
    return { ...local, providerNote: "AI分析失败，已回退本地规则分析。" };
  }
}

export function applyAnalysisToAsset(asset: MediaAsset, analysis: DetailedAssetAnalysis, groups: AssetGroup[]) {
  const groupIds = analysis.recommendedGroupNames
    .map((name) => groups.find((group) => group.name === name)?.id)
    .filter(Boolean) as string[];
  return {
    ...asset,
    tags: Array.from(new Set([...asset.tags, ...analysis.recommendedTags])),
    groupIds: groupIds.length ? Array.from(new Set([...asset.groupIds, ...groupIds])) : asset.groupIds,
    usageType: analysis.recommendedShotUsage,
    note: [asset.note, analysis.summary, analysis.providerNote].filter(Boolean).join("\n"),
    updatedAt: new Date().toISOString()
  };
}
