import { getAdapter } from "../adapters";
import { mcpLogger } from "../logs/mcpLogger";
import { reviewQueue } from "../review/ReviewQueue";
import { nextAssetVersion } from "../schemas/assetVersion.schema";
import type { MCPTask } from "../schemas/task.schema";
import { resolveShotContext } from "../engine/ContextResolver";
import { buildImagePrompt } from "../engine/PromptBuilder";
import { runAssetSafetyCheck } from "./assetSafetyRules";

export async function createKeyframeProductionWorkflow(task: MCPTask): Promise<Partial<MCPTask>> {
  const context = resolveShotContext(task.episodeId ?? "EP01", task.shotId ?? "EP01_KF01");
  const prompt = {
    ...buildImagePrompt(context),
    prompt: typeof task.input.prompt === "string" && task.input.prompt.trim() ? task.input.prompt : buildImagePrompt(context).prompt,
    negative: typeof task.input.negativePrompt === "string" && task.input.negativePrompt.trim() ? task.input.negativePrompt : buildImagePrompt(context).negative
  };
  const safety = runAssetSafetyCheck({
    targetStage: "image",
    targetToolId: "gpt_image2",
    episodeId: context.episodeId,
    prompt: prompt.prompt,
    registered: true
  });
  if (!safety.allowed) {
    mcpLogger.warn({ scope: "workflow", taskId: task.taskId, toolId: "gpt_image2", message: "Keyframe production blocked", reason: safety.reasons.join("; ") });
    return { status: "failed", reviewStatus: "rejected", errors: safety.reasons };
  }

  const adapter = getAdapter("gpt_image2");
  if (!adapter) return { status: "failed", errors: ["GPT Image2 adapter is not registered."] };

  const job = await adapter.submitJob({
    taskId: task.taskId,
    prompt: prompt.prompt,
    negative: prompt.negative,
    references: context.references,
    episodeId: context.episodeId,
    shotId: context.shotId,
    referenceImages: context.references.map((reference) => reference.reference)
  });

  if (job.status === "needs_key" || job.status === "failed" || job.status === "planned") {
    mcpLogger.warn({ scope: "workflow", taskId: task.taskId, toolId: "gpt_image2", message: "Keyframe production did not submit", reason: job.error });
    return {
      status: job.status === "needs_key" ? "needs_key" : "failed",
      reviewStatus: "draft",
      output: { job, context, prompt },
      errors: job.error ? [job.error] : ["GPT Image2 job was not submitted."]
    };
  }

  const assetVersion = {
    assetId: `${context.shotId}_DRAFT`,
    version: nextAssetVersion(),
    source: "createKeyframeProduction.workflow",
    prompt: prompt.prompt,
    tool: "gpt_image2",
    createdAt: new Date().toISOString(),
    status: "waiting_review" as const
  };
  reviewQueue.add({ taskId: task.taskId, assetVersion, prompt: prompt.prompt, tool: "gpt_image2" });

  return {
    status: "completed",
    reviewStatus: "review",
    progress: 100,
    output: { job, context, prompt, assetVersion }
  };
}
