import { mcpLogger } from "../logs/mcpLogger";
import { batchProductionStore } from "../production/BatchProduction";
import { episodePlanner } from "./EpisodePlanner";
import { episodeTaskGenerator } from "./EpisodeTaskGenerator";
import { calculateEpisodeProgress } from "./EpisodeProgress";
import { episodeValidator } from "./EpisodeValidator";
import { taskQueue } from "../queue/taskQueue";

export class EpisodeFactory {
  createEpisodeProduction(episodeId: string) {
    const plan = episodePlanner.createPlan(episodeId);
    const validation = episodeValidator.validatePlan(plan);
    if (!validation.ok) {
      mcpLogger.error({ scope: "workflow", message: "Episode factory validation failed", reason: validation.reasons.join("; "), input: { episodeId } });
      throw new Error(validation.reasons.join("; "));
    }
    const tasks = episodeTaskGenerator.createShotTasks(plan);
    const batch = batchProductionStore.createBatch(episodeId, tasks);
    mcpLogger.info({ scope: "workflow", message: "Episode production batch created", input: { episodeId, totalShots: tasks.length, batchId: batch.batchId } });
    return { plan, tasks, batch, progress: calculateEpisodeProgress(episodeId, taskQueue.listTasks()) };
  }

  resumeEpisodeProduction(episodeId: string) {
    const tasks = taskQueue.listTasks().filter((task) => task.episodeId === episodeId && task.status === "pending");
    mcpLogger.info({ scope: "workflow", message: "Episode production resume requested", input: { episodeId, pendingTasks: tasks.length } });
    return tasks;
  }

  retryFailedShots(episodeId: string) {
    const retries = taskQueue
      .listTasks()
      .filter((task) => task.episodeId === episodeId && (task.status === "failed" || task.status === "needs_key"))
      .map((task) => taskQueue.retryTask(task.taskId))
      .filter(Boolean);
    mcpLogger.info({ scope: "workflow", message: "Episode failed shots retry requested", input: { episodeId, retries: retries.length } });
    return retries;
  }
}

export const episodeFactory = new EpisodeFactory();
