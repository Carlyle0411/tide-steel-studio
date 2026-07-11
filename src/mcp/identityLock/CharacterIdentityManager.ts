export type CharacterIdentity = {
  characterId: string;
  name: string;
  masterReference: string;
  lockedTraits: string[];
  minimumScore: number;
};

const identities: CharacterIdentity[] = [
  {
    characterId: "linzhou",
    name: "林舟",
    masterReference: "assets/characters/linzhou/MASTER_REFERENCE.png",
    lockedTraits: ["facial structure", "eye shape", "hair style", "age 23", "subtle eyebrow scar", "body proportion", "pilot suit logic"],
    minimumScore: 90
  },
  {
    characterId: "xuran",
    name: "许燃",
    masterReference: "assets/characters/xuran/MASTER_REFERENCE.png",
    lockedTraits: ["facial structure", "eye shape", "hair style", "age 24", "calm ace pilot presence", "pilot suit logic"],
    minimumScore: 90
  },
  {
    characterId: "chenmu",
    name: "陈牧",
    masterReference: "assets/characters/chenmu/MASTER_REFERENCE.png",
    lockedTraits: ["gray-black short hair", "tired eyes", "age around 50", "ocean defense command uniform"],
    minimumScore: 90
  },
  {
    characterId: "tangxiaoman",
    name: "唐小满",
    masterReference: "assets/characters/tangxiaoman/MASTER_REFERENCE.png",
    lockedTraits: ["young engineer face", "maintenance suit", "tool-working posture", "practical styling"],
    minimumScore: 90
  },
  {
    characterId: "lan",
    name: "AI澜",
    masterReference: "assets/characters/lan/MASTER_REFERENCE.png",
    lockedTraits: ["cold blue holographic system identity", "non-human interface logic", "no cute assistant redesign"],
    minimumScore: 90
  }
];

export function getCharacterIdentity(characterIdOrName: string) {
  const query = characterIdOrName.toLowerCase();
  return identities.find((item) => item.characterId === query || item.name === characterIdOrName || query.includes(item.characterId));
}

export function listCharacterIdentities() {
  return identities;
}

export function hasMasterReference(identity: CharacterIdentity) {
  return Boolean(identity.masterReference);
}
