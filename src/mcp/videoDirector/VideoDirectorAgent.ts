import { resolveShotContext } from "../engine/ContextResolver";
import { directorEngine } from "../director/DirectorEngine";
import { checkVisualContinuity } from "../director/VisualContinuity";
import { planCameraMovement } from "./CameraPlanner";
import { planMotion } from "./MotionPlanner";
import { planAudio } from "./AudioPlanner";
import { buildVideoPrompts, type VideoProductionPackage } from "./VideoPromptBuilder";

export function createVideoProductionPackage(input: {
  episodeId: string;
  shotId: string;
  approvedImage: string;
}): VideoProductionPackage & { approvedImage: string; shotDescription: string } {
  const context = resolveShotContext(input.episodeId, input.shotId);
  const directorPackage = directorEngine.generateDirectorPrompt(input.episodeId, input.shotId);
  const motion = planMotion(context.description + " " + context.action);
  const audio = planAudio(context.description + " " + context.action);
  const videoPackage = buildVideoPrompts({
    shotDescription: context.description,
    directorPrompt: directorPackage.finalPrompt,
    visualStyle: checkVisualContinuity().styleLock,
    cameraMovement: planCameraMovement(context.description + " " + context.action),
    characterMotion: motion.characterMotion,
    environmentMotion: motion.environmentMotion,
    lens: context.lens,
    lighting: context.lighting,
    audio
  });
  return {
    ...videoPackage,
    approvedImage: input.approvedImage,
    shotDescription: context.description
  };
}
