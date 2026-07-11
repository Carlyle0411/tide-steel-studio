import type { LocalAssetInput, LocalAssetRecord } from "./LocalAssetTypes";

export function generateAsset(input: LocalAssetInput): string {
  return `projects/tide-steel-soul/assets/${input.relativePath}`;
}

export function createLocalAssetRecord(input: LocalAssetInput): LocalAssetRecord {
  return {
    ...input,
    id: `${input.category}:${input.name}:${input.relativePath}`,
    version: versionFromPath(input.relativePath),
    createdAt: new Date().toISOString(),
    status: "review",
    qualityScore: 0
  };
}

function versionFromPath(path: string) {
  const match = /(?:^|[\\/])(\d+|v\d+|front|side|back|cockpit|battle_damage|portrait|fullbody|pilot_suit|emotion_sheet)\.(png|jpg|jpeg)$/i.exec(path);
  return match?.[1]?.toUpperCase() ?? "V001";
}
