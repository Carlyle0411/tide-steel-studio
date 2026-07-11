import type { ProductionAsset, StoryboardShotRecord } from "../../pages/production/types";

export type MissingAsset = {
  assetId: string;
  category: "character" | "mecha" | "creature" | "environment" | "shot";
  priority: "high" | "medium" | "low";
  reason: string;
};

export type MissingAssetReport = {
  episodeId: string;
  missingAssets: MissingAsset[];
  summary: string;
};

export function generateMissingAssetReport(episodeId: string, assets: ProductionAsset[], shots: StoryboardShotRecord[]): MissingAssetReport {
  const missingAssets: MissingAsset[] = [];
  if (!assets.some((asset) => asset.name.includes("林舟") && asset.approved)) {
    missingAssets.push({ assetId: "CHAR-LINZHOU-REFERENCE", category: "character", priority: "high", reason: "Lin Zhou appears after EP01 and needs locked face/reference before cockpit shots." });
  }
  if (!assets.some((asset) => asset.name.includes("许燃") && asset.approved)) {
    missingAssets.push({ assetId: "CHAR-XURAN-REFERENCE", category: "character", priority: "high", reason: "Xu Ran needs an approved reference before sync-room and cockpit reaction shots." });
  }
  if (!assets.some((asset) => asset.name.includes("白潮") && asset.approved)) {
    missingAssets.push({ assetId: "CRE-WHITE-TIDE-PARTIAL", category: "creature", priority: "medium", reason: "White Tide partial body language must be designed before EP03-EP07 escalation." });
  }
  if (shots.length < 18) {
    missingAssets.push({ assetId: "EP01-SHOTLIST-COVERAGE", category: "shot", priority: "medium", reason: "EP01 expected 18 shots for production tracking." });
  }
  missingAssets.push({ assetId: "MECHA-CRT001-COMBAT-CLOSEUP", category: "mecha", priority: "medium", reason: "CRT001 has approved cockpit/back detail, but combat closeup reference is not production-ready." });
  missingAssets.push({ assetId: "ENV-TIDE-GATE-INTERIOR", category: "environment", priority: "low", reason: "Tide Gate interior is a later reveal; keep in planning but do not force early production." });

  return {
    episodeId,
    missingAssets,
    summary: `${missingAssets.length} resource gaps found; none should be solved by bypassing asset review.`
  };
}
