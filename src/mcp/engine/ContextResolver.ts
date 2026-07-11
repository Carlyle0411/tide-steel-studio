import { storyboardShots } from "../../pages/production/data/productionData";
import { resolveReferencesForShot, type ResolvedAssetReference } from "./AssetResolver";

export type ShotProductionContext = {
  episodeId: string;
  shotId: string;
  camera: string;
  lens: string;
  lighting: string;
  environment: string;
  character: string;
  creature: string;
  mecha: string;
  emotion: string;
  action: string;
  description: string;
  negative: string[];
  references: ResolvedAssetReference[];
  assetGate: "approved" | "review_only" | "blocked";
  sourceShot?: string;
};

const keyframeContext: Record<string, Partial<ShotProductionContext>> = {
  EP01_KF01: {
    camera: "24mm stable wide establishing shot",
    lens: "24mm",
    lighting: "low storm cloud, cold gray daylight, wet ocean atmosphere",
    environment: "2047 Hangzhou Bay ocean defense line",
    character: "none",
    creature: "none visible",
    mecha: "none visible",
    emotion: "quiet unease before disaster",
    action: "normal defense line continues operating while far sea shows a barely visible unnatural ripple",
    description: "建立正常世界，但画面中存在第一丝不对劲。海洋必须比防线更大。",
    negative: ["cartoon", "anime", "game render", "purple energy", "monster", "explosion", "logo", "text"]
  }
};

export function resolveShotContext(episodeId: string, shotId: string): ShotProductionContext {
  const shotNumber = shotId.match(/SHOT-(\d+)/)?.[1];
  const sourceShot = shotNumber ? storyboardShots.find((shot) => shot.number === shotNumber) : storyboardShots[0];
  const preset = keyframeContext[shotId] ?? {};
  const references = resolveReferencesForShot(shotId);
  const allApproved = references.every((reference) => reference.status === "approved");
  const anyDeprecated = references.some((reference) => reference.status === "deprecated");

  return {
    episodeId,
    shotId,
    camera: preset.camera ?? sourceShot?.camera ?? "grounded cinematic camera",
    lens: preset.lens ?? inferLens(sourceShot?.camera ?? ""),
    lighting: preset.lighting ?? "low-key cold industrial lighting",
    environment: preset.environment ?? "Deep Blue Base / Hangzhou Bay",
    character: preset.character ?? "context dependent",
    creature: preset.creature ?? "none unless shot requires it",
    mecha: preset.mecha ?? "none unless shot requires it",
    emotion: preset.emotion ?? "restrained tension",
    action: preset.action ?? sourceShot?.storyFunction ?? "shot action unresolved",
    description: preset.description ?? sourceShot?.frame ?? "shot description unresolved",
    negative: preset.negative ?? ["cartoon", "anime", "game render", "low quality", "wrong character"],
    references,
    assetGate: anyDeprecated ? "blocked" : allApproved ? "approved" : "review_only",
    sourceShot: sourceShot?.id
  };
}

export function contextItemCount(context: ShotProductionContext) {
  return [
    context.episodeId,
    context.shotId,
    context.camera,
    context.lens,
    context.lighting,
    context.environment,
    context.character,
    context.creature,
    context.mecha,
    context.emotion,
    context.action,
    context.description,
    context.negative.join(","),
    context.references.length,
    context.assetGate,
    context.sourceShot,
    "asset_database",
    "prompt_library"
  ].filter(Boolean).length;
}

function inferLens(camera: string) {
  if (/24mm/.test(camera)) return "24mm";
  if (/35mm/.test(camera)) return "35mm";
  if (/50mm/.test(camera)) return "50mm";
  if (/85mm/.test(camera)) return "85mm";
  return "35mm";
}
