import { approvedImages, productionAssets } from "../../pages/production/data/productionData";
import { taskQueue } from "../queue/taskQueue";
import { videoTaskQueue } from "../video/VideoTaskQueue";
import { getEP01Shots, type EP01ShotProductionData, type EP01ShotStatus } from "./EP01ShotData";

export type EP01ProductionBoardRow = EP01ShotProductionData & {
  referenceStatus: EP01ShotStatus;
  imageStatus: EP01ShotStatus;
  videoStatus: EP01ShotStatus;
  audioStatus: EP01ShotStatus;
  reviewStatus: EP01ShotStatus;
};

function mapTaskStatus(status?: string): EP01ShotStatus {
  if (!status) return "LOCKED";
  if (status === "completed") return "APPROVED";
  if (status === "running" || status === "pending") return "GENERATING";
  if (status === "failed" || status === "needs_key") return "FAILED";
  return "REVIEW";
}

function imageStatusFor(shotId: string): EP01ShotStatus {
  const number = shotId.slice(-2);
  const approved = approvedImages.some((image) => image.id.includes(`KF${Number(number)}`) || image.id.includes(`KF${number}`));
  if (approved) return "APPROVED";
  const task = taskQueue.listTasks().find((item) => item.episodeId === "EP01" && item.shotId === shotId && item.type === "image_generation");
  return mapTaskStatus(task?.status);
}

export function buildEP01ProductionBoard(): EP01ProductionBoardRow[] {
  const approvedReferenceCount = productionAssets.filter((asset) => asset.approved).length;
  return getEP01Shots().map((shot) => {
    const videoTask = videoTaskQueue.listTasks().find((task) => task.episode === "EP01" && task.shot === shot.shot_id);
    const imageStatus = imageStatusFor(shot.shot_id);
    return {
      ...shot,
      referenceStatus: approvedReferenceCount >= 4 ? "APPROVED" : "REVIEW",
      imageStatus,
      videoStatus: mapTaskStatus(videoTask?.status),
      audioStatus: "LOCKED",
      reviewStatus: imageStatus === "APPROVED" && videoTask?.status === "completed" ? "REVIEW" : "LOCKED"
    };
  });
}

export function getEP01Completion() {
  const board = buildEP01ProductionBoard();
  return {
    image: `${board.filter((shot) => shot.imageStatus === "APPROVED").length}/${board.length}`,
    video: `${board.filter((shot) => shot.videoStatus === "APPROVED").length}/${board.length}`,
    audio: "0%",
    edit: "0%",
    totalShots: board.length
  };
}
