import { approvedImages, productionAssets, storyboardShots } from "../../pages/production/data/productionData";
import { editorAgent } from "../editorDirector/EditorAgent";
import { taskQueue } from "../queue/taskQueue";
import { videoTaskQueue } from "../video/VideoTaskQueue";
import { generateAgentMeeting, type ProductionMeetingReport } from "./AgentMeeting";
import { generateBudgetReport, type EpisodeBudgetReport } from "./BudgetManager";
import { generateProjectProgress, type ProjectProgressReport } from "./ProjectManager";
import { generateQualityReport, type QualityReport } from "./QualityController";
import { analyzeProductionRisk, type RiskReport } from "./RiskAnalyzer";
import { generateMissingAssetReport, type MissingAssetReport } from "./ResourcePlanner";

export type ProductionDecision = {
  episodeId: string;
  priority: "low" | "medium" | "high";
  risk: string;
  deadline: string;
  cost: number;
  recommendation: string;
};

export type ProducerReport = {
  episodeId: string;
  productionHealth: number;
  nextAction: string;
  decision: ProductionDecision;
  progress: ProjectProgressReport;
  budget: EpisodeBudgetReport;
  resources: MissingAssetReport;
  risk: RiskReport;
  quality: QualityReport;
  meeting: ProductionMeetingReport;
};

export class ProducerAgent {
  analyzeEpisode(episodeId: string): ProducerReport {
    const tasks = taskQueue.listTasks();
    const videos = videoTaskQueue.listTasks();
    const editDecision = editorAgent.generateFinalEditDecision(episodeId);
    const progress = generateProjectProgress(episodeId, tasks);
    const budget = generateBudgetReport(episodeId, tasks);
    const resources = generateMissingAssetReport(episodeId, productionAssets, storyboardShots);
    const risk = analyzeProductionRisk(episodeId, tasks, videos, resources);
    const quality = generateQualityReport(episodeId, approvedImages, editDecision);
    const meeting = generateAgentMeeting({ episodeId, progress, budget, risk, quality, resources });
    const priority = risk.riskLevel === "High" || resources.missingAssets.some((asset) => asset.priority === "high") ? "high" : risk.riskLevel === "Medium" ? "medium" : "low";
    const nextAction = priority === "high" ? "Lock missing character references before video batching." : "Continue approved keyframe generation and editor review.";

    return {
      episodeId,
      productionHealth: progress.productionHealth,
      nextAction,
      decision: {
        episodeId,
        priority,
        risk: risk.riskLevel,
        deadline: "Phase gate: resolve high-priority references before next video batch.",
        cost: budget.estimatedCost,
        recommendation: nextAction
      },
      progress,
      budget,
      resources,
      risk,
      quality,
      meeting
    };
  }
}

export const producerManagementAgent = new ProducerAgent();
