import { gptImage2Adapter } from "../adapters/gptImage2.adapter";
import { assetGenerationQueue, type AssetGenerationTask, type AssetTaskType } from "./AssetGenerationQueue";
import { buildAssetProductionPlan, buildAssetPrompt, type PlannedAsset } from "./AssetPromptEngine";
import { importGeneratedAsset } from "./AssetImportPipeline";
import { nextFactoryVersion } from "./AssetVersionController";

export class AssetFactory {
  createPlannedTasks(type?: AssetTaskType) {
    const plan = buildAssetProductionPlan().filter((item) => !type || item.type === type);
    return plan.map((asset) => this.createTask(asset));
  }

  createTask(asset: PlannedAsset) {
    const prompt = buildAssetPrompt(asset);
    return assetGenerationQueue.add({
      type: asset.type,
      assetName: asset.assetName,
      variant: asset.variant,
      prompt,
      version: nextFactoryVersion(`${asset.type}:${asset.assetName}:${asset.variant}`)
    });
  }

  createTaskFromPrompt(input: { type: AssetTaskType; assetName: string; variant: string; prompt: string }) {
    return assetGenerationQueue.add({
      type: input.type,
      assetName: input.assetName,
      variant: input.variant,
      prompt: input.prompt,
      version: nextFactoryVersion(`${input.type}:${input.assetName}:${input.variant}`)
    });
  }

  async generateFromPrompt(input: { type: AssetTaskType; assetName: string; variant: string; prompt: string }) {
    const task = this.createTaskFromPrompt(input);
    return this.generateTask(task);
  }

  async generateTask(task: AssetGenerationTask) {
    assetGenerationQueue.patch(task.taskId, { status: "generating" });
    const result = await gptImage2Adapter.generateImage({
      taskId: task.taskId,
      assetType: task.type,
      assetName: task.assetName,
      prompt: task.prompt ?? "",
      episodeId: "ASSET_FACTORY",
      shotId: `${task.type}_${task.assetName}_${task.variant}`.replace(/\s+/g, "_"),
      version: task.version,
      size: "1536x1024",
      quality: "high",
      referenceImages: []
    });

    if (result.status === "needs_key") {
      assetGenerationQueue.patch(task.taskId, { status: "needs_key", error: result.error });
      return result;
    }
    if (result.status === "failed") {
      assetGenerationQueue.patch(task.taskId, { status: "failed", error: result.error });
      return result;
    }

    const imported = importGeneratedAsset(task, result);
    assetGenerationQueue.patch(task.taskId, {
      status: "review",
      outputAssetPath: imported.localPath,
      imageUrl: imported.imageUrl,
      qualityScore: imported.qualityScore
    });
    return result;
  }

  async generateCRT001MechaAssets() {
    const variants = ["Front View", "Side View", "Back View", "Cockpit", "Battle Damage"];
    return this.generateBatch(variants.map((variant) => ({ type: "MECHA" as const, assetName: "CRT-001 Red Thunder", variant })));
  }

  async generateCoreCharacterAssets() {
    const variants = ["Character Portrait", "Full Body", "Pilot Suit", "Emotion Sheet"];
    const assets = ["Lin Zhou", "Xu Ran"].flatMap((assetName) => variants.map((variant) => ({ type: "CHARACTER" as const, assetName, variant })));
    return this.generateBatch(assets);
  }

  async generateBatch(assets: PlannedAsset[]) {
    const results = [];
    for (const asset of assets) {
      const task = this.createTask(asset);
      results.push(await this.generateTask(task));
    }
    return results;
  }

  async generateFirstForType(type: AssetTaskType) {
    const existing = assetGenerationQueue.list(type);
    const task = existing[0] ?? this.createPlannedTasks(type)[0];
    if (!task) return undefined;
    return this.generateTask(task);
  }
}

export const assetFactory = new AssetFactory();
