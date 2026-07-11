import { taskQueue } from "../queue/taskQueue";
import type { MCPTask, MCPTaskType } from "../schemas/task.schema";
import { resolveShotContext } from "./ContextResolver";
import { buildImagePrompt } from "./PromptBuilder";

export type ProductionEngineInput = {
  episodeId: string;
  shotId: string;
  taskType: MCPTaskType;
};

export class ProductionEngine {
  createProductionTask(input: ProductionEngineInput): MCPTask {
    const context = resolveShotContext(input.episodeId, input.shotId);
    const prompt = buildImagePrompt(context);
    return taskQueue.addTask({
      type: input.taskType,
      projectId: "tide-steel-soul",
      episodeId: input.episodeId,
      shotId: input.shotId,
      assetIds: context.references.map((reference) => reference.assetId),
      toolId: prompt.toolId,
      input: {
        productionEngine: true,
        prompt: prompt.prompt,
        negative: prompt.negative,
        context,
        references: context.references
      },
      output: undefined,
      reviewStatus: "draft"
    });
  }
}

export const productionEngine = new ProductionEngine();
