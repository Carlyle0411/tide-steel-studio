import { nextAssetVersion, type AssetVersion } from "../../schemas/assetVersion.schema";

export function createEP01AssetVersion(input: {
  shotId: string;
  prompt: string;
  tool?: string;
  parentAsset?: string;
}): AssetVersion {
  return {
    assetId: `${input.shotId}_DRAFT`,
    version: nextAssetVersion(),
    source: "EP01 Visual Production",
    prompt: input.prompt,
    tool: input.tool ?? "gpt_image2",
    createdAt: new Date().toISOString(),
    parentAsset: input.parentAsset,
    status: "waiting_review"
  };
}
