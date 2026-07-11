import { mcpLogger } from "../logs/mcpLogger";
import type { MCPTask } from "../schemas/task.schema";
import { runAssetSafetyCheck } from "./assetSafetyRules";

export type ConsistencyResultLevel = "PASS" | "WARNING" | "FAIL";

export type ConsistencyCheckResult = {
  result: ConsistencyResultLevel;
  checks: Array<{
    area: "character" | "mecha" | "environment" | "creature" | "pipeline";
    status: ConsistencyResultLevel;
    message: string;
  }>;
};

export async function runConsistencyCheckWorkflow(task: MCPTask): Promise<Partial<MCPTask>> {
  const subject = String(task.input.subject ?? "");
  const prompt = String(task.input.prompt ?? "");
  const checks: ConsistencyCheckResult["checks"] = [];

  const safety = runAssetSafetyCheck({
    targetStage: "review",
    episodeId: task.episodeId,
    assetId: task.assetIds[0],
    subject,
    prompt,
    registered: task.input.registered as boolean | undefined
  });

  checks.push({
    area: "pipeline",
    status: safety.allowed ? "PASS" : "FAIL",
    message: safety.allowed ? "Asset safety rules passed." : safety.reasons.join("; ")
  });

  if (/陈牧|chen mu/i.test(subject + prompt)) {
    checks.push({ area: "character", status: "WARNING", message: "Character face, age and uniform require image-level verification by reviewer." });
  }
  if (/赤霆|crt001|red thunder/i.test(subject + prompt)) {
    checks.push({ area: "mecha", status: /EP01/.test(task.episodeId ?? "") && /完整|full body|hero pose/i.test(prompt) ? "FAIL" : "PASS", message: "CRT-001 must keep dark red armor, black frame and blue sync light; EP01 cannot show full body." });
  }
  if (/杭州湾|海防|deep blue|深蓝/i.test(subject + prompt)) {
    checks.push({ area: "environment", status: "PASS", message: "Environment should keep wet cold industrial ocean-defense language." });
  }

  const result: ConsistencyResultLevel = checks.some((check) => check.status === "FAIL") ? "FAIL" : checks.some((check) => check.status === "WARNING") ? "WARNING" : "PASS";
  const output: ConsistencyCheckResult = { result, checks };
  mcpLogger.info({ scope: "workflow", taskId: task.taskId, message: `Consistency check ${result}`, output });
  return {
    status: "completed",
    reviewStatus: result === "FAIL" ? "rejected" : "review",
    output,
    errors: result === "FAIL" ? checks.filter((check) => check.status === "FAIL").map((check) => check.message) : []
  };
}
