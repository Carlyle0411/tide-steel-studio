export type AssetVersionStatus = "draft" | "waiting_review" | "approved" | "rejected" | "deprecated";

export type AssetVersion = {
  assetId: string;
  version: string;
  source: string;
  prompt: string;
  tool: string;
  createdAt: string;
  approvedBy?: string;
  parentAsset?: string;
  status: AssetVersionStatus;
};

export function nextAssetVersion(previous?: string) {
  const current = Number(previous?.replace(/^V/i, "") || "0");
  return `V${String(current + 1).padStart(3, "0")}`;
}
