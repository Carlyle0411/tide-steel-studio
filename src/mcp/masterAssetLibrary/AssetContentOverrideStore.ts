import type { MasterAsset } from "./MasterAssetLibraryData";

export type AssetContentOverride = {
  name?: string;
  variant?: string;
  description?: string;
  identityLock?: string;
  assetRequirement?: string;
  composition?: string;
  cameraRule?: string;
  materialRule?: string;
  backgroundRule?: string;
  negativePrompt?: string;
  usage?: string;
  updatedAt?: string;
};

export type AssetContentOverrideStore = Record<string, AssetContentOverride>;

const STORAGE_KEY = "tide-steel-soul-asset-content-overrides-v1";
const EVENT_NAME = "tide-steel-soul-asset-content-overrides-change";

export function loadAssetContentOverrides(): AssetContentOverrideStore {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as AssetContentOverrideStore;
  } catch {
    return {};
  }
}

export function getAssetContentOverride(assetId: string) {
  return loadAssetContentOverrides()[assetId] ?? {};
}

export function saveAssetContentOverride(assetId: string, override: AssetContentOverride) {
  const store = loadAssetContentOverrides();
  store[assetId] = { ...store[assetId], ...override, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function resetAssetContentOverride(assetId: string) {
  const store = loadAssetContentOverrides();
  delete store[assetId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function applyAssetContentOverride(asset: MasterAsset): MasterAsset {
  const override = getAssetContentOverride(asset.id);
  const baseName = asset.baseName;
  const titleVariant = override.name ? parseVariant(override.name, baseName) : "";
  const variant = titleVariant || override.variant?.trim() || asset.variant;
  return {
    ...asset,
    name: `${baseName} / ${variant}`,
    variant,
    description: override.description?.trim() || asset.description
  } as MasterAsset;
}

function parseVariant(title: string, baseName: string) {
  const trimmed = title.trim();
  const slashIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("／"));
  if (slashIndex >= 0) return trimmed.slice(slashIndex + 1).trim();
  if (trimmed.startsWith(baseName)) return trimmed.slice(baseName.length).replace(/^\s*[-—:：]\s*/, "").trim();
  return trimmed;
}

export function subscribeAssetContentOverrides(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}
