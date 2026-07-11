import type { MCPTask } from "../schemas/task.schema";

export type EpisodeCostEstimate = {
  episodeId: string;
  imageCount: number;
  videoSeconds: number;
  estimatedCost: number;
  currency: "USD";
  byModel: Array<{ model: string; units: number; estimatedCost: number }>;
};

const imageUnitCost = 0.08;
const videoSecondCost = 0.18;

export function estimateEpisodeCost(episodeId: string, tasks: MCPTask[]): EpisodeCostEstimate {
  const episodeTasks = tasks.filter((task) => task.episodeId === episodeId);
  const imageCount = Math.max(18, episodeTasks.filter((task) => task.type === "image_generation").length || 0);
  const videoSeconds = 180;
  const imageCost = imageCount * imageUnitCost;
  const videoCost = videoSeconds * videoSecondCost;
  return {
    episodeId,
    imageCount,
    videoSeconds,
    estimatedCost: Number((imageCost + videoCost).toFixed(2)),
    currency: "USD",
    byModel: [
      { model: "GPT Image2", units: imageCount, estimatedCost: Number(imageCost.toFixed(2)) },
      { model: "Kling/Veo", units: videoSeconds, estimatedCost: Number(videoCost.toFixed(2)) }
    ]
  };
}
