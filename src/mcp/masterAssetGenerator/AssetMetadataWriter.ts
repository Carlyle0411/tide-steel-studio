import type { MasterGenerationTask } from "./AssetGenerationQueue";

export type MasterAssetMetadata = {
  id: string;
  name: string;
  category: string;
  version: string;
  prompt: string;
  negativePrompt: string;
  model: "GPT Image2";
  created_time: string;
  reference_tags: string[];
  used_episode: string;
  approved: false;
  status: "REVIEW" | "GENERATION_FAILED";
  imagePath: string;
  failureReason?: string;
};

export function buildAssetMetadata(task: MasterGenerationTask, status: "REVIEW" | "GENERATION_FAILED", failureReason = ""): MasterAssetMetadata {
  return {
    id: task.assetId,
    name: task.name,
    category: task.category,
    version: task.assetId.split("-").at(-1) ?? "V001",
    prompt: task.prompt,
    negativePrompt: task.negativePrompt,
    model: "GPT Image2",
    created_time: new Date().toISOString(),
    reference_tags: [task.sourceType, task.category, task.variant, "MASTER_ASSET"],
    used_episode: "ALL",
    approved: false,
    status,
    imagePath: task.outputPath,
    failureReason: failureReason || undefined
  };
}
