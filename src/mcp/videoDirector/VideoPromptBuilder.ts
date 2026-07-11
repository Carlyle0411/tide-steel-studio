import type { AudioPlan } from "./AudioPlanner";

export type VideoProductionPackage = {
  cameraMovement: string;
  characterMotion: string;
  environmentMotion: string;
  duration: number;
  fps: number;
  lens: string;
  lighting: string;
  klingPrompt: string;
  veoPrompt: string;
  negativePrompt: string;
  audio: AudioPlan;
};

export function buildVideoPrompts(input: {
  shotDescription: string;
  directorPrompt: string;
  visualStyle: string;
  cameraMovement: string;
  characterMotion: string;
  environmentMotion: string;
  lens: string;
  lighting: string;
  audio: AudioPlan;
}): VideoProductionPackage {
  const negativePrompt = "fake video, game render, anime, over-motion, shaky action cam, wrong character, changed composition, new unapproved assets, text, logo, watermark";
  const base = [
    input.directorPrompt,
    "",
    "VIDEO MOTION:",
    `Camera Movement: ${input.cameraMovement}`,
    `Character Motion: ${input.characterMotion}`,
    `Environment Motion: ${input.environmentMotion}`,
    `Lens: ${input.lens}`,
    `Lighting: ${input.lighting}`,
    `Style: ${input.visualStyle}`,
    `Audio Direction: ${input.audio.sfx.join(", ")}`
  ].join("\n");
  return {
    cameraMovement: input.cameraMovement,
    characterMotion: input.characterMotion,
    environmentMotion: input.environmentMotion,
    duration: 5,
    fps: 24,
    lens: input.lens,
    lighting: input.lighting,
    klingPrompt: `KLING IMAGE-TO-VIDEO:\n${base}\nNEGATIVE:\n${negativePrompt}`,
    veoPrompt: `VEO IMAGE-TO-VIDEO:\n${base}\nNEGATIVE:\n${negativePrompt}`,
    negativePrompt,
    audio: input.audio
  };
}
