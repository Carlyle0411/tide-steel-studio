import characterLock from "../../../projects/tide-steel-soul/episodes/EP01/EP01_CHARACTER_LOCK.json";
import creatureLock from "../../../projects/tide-steel-soul/episodes/EP01/CREATURE_LOCK.json";
import environmentLibrary from "../../../projects/tide-steel-soul/episodes/EP01/ENVIRONMENT_LIBRARY.json";
import mechaLock from "../../../projects/tide-steel-soul/episodes/EP01/MECHA_LOCK.json";
import type { AssetTaskType } from "./AssetGenerationQueue";

export type PlannedAsset = {
  type: AssetTaskType;
  assetName: string;
  variant: string;
};

const characterVariants = ["Portrait", "Full Body", "Pilot Suit", "Emotional Expression Sheet", "Action Pose"];
const mechaVariants = ["Front View", "Side View", "Back View", "Cockpit View", "Battle Damage Version", "Weapon Activation Version"];
const creatureVariants = ["Full Body", "Head Detail", "Swimming Pose", "Attack Pose", "Damage Version"];
const environmentVariants = ["Wide Cinematic Shot", "Street Level", "Night Version", "Storm Version", "Battle Version"];

export function buildAssetProductionPlan(): PlannedAsset[] {
  const characters = ["Lin Zhou", "Xu Ran", "Chen Mu", "Tang Xiaoman"].flatMap((assetName) => characterVariants.map((variant) => ({ type: "CHARACTER" as const, assetName, variant })));
  const mechas = ["CRT-001 Red Thunder", "Xuanjing-03", "Baiyuan-07"].flatMap((assetName) => mechaVariants.map((variant) => ({ type: "MECHA" as const, assetName, variant })));
  const creatures = ["White Tide", "Sting Tide", "Black Tide Mother"].flatMap((assetName) => creatureVariants.map((variant) => ({ type: "CREATURE" as const, assetName, variant })));
  const environments = ["2042 Hangzhou Bay", "Deep Blue Base", "Ocean Rift Gate", "Underwater Ruins", "Cockpit"].flatMap((assetName) => environmentVariants.map((variant) => ({ type: "ENVIRONMENT" as const, assetName, variant })));
  return [...characters, ...mechas, ...creatures, ...environments];
}

export function buildAssetPrompt(asset: PlannedAsset) {
  const lock = lockFor(asset);
  return [
    "SYSTEM STYLE: Tide Steel Soul, cinematic realistic sci-fi, industrial ocean future, low saturation, IMAX composition.",
    `ASSET TYPE: ${asset.type}`,
    `ASSET NAME: ${asset.assetName}`,
    `VARIANT: ${asset.variant}`,
    `LOCK: ${lock}`,
    "OUTPUT: one production reference image, clean subject readability, no text, no watermark, no logo.",
    "NEGATIVE: cartoon, anime, game render, plastic future, random redesign, inconsistent face, wrong costume, low quality, extra limbs, title text, watermark"
  ].join("\n");
}

function lockFor(asset: PlannedAsset) {
  if (asset.type === "CHARACTER") {
    if (asset.assetName === "Lin Zhou") return JSON.stringify(characterLock["Lin Zhou"]);
    if (asset.assetName === "Xu Ran") return JSON.stringify(characterLock["Xu Ran"]);
    return "2042 Deep Blue Base human character, grounded film realism, no superhero styling";
  }
  if (asset.type === "MECHA") {
    if (asset.assetName === "CRT-001 Red Thunder") return JSON.stringify(mechaLock["CRT-001 Red Thunder"]);
    return "heavy industrial ocean-defense mecha, functional engineering, consistent silhouette, no toy/game gloss";
  }
  if (asset.type === "CREATURE") {
    if (asset.assetName === "White Tide") return JSON.stringify(creatureLock["White Tide"]);
    return "ancient deep-ocean biological structure, unknown but not demonic, no boss pose";
  }
  if (asset.type === "ENVIRONMENT") {
    const key = asset.assetName in environmentLibrary ? asset.assetName as keyof typeof environmentLibrary : "Deep Blue Base";
    return JSON.stringify(environmentLibrary[key]);
  }
  return "functional 2042 ocean-defense production prop, worn industrial material";
}
