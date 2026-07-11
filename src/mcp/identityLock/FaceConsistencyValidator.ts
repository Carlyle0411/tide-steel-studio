import { getCharacterIdentity } from "./CharacterIdentityManager";

export type FaceConsistencyScore = {
  faceSimilarity: number;
  hairSimilarity: number;
  ageSimilarity: number;
  totalScore: number;
  status: "PASS" | "REJECTED";
  reason: string;
};

export function validateFaceConsistency(characterIdOrName: string, observed?: Partial<FaceConsistencyScore>): FaceConsistencyScore {
  const identity = getCharacterIdentity(characterIdOrName);
  const minimum = identity?.minimumScore ?? 90;
  const faceSimilarity = observed?.faceSimilarity ?? 0;
  const hairSimilarity = observed?.hairSimilarity ?? 0;
  const ageSimilarity = observed?.ageSimilarity ?? 0;
  const totalScore = observed?.totalScore ?? Math.round(faceSimilarity * 0.55 + hairSimilarity * 0.25 + ageSimilarity * 0.2);
  return {
    faceSimilarity,
    hairSimilarity,
    ageSimilarity,
    totalScore,
    status: totalScore >= minimum ? "PASS" : "REJECTED",
    reason: totalScore >= minimum ? "Identity lock passed." : `Identity score below ${minimum}. Regenerate with MASTER_REFERENCE.`
  };
}

export function shouldRegenerate(score: FaceConsistencyScore) {
  return score.status === "REJECTED";
}
