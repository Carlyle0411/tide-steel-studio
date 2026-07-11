export const motionLibrary = {
  camera: ["push in", "pull out", "orbit", "tracking", "handheld", "crane"],
  character: ["walk", "turn", "look", "attack", "react"],
  mecha: ["idle", "transform", "weapon activate", "combat"],
  creature: ["emerge", "roar", "swim", "attack"]
} as const;

export type MotionCategory = keyof typeof motionLibrary;
