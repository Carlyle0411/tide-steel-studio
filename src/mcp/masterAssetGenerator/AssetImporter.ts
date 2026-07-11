import type { MasterGenerationTask } from "./AssetGenerationQueue";
import { buildAssetMetadata } from "./AssetMetadataWriter";
import { validateGeneratedAsset } from "./GenerationValidator";

export type AssetImportPlan = {
  taskId: string;
  sourcePath: string;
  destinationPath: string;
  metadataPath: string;
  metadata: ReturnType<typeof buildAssetMetadata>;
  validation: ReturnType<typeof validateGeneratedAsset>;
  shellCommand: string;
};

export function createAssetImportPlan(task: MasterGenerationTask, sourcePath: string): AssetImportPlan {
  const validation = validateGeneratedAsset(task, task.outputPath);
  const status = validation.passed ? "REVIEW" : "GENERATION_FAILED";
  return {
    taskId: task.taskId,
    sourcePath,
    destinationPath: task.outputPath,
    metadataPath: task.metadataPath,
    metadata: buildAssetMetadata(task, status, validation.issues.join(" / ")),
    validation,
    shellCommand: `Copy-Item -LiteralPath "${sourcePath}" -Destination "${task.outputPath}" -Force`
  };
}
