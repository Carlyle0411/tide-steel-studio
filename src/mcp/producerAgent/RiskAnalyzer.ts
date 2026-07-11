import type { MCPTask } from "../schemas/task.schema";
import type { VideoTask } from "../video/VideoTaskQueue";
import type { MissingAssetReport } from "./ResourcePlanner";

export type ProductionRisk = {
  type: "Character inconsistency" | "Scene inconsistency" | "Timeline conflict" | "Missing asset" | "Production delay";
  score: number;
  severity: "low" | "medium" | "high";
  description: string;
  mitigation: string;
};

export type RiskReport = {
  episodeId: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  risks: ProductionRisk[];
};

function severity(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function analyzeProductionRisk(episodeId: string, tasks: MCPTask[], videoTasks: VideoTask[], missingReport: MissingAssetReport): RiskReport {
  const failedTasks = tasks.filter((task) => task.episodeId === episodeId && (task.status === "failed" || task.status === "needs_key")).length;
  const waitingVideos = videoTasks.filter((task) => task.episode === episodeId && (task.status === "waiting_asset" || task.status === "needs_key")).length;
  const highMissing = missingReport.missingAssets.filter((asset) => asset.priority === "high").length;
  const risks: ProductionRisk[] = [
    {
      type: "Character inconsistency",
      score: highMissing ? 78 : 28,
      severity: severity(highMissing ? 78 : 28),
      description: "Main character references are not fully approved for future shots.",
      mitigation: "Lock Lin Zhou and Xu Ran references before image batches involving faces."
    },
    {
      type: "Missing asset",
      score: Math.min(90, missingReport.missingAssets.length * 12),
      severity: severity(Math.min(90, missingReport.missingAssets.length * 12)),
      description: missingReport.summary,
      mitigation: "Create missing references in draft/review before video production."
    },
    {
      type: "Production delay",
      score: Math.min(85, failedTasks * 18 + waitingVideos * 8),
      severity: severity(Math.min(85, failedTasks * 18 + waitingVideos * 8)),
      description: "Some tasks cannot proceed because keys, endpoints, or approved media are missing.",
      mitigation: "Resolve provider configuration and approved-image gate before batching videos."
    },
    {
      type: "Timeline conflict",
      score: 20,
      severity: "low",
      description: "AI Edit Mode preserves original timeline and does not delete shots.",
      mitigation: "Keep final edit in review until manual approval."
    }
  ];
  const riskScore = Math.round(risks.reduce((sum, risk) => sum + risk.score, 0) / risks.length);
  return {
    episodeId,
    riskScore,
    riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
    risks
  };
}
