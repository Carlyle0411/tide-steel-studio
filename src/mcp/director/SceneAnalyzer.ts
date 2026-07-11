import { resolveShotContext } from "../engine/ContextResolver";
import { getSceneLock } from "./SceneContinuity";

export function analyzeScene(episodeId: string, shotId: string) {
  const context = resolveShotContext(episodeId, shotId);
  const sceneLock = getSceneLock(context.environment);
  return {
    environment: context.environment,
    lighting: context.lighting,
    sceneLock,
    references: context.references.filter((reference) => /ENV-/.test(reference.assetId))
  };
}
