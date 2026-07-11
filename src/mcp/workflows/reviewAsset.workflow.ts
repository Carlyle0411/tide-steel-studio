import { mcpLogger } from "../logs/mcpLogger";
import { MCPTask } from "../schemas/task.schema";
import { runAssetSafetyCheck } from "./assetSafetyRules";

export async function reviewAssetWorkflow(task: MCPTask): Promise<Partial<MCPTask>> {
  const approved = Boolean(task.input.approved);
  const consistencyPassed = Boolean(task.input.consistencyPassed);
  const safety = runAssetSafetyCheck({
    targetStage: "review",
    assetId: task.assetIds[0],
    assetStatus: task.input.assetStatus as "draft" | "review" | "approved" | "deprecated" | undefined,
    consistencyPassed
  });
  if (!safety.allowed) return { status: "failed", reviewStatus: "rejected", errors: safety.reasons };
  const reviewStatus = approved ? "approved" : "rejected";
  mcpLogger.info({ scope: "review", taskId: task.taskId, assetId: task.assetIds[0], message: `Asset review ${reviewStatus}`, output: task.input });
  return { status: "completed", reviewStatus, output: { reviewStatus, approved, consistencyPassed } };
}
