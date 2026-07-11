import type { MCPTask } from "../schemas/task.schema";
import { estimateEpisodeCost } from "../cost/CostTracker";

export type BudgetLine = {
  category: "Image Generation Cost" | "Video Generation Cost" | "Audio Cost" | "Storage Cost" | "API Cost";
  estimatedCost: number;
  actualCost: number;
  note: string;
};

export type EpisodeBudgetReport = {
  episodeId: string;
  currency: "USD";
  estimatedCost: number;
  actualCost: number;
  remainingBudget: number;
  budgetCap: number;
  lines: BudgetLine[];
};

export function generateBudgetReport(episodeId: string, tasks: MCPTask[], budgetCap = 300): EpisodeBudgetReport {
  const estimate = estimateEpisodeCost(episodeId, tasks);
  const actualImageTasks = tasks.filter((task) => task.episodeId === episodeId && task.type === "image_generation" && task.status === "completed").length;
  const actualVideoTasks = tasks.filter((task) => task.episodeId === episodeId && task.type === "video_generation" && task.status === "completed").length;
  const actualCost = Number((actualImageTasks * 0.08 + actualVideoTasks * 0.9).toFixed(2));
  const audio = 8;
  const storage = 4;
  const apiBuffer = Number((estimate.estimatedCost * 0.12).toFixed(2));

  return {
    episodeId,
    currency: "USD",
    estimatedCost: Number((estimate.estimatedCost + audio + storage + apiBuffer).toFixed(2)),
    actualCost,
    remainingBudget: Number((budgetCap - actualCost).toFixed(2)),
    budgetCap,
    lines: [
      { category: "Image Generation Cost", estimatedCost: estimate.byModel[0]?.estimatedCost ?? 0, actualCost: Number((actualImageTasks * 0.08).toFixed(2)), note: "Based on planned keyframes and completed image tasks." },
      { category: "Video Generation Cost", estimatedCost: estimate.byModel[1]?.estimatedCost ?? 0, actualCost: Number((actualVideoTasks * 0.9).toFixed(2)), note: "Based on estimated seconds; real provider billing will replace this." },
      { category: "Audio Cost", estimatedCost: audio, actualCost: 0, note: "Placeholder for SFX, BGM, voice, and final mix." },
      { category: "Storage Cost", estimatedCost: storage, actualCost: 0, note: "Local storage and future cloud asset archive." },
      { category: "API Cost", estimatedCost: apiBuffer, actualCost: 0, note: "Safety buffer for retries, failed jobs, and model comparisons." }
    ]
  };
}
