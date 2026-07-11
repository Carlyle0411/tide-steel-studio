import type { MCPTask } from "../schemas/task.schema";
import { calculateEpisodeProgress } from "../episodeFactory/EpisodeProgress";

export type ProductionStage = "Script" | "Storyboard" | "Image" | "Video" | "Audio" | "Edit" | "Review" | "Export";

export type ProductionTimelineStage = {
  stage: ProductionStage;
  progress: number;
  status: "not_started" | "in_progress" | "blocked" | "ready";
  note: string;
};

export type ProjectProgressReport = {
  episodeId: string;
  totalShots: number;
  productionHealth: number;
  timeline: ProductionTimelineStage[];
};

export function generateProjectProgress(episodeId: string, tasks: MCPTask[]): ProjectProgressReport {
  const progress = calculateEpisodeProgress(episodeId, tasks);
  const imageProgress = Math.round((progress.imageGenerated / progress.totalShots) * 100);
  const videoProgress = Math.round((progress.videoReady / progress.totalShots) * 100);
  const reviewProgress = Math.round((progress.reviewPassed / progress.totalShots) * 100);
  const productionHealth = Math.round((100 + 100 + imageProgress + videoProgress + reviewProgress) / 5);

  return {
    episodeId,
    totalShots: progress.totalShots,
    productionHealth,
    timeline: [
      { stage: "Script", progress: 100, status: "ready", note: "Episode script foundation exists." },
      { stage: "Storyboard", progress: 100, status: "ready", note: "EP01 shotlist parsed into storyboard records." },
      { stage: "Image", progress: imageProgress, status: imageProgress >= 100 ? "ready" : "in_progress", note: `${progress.imageGenerated}/${progress.totalShots} image tasks completed.` },
      { stage: "Video", progress: videoProgress, status: videoProgress > 0 ? "in_progress" : "blocked", note: "Requires approved images and provider keys/endpoints." },
      { stage: "Audio", progress: 10, status: "in_progress", note: "Audio plan exists; final mix assets pending." },
      { stage: "Edit", progress: 20, status: "in_progress", note: "AI edit plan exists; editor review pending." },
      { stage: "Review", progress: reviewProgress, status: reviewProgress > 0 ? "in_progress" : "blocked", note: "Manual review gate remains active." },
      { stage: "Export", progress: 15, status: "in_progress", note: "Final package schema exists; media files pending." }
    ]
  };
}
