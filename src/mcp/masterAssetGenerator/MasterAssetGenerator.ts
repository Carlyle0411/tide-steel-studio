import { getMissingMasterAssets, getMasterGenerationStats, type MasterGenerationTask } from "./AssetGenerationQueue";
import { createAssetImportPlan } from "./AssetImporter";
import { executeGPTImage2 } from "./GPTImage2Executor";

export type MasterAssetGenerationPreview = {
  stats: ReturnType<typeof getMasterGenerationStats>;
  nextTasks: MasterGenerationTask[];
};

export function previewMasterAssetGeneration(limit = 12): MasterAssetGenerationPreview {
  return {
    stats: getMasterGenerationStats(),
    nextTasks: getMissingMasterAssets(limit)
  };
}

export function generateMasterAssetWithExistingImage(task: MasterGenerationTask, generatedImagePath: string) {
  const result = executeGPTImage2({ task, generatedImagePath });
  if (result.status === "generation_failed") {
    return { result, importPlan: null };
  }
  return {
    result,
    importPlan: createAssetImportPlan(task, result.sourcePath)
  };
}

export function markUnavailable(task: MasterGenerationTask) {
  return executeGPTImage2({ task });
}
