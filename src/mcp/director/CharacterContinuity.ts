export type CharacterLock = {
  character: string;
  status: "PASS" | "WARNING" | "FAIL";
  lockPrompt: string;
  checks: string[];
};

const characterLocks: Record<string, CharacterLock> = {
  "陈牧": {
    character: "陈牧",
    status: "PASS",
    lockPrompt: "same person as approved reference, Chinese male around 50, same facial structure, short gray-black hair, tired eyes, same deep blue-gray ocean defense command uniform, restrained veteran presence",
    checks: ["年龄", "脸型", "发型", "服装", "疲惫眼神", "身材"]
  },
  "林舟": {
    character: "林舟",
    status: "WARNING",
    lockPrompt: "Lin Zhou character reference not approved yet; keep young pilot silhouette restrained, not heroic, fear under courage",
    checks: ["年龄待定稿", "脸型待定稿", "服装待定稿"]
  },
  "许燃": {
    character: "许燃",
    status: "WARNING",
    lockPrompt: "Xu Ran character reference not approved yet; maintain rational systems engineer presence, controlled posture, functional ocean-defense uniform",
    checks: ["年龄待定稿", "脸型待定稿", "服装待定稿"]
  }
};

export function getCharacterLock(character: string): CharacterLock {
  return characterLocks[character] ?? {
    character: character || "none",
    status: character === "none" || !character ? "PASS" : "WARNING",
    lockPrompt: character === "none" || !character ? "no human character in frame" : "character reference not approved; do not invent a new face",
    checks: ["reference"]
  };
}
