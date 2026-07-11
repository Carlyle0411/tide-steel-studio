import assetData from "../../../projects/tide-steel-soul/industrial-workflow/Asset.json";
import characterData from "../../../projects/tide-steel-soul/industrial-workflow/Character.json";
import logData from "../../../projects/tide-steel-soul/industrial-workflow/ProductionLog.json";
import promptData from "../../../projects/tide-steel-soul/industrial-workflow/Prompt.json";
import relationshipData from "../../../projects/tide-steel-soul/industrial-workflow/Relationship.json";
import sceneData from "../../../projects/tide-steel-soul/industrial-workflow/Scene.json";
import shotData from "../../../projects/tide-steel-soul/industrial-workflow/Shot.json";
import tagData from "../../../projects/tide-steel-soul/industrial-workflow/Tag.json";
import timelineData from "../../../projects/tide-steel-soul/industrial-workflow/Timeline.json";
import masterAssetData from "../../../projects/tide-steel-soul/master-asset-library/MASTER_ASSETS.json";

export type IndustrialAsset = (typeof assetData.assets)[number];
export type IndustrialShot = (typeof shotData.shots)[number];
export type IndustrialCharacter = (typeof characterData.characters)[number];
export type IndustrialScene = (typeof sceneData.scenes)[number];
export type IndustrialTag = (typeof tagData.tags)[number];
export type IndustrialPrompt = (typeof promptData.prompts)[number];
export type IndustrialRelationship = (typeof relationshipData.relationships)[number];
export type IndustrialTimeline = typeof timelineData;

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

export function getIndustrialAssets(): IndustrialAsset[] {
  return assetData.assets;
}

export function getIndustrialShots(): IndustrialShot[] {
  return shotData.shots;
}

export function getIndustrialCharacters(): IndustrialCharacter[] {
  return characterData.characters;
}

export function getIndustrialScenes(): IndustrialScene[] {
  return sceneData.scenes;
}

export function getIndustrialTags(): IndustrialTag[] {
  return tagData.tags;
}

export function getIndustrialPrompts(): IndustrialPrompt[] {
  return promptData.prompts;
}

export function getIndustrialRelationships(): IndustrialRelationship[] {
  return relationshipData.relationships;
}

export function getIndustrialTimeline(): IndustrialTimeline {
  return timelineData;
}

export function getIndustrialLogs() {
  return logData.logs;
}

export function industrialAssetUrl(asset: Pick<IndustrialAsset, "relativePath">) {
  const workspaceRoot = "D:/OneDrive/桌面/潮汐钢魂";
  return `/@fs/${workspaceRoot}/projects/tide-steel-soul/assets/${asset.relativePath.replace(/\\/g, "/")}`;
}

export function globalSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const items: SearchResult[] = [
    ...assetData.assets.map((asset) => ({
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
      summary: asset.prompt
    })),
    ...shotData.shots.map((shot) => ({
      id: shot.id,
      name: shot.name,
      type: "Shot",
      project: "潮汐钢魂",
      episode: shot.episode,
      shot: shot.shotId,
      createdAt: shot.createdAt,
      updatedAt: shot.updatedAt,
      tags: shot.tags,
      summary: shot.description
    })),
    ...promptData.prompts.map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
      type: prompt.type,
      project: "潮汐钢魂",
      episode: "EP01",
      shot: prompt.linkedShots[0] ?? "",
      createdAt: prompt.updatedAt,
      updatedAt: prompt.updatedAt,
      tags: prompt.tags,
      summary: prompt.prompt
    })),
    ...masterAssetData.assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: `母资产/${asset.category}`,
      project: "潮汐钢魂",
      episode: "全系列",
      shot: "",
      createdAt: asset.updatedAt,
      updatedAt: asset.updatedAt,
      tags: asset.tags,
      summary: asset.description
    }))
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
    approved: assets.filter((asset) => asset.status.includes("通过")).length,
    review: assets.filter((asset) => asset.status.includes("审核")).length,
    timelineDuration: timeline.duration
  };
}

export function statusTone(status: string): "jade" | "gold" | "red" | "slate" {
  if (status.includes("通过") || status.includes("完成")) return "jade";
  if (status.includes("审核") || status.includes("制作")) return "gold";
  if (status.includes("废弃") || status.includes("驳回")) return "red";
  return "slate";
}
