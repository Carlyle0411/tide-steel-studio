import { getCharacterIdentity } from "./CharacterIdentityManager";

const identityLockText = [
  "Use the exact same person from MASTER_REFERENCE.",
  "Maintain identical facial structure, eye shape, hair style, age, scar, skin tone, and body proportion.",
  "Character identity must remain unchanged.",
  "No redesign.",
  "No different actor.",
  "No alternate face.",
  "No age drift."
].join("\n");

export function buildIdentityLockedPrompt(characterIdOrName: string, originalPrompt: string) {
  const identity = getCharacterIdentity(characterIdOrName);
  if (!identity) return originalPrompt;
  return [
    originalPrompt,
    "",
    "CHARACTER IDENTITY LOCK:",
    identityLockText,
    `Locked traits: ${identity.lockedTraits.join(", ")}.`,
    `Reference image: ${identity.masterReference}.`
  ].join("\n");
}

export function identityNegativePrompt() {
  return "different actor, different face, changed eye shape, changed hairstyle, changed age, missing scar, face redesign, random identity";
}
