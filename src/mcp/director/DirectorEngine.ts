import { resolveShotContext } from "../engine/ContextResolver";
import { createPromptVersion, type PromptVersion } from "../schemas/promptVersion.schema";
import { getCharacterLock } from "./CharacterContinuity";
import { getMechaLock } from "./MechaContinuity";
import { getSceneLock } from "./SceneContinuity";
import { analyzeShot, type ShotUnderstanding } from "./ShotAnalyzer";
import { checkVisualContinuity } from "./VisualContinuity";

export type DirectorPromptPackage = {
  shotId: string;
  storyIntent: string;
  shotUnderstanding: ShotUnderstanding;
  characterLock: ReturnType<typeof getCharacterLock>;
  mechaLock: ReturnType<typeof getMechaLock>;
  sceneLock: ReturnType<typeof getSceneLock>;
  visualStyle: ReturnType<typeof checkVisualContinuity>;
  cameraLanguage: string;
  finalPrompt: string;
  klingPrompt: string;
  veoPrompt: string;
  negativePrompt: string;
  promptVersion: PromptVersion;
};

export class DirectorEngine {
  generateDirectorPrompt(episodeId: string, shotId: string): DirectorPromptPackage {
    const context = resolveShotContext(episodeId, shotId);
    const shotUnderstanding = analyzeShot(episodeId, shotId);
    const characterLock = getCharacterLock(context.character);
    const mechaLock = getMechaLock(context.mecha, episodeId);
    const sceneLock = getSceneLock(context.environment);
    const visualStyle = checkVisualContinuity();
    const negativePrompt = [
      ...context.negative,
      "wrong character",
      "inconsistent face",
      "wrong costume",
      "plastic sci-fi",
      "over-saturated",
      "fake game render"
    ].join(", ");

    const finalPrompt = [
      "SYSTEM STYLE:",
      "《潮汐钢魂》, Cinematic Sci-Fi, dark ocean future, restrained industrial realism, low saturation, IMAX film frame.",
      "",
      "STORY INTENT:",
      shotUnderstanding.storyIntent,
      "",
      "SHOT PURPOSE:",
      shotUnderstanding.cameraLanguage,
      "",
      "CHARACTER LOCK:",
      characterLock.lockPrompt,
      "",
      "MECHANICAL LOCK:",
      mechaLock.lockPrompt,
      "",
      "SCENE LOCK:",
      sceneLock.lockPrompt,
      "",
      "VISUAL STYLE LOCK:",
      visualStyle.styleLock,
      "",
      "CAMERA LANGUAGE:",
      `${context.camera}. ${shotUnderstanding.cinematography}`,
      "",
      "LIGHTING:",
      context.lighting,
      "",
      "ACTION:",
      context.action,
      "",
      "EMOTION:",
      shotUnderstanding.emotion,
      "",
      "NEGATIVE:",
      negativePrompt
    ].join("\n");

    const promptVersion = createPromptVersion({
      shotId,
      model: "gpt_image2",
      prompt: finalPrompt,
      negativePrompt
    });

    return {
      shotId,
      storyIntent: shotUnderstanding.storyIntent,
      shotUnderstanding,
      characterLock,
      mechaLock,
      sceneLock,
      visualStyle,
      cameraLanguage: context.camera,
      finalPrompt,
      klingPrompt: buildMotionPrompt(finalPrompt, "Kling"),
      veoPrompt: buildMotionPrompt(finalPrompt, "Veo"),
      negativePrompt,
      promptVersion
    };
  }
}

function buildMotionPrompt(prompt: string, model: "Kling" | "Veo") {
  return [
    `${model.toUpperCase()} MOTION PROMPT:`,
    "Preserve approved keyframe composition and asset locks.",
    "Use restrained cinematic movement, no spectacle beyond shot intent.",
    "",
    prompt
  ].join("\n");
}

export const directorEngine = new DirectorEngine();
