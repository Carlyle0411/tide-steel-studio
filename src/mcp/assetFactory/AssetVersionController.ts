import { nextAssetVersion } from "../schemas/assetVersion.schema";

const versions = new Map<string, string>();

export function nextFactoryVersion(assetName: string) {
  const previous = versions.get(assetName);
  const next = nextAssetVersion(previous);
  versions.set(assetName, next);
  return next;
}
