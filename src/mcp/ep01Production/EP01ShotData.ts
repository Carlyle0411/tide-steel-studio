import { getEP01Keyframes } from "../tideSteelStudio/EP01StudioData";

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
  return getEP01Keyframes().map((shot, index) => ({
    shot_id: `EP01_SHOT_${String(index + 1).padStart(2, "0")}`,
    sourceShotId: shot.shot,
    duration: `${shot.duration ?? 15}s`,
    description: shot.purpose,
    camera: `景别：${shot.shotSize ?? "待定"}。摄影目的：${shot.notes ?? shot.purpose}`,
    lens: shot.lens ?? "待定",
    movement: shot.movement ?? "待定",
    character: shot.character ?? "无",
    character_action: shot.notes ?? shot.purpose,
    emotion: shot.emotion ?? "待定",
    lighting: shot.lighting ?? "待定",
    environment: shot.environment ?? "待定",
    vfx: "保持真实物理异常，不使用夸张能量特效。",
    sound: shot.sound ?? "待定",
  }));
}
