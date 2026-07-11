import type { EpisodeBudgetReport } from "./BudgetManager";
import type { ProjectProgressReport } from "./ProjectManager";
import type { QualityReport } from "./QualityController";
import type { RiskReport } from "./RiskAnalyzer";
import type { MissingAssetReport } from "./ResourcePlanner";

export type MeetingItem = {
  role: "Producer" | "Director" | "Editor" | "VFX" | "Sound Designer";
  meetingTopic: string;
  decision: string;
  reason: string;
  actionItems: string[];
};

export type ProductionMeetingReport = {
  episodeId: string;
  createdAt: string;
  items: MeetingItem[];
};

export function generateAgentMeeting(input: {
  episodeId: string;
  progress: ProjectProgressReport;
  budget: EpisodeBudgetReport;
  risk: RiskReport;
  quality: QualityReport;
  resources: MissingAssetReport;
}): ProductionMeetingReport {
  return {
    episodeId: input.episodeId,
    createdAt: new Date().toISOString(),
    items: [
      {
        role: "Producer",
        meetingTopic: "Production priority",
        decision: input.risk.riskLevel === "High" ? "Pause video batching until missing references are resolved." : "Continue EP01 image and review work.",
        reason: `Health ${input.progress.productionHealth}%, risk ${input.risk.riskLevel}, budget remaining $${input.budget.remainingBudget}.`,
        actionItems: ["Keep review gate active.", "Prioritize high-risk missing assets.", "Do not overwrite original timeline."]
      },
      {
        role: "Director",
        meetingTopic: "Story and visual control",
        decision: "Protect the slow-burn EP01 rhythm.",
        reason: "The first episode depends on small physical anomalies and Chen Mu's decision, not spectacle.",
        actionItems: ["Avoid adding action shots before story need is proven.", "Keep camera language restrained."]
      },
      {
        role: "Editor",
        meetingTopic: "Cut plan",
        decision: "Use AI edit plan as review material only.",
        reason: "AI recommendations are useful, but final emotional timing must be approved manually.",
        actionItems: ["Review hold/trim decisions.", "Check subtitle timing against final script."]
      },
      {
        role: "VFX",
        meetingTopic: "Missing assets",
        decision: `Resolve ${input.resources.missingAssets.length} asset gaps before large batch generation.`,
        reason: "Reference drift is more expensive than early planning.",
        actionItems: input.resources.missingAssets.slice(0, 3).map((asset) => `Prepare ${asset.assetId} for review.`)
      },
      {
        role: "Sound Designer",
        meetingTopic: "Audio plan",
        decision: "Build low-frequency ocean and facility ambience before music.",
        reason: "EP01 fear comes from sound absence and pressure, not score volume.",
        actionItems: ["Create room tone bed.", "Mark silence around the observation-gate close."]
      }
    ]
  };
}
