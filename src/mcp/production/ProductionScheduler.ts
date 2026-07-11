import { taskQueue } from "../queue/taskQueue";
import type { MCPTask } from "../schemas/task.schema";

export class ProductionScheduler {
  scheduleImageGeneration(input: {
    episodeId: string;
    shotId: string;
    prompt: string;
    negativePrompt: string;
    referenceImages: string[];
  }): MCPTask {
    return taskQueue.addTask({
      type: "image_generation",
      projectId: "tide-steel-soul",
      episodeId: input.episodeId,
      shotId: input.shotId,
      assetIds: input.referenceImages,
      toolId: "gpt_image2",
      model: "gpt_image2",
      progress: 0,
      input: {
        productionEngine: true,
        prompt: input.prompt,
        negative: input.negativePrompt,
        referenceImages: input.referenceImages,
        episodeId: input.episodeId,
        shotId: input.shotId
      },
      output: undefined,
      reviewStatus: "draft"
    });
  }
}

export const productionScheduler = new ProductionScheduler();
