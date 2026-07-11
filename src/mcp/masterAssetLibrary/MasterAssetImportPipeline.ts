import { buildMasterGenerationPackage, type MasterAsset } from "./MasterAssetLibraryData";

export type MasterAssetImportInput = {
  asset: MasterAsset;
  imagePath: string;
  promptPath?: string;
  referencePath?: string;
  reviewer?: string;
};

export type MasterAssetImportRecord = {
  assetId: string;
  name: string;
  imagePath: string;
  metadataPath: string;
  prompt: string;
  reference: string;
  version: string;
  status: "待审核";
  tags: string[];
  importedAt: string;
  rule: string;
};

export function createMasterAssetImportRecord(input: MasterAssetImportInput): MasterAssetImportRecord {
  const pack = buildMasterGenerationPackage(input.asset);
  return {
    assetId: input.asset.id,
    name: input.asset.name,
    imagePath: input.imagePath,
    metadataPath: input.asset.metadataPath,
    prompt: pack.prompt,
    reference: input.referencePath ?? input.asset.referenceStatus,
    version: input.asset.version,
    status: "待审核",
    tags: input.asset.tags,
    importedAt: new Date().toISOString(),
    rule: "母资产进入长期复用前必须人工审核。未通过的图片不能作为全系列Reference。"
  };
}

export function buildReferenceFileName(asset: MasterAsset) {
  return `${asset.id}_REFERENCE.json`;
}

export function buildPromptFileName(asset: MasterAsset) {
  return `${asset.id}_PROMPT.md`;
}
