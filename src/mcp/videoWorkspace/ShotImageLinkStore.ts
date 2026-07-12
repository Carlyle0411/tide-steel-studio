export type ShotImageLink = { assetId: string; versionId: string };
const KEY = "tide-steel-soul-shot-image-links-v1";
const EVENT = "tide-steel-soul-shot-image-links-change";
export function loadShotImageLinks(): Record<string, ShotImageLink> { try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; } }
export function saveShotImageLink(shotId: string, link: ShotImageLink | null) { const value = loadShotImageLinks(); if (link) value[shotId] = link; else delete value[shotId]; localStorage.setItem(KEY, JSON.stringify(value)); window.dispatchEvent(new Event(EVENT)); }
export function subscribeShotImageLinks(callback: () => void) { window.addEventListener(EVENT, callback); window.addEventListener("storage", callback); return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", callback); }; }
