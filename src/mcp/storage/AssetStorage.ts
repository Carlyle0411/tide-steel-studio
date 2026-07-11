import type { AssetVersion } from "../schemas/assetVersion.schema";

export type StoredProductionAsset = {
  assetId: string;
  episode: string;
  shot: string;
  assetType?: string;
  assetName?: string;
  version: string;
  prompt: string;
  model: string;
  createdAt: string;
  status: "draft" | "waiting_review" | "approved" | "rejected" | "deprecated";
  assetPath: string;
  localPath: string;
  url?: string;
  dataUrl?: string;
  metadata: Record<string, unknown>;
};

const storageKey = "tide-production-assets-v1";

class AssetStorage {
  async saveGeneratedAsset(input: {
    episode: string;
    shot: string;
    assetType?: string;
    assetName?: string;
    version: string;
    prompt: string;
    model: string;
    status: StoredProductionAsset["status"];
    url?: string;
    dataUrl?: string;
    metadata?: Record<string, unknown>;
  }) {
    const assetId = `${input.episode}_${input.shot}_${input.version}`;
    const localPath = buildLocalAssetPath(input.assetType, input.assetName ?? input.shot, input.version);
    const assetPath = localPath;
    const asset: StoredProductionAsset = {
      assetId,
      episode: input.episode,
      shot: input.shot,
      assetType: input.assetType,
      assetName: input.assetName,
      version: input.version,
      prompt: input.prompt,
      model: input.model,
      createdAt: new Date().toISOString(),
      status: input.status,
      assetPath,
      localPath,
      url: input.url,
      dataUrl: input.dataUrl,
      metadata: input.metadata ?? {}
    };
    const current = this.listAssets();
    try {
      localStorage.setItem(storageKey, JSON.stringify([asset, ...current].slice(0, 200)));
    } catch {
      const metadataOnly = { ...asset, dataUrl: undefined };
      localStorage.setItem(storageKey, JSON.stringify([metadataOnly, ...current].slice(0, 200)));
      return metadataOnly;
    }
    return asset;
  }

  saveAssetJson(asset: StoredProductionAsset) {
    return {
      assetId: asset.assetId,
      episode: asset.episode,
      shot: asset.shot,
      version: asset.version,
      prompt: asset.prompt,
      model: asset.model,
      createdAt: asset.createdAt,
      status: asset.status,
      assetPath: asset.assetPath,
      localPath: asset.localPath,
      url: asset.url,
      metadata: asset.metadata
    };
  }

  listAssets(): StoredProductionAsset[] {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as StoredProductionAsset[];
    } catch {
      return [];
    }
  }

  toAssetVersion(asset: StoredProductionAsset, source: string, parentAsset?: string): AssetVersion {
    return {
      assetId: asset.assetId,
      version: asset.version,
      source,
      prompt: asset.prompt,
      tool: asset.model,
      createdAt: asset.createdAt,
      parentAsset,
      status: asset.status
    };
  }
}

export const assetStorage = new AssetStorage();

function buildLocalAssetPath(assetType: string | undefined, assetName: string, version: string) {
  const category = categoryFolder(assetType);
  const slug = slugify(assetName);
  const file = `${version.toLowerCase()}.png`;
  return `src/storage/assets/${category}/${slug}/${file}`;
}

function categoryFolder(assetType: string | undefined) {
  if (assetType === "CHARACTER") return "characters";
  if (assetType === "MECHA") return "mechas";
  if (assetType === "CREATURE") return "creatures";
  if (assetType === "ENVIRONMENT") return "environment";
  if (assetType === "PROP") return "props";
  return "keyframes";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "asset";
}
