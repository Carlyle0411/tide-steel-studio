import { editorAgent } from "../editorDirector/EditorAgent";
import { createEpisodeTimeline } from "../timeline/EpisodeTimeline";
import { videoTaskQueue } from "../video/VideoTaskQueue";
import { buildEP01AudioTimeline } from "./EP01AudioPackage";
import { runEP01ContinuityCheck } from "./EP01ContinuityChecker";
import { buildEP01ProductionBoard, getEP01Completion } from "./EP01ProductionBoard";

export type EP01FinalReview = {
  episodeId: "EP01";
  approvedImages: number;
  generatedVideos: number;
  audioStatus: "planned" | "mixed";
  subtitleStatus: "draft" | "approved";
  finalTimelineStatus: "draft" | "review" | "approved";
  canApproveEpisode: boolean;
  blockers: string[];
};

export function buildEP01FinalReview(): EP01FinalReview {
  const board = buildEP01ProductionBoard();
  const generatedVideos = videoTaskQueue.listTasks().filter((task) => task.episode === "EP01" && task.status === "completed").length;
  const approvedImages = board.filter((shot) => shot.imageStatus === "APPROVED").length;
  const blockers = [
    approvedImages < 18 ? `Images incomplete: ${approvedImages}/18 approved.` : "",
    generatedVideos < 18 ? `Videos incomplete: ${generatedVideos}/18 generated.` : "",
    "Audio final mix not rendered.",
    "Final editor approval not recorded."
  ].filter(Boolean);
  return {
    episodeId: "EP01",
    approvedImages,
    generatedVideos,
    audioStatus: "planned",
    subtitleStatus: "draft",
    finalTimelineStatus: "draft",
    canApproveEpisode: blockers.length === 0,
    blockers
  };
}

export function buildEP01FinalPackageManifest() {
  const editDecision = editorAgent.generateFinalEditDecision("EP01");
  return {
    packageName: "EP01_FINAL_PACKAGE",
    episodeId: "EP01",
    media: {
      "EP01_VIDEO.mp4": { status: "pending", reason: "No approved/generated final video file exists yet." },
      "EP01_AUDIO.wav": { status: "pending", reason: "No rendered final audio mix exists yet." },
      "EP01_SUBTITLE.srt": { status: "draft" },
      "EP01_TIMELINE.json": { status: "draft" },
      "EP01_CONTINUITY_REPORT.json": { status: "generated" },
      "EP01_FINAL_REVIEW.json": { status: "generated" }
    },
    completion: getEP01Completion(),
    productionBoard: buildEP01ProductionBoard(),
    audioTimeline: buildEP01AudioTimeline(),
    finalTimeline: createEpisodeTimeline("EP01", 18).list(),
    editPlan: editDecision.editPlan,
    continuityReport: runEP01ContinuityCheck(),
    finalReview: buildEP01FinalReview()
  };
}
