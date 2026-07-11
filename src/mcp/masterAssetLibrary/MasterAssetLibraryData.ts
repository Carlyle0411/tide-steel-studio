import actionLibrary from "../../../projects/tide-steel-soul/master-asset-library/ACTION_LIBRARY.json";
import autoImportRules from "../../../projects/tide-steel-soul/master-asset-library/AUTO_IMPORT_RULES.json";
import cameraLibrary from "../../../projects/tide-steel-soul/master-asset-library/CAMERA_LIBRARY.json";
import compositionLibrary from "../../../projects/tide-steel-soul/master-asset-library/COMPOSITION_LIBRARY.json";
import lightingLibrary from "../../../projects/tide-steel-soul/master-asset-library/LIGHTING_LIBRARY.json";
import masterAssets from "../../../projects/tide-steel-soul/master-asset-library/MASTER_ASSETS.json";
import manifest from "../../../projects/tide-steel-soul/master-asset-library/MASTER_ASSET_LIBRARY_MANIFEST.json";
import metadataSchema from "../../../projects/tide-steel-soul/master-asset-library/METADATA_SCHEMA.json";
import promptTemplates from "../../../projects/tide-steel-soul/master-asset-library/PROMPT_TEMPLATE_LIBRARY.json";
import vfxLibrary from "../../../projects/tide-steel-soul/master-asset-library/VFX_LIBRARY.json";
import videoTemplates from "../../../projects/tide-steel-soul/master-asset-library/VIDEO_TEMPLATE_LIBRARY.json";
import weatherLibrary from "../../../projects/tide-steel-soul/master-asset-library/WEATHER_LIBRARY.json";

export type MasterAsset = (typeof masterAssets.assets)[number];
export type MasterCategory = (typeof manifest.categories)[number];
export type MasterTemplate = (typeof actionLibrary.templates)[number];
export type MasterPromptTemplate = (typeof promptTemplates.templates)[number];
export type MasterVideoTemplate = (typeof videoTemplates.templates)[number];

export function getMasterAssetManifest() {
  return manifest;
}

export function getMasterAssets(): MasterAsset[] {
  return masterAssets.assets;
}

export function getMasterCategories(): MasterCategory[] {
  return manifest.categories;
}

export function getMasterActionTemplates() {
  return actionLibrary.templates;
}

export function getMasterCameraTemplates() {
  return cameraLibrary.templates;
}

export function getMasterWeatherTemplates() {
  return weatherLibrary.templates;
}

export function getMasterLightingTemplates() {
  return lightingLibrary.templates;
}

export function getMasterVfxTemplates() {
  return vfxLibrary.templates;
}

export function getMasterCompositionTemplates() {
  return compositionLibrary.templates;
}

export function getMasterPromptTemplates(): MasterPromptTemplate[] {
  return promptTemplates.templates;
}

export function getMasterVideoTemplates(): MasterVideoTemplate[] {
  return videoTemplates.templates;
}

export function getMasterMetadataSchema() {
  return metadataSchema;
}

export function getMasterAutoImportRules() {
  return autoImportRules;
}

export function searchMasterAssets(query: string, category = "全部") {
  const q = query.trim().toLowerCase();
  return getMasterAssets().filter((asset) => {
    const categoryOk = category === "全部" || asset.category === category;
    const text = [asset.id, asset.name, asset.baseName, asset.category, asset.variant, asset.description, ...asset.tags].join(" ").toLowerCase();
    return categoryOk && (!q || text.includes(q));
  });
}

export function getMasterLibraryStats() {
  return {
    categories: manifest.stats.categories,
    masterAssets: manifest.stats.masterAssets,
    actionTemplates: manifest.stats.actionTemplates,
    cameraTemplates: manifest.stats.cameraTemplates,
    weatherTemplates: manifest.stats.weatherTemplates,
    lightingTemplates: manifest.stats.lightingTemplates,
    vfxTemplates: manifest.stats.vfxTemplates,
    compositionTemplates: manifest.stats.compositionTemplates,
    promptTemplates: manifest.stats.promptTemplates,
    videoTemplates: manifest.stats.videoTemplates
  };
}

export function buildMasterGenerationPackage(asset: MasterAsset) {
  const prompt = getMasterPromptTemplates().find((item) => item.assetId === asset.id);
  return {
    assetId: asset.id,
    name: asset.name,
    status: "待生成",
    outputPath: `projects/tide-steel-soul/master-asset-library/generated/${asset.id}.png`,
    metadataPath: asset.metadataPath,
    prompt: prompt?.gptImage2Prompt ?? "",
    klingPrompt: prompt?.klingPrompt ?? "",
    negativePrompt: prompt?.negativePrompt ?? "",
    tags: asset.tags,
    reference: asset.referenceStatus
  };
}
