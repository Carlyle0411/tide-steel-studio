import { getCharacterIdentity } from "./CharacterIdentityManager";

export type ReferenceBinding = {
  characterId: string;
  referenceImage: string;
  role: "MASTER_REFERENCE_IMAGE";
  required: boolean;
  note: string;
};

export function bindCharacterReference(characterIdOrName: string): ReferenceBinding | null {
  const identity = getCharacterIdentity(characterIdOrName);
  if (!identity) return null;
  return {
    characterId: identity.characterId,
    referenceImage: identity.masterReference,
    role: "MASTER_REFERENCE_IMAGE",
    required: true,
    note: "All generated images for this character must use this exact reference image as the only identity source."
  };
}

export function getReferenceImagesForPrompt(characterIdOrName: string) {
  const binding = bindCharacterReference(characterIdOrName);
  return binding ? [binding.referenceImage] : [];
}
