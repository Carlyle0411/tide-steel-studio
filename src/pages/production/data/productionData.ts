import assetDatabaseMd from "../../../../ASSET_DATABASE.md?raw";
import visualPipelineMd from "../../../../VISUAL_PIPELINE_BIBLE.md?raw";
import ep01ShotlistMd from "../../../../SHOTLIST_EP01_海面低频_导演分镜版.md?raw";
import ep01PromptMd from "../../../../GPT_IMAGE2_PROMPT_EP01_海面低频.md?raw";
import ep01AssetIndexMd from "../../../../EP01_ASSET_INDEX.md?raw";
import episodeBibleMd from "../../../../EPISODE_BIBLE_赤霆纪元_EP01-EP12.md?raw";
import whiteTideBibleMd from "../../../../WHITE_TIDE_CREATURE_BIBLE.md?raw";
import tideGateBibleMd from "../../../../TIDE_GATE_WORLD_RULES_BIBLE.md?raw";
import { parseAssetDatabase, parseShotlist, summarizeMarkdown } from "./markdown";
import type { EpisodeRecord, ProductionCenterItem, ProductionImageAsset, ProductionMetric } from "../types";

export const productionDocs = {
  assetDatabaseMd,
  visualPipelineMd,
  ep01ShotlistMd,
  ep01PromptMd,
  ep01AssetIndexMd,
  episodeBibleMd,
  whiteTideBibleMd,
  tideGateBibleMd
};

export const productionAssets = parseAssetDatabase(assetDatabaseMd);
export const storyboardShots = parseShotlist(ep01ShotlistMd);

export const episodes: EpisodeRecord[] = Array.from({ length: 36 }, (_, index) => {
  const n = index + 1;
  const part = n <= 12 ? "赤霆纪元" : n <= 24 ? "深蓝遗迹" : "终潮";
  const localIndex = ((n - 1) % 12) + 1;
  const id = `EP${String(n).padStart(2, "0")}`;
  const isEp01 = n === 1;
  return {
    id,
    part,
    index: localIndex,
    title: isEp01 ? "海面低频" : `${part} Chapter ${String(localIndex).padStart(2, "0")}`,
    status: isEp01 ? "in-progress" : n <= 12 ? "ready" : "not-started",
    script: isEp01 ? "SCRIPT_EP01_海面低频_剧本开发版.md" : "待开发",
    storyboard: isEp01 ? storyboardShots.length : 0,
    assets: isEp01 ? 4 : 0,
    images: isEp01 ? 4 : 0,
    videos: 0
  };
});

export const approvedImages: ProductionImageAsset[] = [
  {
    id: "EP01-KF01",
    name: "KF01 杭州湾海防线正常世界",
    src: "/assets/episodes/EP01/keyframes/approved/EP01_KF01_APPROVED_V01.png",
    status: "approved",
    version: "V01",
    reference: "REFERENCE_04_HANGZHOU_BAY_OCEAN_DEFENSE_LINE.png",
    prompt: "建立正常世界，但海面存在第一丝不对劲。",
    firstUse: "EP01",
    lastUse: "EP01",
    usageCount: 1
  },
  {
    id: "EP01-KF02",
    name: "KF02 杯中反向水纹",
    src: "/assets/episodes/EP01/keyframes/approved/EP01_KF02_APPROVED_V01.png",
    status: "approved",
    version: "V01",
    reference: "REFERENCE_02_DEEP_BLUE_BASE_2047.png",
    prompt: "第一次无法解释的物理证据。",
    firstUse: "EP01",
    lastUse: "EP01",
    usageCount: 1
  },
  {
    id: "EP01-KF04",
    name: "KF04 陈牧相信异常",
    src: "/assets/episodes/EP01/keyframes/approved/EP01_KF04_APPROVED_V01.png",
    status: "approved",
    version: "V01",
    reference: "REFERENCE_01 / REFERENCE_02",
    prompt: "一个人比系统早一步感觉到危险。",
    firstUse: "EP01",
    lastUse: "EP01",
    usageCount: 1
  },
  {
    id: "EP01-KF09",
    name: "KF09 观测闸关闭",
    src: "/assets/episodes/EP01/keyframes/approved/EP01_KF09_APPROVED_V01.png",
    status: "approved",
    version: "V01",
    reference: "REFERENCE_01 / REFERENCE_02 / REFERENCE_04",
    prompt: "陈牧完成不可撤回的关闭动作。",
    firstUse: "EP01",
    lastUse: "EP01",
    usageCount: 1
  }
];

export const centerItems: ProductionCenterItem[] = [
  {
    id: "CHAR-LINZHOU-001",
    name: "林舟",
    kind: "characters",
    status: "draft",
    reference: "待建立",
    version: "V0",
    firstAppearance: "EP02",
    lastAppearance: "EP12",
    shotCount: 0,
    episodes: ["EP02-EP12"],
    tags: ["驾驶员", "赤霆同步", "人物伤口"],
    promptCount: 0,
    approvedImages: 0,
    notes: "核心角色资产待Reference定稿。"
  },
  {
    id: "CHAR-XURAN-001",
    name: "许燃",
    kind: "characters",
    status: "draft",
    reference: "待建立",
    version: "V0",
    firstAppearance: "EP02",
    lastAppearance: "EP12",
    shotCount: 0,
    episodes: ["EP02-EP12"],
    tags: ["数据", "流程", "同步判断"],
    promptCount: 0,
    approvedImages: 0,
    notes: "需要角色视觉定稿与制服系统。"
  },
  {
    id: "CHAR-CHENMU-001",
    name: "陈牧",
    kind: "characters",
    status: "approved",
    reference: "REFERENCE_01_CHEN_MU_CHARACTER_FINAL.png",
    version: "V1",
    firstAppearance: "EP01",
    lastAppearance: "EP12",
    shotCount: 2,
    episodes: ["EP01", "EP10"],
    tags: ["指挥官", "海防", "克制"],
    promptCount: 2,
    approvedImages: 2,
    notes: "同一张脸、同一制服、疲惫而可信。"
  },
  {
    id: "CRE-WHITETIDE-001",
    name: "白潮",
    kind: "creatures",
    status: "draft",
    reference: "WHITE_TIDE_CREATURE_BIBLE.md",
    version: "V0",
    firstAppearance: "EP03局部",
    lastAppearance: "EP12",
    shotCount: 0,
    episodes: ["EP03", "EP05", "EP07", "EP12"],
    tags: ["古老", "脆弱", "巨大", "未知", "逃亡"],
    promptCount: 0,
    approvedImages: 0,
    notes: summarizeMarkdown(whiteTideBibleMd, 90)
  },
  {
    id: "MECHA-CRT001-001",
    name: "赤霆01",
    kind: "mechas",
    status: "approved",
    reference: "REFERENCE_03_CRT001_BACK_COCKPIT_DETAIL.png",
    version: "V1",
    firstAppearance: "EP01局部",
    lastAppearance: "EP12",
    shotCount: 1,
    episodes: ["EP01", "EP02", "EP05", "EP12"],
    tags: ["暗红装甲", "黑色骨架", "蓝色同步光"],
    promptCount: 1,
    approvedImages: 1,
    notes: "EP01阶段禁止完整展示。"
  },
  {
    id: "ENV-TIDEGATE-001",
    name: "潮门",
    kind: "environment",
    status: "draft",
    reference: "TIDE_GATE_WORLD_RULES_BIBLE.md",
    version: "V0",
    firstAppearance: "EP09局部",
    lastAppearance: "EP12",
    shotCount: 0,
    episodes: ["EP09", "EP10", "EP12"],
    tags: ["生态入口", "不是传送门", "深海压力"],
    promptCount: 0,
    approvedImages: 0,
    notes: summarizeMarkdown(tideGateBibleMd, 90)
  }
];

export function buildDashboardMetrics(): ProductionMetric[] {
  const approved = productionAssets.filter((item) => item.approved).length;
  const pending = productionAssets.length - approved;
  return [
    { label: "Project Name", value: "潮汐钢魂", helper: "36集连续章节式AI科幻电影系列", tone: "jade" },
    { label: "Progress", value: "Phase 01", helper: "Movie Control Center / Visual Pipeline" },
    { label: "Total Episodes", value: "36", helper: "三部曲，每部12集", tone: "blue" },
    { label: "Completed Episodes", value: "0", helper: "EP01处于视觉制作阶段" },
    { label: "Approved Assets", value: String(approved), helper: "来自ASSET_DATABASE.md", tone: "jade" },
    { label: "Pending Review", value: String(pending), helper: "Draft / 未定稿资产", tone: "gold" },
    { label: "Generated Images", value: String(approvedImages.length), helper: "EP01第一批关键帧" },
    { label: "Generated Videos", value: "0", helper: "Kling / Veo接口预留" },
    { label: "Reference Images", value: "4", helper: "基础视觉Reference资产" },
    { label: "Storyboard Progress", value: `${storyboardShots.length} shots`, helper: "EP01导演分镜版已解析" },
    { label: "Production Status", value: "Live", helper: "资产库与审核流已建立", tone: "jade" }
  ];
}
