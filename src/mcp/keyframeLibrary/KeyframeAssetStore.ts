import { CLOUD_ASSET_BUCKET, supabase, supabaseConfigured } from "../../lib/supabaseClient";
import { mergeStaticKeyframeFallback } from "./StaticKeyframeAssets";

export type KeyframeVersionStatus = "REVIEW" | "APPROVED" | "MASTER_REFERENCE" | "REJECTED";
export type KeyframeFrameRole = "START" | "END";

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
    frameRole?: KeyframeFrameRole;
    cloudPath?: string;
    staticFallback?: boolean;
  };
};

export type KeyframeAssetStore = Record<string, KeyframeAssetVersion[]>;

type CloudKeyframeRow = {
  id: string;
  asset_id: string;
  version_id: string;
  file_name: string;
  file_path: string;
  media_type: "image" | "video";
  status: KeyframeVersionStatus;
  uploaded_at: string;
  prompt_versions: { versionId: string; prompt: string; reason: string; createdAt: string }[] | null;
  metadata: KeyframeAssetVersion["metadata"] & { prompt?: string };
};

const DB_NAME = "tide-steel-soul-keyframe-library";
const DB_VERSION = 1;
const STORE_NAME = "keyframes";
const STORE_KEY = "keyframe-store";
const CLOUD_PREFIX = "KEYFRAME::";
const EVENT = "tide-steel-keyframe-library-change";
const listeners = new Set<() => void>();

export function subscribeKeyframeStore(listener: () => void) {
  listeners.add(listener);
  const handler = () => listener();
  window.addEventListener(EVENT, handler);
  return () => {
    listeners.delete(listener);
    window.removeEventListener(EVENT, handler);
  };
}

export async function loadKeyframeStore(): Promise<KeyframeAssetStore> {
  const store = supabaseConfigured && (await getSession(false))
    ? await loadCloudKeyframeStore()
    : await loadLocalKeyframeStore();
  return mergeStaticKeyframeFallback(store);
}

export async function importKeyframeFiles(
  keyframe: { id: string; shot: string; title: string },
  files: FileList | File[],
  prompt: string,
  episodeId = "EP01",
  frameRole: KeyframeFrameRole = "START"
) {
  if (supabaseConfigured && (await getSession(false))) {
    return importCloudKeyframeFiles(keyframe, files, prompt, episodeId, frameRole);
  }
  return importLocalKeyframeFiles(keyframe, files, prompt, episodeId, frameRole);
}

export function getKeyframeFrameVersions(store: KeyframeAssetStore, keyframeId: string, frameRole: KeyframeFrameRole) {
  const ids = getKeyframeAliasIds(keyframeId);
  const frameKeys = ids.map((id) => getKeyframeFrameStorageKey(id, frameRole));
  const frameVersions = mergeVersions(frameKeys.flatMap((key) => store[key] ?? []));
  if (frameVersions.length || frameRole !== "START") return frameVersions;
  return mergeVersions(ids.flatMap((id) => store[id] ?? []));
}

export function getKeyframeFrameStorageKey(keyframeId: string, frameRole: KeyframeFrameRole) {
  return `${keyframeId}::${frameRole}`;
}

export function getKeyframeFrameVersionOwnerKey(store: KeyframeAssetStore, keyframeId: string, frameRole: KeyframeFrameRole, versionId: string) {
  const ids = getKeyframeAliasIds(keyframeId);
  for (const id of ids) {
    const storageKey = getKeyframeFrameStorageKey(id, frameRole);
    if ((store[storageKey] ?? []).some((version) => version.versionId === versionId)) return storageKey;
  }
  if (frameRole === "START") {
    for (const id of ids) {
      if ((store[id] ?? []).some((version) => version.versionId === versionId)) return id;
    }
  }
  return getKeyframeFrameStorageKey(keyframeId, frameRole);
}

export function getKeyframeAliasIds(keyframeId: string) {
  const ids = new Set([keyframeId]);
  const normalized = keyframeId.replace(/^TRAILER_/, "");
  ids.add(normalized);

  const trMatch = normalized.match(/^TR(\d{2})$/i);
  const epMatch = normalized.match(/^EP(\d{2})_KF(\d{2})$/i);
  const kfMatch = normalized.match(/^KF(\d{2})$/i);
  const trailerShotMatch = normalized.match(/^SHOT-TRAILER-(\d{3})$/i);
  const trilogyShotMatch = normalized.match(/^SHOT-TRILOGY-(\d{3})$/i);

  if (epMatch || kfMatch) {
    const two = (epMatch?.[2] ?? kfMatch?.[1] ?? "").padStart(2, "0");
    ids.add(`KF${two}`);
    ids.add(`EP01_KF${two}`);
  }

  if (trMatch || trailerShotMatch || trilogyShotMatch) {
    const number = trMatch?.[1] ?? trailerShotMatch?.[1]?.slice(-2) ?? trilogyShotMatch?.[1]?.slice(-2);
    if (number) {
      const two = number.padStart(2, "0");
      const three = number.padStart(3, "0");
      ids.add(`TR${two}`);
      ids.add(`TRAILER_TR${two}`);
      ids.add(`SHOT-TRAILER-${three}`);
      ids.add(`SHOT-TRILOGY-${three}`);
    }
  }

  return [...ids];
}

function mergeVersions(versions: KeyframeAssetVersion[]) {
  const seen = new Set<string>();
  return versions.filter((version) => {
    const key = [
      version.metadata.cloudPath,
      version.dataUrl,
      version.fileName,
      version.versionId,
      version.metadata.frameRole
    ].filter(Boolean).join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function deleteAllKeyframeFrameVersions(keyframeId: string, frameRole: KeyframeFrameRole) {
  const storageKey = getKeyframeFrameStorageKey(keyframeId, frameRole);
  if (supabaseConfigured && (await getSession(false))) {
    await deleteCloudKeyframeAsset(storageKey);
    if (frameRole === "START") await deleteCloudKeyframeAsset(keyframeId);
    return;
  }
  const store = await loadLocalKeyframeStore();
  const next = { ...store };
  delete next[storageKey];
  if (frameRole === "START") delete next[keyframeId];
  await saveLocalStore(next);
}

export async function deleteKeyframeVersion(keyframeId: string, versionId: string) {
  if (supabaseConfigured && (await getSession(false))) return deleteCloudKeyframeVersion(keyframeId, versionId);
  const store = await loadLocalKeyframeStore();
  const nextVersions = (store[keyframeId] ?? []).filter((version) => version.versionId !== versionId);
  const next = { ...store };
  if (nextVersions.length) next[keyframeId] = nextVersions;
  else delete next[keyframeId];
  await saveLocalStore(next);
}

export async function deleteAllKeyframeVersions(keyframeId: string) {
  if (supabaseConfigured && (await getSession(false))) return deleteCloudKeyframeAsset(keyframeId);
  const store = await loadLocalKeyframeStore();
  const next = { ...store };
  delete next[keyframeId];
  await saveLocalStore(next);
}

export async function approveKeyframeVersion(keyframeId: string, versionId: string) {
  await updateVersionStatus(keyframeId, versionId, "APPROVED");
}

export async function rejectKeyframeVersion(keyframeId: string, versionId: string) {
  await updateVersionStatus(keyframeId, versionId, "REJECTED");
}

export async function setMasterKeyframeVersion(keyframeId: string, versionId: string) {
  if (supabaseConfigured && (await getSession(false))) {
    const rows = await findCloudKeyframeRows(keyframeId);
    await Promise.all(rows.map(async (row) => {
      const status = row.version_id === versionId ? "MASTER_REFERENCE" : row.status === "MASTER_REFERENCE" ? "APPROVED" : row.status;
      const { error } = await supabase!.from("asset_versions").update({ status }).eq("id", row.id);
      if (error) throw error;
    }));
    emitChange();
    return;
  }
  const store = await loadLocalKeyframeStore();
  const versions = (store[keyframeId] ?? []).map((version) => ({
    ...version,
    status: version.versionId === versionId ? "MASTER_REFERENCE" as const : version.status === "MASTER_REFERENCE" ? "APPROVED" as const : version.status
  }));
  await saveLocalStore({ ...store, [keyframeId]: versions });
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
  if (supabaseConfigured && (await getSession(false))) {
    const row = (await findCloudKeyframeRows(keyframeId)).find((item) => item.version_id === versionId);
    if (!row) return;
    const { error } = await supabase!.from("asset_versions").update({ status }).eq("id", row.id);
    if (error) throw error;
    emitChange();
    return;
  }
  const store = await loadLocalKeyframeStore();
  const versions = (store[keyframeId] ?? []).map((version) => version.versionId === versionId ? { ...version, status } : version);
  await saveLocalStore({ ...store, [keyframeId]: versions });
}

async function loadCloudKeyframeStore(): Promise<KeyframeAssetStore> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("asset_versions")
    .select("*")
    .like("asset_id", `${CLOUD_PREFIX}%`)
    .eq("media_type", "image")
    .order("uploaded_at", { ascending: true });
  if (error) throw error;
  const store: KeyframeAssetStore = {};
  for (const row of (data ?? []) as CloudKeyframeRow[]) {
    const key = fromCloudAssetId(row.asset_id);
    const version = await mapCloudRow(row);
    store[key] = [...(store[key] ?? []), version];
  }
  return store;
}

async function importCloudKeyframeFiles(
  keyframe: { id: string; shot: string; title: string },
  files: FileList | File[],
  prompt: string,
  episodeId: string,
  frameRole: KeyframeFrameRole
) {
  const session = await getSession(true);
  if (!supabase || !session) throw new Error("Please sign in before uploading keyframes to cloud storage.");
  const accepted = Array.from(files).filter((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type));
  if (!accepted.length) return [];

  const storageKey = getKeyframeFrameStorageKey(keyframe.id, frameRole);
  const assetId = toCloudAssetId(storageKey);
  const { data: currentRows, error: currentError } = await supabase.from("asset_versions").select("version_id").eq("asset_id", assetId);
  if (currentError) throw currentError;

  const created: KeyframeAssetVersion[] = [];
  for (const [index, file] of accepted.entries()) {
    const versionId = `V${String((currentRows?.length ?? 0) + index + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const filePath = `${session.user.id}/keyframes/${safeFileName(storageKey)}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(CLOUD_ASSET_BUCKET).upload(filePath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const metadata: KeyframeAssetVersion["metadata"] & { prompt: string } = {
      keyframeId: keyframe.id,
      episodeId,
      shotId: keyframe.shot,
      title: keyframe.title,
      frameRole,
      prompt,
      cloudPath: filePath
    };

    const { data: row, error: insertError } = await supabase.from("asset_versions").insert({
      owner_id: session.user.id,
      asset_id: assetId,
      version_id: versionId,
      file_name: file.name,
      file_path: filePath,
      media_type: "image",
      status: "REVIEW",
      uploaded_at: now,
      prompt_versions: [{ versionId: "Prompt V001", prompt, reason: "Keyframe upload prompt record", createdAt: now }],
      metadata
    }).select().single();
    if (insertError) {
      await supabase.storage.from(CLOUD_ASSET_BUCKET).remove([filePath]);
      throw insertError;
    }
    created.push(await mapCloudRow(row as CloudKeyframeRow));
  }
  emitChange();
  return created;
}

async function deleteCloudKeyframeAsset(keyframeId: string) {
  const rows = await findCloudKeyframeRows(keyframeId);
  for (const row of rows) await deleteCloudKeyframeVersion(keyframeId, row.version_id);
}

async function deleteCloudKeyframeVersion(keyframeId: string, versionId: string) {
  if (!supabase) return;
  const row = (await findCloudKeyframeRows(keyframeId)).find((item) => item.version_id === versionId);
  if (!row) return;
  const { error: storageError } = await supabase.storage.from(CLOUD_ASSET_BUCKET).remove([row.file_path]);
  if (storageError) throw storageError;
  const { error } = await supabase.from("asset_versions").delete().eq("id", row.id);
  if (error) throw error;
  emitChange();
}

async function findCloudKeyframeRows(keyframeId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("asset_versions")
    .select("*")
    .eq("asset_id", toCloudAssetId(keyframeId))
    .order("uploaded_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CloudKeyframeRow[];
}

async function mapCloudRow(row: CloudKeyframeRow): Promise<KeyframeAssetVersion> {
  const { data, error } = await supabase!.storage.from(CLOUD_ASSET_BUCKET).createSignedUrl(row.file_path, 60 * 60);
  if (error) throw error;
  const prompt = row.prompt_versions?.at(-1)?.prompt ?? row.metadata.prompt ?? "";
  return {
    versionId: row.version_id,
    fileName: row.file_name,
    dataUrl: data.signedUrl,
    mediaType: "image",
    uploadedAt: row.uploaded_at,
    status: row.status,
    prompt,
    metadata: { ...row.metadata, cloudPath: row.file_path }
  };
}

async function loadLocalKeyframeStore(): Promise<KeyframeAssetStore> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(STORE_KEY);
    request.onsuccess = () => resolve((request.result?.value ?? {}) as KeyframeAssetStore);
    request.onerror = () => reject(request.error);
  });
}

async function importLocalKeyframeFiles(
  keyframe: { id: string; shot: string; title: string },
  files: FileList | File[],
  prompt: string,
  episodeId: string,
  frameRole: KeyframeFrameRole
) {
  const accepted = Array.from(files).filter((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type));
  if (!accepted.length) return [];

  const store = await loadLocalKeyframeStore();
  const storageKey = getKeyframeFrameStorageKey(keyframe.id, frameRole);
  const current = store[storageKey] ?? [];
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
        title: keyframe.title,
        frameRole
      }
    });
  }

  await saveLocalStore({ ...store, [storageKey]: [...current, ...imported] });
  return imported;
}

async function saveLocalStore(value: KeyframeAssetStore) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id: STORE_KEY, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  emitChange();
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

async function getSession(required: boolean) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session && required) throw new Error("Please sign in before using cloud asset storage.");
  return data.session;
}

function toCloudAssetId(keyframeId: string) {
  return `${CLOUD_PREFIX}${keyframeId}`;
}

function fromCloudAssetId(assetId: string) {
  return assetId.startsWith(CLOUD_PREFIX) ? assetId.slice(CLOUD_PREFIX.length) : assetId;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-140);
}

function emitChange() {
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new Event(EVENT));
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
