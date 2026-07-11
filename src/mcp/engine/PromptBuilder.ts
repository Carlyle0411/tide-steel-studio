import type { ShotProductionContext } from "./ContextResolver";
import { directorEngine } from "../director/DirectorEngine";

export type BuiltPrompt = {
  toolId: "gpt_image2" | "kling" | "veo";
  prompt: string;
  negative: string;
};

export function buildImagePrompt(context: ShotProductionContext): BuiltPrompt {
  const directorPrompt = directorEngine.generateDirectorPrompt(context.episodeId, context.shotId);
  if (directorPrompt.finalPrompt) {
    return {
      toolId: "gpt_image2",
      prompt: directorPrompt.finalPrompt,
      negative: directorPrompt.negativePrompt
    };
  }
  const prompt = [
    "SYSTEM STYLE:",
    "《潮汐钢魂》, Cinematic Sci-Fi, Denis Villeneuve style, dark ocean future, restrained industrial realism, low saturation, real material, IMAX film frame.",
    "",
    "CHARACTER:",
    context.character,
    "",
    "ENVIRONMENT:",
    context.environment,
    "",
    "CAMERA:",
    `${context.camera}. Lens: ${context.lens}. Camera must feel physically grounded, not divine viewpoint.`,
    "",
    "LIGHTING:",
    context.lighting,
    "",
    "ACTION:",
    context.action,
    "",
    "EMOTION:",
    context.emotion,
    "",
    "REFERENCES:",
    context.references.map((reference) => `${reference.assetId}: ${reference.name} / ${reference.reference}`).join("\n"),
    "",
    "NEGATIVE:",
    context.negative.join(", ")
  ].join("\n");

  return {
    toolId: "gpt_image2",
    prompt,
    negative: context.negative.join(", ")
  };
}

export function buildVideoPrompt(context: ShotProductionContext, toolId: "kling" | "veo" = "kling"): BuiltPrompt {
  const directorPrompt = directorEngine.generateDirectorPrompt(context.episodeId, context.shotId);
  if (directorPrompt.finalPrompt) {
    return {
      toolId,
      prompt: toolId === "kling" ? directorPrompt.klingPrompt : directorPrompt.veoPrompt,
      negative: directorPrompt.negativePrompt
    };
  }
  return {
    toolId,
    prompt: [
      "SHOT MOTION:",
      context.action,
      "",
      "CAMERA:",
      context.camera,
      "",
      "LIGHTING:",
      context.lighting,
      "",
      "NEGATIVE:",
      context.negative.join(", ")
    ].join("\n"),
    negative: context.negative.join(", ")
  };
}
