import { getAdapter } from "../adapters";
import { mcpLogger } from "../logs/mcpLogger";
import { MCPTask } from "../schemas/task.schema";
import { runAssetSafetyCheck } from "./assetSafetyRules";

export async function generateKeyframeWorkflow(task: MCPTask): Promise<Partial<MCPTask>> {
  const safety = runAssetSafetyCheck({
    targetStage: "image",
    targetToolId: task.toolId,
    episodeId: task.episodeId,
    prompt: String(task.input.prompt ?? ""),
    assetId: task.assetIds[0]
  });
  if (!safety.allowed) {
    mcpLogger.warn({ scope: "workflow", taskId: task.taskId, toolId: task.toolId, message: "Keyframe blocked by asset safety", reason: safety.reasons.join("; ") });
    return { status: "failed", errors: safety.reasons };
  }
  const adapter = getAdapter(task.toolId);
  if (!adapter) return { status: "failed", errors: [`No adapter registered for ${task.toolId}`] };
  const job = await adapter.submitJob(task.input);
  return {
    status: job.status === "queued" || job.status === "completed" ? "completed" : "failed",
    reviewStatus: job.status === "queued" || job.status === "completed" ? "review" : "draft",
    output: { job, target: "draft", next: "review" },
    errors: job.error ? [job.error] : []
  };
}
