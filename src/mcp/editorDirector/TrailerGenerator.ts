import type { TimelineEditPlan } from "./EditPlanner";
import type { EmotionPoint } from "./EmotionCurve";

export type TrailerBeat = {
  time: string;
  section: "Hook" | "World + Conflict" | "Peak" | "Title Reveal";
  sourceShots: string[];
  editNote: string;
};

export type TrailerPlan = {
  episodeId: string;
  duration: 30;
  beats: TrailerBeat[];
  titleCard: string;
  protectedOriginalAssets: true;
};

export function generateTrailerPlan(episodeId: string, editPlan: TimelineEditPlan, emotionCurve: EmotionPoint[]): TrailerPlan {
  const highValueShots = editPlan.decisions.filter((decision) => decision.action === "hold" || decision.action === "keep").map((decision) => decision.shotId);
  return {
    episodeId,
    duration: 30,
    beats: [
      { time: "0-3s", section: "Hook", sourceShots: highValueShots.slice(0, 1), editNote: "Open with the smallest impossible sign, not spectacle." },
      { time: "3-15s", section: "World + Conflict", sourceShots: highValueShots.slice(1, 5), editNote: "Reveal the defense line and command pressure without explaining the world." },
      { time: "15-25s", section: "Peak", sourceShots: highValueShots.slice(-4), editNote: `Build toward ${emotionCurve[emotionCurve.length - 2]?.emotion ?? "dread"} without showing a monster.` },
      { time: "25-30s", section: "Title Reveal", sourceShots: highValueShots.slice(-1), editNote: "End on sound and title, not exposition." }
    ],
    titleCard: "潮汐钢魂：赤霆纪元 EP01 海面低频",
    protectedOriginalAssets: true
  };
}
