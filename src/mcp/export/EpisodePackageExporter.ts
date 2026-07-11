import { productionDocs, approvedImages, storyboardShots } from "../../pages/production/data/productionData";
import { generationHistory } from "../logs/generationHistory";
import { taskQueue } from "../queue/taskQueue";
import { videoTaskQueue } from "../video/VideoTaskQueue";
import { planEpisodeAudio } from "../audio/AudioPlanner";
import { generateEpisodeSubtitleStub } from "../subtitle/SubtitleGenerator";
import { createEpisodeTimeline } from "../timeline/EpisodeTimeline";
import { editorAgent } from "../editorDirector/EditorAgent";
import { producerManagementAgent } from "../producerAgent/ProducerAgent";

export type EpisodePackage = {
  packageId: string;
  episodeId: string;
  name: string;
  storyBible: string;
  episodeBible: string;
  shotList: unknown[];
  approvedImages: unknown[];
  prompts: string[];
  videoTasks: unknown[];
  videoFiles: unknown[];
  audioFiles: unknown[];
  subtitleFiles: unknown[];
  timelineData: unknown[];
  editFiles: {
    "EDIT_PLAN.json": unknown;
    "EMOTION_CURVE.json": unknown;
    "TRAILER_PLAN.json": unknown;
    "SUBTITLE.srt": unknown;
    "TIMELINE.json": unknown;
  };
  producerFiles: {
    "PRODUCER_REPORT.json": unknown;
    "BUDGET_REPORT.json": unknown;
    "RISK_REPORT.json": unknown;
    "QUALITY_REPORT.json": unknown;
    "MEETING_LOG.json": unknown;
  };
  productionReport: {
    generatedAt: string;
    taskCount: number;
    historyCount: number;
  };
};

export function exportEpisodePackage(episodeId: string): EpisodePackage {
  const tasks = taskQueue.listTasks().filter((task) => task.episodeId === episodeId);
  const editDecision = editorAgent.generateFinalEditDecision(episodeId);
  const producerReport = producerManagementAgent.analyzeEpisode(episodeId);
  const subtitles = generateEpisodeSubtitleStub();
  const timeline = createEpisodeTimeline(episodeId).list();
  return {
    packageId: `${episodeId}_PACKAGE_${new Date().toISOString()}`,
    episodeId,
    name: `${episodeId}_FINAL_PACKAGE`,
    storyBible: productionDocs.episodeBibleMd,
    episodeBible: productionDocs.episodeBibleMd,
    shotList: storyboardShots,
    approvedImages,
    prompts: tasks.map((task) => String(task.input.prompt ?? "")).filter(Boolean),
    videoTasks: tasks.filter((task) => task.type === "video_generation"),
    videoFiles: videoTaskQueue.listTasks().filter((task) => task.episode === episodeId && task.status === "completed"),
    audioFiles: [planEpisodeAudio(episodeId)],
    subtitleFiles: [subtitles],
    timelineData: timeline,
    editFiles: {
      "EDIT_PLAN.json": editDecision.editPlan,
      "EMOTION_CURVE.json": editDecision.emotionCurve,
      "TRAILER_PLAN.json": editDecision.trailerPlan,
      "SUBTITLE.srt": subtitles,
      "TIMELINE.json": timeline
    },
    producerFiles: {
      "PRODUCER_REPORT.json": producerReport,
      "BUDGET_REPORT.json": producerReport.budget,
      "RISK_REPORT.json": producerReport.risk,
      "QUALITY_REPORT.json": producerReport.quality,
      "MEETING_LOG.json": producerReport.meeting
    },
    productionReport: {
      generatedAt: new Date().toISOString(),
      taskCount: tasks.length,
      historyCount: generationHistory.list().filter((item) => item.taskId).length
    }
  };
}
