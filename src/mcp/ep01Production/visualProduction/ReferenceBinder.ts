import characterLock from "../../../../projects/tide-steel-soul/episodes/EP01/EP01_CHARACTER_LOCK.json";
import creatureLock from "../../../../projects/tide-steel-soul/episodes/EP01/CREATURE_LOCK.json";
import environmentLibrary from "../../../../projects/tide-steel-soul/episodes/EP01/ENVIRONMENT_LIBRARY.json";
import mechaLock from "../../../../projects/tide-steel-soul/episodes/EP01/MECHA_LOCK.json";
import type { EP01ShotProductionData } from "../EP01ShotData";

export type BoundVisualReference = {
  category: "character" | "mecha" | "creature" | "environment";
  name: string;
  lock: Record<string, unknown>;
};

export function bindReferencesForShot(shot: EP01ShotProductionData): BoundVisualReference[] {
  const references: BoundVisualReference[] = [];
  if (shot.character.includes("Lin") || shot.character.includes("林舟")) {
    references.push({ category: "character", name: "Lin Zhou", lock: characterLock["Lin Zhou"] });
  }
  if (shot.character.includes("Xu") || shot.character.includes("许燃")) {
    references.push({ category: "character", name: "Xu Ran", lock: characterLock["Xu Ran"] });
  }
  if (/CRT|赤霆|mecha|Mecha/i.test(`${shot.description} ${shot.environment} ${shot.vfx}`)) {
    references.push({ category: "mecha", name: "CRT-001 Red Thunder", lock: mechaLock["CRT-001 Red Thunder"] });
  }
  if (/White Tide|白潮|creature|living sea/i.test(`${shot.description} ${shot.vfx}`)) {
    references.push({ category: "creature", name: "White Tide", lock: creatureLock["White Tide"] });
  }
  const environment = Object.keys(environmentLibrary).find((name) => shot.environment.toLowerCase().includes(name.toLowerCase().split(" ")[0])) ?? environmentNameForShot(shot);
  references.push({ category: "environment", name: environment, lock: environmentLibrary[environment as keyof typeof environmentLibrary] });
  return references;
}

function environmentNameForShot(shot: EP01ShotProductionData) {
  if (/hangar|maintenance|CRT/i.test(shot.environment)) return "Mecha Hangar";
  if (/gate/i.test(shot.environment)) return "Ocean Rift Gate";
  if (/base|command|observation|Deep Blue/i.test(shot.environment)) return "Deep Blue Base";
  return "2042 Hangzhou Bay";
}

export function buildReferenceLockText(references: BoundVisualReference[]) {
  return references.map((reference) => {
    const rules = Object.entries(reference.lock).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join("; ");
    return `${reference.category.toUpperCase()} LOCK - ${reference.name}: ${rules}`;
  }).join("\n");
}
