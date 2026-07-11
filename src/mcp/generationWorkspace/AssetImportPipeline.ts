import type { AssetProductionTask } from "./AssetProductionTask";

export type ImportReadiness =
  | {
      ok: true;
      nextStatus: "REVIEW";
      metadata: Record<string, string | boolean>;
    }
  | {
      ok: false;
      nextStatus: "WAITING_IMPORT";
      reason: string;
    };

export function prepareAssetImport(task: AssetProductionTask, realPngPath?: string): ImportReadiness {
  if (!realPngPath || !realPngPath.toLowerCase().endsWith(".png")) {
    return {
      ok: false,
      nextStatus: "WAITING_IMPORT",
      reason: "等待真实 PNG 文件。没有真实图片路径时，禁止进入 Review 或 Master。"
    };
  }

  return {
    ok: true,
    nextStatus: "REVIEW",
    metadata: {
      asset_id: task.assetId,
      prompt: task.prompt,
      reference: task.reference ?? "",
      character_id: task.characterId ?? "",
      version: task.variant,
      created_time: new Date().toISOString(),
      approved: false
    }
  };
}
