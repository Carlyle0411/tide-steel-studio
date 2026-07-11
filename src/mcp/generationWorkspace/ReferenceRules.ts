import type { MasterGenerationTask } from "../masterAssetGenerator/AssetGenerationQueue";

const characterReferenceByFolder: Record<string, string> = {
  linzhou: "assets/characters/linzhou/MASTER_REFERENCE.png",
  xuran: "assets/characters/xuran/MASTER_REFERENCE.png",
  chenmu: "assets/characters/chenmu/MASTER_REFERENCE.png",
  tangxiaoman: "assets/characters/tangxiaoman/MASTER_REFERENCE.png",
  lan: "assets/characters/lan/MASTER_REFERENCE.png"
};

export function getReferenceForTask(task: MasterGenerationTask) {
  if (task.sourceType !== "character") return task.referencePath;
  const normalized = task.outputPath.replace(/\\/g, "/").toLowerCase();
  const folder = normalized.match(/characters\/([^/]+)/)?.[1];
  return folder ? characterReferenceByFolder[folder] ?? task.referencePath : task.referencePath;
}

export function buildIdentityLockNote(task: MasterGenerationTask) {
  if (task.sourceType !== "character") return "非角色资产：使用视觉风格圣经和对应资产设定锁定。";
  return [
    "Same person identity.",
    "Same facial structure.",
    "Same hairstyle.",
    "Same age.",
    "Same scar.",
    "No redesign.",
    `Reference: ${getReferenceForTask(task)}`
  ].join("\n");
}
