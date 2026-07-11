import type { MasterGenerationTask } from "../masterAssetGenerator/AssetGenerationQueue";

export type WorkspaceTaskStatus =
  | "DRAFT"
  | "READY"
  | "GENERATING"
  | "WAITING_IMPORT"
  | "REVIEW"
  | "MASTER";

export type AssetProductionTask = {
  taskId: string;
  assetId: string;
  name: string;
  category: string;
  variant: string;
  sourceType: string;
  status: WorkspaceTaskStatus;
  prompt: string;
  negativePrompt: string;
  reference?: string;
  characterId?: string;
  outputPath: string;
  metadataPath: string;
  promptPath: string;
  originalTask: MasterGenerationTask;
};

export function mapMasterTaskToProductionTask(task: MasterGenerationTask, prompt: string, reference?: string): AssetProductionTask {
  return {
    taskId: task.taskId,
    assetId: task.assetId,
    name: task.name,
    category: task.category,
    variant: task.variant,
    sourceType: task.sourceType,
    status: mapStatus(task.status),
    prompt,
    negativePrompt: task.negativePrompt,
    reference,
    characterId: task.sourceType === "character" ? inferCharacterId(task.outputPath) : undefined,
    outputPath: task.outputPath,
    metadataPath: task.metadataPath,
    promptPath: task.promptPath,
    originalTask: task
  };
}

export function mapStatus(status: string): WorkspaceTaskStatus {
  if (status === "REVIEW" || status === "GENERATED") return "REVIEW";
  if (status === "APPROVED" || status === "MASTER_REFERENCE") return "MASTER";
  if (status === "GENERATING" || status === "DOWNLOADING" || status === "IMPORTING" || status === "VALIDATING") return "GENERATING";
  if (status === "WAITING_IMPORT") return "WAITING_IMPORT";
  return "READY";
}

export function inferCharacterId(path: string) {
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  const match = normalized.match(/characters\/([^/]+)/);
  return match?.[1];
}
