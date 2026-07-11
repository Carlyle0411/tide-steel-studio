export type KeyframeVersionStatus = "REVIEW" | "APPROVED" | "MASTER_REFERENCE" | "REJECTED";

export type KeyframeAssetVersion = {
  versionId: string;
  fileName: string;
  dataUrl: string;
  mediaType: "image";
  uploadedAt: string;
  status: KeyframeVersionStatus;
  prompt: string;
  metadata: {
    keyframeId: string;
    episodeId: string;
    shotId: string;
    title: string;
  };
};

export type KeyframeAssetStore = Record<string, KeyframeAssetVersion[]>;

const DB_NAME = "tide-steel-soul-keyframe-library";
const DB_VERSION = 1;
const STORE_NAME = "keyframes";
const STORE_KEY = "keyframe-store";
const listeners = new Set<() => void>();

export function subscribeKeyframeStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadKeyframeStore(): Promise<KeyframeAssetStore> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(STORE_KEY);
    request.onsuccess = () => resolve((request.result?.value ?? {}) as KeyframeAssetStore);
    request.onerror = () => reject(request.error);
  });
}

export async function importKeyframeFiles(
  keyframe: { id: string; shot: string; title: string },
  files: FileList | File[],
  prompt: string,
  episodeId = "EP01"
) {
  const accepted = Array.from(files).filter((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type));
  if (!accepted.length) return [];

  const store = await loadKeyframeStore();
  const current = store[keyframe.id] ?? [];
  const imported: KeyframeAssetVersion[] = [];

  for (const file of accepted) {
    const dataUrl = await readFileAsDataUrl(file);
    const index = current.length + imported.length + 1;
    imported.push({
      versionId: `V${String(index).padStart(3, "0")}`,
      fileName: file.name,
      dataUrl,
      mediaType: "image",
      uploadedAt: new Date().toISOString(),
      status: "REVIEW",
      prompt,
      metadata: {
        keyframeId: keyframe.id,
        episodeId,
        shotId: keyframe.shot,
        title: keyframe.title
      }
    });
  }

  await saveStore({ ...store, [keyframe.id]: [...current, ...imported] });
  return imported;
}

export async function deleteKeyframeVersion(keyframeId: string, versionId: string) {
  const store = await loadKeyframeStore();
  const nextVersions = (store[keyframeId] ?? []).filter((version) => version.versionId !== versionId);
  const next = { ...store };
  if (nextVersions.length) next[keyframeId] = nextVersions;
  else delete next[keyframeId];
  await saveStore(next);
}

export async function deleteAllKeyframeVersions(keyframeId: string) {
  const store = await loadKeyframeStore();
  const next = { ...store };
  delete next[keyframeId];
  await saveStore(next);
}

export async function approveKeyframeVersion(keyframeId: string, versionId: string) {
  await updateVersionStatus(keyframeId, versionId, "APPROVED");
}

export async function rejectKeyframeVersion(keyframeId: string, versionId: string) {
  await updateVersionStatus(keyframeId, versionId, "REJECTED");
}

export async function setMasterKeyframeVersion(keyframeId: string, versionId: string) {
  const store = await loadKeyframeStore();
  const versions = (store[keyframeId] ?? []).map((version) => ({
    ...version,
    status: version.versionId === versionId ? "MASTER_REFERENCE" as const : version.status === "MASTER_REFERENCE" ? "APPROVED" as const : version.status
  }));
  await saveStore({ ...store, [keyframeId]: versions });
}

export function getBestKeyframeVersion(versions: KeyframeAssetVersion[] = []) {
  return (
    versions.find((version) => version.status === "MASTER_REFERENCE") ??
    versions.find((version) => version.status === "APPROVED") ??
    versions.find((version) => version.status === "REVIEW") ??
    versions[0] ??
    null
  );
}

async function updateVersionStatus(keyframeId: string, versionId: string, status: KeyframeVersionStatus) {
  const store = await loadKeyframeStore();
  const versions = (store[keyframeId] ?? []).map((version) => version.versionId === versionId ? { ...version, status } : version);
  await saveStore({ ...store, [keyframeId]: versions });
}

async function saveStore(value: KeyframeAssetStore) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id: STORE_KEY, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  listeners.forEach((listener) => listener());
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
