import { createEpisodeTimeline } from "../timeline/EpisodeTimeline";
import { createEditPlan, type TimelineEditPlan } from "./EditPlanner";
import { generateEmotionCurve, type EmotionPoint } from "./EmotionCurve";
import { analyzeEpisodeRhythm, type RhythmAnalysis } from "./RhythmAnalyzer";
import { rankShots, type ShotScore } from "./ShotRanking";
import { planTransitions, type TransitionDecision } from "./TransitionPlanner";
import { generateTrailerPlan, type TrailerPlan } from "./TrailerGenerator";

export type FinalEditDecision = {
  episodeId: string;
  sourceShotCount: number;
  rhythm: RhythmAnalysis[];
  emotionCurve: EmotionPoint[];
  shotRanking: ShotScore[];
  transitions: TransitionDecision[];
  editPlan: TimelineEditPlan;
  trailerPlan: TrailerPlan;
  status: "editor_review";
  guardrails: string[];
};

export class EditorAgent {
  generateFinalEditDecision(episodeId: string): FinalEditDecision {
    const nodes = createEpisodeTimeline(episodeId, 18).list();
    const rhythm = analyzeEpisodeRhythm(nodes);
    const emotionCurve = generateEmotionCurve(episodeId);
    const shotRanking = rankShots(nodes);
    const transitions = planTransitions(rhythm, shotRanking);
    const editPlan = createEditPlan({ episodeId, nodes, rhythm, emotionCurve, rankings: shotRanking, transitions });
    const trailerPlan = generateTrailerPlan(episodeId, editPlan, emotionCurve);

    return {
      episodeId,
      sourceShotCount: nodes.length,
      rhythm,
      emotionCurve,
      shotRanking,
      transitions,
      editPlan,
      trailerPlan,
      status: "editor_review",
      guardrails: [
        "Do not delete source assets.",
        "Do not overwrite original timeline.",
        "All edit decisions require editor review before export.",
        "Subtitle and audio timing remain editable downstream."
      ]
    };
  }
}

export const editorAgent = new EditorAgent();
