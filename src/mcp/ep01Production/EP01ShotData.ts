import { storyboardShots } from "../../pages/production/data/productionData";

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

const enrichment = [
  ["8s", "24mm", "slow push in", "None", "The ocean defense line holds normal operation while the sea behaves slightly wrong.", "unease", "cold dawn overcast", "Hangzhou Bay ocean wall", "subtle reverse sea pattern"],
  ["7s", "85mm macro", "locked close focus", "None", "Water inside a cup gathers inward instead of rippling outward.", "doubt", "dim observation room practicals", "Deep Blue observation post", "practical water anomaly only"],
  ["9s", "35mm", "slow lateral track", "Chen Mu", "Chen Mu notices the room before the system notices the sea.", "contained suspicion", "cold blue monitor spill", "Deep Blue command corridor", "none"],
  ["8s", "50mm", "measured push", "Chen Mu", "Chen Mu turns away from normal readouts and listens to the low frequency.", "experience against system", "low-key screen light", "Deep Blue command center", "low frequency monitor pulse"],
  ["10s", "35mm", "handheld restraint", "Chen Mu / operators", "Operators continue procedure while Chen Mu stops the automatic clearance.", "pressure", "flickering blue alert wash", "Observation control deck", "interface status mismatch"],
  ["7s", "24mm", "static wide", "None", "The observation gate structure dwarfs the personnel below it.", "institutional weight", "storm-gray exterior light", "Observation gate bay", "rain and sea mist"],
  ["8s", "50mm", "follow to console", "Chen Mu", "Chen Mu walks to the manual control station without announcing a heroic order.", "responsibility", "hard side light", "Manual gate control station", "none"],
  ["6s", "85mm", "fixed detail", "Chen Mu", "His hand hovers before the control, then leaves the frame after the choice.", "irreversible choice", "cold metal reflection", "Manual control panel", "no magic, practical mechanics"],
  ["12s", "24mm", "slow architectural pullback", "Chen Mu", "The observation gate closes and the last sea light disappears.", "cost", "blue alarm against gray sea", "Giant observation gate", "closing gate scale effect"],
  ["6s", "50mm", "locked", "AI Lan system", "AI Lan registers a 0.2 second delay in normal confirmation.", "wrongness", "cold transparent interface light", "Command system layer", "UI delay only"],
  ["8s", "35mm", "slow push", "Chen Mu", "Chen Mu watches the system mark normal after his manual override.", "isolation", "monitor blue and practical shadow", "Command center", "none"],
  ["7s", "24mm", "static exterior", "None", "The sea outside the closed gate loses natural wave rhythm.", "silence", "muted storm light", "Exterior sea line", "water motion discontinuity"],
  ["8s", "50mm", "controlled pan", "Operators", "A junior operator notices an old incident code resurfacing in the log.", "buried past", "screen light in dark room", "Deep Blue log station", "data log flash"],
  ["9s", "35mm", "slow track", "Chen Mu", "Chen Mu asks for silence without explaining what he hears.", "listening", "low contrast blue-gray", "Command deck", "audio-led anomaly"],
  ["7s", "85mm", "fixed close-up", "None", "A sensor line drops flat as if the ocean has stopped making sound.", "fear", "monitor glow", "Sonar desk", "sonar silence"],
  ["8s", "24mm", "crane-like vertical read", "None", "Deep below the base, part of CRT001 remains still in blue standby light.", "latent power", "blue maintenance spill", "Mecha maintenance shaft", "partial mecha reveal only"],
  ["6s", "50mm", "slow push", "None", "CRT001 back armor and cockpit seam catch the alert light.", "coming consequence", "cold blue alert", "CRT001 rear cockpit bay", "no full mecha reveal"],
  ["10s", "24mm", "locked final wide", "None", "Beyond the closed human gate, the sea pattern moves toward the base as if a life is approaching.", "mystery", "storm blue-gray", "Hangzhou Bay beyond the wall", "subtle living sea movement"]
] as const;

export function getEP01Shots(): EP01ShotProductionData[] {
  return Array.from({ length: 18 }, (_, index) => {
    const shot = storyboardShots[index];
    const [duration, lens, movement, character, action, emotion, lighting, environment, vfx] = enrichment[index];
    return {
      shot_id: `EP01_SHOT_${String(index + 1).padStart(2, "0")}`,
      sourceShotId: shot?.id ?? `EP01-SHOT-${String(index + 1).padStart(3, "0")}`,
      duration,
      description: shot?.storyFunction || action,
      camera: shot?.camera || "cinematic production camera",
      lens,
      movement,
      character,
      character_action: action,
      emotion,
      lighting,
      environment,
      vfx,
      sound: shot?.sound || "low-frequency ocean tone"
    };
  });
}
