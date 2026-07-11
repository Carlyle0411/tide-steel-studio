import { directorEngine } from "../director/DirectorEngine";
import { taskQueue } from "../queue/taskQueue";
import type { MCPTask } from "../schemas/task.schema";
import type { EpisodePlan } from "./EpisodePlanner";

export class EpisodeTaskGenerator {
  createShotTasks(plan: EpisodePlan): MCPTask[] {
    return plan.shots.map((shot) => {
      const directorPackage = directorEngine.generateDirectorPrompt(plan.episodeId, shot.shotId);
      return taskQueue.addTask({
        type: "image_generation",
        projectId: "tide-steel-soul",
        episodeId: plan.episodeId,
        shotId: shot.shotId,
        assetIds: [],
        toolId: "gpt_image2",
        model: "gpt_image2",
        progress: 0,
        input: {
          productionEngine: true,
          episodeBatch: true,
          prompt: directorPackage.finalPrompt,
          negative: directorPackage.negativePrompt,
          directorPromptVersion: directorPackage.promptVersion.version
        },
        output: undefined,
        reviewStatus: "draft"
      });
    });
  }
}

export const episodeTaskGenerator = new EpisodeTaskGenerator();
