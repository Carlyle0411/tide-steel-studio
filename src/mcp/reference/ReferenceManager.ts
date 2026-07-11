import { resolveReferencesForShot, type ResolvedAssetReference } from "../engine/AssetResolver";
import { getCharacterLock } from "../director/CharacterContinuity";
import { getMechaLock } from "../director/MechaContinuity";
import { getSceneLock } from "../director/SceneContinuity";
import { resolveShotContext } from "../engine/ContextResolver";

export type ReferencePack = {
  shotId: string;
  mainPrompt: string;
  referenceImages: string[];
  references: ResolvedAssetReference[];
  continuityRules: string[];
  negativePrompt: string;
};

export class ReferenceManager {
  buildReferencePack(episodeId: string, shotId: string, mainPrompt: string, negativePrompt: string): ReferencePack {
    const context = resolveShotContext(episodeId, shotId);
    const references = resolveReferencesForShot(shotId);
    const characterLock = getCharacterLock(context.character);
    const mechaLock = getMechaLock(context.mecha, episodeId);
    const sceneLock = getSceneLock(context.environment);
    return {
      shotId,
      mainPrompt,
      references,
      referenceImages: references.map((reference) => reference.reference).filter(Boolean),
      continuityRules: [
        characterLock.lockPrompt,
        mechaLock.lockPrompt,
        sceneLock.lockPrompt
      ],
      negativePrompt
    };
  }
}

export const referenceManager = new ReferenceManager();
