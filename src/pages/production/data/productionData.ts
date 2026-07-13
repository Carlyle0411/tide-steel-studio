import assetDatabaseMd from "../../../../ASSET_DATABASE.md?raw";
import visualPipelineMd from "../../../../VISUAL_PIPELINE_BIBLE.md?raw";
import { trilogyScriptDocuments, trilogyStoryboardShots } from "../../../mcp/trilogy/TrilogyStoryData";
import { parseAssetDatabase } from "./markdown";
import type { EpisodeRecord, ProductionCenterItem, ProductionImageAsset, ProductionMetric, StoryboardShotRecord } from "../types";

const trilogyStructure = trilogyScriptDocuments.find((item) => item.id === "trilogy-structure")?.source ?? "";
const redThunderBible = trilogyScriptDocuments.find((item) => item.id === "red-thunder-episode-bible")?.source ?? "";
const trailerPlan = trilogyScriptDocuments.find((item) => item.id === "trailer-90-plan")?.source ?? "";

export const productionDocs = {
  assetDatabaseMd,
  visualPipelineMd,
  ep01ShotlistMd: trailerPlan,
  ep01PromptMd: trailerPlan,
  ep01AssetIndexMd: assetDatabaseMd,
  episodeBibleMd: redThunderBible,
  whiteTideBibleMd: trilogyStructure,
  tideGateBibleMd: trilogyStructure
};

export const productionAssets = parseAssetDatabase(assetDatabaseMd);

export const storyboardShots: StoryboardShotRecord[] = trilogyStoryboardShots.map((shot, index) => ({
  id: shot.id,
  number: String(index + 1).padStart(3, "0"),
  time: `${shot.duration}s`,
  storyFunction: shot.description,
  frame: shot.notes,
  camera: `${shot.shotSize} / ${shot.camera} / ${shot.lens} / ${shot.movement}`,
  keyframe: shot.keyframeId,
  video: `${shot.movement}，情绪：${shot.emotion}`,
  sound: shot.sound,
  review: "review"
}));

const trilogyParts = ["赤霆纪元", "深蓝遗迹", "终潮"] as const;

export const episodes: EpisodeRecord[] = Array.from({ length: 36 }, (_, index) => {
  const n = index + 1;
  const partIndex = n <= 12 ? 0 : n <= 24 ? 1 : 2;
  const localIndex = ((n - 1) % 12) + 1;
  const id = `EP${String(n).padStart(2, "0")}`;
  const part = trilogyParts[partIndex];

  return {
    id,
    part: part as EpisodeRecord["part"],
    index: localIndex,
    title: `《${part}》第${localIndex}集`,
    status: partIndex === 0 ? "ready" : "not-started",
    script: partIndex === 0 ? "RED_THUNDER_12_EPISODE_BIBLE.md" : "待建立正式分集文档",
    storyboard: 0,
    assets: 0,
    images: 0,
    videos: 0
  };
});

export const approvedImages: ProductionImageAsset[] = [];

export const centerItems: ProductionCenterItem[] = [
  {
    id: "CHAR-LINZHOU-001",
    name: "林舟",
    kind: "characters",
    status: "draft",
    reference: "母资产库 / 林舟身份锁定",
    version: "V0",
    firstAppearance: "赤霆纪元",
    lastAppearance: "终潮",
    shotCount: 0,
    episodes: ["赤霆纪元", "深蓝遗迹", "终潮"],
    tags: ["驾驶员", "赤霆同步", "三年前事故"],
    promptCount: 0,
    approvedImages: 0,
    notes: "第一部从相信力量到理解未知；第二部怀疑胜利逻辑；第三部决定什么值得留下。"
  },
  {
    id: "CHAR-XURAN-001",
    name: "许燃",
    kind: "characters",
    status: "draft",
    reference: "母资产库 / 许燃身份锁定",
    version: "V0",
    firstAppearance: "赤霆纪元",
    lastAppearance: "终潮",
    shotCount: 0,
    episodes: ["赤霆纪元", "深蓝遗迹", "终潮"],
    tags: ["规则", "数据", "副同步位"],
    promptCount: 0,
    approvedImages: 0,
    notes: "她不是林舟的辅助，而是从相信流程走向在不完整信息下行动的人。"
  },
  {
    id: "CHAR-CHENMU-001",
    name: "陈牧",
    kind: "characters",
    status: "draft",
    reference: "母资产库 / 陈牧身份锁定",
    version: "V0",
    firstAppearance: "赤霆纪元",
    lastAppearance: "终潮",
    shotCount: 0,
    episodes: ["赤霆纪元", "深蓝遗迹", "终潮"],
    tags: ["防线", "上一代战争逻辑", "指挥官"],
    promptCount: 0,
    approvedImages: 0,
    notes: "他从守住城市，走向守住文明值得存在的理由。"
  },
  {
    id: "MECHA-CRT001-001",
    name: "赤霆01",
    kind: "mechas",
    status: "draft",
    reference: "母资产库 / 赤霆01三视图",
    version: "V0",
    firstAppearance: "赤霆纪元",
    lastAppearance: "终潮",
    shotCount: 0,
    episodes: ["赤霆纪元", "深蓝遗迹", "终潮"],
    tags: ["暗红装甲", "黑色骨架", "蓝色同步光", "重型工业机甲"],
    promptCount: 0,
    approvedImages: 0,
    notes: "赤霆不是救世主，也不是超级英雄，它是人类旧答案的重量。"
  },
  {
    id: "CRE-WHITETIDE-001",
    name: "白潮",
    kind: "creatures",
    status: "draft",
    reference: "母资产库 / 白潮三视图",
    version: "V0",
    firstAppearance: "赤霆纪元",
    lastAppearance: "终潮",
    shotCount: 0,
    episodes: ["赤霆纪元", "深蓝遗迹", "终潮"],
    tags: ["深海生命", "白色甲壳", "未知使命", "非敌人"],
    promptCount: 0,
    approvedImages: 0,
    notes: "白潮不是朋友，也不是怪兽 Boss，它是潮汐系统里一个正在执行使命的生命。"
  },
  {
    id: "ENV-TIDEGATE-001",
    name: "潮门",
    kind: "environment",
    status: "draft",
    reference: "母资产库 / 潮门生态入口",
    version: "V0",
    firstAppearance: "赤霆纪元",
    lastAppearance: "终潮",
    shotCount: 0,
    episodes: ["赤霆纪元", "深蓝遗迹", "终潮"],
    tags: ["生态入口", "非传送门", "文明评估机制"],
    promptCount: 0,
    approvedImages: 0,
    notes: "潮门不是虫洞，不是空间裂缝，而是未知海洋生命系统与地球发生连接的位置。"
  }
];

export function buildDashboardMetrics(): ProductionMetric[] {
  return [
    { label: "项目名称", value: "潮汐钢魂", helper: "三部曲，36集连续章节式AI科幻电影系列", tone: "jade" },
    { label: "当前主线", value: "三部曲", helper: "赤霆纪元 / 深蓝遗迹 / 终潮" },
    { label: "总集数", value: "36", helper: "每部12集，每集3分30秒到4分钟", tone: "blue" },
    { label: "预告片 Shot", value: String(storyboardShots.length), helper: "三部曲90秒预告片分镜", tone: "jade" },
    { label: "母资产", value: String(productionAssets.length), helper: "来自ASSET_DATABASE.md" },
    { label: "已上传图片", value: "云端资产库同步", helper: "以用户上传和审核为准", tone: "gold" },
    { label: "生成方式", value: "手动复制Prompt", helper: "ChatGPT / GPT Image生成后上传回资产库" },
    { label: "制作状态", value: "三部曲化", helper: "旧版单集旧故事不再作为网页数据源", tone: "jade" }
  ];
}
