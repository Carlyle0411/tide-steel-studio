import { getMasterAssets } from "../masterAssetLibrary/MasterAssetLibraryData";
import { trilogyStoryboardShots } from "../trilogy/TrilogyStoryData";

export type IndustrialAsset = {
  id: string;
  originalId: string;
  name: string;
  chineseName: string;
  type: string;
  category: string;
  project: string;
  episode: string;
  shot: string;
  path: string;
  relativePath: string;
  prompt: string;
  negativePrompt: string;
  status: string;
  tags: string[];
  favorite: boolean;
  version: string;
  versions: Array<{ id: string; label: string; note: string; updatedAt: string; active: boolean }>;
  references: Array<{ type: string; id: string; name: string; episode: string }>;
  linkedCharacters: string[];
  linkedScenes: string[];
  linkedShots: string[];
  usageCount: number;
  qualityScore: string;
  createdAt: string;
  updatedAt: string;
};

export type IndustrialShot = {
  id: string;
  shotId: string;
  name: string;
  description: string;
  episode: string;
  duration: number;
  shotSize: string;
  lens: string;
  movement: string;
  camera: string;
  character: string;
  scene: string;
  status: string;
  tags: string[];
  linkedAssets: string[];
  createdAt: string;
  updatedAt: string;
};

export type IndustrialCharacter = { id: string; name: string; role: string };
export type IndustrialScene = { id: string; name: string; type: string };
export type IndustrialTag = { id: string; name: string; color: string; group: string; createdAt: string; editable: boolean };
export type IndustrialPrompt = {
  id: string;
  name: string;
  type: string;
  prompt: string;
  tags: string[];
  linkedShots: string[];
  usageCount: number;
  version: string;
  favorite: boolean;
  updatedAt: string;
};
export type IndustrialRelationship = { from: string; fromName: string; relation: string; to: string; toName: string };
export type IndustrialTimeline = { title: string; duration: number; tracks: Array<{ id: string; name: string; items: Array<{ id: string; label: string; start: number; duration: number }> }> };

export type SearchResult = {
  id: string;
  name: string;
  type: string;
  project: string;
  episode: string;
  shot: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  tags: string[];
  summary: string;
};

const projectName = "潮汐钢魂三部曲";
const now = "2026-07-13";

function inferCategory(category: string) {
  const map: Record<string, string> = {
    character: "characters",
    characters: "characters",
    mecha: "mechas",
    mechas: "mechas",
    creature: "creatures",
    creatures: "creatures",
    environment: "environment",
    environments: "environment",
    prop: "props",
    props: "props",
  };
  return map[category] ?? category;
}

export function getIndustrialAssets(): IndustrialAsset[] {
  return getMasterAssets().map((asset, index) => {
    const category = inferCategory(asset.category);
    const name = asset.name ?? asset.baseName ?? asset.id;
    const linkedShots = trilogyStoryboardShots
      .filter((shot) => [shot.character, shot.environment, shot.notes].join(" ").includes(asset.baseName ?? name))
      .map((shot) => shot.id);
    return {
      id: asset.id,
      originalId: asset.id,
      name,
      chineseName: name,
      type: asset.category,
      category,
      project: projectName,
      episode: "三部曲",
      shot: linkedShots[0] ?? "",
      path: asset.outputPath ?? "",
      relativePath: asset.outputPath ?? "",
      prompt: asset.description ?? name,
      negativePrompt: "不要动漫、不要游戏CG、不要塑料质感、不要文字、水印、logo、字幕。",
      status: asset.referenceStatus === "MASTER_REFERENCE" ? "已通过" : "审核中",
      tags: asset.tags ?? [category],
      favorite: index < 8,
      version: "V001",
      versions: [{ id: `${asset.id}-V001`, label: "V001", note: "三部曲母资产索引。", updatedAt: asset.updatedAt ?? now, active: true }],
      references: linkedShots.map((shotId) => {
        const shot = trilogyStoryboardShots.find((item) => item.id === shotId);
        return { type: "Shot", id: shotId, name: shot?.title ?? shotId, episode: "三部曲" };
      }),
      linkedCharacters: category === "characters" ? [asset.baseName ?? name] : [],
      linkedScenes: category === "environment" ? [asset.baseName ?? name] : [],
      linkedShots,
      usageCount: linkedShots.length,
      qualityScore: "待评",
      createdAt: asset.updatedAt ?? now,
      updatedAt: asset.updatedAt ?? now,
    };
  });
}

export function getIndustrialShots(): IndustrialShot[] {
  return trilogyStoryboardShots.map((shot) => ({
    id: shot.id,
    shotId: shot.id,
    name: shot.title,
    description: shot.description,
    episode: "三部曲预告片",
    duration: shot.duration,
    shotSize: shot.shotSize,
    lens: shot.lens,
    movement: shot.movement,
    camera: shot.camera,
    character: shot.character,
    scene: shot.environment,
    status: "草稿",
    tags: ["三部曲", "预告片", shot.emotion],
    linkedAssets: [shot.character, shot.environment].filter((item) => item && item !== "无"),
    createdAt: now,
    updatedAt: now,
  }));
}

export function getIndustrialCharacters(): IndustrialCharacter[] {
  return [
    { id: "CHAR-LINZHOU", name: "林舟", role: "赤霆01驾驶员" },
    { id: "CHAR-XURAN", name: "许燃", role: "同步驾驶员" },
    { id: "CHAR-CHENMU", name: "陈牧", role: "海防指挥官" },
    { id: "CHAR-LAN", name: "AI澜", role: "深蓝基地智能系统" },
  ];
}

export function getIndustrialScenes(): IndustrialScene[] {
  return [
    { id: "SCENE-HANGZHOU-BAY", name: "杭州湾海防线", type: "海洋防线" },
    { id: "SCENE-DEEP-BLUE", name: "深蓝基地", type: "军事工程设施" },
    { id: "SCENE-CHITING-HANGAR", name: "赤霆机库", type: "机甲维护区" },
    { id: "SCENE-TIDE-GATE", name: "潮门压力边界", type: "未知生态入口" },
  ];
}

export function getIndustrialTags(): IndustrialTag[] {
  return ["三部曲", "预告片", "角色", "机甲", "怪兽", "场景", "情绪", "战斗", "转场", "远景"].map((name, index) => ({
    id: `TAG-${index + 1}`,
    name,
    color: ["#7ed6bd", "#d6b46a", "#70a6ff", "#d68fb3", "#f87171"][index % 5],
    group: "三部曲",
    createdAt: now,
    editable: true,
  }));
}

export function getIndustrialPrompts(): IndustrialPrompt[] {
  return trilogyStoryboardShots.map((shot) => ({
    id: `PROMPT-${shot.keyframeId}`,
    name: `${shot.keyframeId} / ${shot.title}`,
    type: "Keyframe Prompt",
    prompt: `根据三部曲分镜生成关键帧：${shot.description}。参考资产：${[shot.character, shot.environment].filter((item) => item && item !== "无").join(" / ") || "杭州湾世界观母资产"}。景别：${shot.shotSize}，镜头：${shot.camera}，焦段：${shot.lens}，运动：${shot.movement}。画面情绪：${shot.emotion}。`,
    tags: ["三部曲", "关键帧", shot.emotion],
    linkedShots: [shot.id],
    usageCount: 1,
    version: "V001",
    favorite: false,
    updatedAt: now,
  }));
}

export function getIndustrialRelationships(): IndustrialRelationship[] {
  return trilogyStoryboardShots.flatMap((shot) =>
    [shot.character, shot.environment]
      .filter((item) => item && item !== "无")
      .map((item) => ({ from: item, fromName: item, relation: "引用于", to: shot.id, toName: shot.title }))
  );
}

export function getIndustrialTimeline(): IndustrialTimeline {
  let start = 0;
  const items = trilogyStoryboardShots.map((shot) => {
    const item = { id: shot.id, label: shot.title, start, duration: shot.duration };
    start += shot.duration;
    return item;
  });
  return { title: "潮汐钢魂三部曲预告片 Timeline", duration: start, tracks: [{ id: "TRILOGY-TRAILER", name: "三部曲预告片", items }] };
}

export function getIndustrialLogs() {
  return [
    { id: "LOG-TRILOGY-001", action: "清理旧版故事数据", detail: "剧本管理与 Storyboard 已切换为潮汐钢魂三部曲数据源。", status: "已完成" },
    { id: "LOG-TRILOGY-002", action: "建立三部曲分镜索引", detail: "20个预告片镜头作为当前网页统一 Storyboard 来源。", status: "已完成" },
  ];
}

export function industrialAssetUrl(asset: Pick<IndustrialAsset, "relativePath">) {
  return asset.relativePath || "";
}

export function globalSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const items: SearchResult[] = [
    ...getIndustrialAssets().map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      project: asset.project,
      episode: asset.episode,
      shot: asset.shot,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      thumbnail: industrialAssetUrl(asset),
      tags: asset.tags,
      summary: asset.prompt,
    })),
    ...getIndustrialShots().map((shot) => ({
      id: shot.id,
      name: shot.name,
      type: "Shot",
      project: projectName,
      episode: shot.episode,
      shot: shot.shotId,
      createdAt: shot.createdAt,
      updatedAt: shot.updatedAt,
      tags: shot.tags,
      summary: shot.description,
    })),
    ...getIndustrialPrompts().map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
      type: prompt.type,
      project: projectName,
      episode: "三部曲",
      shot: prompt.linkedShots[0] ?? "",
      createdAt: prompt.updatedAt,
      updatedAt: prompt.updatedAt,
      tags: prompt.tags,
      summary: prompt.prompt,
    })),
  ];

  if (!q) return items.slice(0, 12);
  return items.filter((item) => {
    const text = [item.id, item.name, item.type, item.project, item.episode, item.shot, item.summary, ...item.tags].join(" ").toLowerCase();
    return q.split(/\s+/).every((part) => text.includes(part));
  });
}

export function getWorkflowStats() {
  const assets = getIndustrialAssets();
  const shots = getIndustrialShots();
  const prompts = getIndustrialPrompts();
  const relationships = getIndustrialRelationships();
  const timeline = getIndustrialTimeline();
  return {
    assets: assets.length,
    shots: shots.length,
    prompts: prompts.length,
    relationships: relationships.length,
    tags: getIndustrialTags().length,
    favorites: assets.filter((asset) => asset.favorite).length + prompts.filter((prompt) => prompt.favorite).length,
    versions: assets.reduce((sum, asset) => sum + asset.versions.length, 0),
    approved: assets.filter((asset) => asset.status.includes("已通过")).length,
    review: assets.filter((asset) => asset.status.includes("审核")).length,
    timelineDuration: timeline.duration,
  };
}

export function statusTone(status: string): "jade" | "gold" | "red" | "slate" {
  if (status.includes("已通过") || status.includes("已完成") || status.includes("MASTER")) return "jade";
  if (status.includes("审核") || status.includes("制作")) return "gold";
  if (status.includes("废弃") || status.includes("驳回")) return "red";
  return "slate";
}
