import { mcpLogger } from "../logs/mcpLogger";
import { MCPTask } from "../schemas/task.schema";
import { runAssetSafetyCheck } from "./assetSafetyRules";

export async function consistencyCheckWorkflow(task: MCPTask): Promise<Partial<MCPTask>> {
  const safety = runAssetSafetyCheck({
    targetStage: "review",
    episodeId: task.episodeId,
    assetId: task.assetIds[0],
    prompt: String(task.input.prompt ?? ""),
    subject: String(task.input.subject ?? ""),
    registered: task.input.registered as boolean | undefined
  });
  mcpLogger.info({ scope: "workflow", taskId: task.taskId, message: "Consistency check completed", output: safety });
  return {
    status: "completed",
    reviewStatus: safety.allowed ? "review" : "rejected",
    output: safety,
    errors: safety.allowed ? [] : safety.reasons
  };
}
