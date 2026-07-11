import type { TimelineNode } from "../timeline/EpisodeTimeline";

export type RhythmLevel = "slow" | "medium" | "fast";

export type RhythmAnalysis = {
  section: string;
  shotId: string;
  duration: number;
  cameraMotion: string;
  actionIntensity: number;
  emotionLevel: number;
  dialogueDensity: number;
  rhythm: RhythmLevel;
  note: string;
};

function rhythmFromScore(score: number): RhythmLevel {
  if (score >= 70) return "fast";
  if (score >= 40) return "medium";
  return "slow";
}

export function analyzeEpisodeRhythm(nodes: TimelineNode[]): RhythmAnalysis[] {
  return nodes.map((node, index) => {
    const firstAct = index < nodes.length * 0.34;
    const middleAct = index >= nodes.length * 0.34 && index < nodes.length * 0.78;
    const actionIntensity = firstAct ? 25 + index * 2 : middleAct ? 45 + (index % 5) * 7 : 35;
    const emotionLevel = firstAct ? 30 + index * 3 : middleAct ? 55 + (index % 4) * 8 : 75 - (index % 3) * 6;
    const dialogueDensity = firstAct ? 15 : middleAct ? 28 : 18;
    const score = actionIntensity * 0.45 + emotionLevel * 0.4 + dialogueDensity * 0.15;
    const rhythm = rhythmFromScore(score);
    return {
      section: firstAct ? "Opening" : middleAct ? "Pressure Build" : "Ending",
      shotId: node.shotId,
      duration: firstAct ? 5 : middleAct ? 4 : 6,
      cameraMotion: firstAct ? "slow build" : middleAct ? "controlled pressure" : "slow emotional",
      actionIntensity,
      emotionLevel,
      dialogueDensity,
      rhythm,
      note: rhythm === "fast" ? "Cut only after action clarity is established." : rhythm === "medium" ? "Hold long enough for spatial orientation." : "Let silence and environment carry the cut."
    };
  });
}
