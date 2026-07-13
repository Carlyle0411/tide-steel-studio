import { productionAssets } from "../../pages/production/data/productionData";

export type ResolvedAssetReference = {
  assetId: string;
  name: string;
  status: "approved" | "draft" | "review" | "deprecated";
  reference: string;
  canGenerateImage: boolean;
  canGenerateVideo: boolean;
};

export function resolveAssetById(assetId: string): ResolvedAssetReference | undefined {
  const asset = productionAssets.find((item) => item.id === assetId);
  if (!asset) return undefined;
  return {
    assetId: asset.id,
    name: asset.name,
    status: asset.status,
    reference: asset.reference,
    canGenerateImage: asset.gptImage2,
    canGenerateVideo: asset.kling || asset.veo
  };
}

export function resolveReferencesForShot(shotId: string): ResolvedAssetReference[] {
  if (shotId === "EP01_KF02") {
    return ["ENV-OCEANWALL-001", "ENV-DEEPBLUEBASE-001", "CHAR-CHENMU-001", "MECHA-CRT001-001"]
      .map(resolveAssetById)
      .filter(Boolean) as ResolvedAssetReference[];
  }
  return productionAssets
    .filter((asset) => asset.approved)
    .slice(0, 4)
    .map((asset) => ({
      assetId: asset.id,
      name: asset.name,
      status: asset.status,
      reference: asset.reference,
      canGenerateImage: asset.gptImage2,
      canGenerateVideo: asset.kling || asset.veo
    }));
}

export function getAssetStatus(assetId: string) {
  return resolveAssetById(assetId)?.status ?? "draft";
}
