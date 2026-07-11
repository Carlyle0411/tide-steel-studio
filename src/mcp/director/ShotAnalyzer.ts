import { resolveShotContext } from "../engine/ContextResolver";

export type ShotUnderstanding = {
  shotId: string;
  storyIntent: string;
  characterGoal: string;
  emotionalShift: string;
  cameraLanguage: string;
  shotType: string;
  cinematography: string;
  emotion: string;
};

export function analyzeShot(episodeId: string, shotId: string): ShotUnderstanding {
  const context = resolveShotContext(episodeId, shotId);
  if (shotId === "EP01_KF01") {
    return {
      shotId,
      storyIntent: "暴风雨前的杭州湾防线仍在正常运行，但海洋已经出现第一丝不属于人类理解的规律。",
      characterGoal: "无人物主体。镜头目标是让观众先感到世界不对，再进入陈牧的判断。",
      emotionalShift: "从秩序感进入轻微不安。",
      cameraLanguage: "Wide Establishing Shot，稳定、克制，不站在神的位置。",
      shotType: "24mm wide establishing shot",
      cinematography: "24mm lens, slow cinematic, low storm cloud, cold gray daylight, no spectacle.",
      emotion: "未知、压迫、安静的危险"
    };
  }
  return {
    shotId,
    storyIntent: context.description,
    characterGoal: context.character,
    emotionalShift: context.emotion,
    cameraLanguage: context.camera,
    shotType: context.lens,
    cinematography: `${context.camera}. ${context.lighting}`,
    emotion: context.emotion
  };
}
