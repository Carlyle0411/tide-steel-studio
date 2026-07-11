import { taskQueue } from "../../queue/taskQueue";
import type { MCPTask } from "../../schemas/task.schema";
import { runWorkflowForTask } from "../../workflows";
import { buildReferenceLockText, bindReferencesForShot } from "./ReferenceBinder";
import type { EP01ShotProductionData } from "../EP01ShotData";

export function buildLockedVisualPrompt(shot: EP01ShotProductionData) {
  const references = bindReferencesForShot(shot);
  return [
    "SYSTEM STYLE: Tide Steel Soul EP01, cinematic realistic sci-fi, restrained industrial ocean future.",
    buildReferenceLockText(references),
    `SHOT: ${shot.shot_id}`,
    `DESCRIPTION: ${shot.description}`,
    `CAMERA: ${shot.camera}`,
    `LENS: ${shot.lens}`,
    `MOVEMENT: ${shot.movement}`,
    `ACTION: ${shot.character_action}`,
    `EMOTION: ${shot.emotion}`,
    `LIGHTING: ${shot.lighting}`,
    `ENVIRONMENT: ${shot.environment}`,
    `VFX: ${shot.vfx}`,
    "NEGATIVE: cartoon, anime, game render, fake plastic future, purple energy, random redesign, low quality, logo, subtitle, watermark"
  ].join("\n");
}

export function createVisualTask(shot: EP01ShotProductionData): MCPTask {
  const lockedPrompt = buildLockedVisualPrompt(shot);
  const references = bindReferencesForShot(shot);
  return taskQueue.addTask({
    type: "image_generation",
    projectId: "tide-steel-soul",
    episodeId: "EP01",
    shotId: shot.shot_id,
    assetIds: references.map((reference) => `${reference.category}:${reference.name}`),
    toolId: "gpt_image2",
    model: "GPT Image2",
    input: {
      productionEngine: true,
      visualProduction: true,
      prompt: lockedPrompt,
      negativePrompt: "cartoon, anime, game render, fake plastic future, purple energy, random redesign, low quality, logo, subtitle, watermark",
      references,
      shot
    },
    output: undefined,
    reviewStatus: "draft"
  });
}

export async function generateVisualTask(shot: EP01ShotProductionData): Promise<MCPTask> {
  const task = createVisualTask(shot);
  await taskQueue.runTask(task.taskId, runWorkflowForTask);
  return task;
}
