import { reviewQueue } from "../review/ReviewQueue";
import type { GPTImage2GenerateOutput } from "../adapters/gptImage2.adapter";
import type { AssetGenerationTask } from "./AssetGenerationQueue";
import { scoreAssetConsistency } from "./AssetQualityChecker";

export type ImportedAssetResult = {
  status: "review" | "needs_key" | "failed";
  localPath?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  qualityScore?: number;
  error?: string;
};

export function importGeneratedAsset(task: AssetGenerationTask, result: GPTImage2GenerateOutput): ImportedAssetResult {
  if (result.status === "needs_key") return { status: "needs_key", error: result.error };
  if (result.status === "failed") return { status: "failed", error: result.error };

  const quality = scoreAssetConsistency({ ...task, outputAssetPath: result.localPath });
  reviewQueue.add({
    taskId: task.taskId,
    assetVersion: {
      assetId: result.localPath,
      version: task.version,
      source: "AI Asset Factory Import Pipeline",
      prompt: task.prompt ?? "",
      tool: "gpt_image2",
      createdAt: new Date().toISOString(),
      parentAsset: `${task.type}:${task.assetName}:${task.variant}`,
      status: "waiting_review"
    },
    prompt: task.prompt ?? "",
    tool: "gpt_image2",
    image: result.imageUrl
  });

  return {
    status: "review",
    localPath: result.localPath,
    imageUrl: result.imageUrl,
    metadata: result.metadata,
    qualityScore: quality.total
  };
}
