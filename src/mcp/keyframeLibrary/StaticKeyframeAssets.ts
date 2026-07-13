import type { KeyframeAssetStore, KeyframeAssetVersion, KeyframeFrameRole } from "./KeyframeAssetStore";

const EP01_STATIC_KEYFRAMES = [
  ["01", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF01.png", import.meta.url).href],
  ["02", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF02.png", import.meta.url).href],
  ["03", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF03.png", import.meta.url).href],
  ["04", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF04.png", import.meta.url).href],
  ["05", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF05.png", import.meta.url).href],
  ["06", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF06.png", import.meta.url).href],
  ["07", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF07.png", import.meta.url).href],
  ["08", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF08.png", import.meta.url).href],
  ["09", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF09.png", import.meta.url).href],
  ["10", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF10.png", import.meta.url).href],
  ["11", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF11.png", import.meta.url).href],
  ["12", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF12.png", import.meta.url).href],
  ["13", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF13.png", import.meta.url).href],
  ["14", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF14.png", import.meta.url).href],
  ["15", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF15.png", import.meta.url).href],
  ["16", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF16.png", import.meta.url).href],
  ["17", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF17.png", import.meta.url).href],
  ["18", new URL("../../../projects/tide-steel-soul/assets/keyframes/ep01/EP01_KF18.png", import.meta.url).href]
] as const;

export function mergeStaticKeyframeFallback(store: KeyframeAssetStore): KeyframeAssetStore {
  const next: KeyframeAssetStore = { ...store };

  for (const [number, dataUrl] of EP01_STATIC_KEYFRAMES) {
    const canonicalId = `EP01_KF${number}`;
    const aliases = getStaticAliasIds(canonicalId);
    const existing = aliases.some((alias) => {
      const startKey = getStaticFrameStorageKey(alias, "START");
      return (next[startKey]?.length ?? 0) > 0 || (next[alias]?.length ?? 0) > 0;
    });

    if (existing) continue;

    const version: KeyframeAssetVersion = {
      versionId: "STATIC_BACKUP",
      fileName: `${canonicalId}.png`,
      dataUrl,
      mediaType: "image",
      uploadedAt: "2026-07-13T00:00:00.000Z",
      status: "MASTER_REFERENCE",
      prompt: "项目内置历史关键帧备份。你上传新的云端版本后，会自动优先显示上传版本。",
      metadata: {
        keyframeId: canonicalId,
        episodeId: "EP01",
        shotId: canonicalId,
        title: `${canonicalId} 历史关键帧备份`,
        frameRole: "START",
        staticFallback: true
      }
    };

    for (const alias of aliases) {
      const startKey = getStaticFrameStorageKey(alias, "START");
      next[startKey] = [version];
    }
  }

  return next;
}

function getStaticFrameStorageKey(keyframeId: string, frameRole: KeyframeFrameRole) {
  return `${keyframeId}::${frameRole}`;
}

function getStaticAliasIds(keyframeId: string) {
  const ids = new Set([keyframeId]);
  const normalized = keyframeId.replace(/^TRAILER_/, "");
  ids.add(normalized);

  const trMatch = normalized.match(/^TR(\d{2})$/i);
  const epMatch = normalized.match(/^EP(\d{2})_KF(\d{2})$/i);
  const kfMatch = normalized.match(/^KF(\d{2})$/i);
  const trailerShotMatch = normalized.match(/^SHOT-TRAILER-(\d{3})$/i);
  const trilogyShotMatch = normalized.match(/^SHOT-TRILOGY-(\d{3})$/i);
  const number = trMatch?.[1] ?? epMatch?.[2] ?? kfMatch?.[1] ?? trailerShotMatch?.[1]?.slice(-2) ?? trilogyShotMatch?.[1]?.slice(-2);

  if (number) {
    const two = number.padStart(2, "0");
    const three = number.padStart(3, "0");
    ids.add(`TR${two}`);
    ids.add(`TRAILER_TR${two}`);
    ids.add(`KF${two}`);
    ids.add(`EP01_KF${two}`);
    ids.add(`SHOT-TRAILER-${three}`);
    ids.add(`SHOT-TRILOGY-${three}`);
  }

  return [...ids];
}
