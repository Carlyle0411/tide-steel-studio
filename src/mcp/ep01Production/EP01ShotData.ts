import { trilogyStoryboardShots } from "../trilogy/TrilogyStoryData";

export type EP01ShotStatus = "LOCKED" | "GENERATING" | "REVIEW" | "APPROVED" | "FAILED";

export type EP01ShotProductionData = {
  shot_id: string;
  sourceShotId: string;
  duration: string;
  description: string;
  camera: string;
  lens: string;
  movement: string;
  character: string;
  character_action: string;
  emotion: string;
  lighting: string;
  environment: string;
  vfx: string;
  sound: string;
};

export function getEP01Shots(): EP01ShotProductionData[] {
  return trilogyStoryboardShots.map((shot, index) => ({
    shot_id: `EP01_SHOT_${String(index + 1).padStart(2, "0")}`,
    sourceShotId: shot.id,
    duration: `${shot.duration}s`,
    description: shot.description,
    camera: shot.camera,
    lens: shot.lens,
    movement: shot.movement,
    character: shot.character === "无" ? "无" : shot.character,
    character_action: shot.description,
    emotion: shot.emotion,
    lighting: shot.lighting,
    environment: shot.environment,
    vfx: shot.notes,
    sound: shot.sound,
  }));
}
