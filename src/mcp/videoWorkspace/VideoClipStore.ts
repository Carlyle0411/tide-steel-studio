export type VideoVersionStatus = "REVIEW" | "APPROVED" | "MASTER" | "REJECTED";
export type VideoClipVersion = { versionId: string; fileName: string; blob: Blob; mimeType: string; size: number; duration: number; uploadedAt: string; status: VideoVersionStatus; prompt: string; notes: string };
export type VideoClipStore = Record<string, VideoClipVersion[]>;

const DB_NAME = "tide-steel-soul-video-clips";
const DB_VERSION = 1;
const STORE_NAME = "clips";
const STORE_KEY = "video-clip-store";
const listeners = new Set<() => void>();

export function subscribeVideoClips(callback: () => void) { listeners.add(callback); return () => listeners.delete(callback); }
export async function loadVideoClipStore(): Promise<VideoClipStore> { const db = await openDb(); return new Promise((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readonly"); const request = tx.objectStore(STORE_NAME).get(STORE_KEY); request.onsuccess = () => resolve(request.result?.value ?? {}); request.onerror = () => reject(request.error); }); }

export async function importVideoClips(shotId: string, files: FileList | File[], prompt: string) {
  const accepted = Array.from(files).filter(isAcceptedVideoFile);
  const store = await loadVideoClipStore(); const current = store[shotId] ?? []; const imported: VideoClipVersion[] = [];
  for (const file of accepted) imported.push({ versionId: `V${String(current.length + imported.length + 1).padStart(3, "0")}`, fileName: file.name, blob: file, mimeType: file.type, size: file.size, duration: await readDuration(file), uploadedAt: new Date().toISOString(), status: "REVIEW", prompt, notes: "" });
  if (imported.length) await save({ ...store, [shotId]: [...current, ...imported] }); return imported;
}

export async function updateVideoVersion(shotId: string, versionId: string, patch: Partial<Pick<VideoClipVersion, "status" | "notes">>) { const store = await loadVideoClipStore(); const versions = (store[shotId] ?? []).map((version) => version.versionId === versionId ? { ...version, ...patch } : patch.status === "MASTER" && version.status === "MASTER" ? { ...version, status: "APPROVED" as const } : version); await save({ ...store, [shotId]: versions }); }
export async function deleteVideoVersion(shotId: string, versionId: string) { const store = await loadVideoClipStore(); const next = { ...store }; const versions = (next[shotId] ?? []).filter((version) => version.versionId !== versionId); if (versions.length) next[shotId] = versions; else delete next[shotId]; await save(next); }
export async function deleteShotVideos(shotId: string) { const store = await loadVideoClipStore(); const next = { ...store }; delete next[shotId]; await save(next); }
export function bestVideoVersion(versions: VideoClipVersion[]) { return versions.find((item) => item.status === "MASTER") ?? versions.find((item) => item.status === "APPROVED") ?? versions.find((item) => item.status === "REVIEW") ?? versions[0] ?? null; }

async function save(value: VideoClipStore) { const db = await openDb(); await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).put({ id: STORE_KEY, value }); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); listeners.forEach((listener) => listener()); }
function openDb(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" }); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
function isAcceptedVideoFile(file: File) { return ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) || /\.(mp4|webm|mov)$/i.test(file.name); }
function readDuration(file: File) { return new Promise<number>((resolve) => { const video = document.createElement("video"); const url = URL.createObjectURL(file); video.preload = "metadata"; video.onloadedmetadata = () => { const duration = Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : 0; URL.revokeObjectURL(url); resolve(duration); }; video.onerror = () => { URL.revokeObjectURL(url); resolve(0); }; video.src = url; }); }
