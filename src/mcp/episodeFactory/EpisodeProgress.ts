import type { MCPTask } from "../schemas/task.schema";

export type EpisodeProgressReport = {
  episodeId: string;
  totalShots: number;
  directorCompleted: number;
  promptGenerated: number;
  imageGenerated: number;
  reviewPassed: number;
  videoReady: number;
};

export function calculateEpisodeProgress(episodeId: string, tasks: MCPTask[]): EpisodeProgressReport {
  const episodeTasks = tasks.filter((task) => task.episodeId === episodeId);
  const totalShots = episodeId === "EP01" ? 18 : episodeTasks.length;
  return {
    episodeId,
    totalShots,
    directorCompleted: episodeTasks.length,
    promptGenerated: episodeTasks.filter((task) => Boolean(task.input.prompt)).length,
    imageGenerated: episodeTasks.filter((task) => task.status === "completed" && task.type === "image_generation").length,
    reviewPassed: episodeTasks.filter((task) => task.reviewStatus === "approved").length,
    videoReady: episodeTasks.filter((task) => task.type === "video_generation" && task.status === "completed").length
  };
}
