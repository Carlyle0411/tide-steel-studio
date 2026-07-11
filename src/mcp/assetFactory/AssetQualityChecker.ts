import type { AssetGenerationTask } from "./AssetGenerationQueue";

export type AssetConsistencyScore = {
  characterFace: number;
  hair: number;
  clothing: number;
  color: number;
  material: number;
  mechaDesign: number;
  creatureStructure: number;
  total: number;
  approvedEligible: boolean;
};

export function scoreAssetConsistency(task: AssetGenerationTask): AssetConsistencyScore {
  const prompt = task.prompt?.toLowerCase() ?? "";
  const characterFace = task.type === "CHARACTER" ? prompt.includes("lock") ? 88 : 72 : 100;
  const hair = task.type === "CHARACTER" ? prompt.includes("hair") ? 86 : 70 : 100;
  const clothing = task.type === "CHARACTER" ? prompt.includes("clothing") || prompt.includes("pilot") ? 86 : 72 : 100;
  const color = prompt.includes("deep crimson") || prompt.includes("deep blue") || prompt.includes("white") ? 88 : 78;
  const material = prompt.includes("industrial") || prompt.includes("biological") || prompt.includes("ocean") ? 90 : 76;
  const mechaDesign = task.type === "MECHA" ? prompt.includes("heavy industrial") || prompt.includes("crt") ? 90 : 70 : 100;
  const creatureStructure = task.type === "CREATURE" ? prompt.includes("biological") || prompt.includes("armor shell") ? 88 : 70 : 100;
  const total = Math.round((characterFace + hair + clothing + color + material + mechaDesign + creatureStructure) / 7);
  return { characterFace, hair, clothing, color, material, mechaDesign, creatureStructure, total, approvedEligible: total >= 85 };
}
