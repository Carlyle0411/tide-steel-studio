import { createLocalAssetRecord } from "./LocalAssetGenerator";
import type { LocalAssetInput, LocalAssetRecord } from "./LocalAssetTypes";

export const tideSteelLocalAssetPlan: LocalAssetInput[] = [
  {
    name: "CRT-001 Front Design",
    category: "mechas",
    relativePath: "mechas/chiting01/front.png",
    style: "cinematic realistic sci-fi asset design",
    reference: "VISUAL_DEVELOPMENT_BIBLE_RedThunderEra_V1.md / MECHA_LOCK.json",
    prompt: "CRT-001 Chiting-01 front design, heavy industrial humanoid mech, deep crimson armor, black mechanical skeleton, blue energy reactor, 20 meters scale, wet metal, salt corrosion, restrained film concept art, not anime, not game render."
  },
  {
    name: "CRT-001 Side Design",
    category: "mechas",
    relativePath: "mechas/chiting01/side.png",
    style: "cinematic realistic sci-fi asset design",
    reference: "VISUAL_DEVELOPMENT_BIBLE_RedThunderEra_V1.md / MECHA_LOCK.json",
    prompt: "CRT-001 Chiting-01 side design, heavy industrial silhouette, deep crimson armor plates, black inner frame, blue synchronized energy lines, humid Hangzhou Bay hangar light, practical engineering mass, no hero pose."
  },
  {
    name: "CRT-001 Back Design",
    category: "mechas",
    relativePath: "mechas/chiting01/back.png",
    style: "cinematic realistic sci-fi asset design",
    reference: "REFERENCE_03_CRT001_BACK_COCKPIT_DETAIL.png / MECHA_LOCK.json",
    prompt: "CRT-001 Chiting-01 back design, hidden rear cockpit entrance, shoulder armor and back plating, deep crimson worn armor, black hydraulic frame, blue warning sync light, wet metal and maintenance scars, partial industrial realism."
  },
  {
    name: "CRT-001 Cockpit Interior",
    category: "mechas",
    relativePath: "mechas/chiting01/cockpit.png",
    style: "cinematic realistic sci-fi interior asset",
    reference: "Deep Blue Base cockpit rules / MECHA_LOCK.json",
    prompt: "CRT-001 cockpit interior, compact industrial pilot chamber, dark red armored shell, black restraint frame, cold blue synchronization interface, damp metal, scratched glass, tactile controls, no holographic clutter, grounded film realism."
  },
  {
    name: "CRT-001 Battle Damage",
    category: "mechas",
    relativePath: "mechas/chiting01/battle_damage.png",
    style: "cinematic realistic sci-fi asset design",
    reference: "MECHA_LOCK.json",
    prompt: "CRT-001 battle damage version, deep crimson armor cracked and salt-burned, black frame exposed, blue reactor still alive, heavy industrial mech after ocean impact, not destroyed, no superhero staging."
  },
  {
    name: "Lin Zhou Portrait",
    category: "characters",
    relativePath: "characters/linzhou/001_portrait.png",
    style: "cinematic realistic character asset",
    reference: "EP01_CHARACTER_LOCK.json",
    prompt: "Lin Zhou character portrait, young Chinese pilot, early twenties, tired determined eyes, restrained fear under courage, short practical hair, humid naval base light, natural skin texture, film still realism, not heroic glamour."
  },
  {
    name: "Lin Zhou Full Body",
    category: "characters",
    relativePath: "characters/linzhou/002_fullbody.png",
    style: "cinematic realistic character asset",
    reference: "EP01_CHARACTER_LOCK.json",
    prompt: "Lin Zhou full body design, young Chinese pilot, functional dark ocean-defense uniform, slim athletic build, worn boots, damp fabric, no fashion sci-fi, industrial military realism, neutral stance."
  },
  {
    name: "Lin Zhou Pilot Suit",
    category: "characters",
    relativePath: "characters/linzhou/003_pilot_suit.png",
    style: "cinematic realistic character asset",
    reference: "EP01_CHARACTER_LOCK.json",
    prompt: "Lin Zhou pilot suit design, pressure-rated mech synchronization suit, dark navy and black material, small blue sync nodes, practical straps and seals, worn by use, anxious readiness, film production asset."
  },
  {
    name: "Lin Zhou Emotion Sheet",
    category: "characters",
    relativePath: "characters/linzhou/004_emotion_sheet.png",
    style: "cinematic realistic character expression sheet",
    reference: "EP01_CHARACTER_LOCK.json",
    prompt: "Lin Zhou emotional expression sheet, same young Chinese pilot face, fear, restraint, guilt, resolve, listening to unknown signal, realistic film lighting, no cartoon expression exaggeration."
  },
  {
    name: "White Tide Full Body",
    category: "creatures",
    relativePath: "creatures/white_tide/full_body.png",
    style: "cinematic realistic creature design",
    reference: "WHITE_TIDE_CREATURE_BIBLE.md / CREATURE_LOCK.json",
    prompt: "White Tide full body creature, ancient deep ocean life, huge yet fragile, white biological armor shell, translucent blue tissue, cracked subtle bioluminescent patterns, pressure-adapted anatomy, not dinosaur, not demon, not boss monster."
  },
  {
    name: "White Tide Head Detail",
    category: "creatures",
    relativePath: "creatures/white_tide/head_detail.png",
    style: "cinematic realistic creature design",
    reference: "WHITE_TIDE_CREATURE_BIBLE.md / CREATURE_LOCK.json",
    prompt: "White Tide head detail, white shell plates, deep-sea sensory folds, translucent membrane, ancient fragile biology, low saturation ocean blue, no roaring monster mouth, unknown lifeform close study."
  },
  {
    name: "White Tide Battle Pose",
    category: "creatures",
    relativePath: "creatures/white_tide/battle_pose.png",
    style: "cinematic realistic creature action asset",
    reference: "WHITE_TIDE_CREATURE_BIBLE.md / CREATURE_LOCK.json",
    prompt: "White Tide defensive battle pose in storm water, huge white armored ocean creature, movement like pressure wave, not aggressive hunting, ancient life trying to survive, scale against ocean mist, grounded film realism."
  },
  {
    name: "White Tide Damage State",
    category: "creatures",
    relativePath: "creatures/white_tide/damage_state.png",
    style: "cinematic realistic creature design",
    reference: "WHITE_TIDE_CREATURE_BIBLE.md / CREATURE_LOCK.json",
    prompt: "White Tide damaged state, cracked white biological shell, exposed translucent blue tissue, wounded deep-sea life, fragile and enormous, no gore spectacle, sympathetic unknown creature design."
  }
];

export function createLocalAssetRecords(): LocalAssetRecord[] {
  return tideSteelLocalAssetPlan.map(createLocalAssetRecord);
}
