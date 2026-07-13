import { CLOUD_ASSET_BUCKET, supabase, supabaseConfigured } from "../../lib/supabaseClient";

export type VideoVersionStatus = "REVIEW" | "APPROVED" | "MASTER" | "REJECTED";
export type VideoClipVersion = {
  versionId: string;
  fileName: string;
  blob?: Blob;
  dataUrl?: string;
  mimeType: string;
  size: number;
  duration: number;
  uploadedAt: string;
  status: VideoVersionStatus;
  prompt: string;
  notes: string;
};
export type VideoClipStore = Record<string, VideoClipVersion[]>;

type CloudVideoRow = {
  id: string;
  asset_id: string;
  version_id: string;
  file_name: string;
  file_path: string;
  media_type: "image" | "video";
  status: "REVIEW" | "APPROVED" | "MASTER_REFERENCE" | "REJECTED";
  uploaded_at: string;
  prompt_versions: { versionId: string; prompt: string; reason: string; createdAt: string }[] | null;
  metadata: {
    shotId?: string;
    prompt?: string;
    notes?: string;
    duration?: number;
    size?: number;
    mimeType?: string;
    cloudPath?: string;
  };
};

const DB_NAME = "tide-steel-soul-video-clips";
const DB_VERSION = 1;
const STORE_NAME = "clips";
const STORE_KEY = "video-clip-store";
const CLOUD_PREFIX = "VIDEO::";
const EVENT = "tide-steel-video-clips-change";
const listeners = new Set<() => void>();

export function subscribeVideoClips(callback: () => void) {
  listeners.add(callback);
  const handler = () => callback();
  window.addEventListener(EVENT, handler);
  return () => {
    listeners.delete(callback);
    window.removeEventListener(EVENT, handler);
  };
}

export async function loadVideoClipStore(): Promise<VideoClipStore> {
  if (supabaseConfigured && (await getSession(false))) return loadCloudVideoStore();
  return loadLocalVideoStore();
}

export async function importVideoClips(shotId: string, files: FileList | File[], prompt: string) {
  if (supabaseConfigured && (await getSession(false))) return importCloudVideoClips(shotId, files, prompt);
  return importLocalVideoClips(shotId, files, prompt);
}

export async function updateVideoVersion(shotId: string, versionId: string, patch: Partial<Pick<VideoClipVersion, "status" | "notes">>) {
  if (supabaseConfigured && (await getSession(false))) return updateCloudVideoVersion(shotId, versionId, patch);
  const store = await loadLocalVideoStore();
  const versions = (store[shotId] ?? []).map((version) =>
    version.versionId === versionId
      ? { ...version, ...patch }
      : patch.status === "MASTER" && version.status === "MASTER"
        ? { ...version, status: "APPROVED" as const }
        : version
  );
  await saveLocalStore({ ...store, [shotId]: versions });
}

export async function deleteVideoVersion(shotId: string, versionId: string) {
  if (supabaseConfigured && (await getSession(false))) return deleteCloudVideoVersion(shotId, versionId);
  const store = await loadLocalVideoStore();
  const next = { ...store };
  const versions = (next[shotId] ?? []).filter((version) => version.versionId !== versionId);
  if (versions.length) next[shotId] = versions;
  else delete next[shotId];
  await saveLocalStore(next);
}

export async function deleteShotVideos(shotId: string) {
  if (supabaseConfigured && (await getSession(false))) return deleteCloudShotVideos(shotId);
  const store = await loadLocalVideoStore();
  const next = { ...store };
  delete next[shotId];
  await saveLocalStore(next);
}

export function bestVideoVersion(versions: VideoClipVersion[]) {
  return versions.find((item) => item.status === "MASTER") ?? versions.find((item) => item.status === "APPROVED") ?? versions.find((item) => item.status === "REVIEW") ?? versions[0] ?? null;
}

async function loadCloudVideoStore(): Promise<VideoClipStore> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("asset_versions")
    .select("*")
    .like("asset_id", `${CLOUD_PREFIX}%`)
    .eq("media_type", "video")
    .order("uploaded_at", { ascending: true });
  if (error) throw error;
  const store: VideoClipStore = {};
  for (const row of (data ?? []) as CloudVideoRow[]) {
    const shotId = fromCloudAssetId(row.asset_id);
    const version = await mapCloudRow(row);
    store[shotId] = [...(store[shotId] ?? []), version];
  }
  return store;
}

async function importCloudVideoClips(shotId: string, files: FileList | File[], prompt: string) {
  const session = await getSession(true);
  if (!supabase || !session) throw new Error("Please sign in before uploading videos to cloud storage.");
  const accepted = Array.from(files).filter(isAcceptedVideoFile);
  if (!accepted.length) return [];

  const assetId = toCloudAssetId(shotId);
  const { data: currentRows, error: currentError } = await supabase.from("asset_versions").select("version_id").eq("asset_id", assetId);
  if (currentError) throw currentError;

  const imported: VideoClipVersion[] = [];
  for (const [index, file] of accepted.entries()) {
    const duration = await readDuration(file);
    const versionId = `V${String((currentRows?.length ?? 0) + index + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const filePath = `${session.user.id}/videos/${safeFileName(shotId)}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(CLOUD_ASSET_BUCKET).upload(filePath, file, { contentType: file.type || "video/mp4", upsert: false });
    if (uploadError) throw uploadError;

    const metadata: CloudVideoRow["metadata"] = {
      shotId,
      prompt,
      notes: "",
      duration,
      size: file.size,
      mimeType: file.type || "video/mp4",
      cloudPath: filePath
    };

    const { data: row, error: insertError } = await supabase.from("asset_versions").insert({
      owner_id: session.user.id,
      asset_id: assetId,
      version_id: versionId,
      file_name: file.name,
      file_path: filePath,
      media_type: "video",
      status: "REVIEW",
      uploaded_at: now,
      prompt_versions: [{ versionId: "Prompt V001", prompt, reason: "Video upload prompt record", createdAt: now }],
      metadata
    }).select().single();
    if (insertError) {
      await supabase.storage.from(CLOUD_ASSET_BUCKET).remove([filePath]);
      throw insertError;
    }
    imported.push(await mapCloudRow(row as CloudVideoRow));
  }
  emitChange();
  return imported;
}

async function updateCloudVideoVersion(shotId: string, versionId: string, patch: Partial<Pick<VideoClipVersion, "status" | "notes">>) {
  if (!supabase) return;
  const rows = await findCloudVideoRows(shotId);
  const selected = rows.find((row) => row.version_id === versionId);
  if (!selected) return;

  if (patch.status === "MASTER") {
    await Promise.all(rows.map(async (row) => {
      const status = row.version_id === versionId ? "MASTER_REFERENCE" : row.status === "MASTER_REFERENCE" ? "APPROVED" : row.status;
      const { error } = await supabase!.from("asset_versions").update({ status }).eq("id", row.id);
      if (error) throw error;
    }));
  } else if (patch.status) {
    const { error } = await supabase.from("asset_versions").update({ status: toCloudStatus(patch.status) }).eq("id", selected.id);
    if (error) throw error;
  }

  if (patch.notes !== undefined) {
    const { error } = await supabase.from("asset_versions").update({ metadata: { ...selected.metadata, notes: patch.notes } }).eq("id", selected.id);
    if (error) throw error;
  }
  emitChange();
}

async function deleteCloudVideoVersion(shotId: string, versionId: string) {
  if (!supabase) return;
  const row = (await findCloudVideoRows(shotId)).find((item) => item.version_id === versionId);
  if (!row) return;
  const { error: storageError } = await supabase.storage.from(CLOUD_ASSET_BUCKET).remove([row.file_path]);
  if (storageError) throw storageError;
  const { error } = await supabase.from("asset_versions").delete().eq("id", row.id);
  if (error) throw error;
  emitChange();
}

async function deleteCloudShotVideos(shotId: string) {
  const rows = await findCloudVideoRows(shotId);
  for (const row of rows) await deleteCloudVideoVersion(shotId, row.version_id);
}

async function findCloudVideoRows(shotId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("asset_versions")
    .select("*")
    .eq("asset_id", toCloudAssetId(shotId))
    .order("uploaded_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CloudVideoRow[];
}

async function mapCloudRow(row: CloudVideoRow): Promise<VideoClipVersion> {
  const { data, error } = await supabase!.storage.from(CLOUD_ASSET_BUCKET).createSignedUrl(row.file_path, 60 * 60);
  if (error) throw error;
  return {
    versionId: row.version_id,
    fileName: row.file_name,
    dataUrl: data.signedUrl,
    mimeType: row.metadata.mimeType ?? "video/mp4",
    size: row.metadata.size ?? 0,
    duration: row.metadata.duration ?? 0,
    uploadedAt: row.uploaded_at,
    status: fromCloudStatus(row.status),
    prompt: row.prompt_versions?.at(-1)?.prompt ?? row.metadata.prompt ?? "",
    notes: row.metadata.notes ?? ""
  };
}

async function loadLocalVideoStore(): Promise<VideoClipStore> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(STORE_KEY);
    request.onsuccess = () => resolve(request.result?.value ?? {});
    request.onerror = () => reject(request.error);
  });
}

async function importLocalVideoClips(shotId: string, files: FileList | File[], prompt: string) {
  const accepted = Array.from(files).filter(isAcceptedVideoFile);
  const store = await loadLocalVideoStore();
  const current = store[shotId] ?? [];
  const imported: VideoClipVersion[] = [];
  for (const file of accepted) {
    imported.push({
      versionId: `V${String(current.length + imported.length + 1).padStart(3, "0")}`,
      fileName: file.name,
      blob: file,
      mimeType: file.type,
      size: file.size,
      duration: await readDuration(file),
      uploadedAt: new Date().toISOString(),
      status: "REVIEW",
      prompt,
      notes: ""
    });
  }
  if (imported.length) await saveLocalStore({ ...store, [shotId]: [...current, ...imported] });
  return imported;
}

async function saveLocalStore(value: VideoClipStore) {
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
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function toCloudStatus(status: VideoVersionStatus): CloudVideoRow["status"] {
  return status === "MASTER" ? "MASTER_REFERENCE" : status;
}

function fromCloudStatus(status: CloudVideoRow["status"]): VideoVersionStatus {
  return status === "MASTER_REFERENCE" ? "MASTER" : status;
}

async function getSession(required: boolean) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session && required) throw new Error("Please sign in before using cloud asset storage.");
  return data.session;
}

function toCloudAssetId(shotId: string) {
  return `${CLOUD_PREFIX}${shotId}`;
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

function isAcceptedVideoFile(file: File) {
  return ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) || /\.(mp4|webm|mov)$/i.test(file.name);
}

function readDuration(file: File) {
  return new Promise<number>((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}
