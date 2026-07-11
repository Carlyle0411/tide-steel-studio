import { getAdapter } from "../adapters";
import { mcpLogger } from "../logs/mcpLogger";
import { MCPTask } from "../schemas/task.schema";
import { runAssetSafetyCheck } from "./assetSafetyRules";

export async function generateVideoShotWorkflow(task: MCPTask): Promise<Partial<MCPTask>> {
  const safety = runAssetSafetyCheck({
    targetStage: "video",
    targetToolId: task.toolId,
    episodeId: task.episodeId,
    assetId: task.assetIds[0],
    assetStatus: task.input.assetStatus as "draft" | "review" | "approved" | "deprecated" | undefined,
    prompt: String(task.input.motionPrompt ?? "")
  });
  if (!safety.allowed) {
    mcpLogger.warn({ scope: "workflow", taskId: task.taskId, toolId: task.toolId, message: "Video shot blocked by asset safety", reason: safety.reasons.join("; ") });
    return { status: "failed", errors: safety.reasons };
  }
  const adapter = getAdapter(task.toolId);
  if (!adapter) return { status: "failed", errors: [`No adapter registered for ${task.toolId}`] };
  const job = await adapter.submitJob(task.input);
  return {
    status: job.status === "queued" || job.status === "completed" ? "completed" : "failed",
    reviewStatus: job.status === "queued" || job.status === "completed" ? "review" : "draft",
    output: { job, target: "draft_video", next: "review" },
    errors: job.error ? [job.error] : []
  };
}
