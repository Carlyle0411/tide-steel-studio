import { assetStorage, type StoredProductionAsset } from "../storage/AssetStorage";
import type { AssetGenerationTask } from "./AssetGenerationQueue";
import { listLocalAssets, localAssetUrl } from "../localAssetGenerator/LocalAssetManifest";

export type FactoryLibraryItem = {
  assetId: string;
  category: string;
  name: string;
  version: string;
  prompt: string;
  generationDate: string;
  qualityScore: number;
  usedCount: number;
  previewImage?: string;
  status: StoredProductionAsset["status"];
};

export function listFactoryLibrary(tasks: AssetGenerationTask[]): FactoryLibraryItem[] {
  const local = listLocalAssets().map((asset) => ({
    assetId: asset.id,
    category: asset.category,
    name: asset.name,
    version: asset.version,
    prompt: asset.prompt,
    generationDate: asset.createdAt,
    qualityScore: asset.qualityScore,
    usedCount: 0,
    previewImage: localAssetUrl(asset),
    status: asset.status
  }));
  const stored = assetStorage.listAssets();
  const runtime = stored.map((asset) => {
    const task = tasks.find((item) => item.outputAssetPath === asset.assetPath || item.assetName === asset.shot);
    return {
      assetId: asset.assetId,
      category: task?.type ?? "KEYFRAME",
      name: task?.assetName ?? asset.shot,
      version: asset.version,
      prompt: asset.prompt,
      generationDate: asset.createdAt,
      qualityScore: task?.qualityScore ?? 0,
      usedCount: 0,
      previewImage: asset.dataUrl ?? asset.url,
      status: asset.status
    };
  });
  return [...local, ...runtime].filter((asset) => Boolean(asset.previewImage));
}

export function getFactoryStats(tasks: AssetGenerationTask[]) {
  const local = listLocalAssets();
  const stored = assetStorage.listAssets();
  const all = [...local, ...stored];
  return {
    generatedAssets: all.length,
    approvedAssets: all.filter((asset) => asset.status === "approved").length,
    pendingReview: all.filter((asset) => asset.status === "review" || asset.status === "waiting_review").length + tasks.filter((task) => task.status === "review").length,
    failedGeneration: tasks.filter((task) => task.status === "failed").length,
    characters: local.filter((asset) => asset.category === "characters").length + tasks.filter((task) => task.type === "CHARACTER").length,
    mechas: local.filter((asset) => asset.category === "mechas").length + tasks.filter((task) => task.type === "MECHA").length,
    creatures: local.filter((asset) => asset.category === "creatures").length + tasks.filter((task) => task.type === "CREATURE").length,
    environment: local.filter((asset) => asset.category === "environment").length + tasks.filter((task) => task.type === "ENVIRONMENT").length
  };
}
