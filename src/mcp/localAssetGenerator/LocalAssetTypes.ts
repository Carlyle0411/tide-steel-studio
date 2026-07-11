export type LocalAssetCategory = "characters" | "mechas" | "creatures" | "environment" | "props";

export type LocalAssetInput = {
  name: string;
  category: LocalAssetCategory;
  prompt: string;
  style?: string;
  reference?: string;
  relativePath: string;
};

export type LocalAssetRecord = LocalAssetInput & {
  id: string;
  version: string;
  createdAt: string;
  status: "review" | "approved" | "rejected";
  qualityScore: number;
  file_size?: number;
};
