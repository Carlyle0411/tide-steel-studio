import type { Session, User } from "@supabase/supabase-js";
import { CLOUD_ASSET_BUCKET, supabase, supabaseConfigured } from "../../lib/supabaseClient";
import type {
  AssetRating,
  ConsistencyChecklist,
  ManualAssetMetadata,
  ManualAssetStore,
  ManualAssetVersion,
  PromptVersion
} from "../manualAssetImport/ManualAssetImport";
import type { MasterAsset } from "../masterAssetLibrary/MasterAssetLibraryData";

type CloudRow = {
  id: string;
  asset_id: string;
  version_id: string;
  file_name: string;
  file_path: string;
  media_type: "image" | "video";
  status: ManualAssetVersion["status"];
  uploaded_at: string;
  checklist: ConsistencyChecklist | null;
  rating: AssetRating | null;
  prompt_versions: PromptVersion[] | null;
  metadata: ManualAssetMetadata;
};

const TABLE = "asset_versions";
const EVENT = "tide-steel-soul-cloud-asset-library-change";
const LOCAL_EVENT = "tide-steel-soul-manual-asset-library-change";
const supportedTypes = new Set(["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm", "video/quicktime"]);

export class CloudAssetAuthRequiredError extends Error {
  constructor() {
    super("请先登录云端资产库，再上传或编辑素材。");
  }
}

export function isCloudAssetSyncEnabled() {
  return supabaseConfigured;
}

export async function getCloudSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInCloud(email: string, password: string) {
  if (!supabase) throw new Error("云端配置缺失。");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  emitChange();
  return data.session;
}

export async function signUpCloud(email: string, password: string) {
  if (!supabase) throw new Error("云端配置缺失。");
  const redirectTo = typeof window === "undefined" ? undefined : window.location.origin;
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
  if (error) throw error;
  emitChange();
  return data;
}

export async function signOutCloud() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  emitChange();
}

export function subscribeCloudAuth(callback: () => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange(() => {
    emitChange();
    callback();
  });
  return () => data.subscription.unsubscribe();
}

export function subscribeCloudAssetStore(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(EVENT, handler);
  window.addEventListener(LOCAL_EVENT, handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener(LOCAL_EVENT, handler);
  };
}

export async function loadCloudAssetStore(): Promise<ManualAssetStore> {
  const session = await requireSession(false);
  if (!session || !supabase) return {};
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("uploaded_at", { ascending: true });
  if (error) throw error;

  const store: ManualAssetStore = {};
  await Promise.all((data as CloudRow[]).map(async (row) => {
    const version = await mapRow(row);
    store[row.asset_id] = [...(store[row.asset_id] ?? []), version];
  }));
  return store;
}

export async function importCloudAssetFiles(asset: MasterAsset, files: FileList | File[], prompt: string) {
  const session = await requireSession(true);
  if (!supabase || !session) throw new CloudAssetAuthRequiredError();
  const validFiles = Array.from(files).filter((file) => supportedTypes.has(file.type));
  if (!validFiles.length) return [];

  const { data: currentRows, error: currentError } = await supabase
    .from(TABLE)
    .select("version_id")
    .eq("asset_id", asset.id);
  if (currentError) throw currentError;

  const created: ManualAssetVersion[] = [];
  for (const [index, file] of validFiles.entries()) {
    const versionId = `V${String((currentRows?.length ?? 0) + index + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const filePath = `${session.user.id}/${asset.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(CLOUD_ASSET_BUCKET).upload(filePath, file, {
      contentType: file.type,
      upsert: false
    });
    if (uploadError) throw uploadError;

    const metadata: ManualAssetMetadata = {
      asset_id: asset.id,
      category: asset.category,
      character: asset.category === "人物" ? asset.baseName : "",
      scene: asset.category === "场景" ? asset.baseName : "",
      prompt,
      version: versionId,
      reference: asset.referenceStatus,
      usage: [],
      file_name: file.name,
      uploaded_at: now,
      cloud_path: filePath
    };
    const checklist = emptyChecklist();
    const rating = emptyRating();
    const promptVersions: PromptVersion[] = [{ versionId: "Prompt V001", prompt, reason: "上传素材时记录当前 Prompt。", createdAt: now }];
    const { data: row, error: insertError } = await supabase
      .from(TABLE)
      .insert({
        owner_id: session.user.id,
        asset_id: asset.id,
        version_id: versionId,
        file_name: file.name,
        file_path: filePath,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        status: "REVIEW",
        uploaded_at: now,
        checklist,
        rating,
        prompt_versions: promptVersions,
        metadata
      })
      .select()
      .single();
    if (insertError) {
      await supabase.storage.from(CLOUD_ASSET_BUCKET).remove([filePath]);
      throw insertError;
    }
    created.push(await mapRow(row as CloudRow));
  }
  emitChange();
  return created;
}

export async function deleteCloudAssetVersion(assetId: string, versionId: string) {
  const row = await findCloudVersion(assetId, versionId);
  if (!row || !supabase) return;
  const { error: storageError } = await supabase.storage.from(CLOUD_ASSET_BUCKET).remove([row.file_path]);
  if (storageError) throw storageError;
  const { error } = await supabase.from(TABLE).delete().eq("id", row.id);
  if (error) throw error;
  emitChange();
}

export async function deleteCloudAssetVersions(assetId: string) {
  const rows = await findCloudAssetRows(assetId);
  for (const row of rows) await deleteCloudAssetVersion(assetId, row.version_id);
}

export async function deleteManyCloudAssetVersions(assetIds: string[]) {
  for (const assetId of assetIds) await deleteCloudAssetVersions(assetId);
}

export async function updateCloudVersionStatus(assetId: string, versionId: string, status: ManualAssetVersion["status"]) {
  const row = await findCloudVersion(assetId, versionId);
  if (!row || !supabase) return;
  const { error } = await supabase.from(TABLE).update({ status }).eq("id", row.id);
  if (error) throw error;
  emitChange();
}

export async function approveCloudVersion(assetId: string, versionId: string) {
  return updateCloudVersionStatus(assetId, versionId, "APPROVED");
}

export async function rejectCloudVersion(assetId: string, versionId: string) {
  return updateCloudVersionStatus(assetId, versionId, "REJECTED");
}

export async function markCloudRegenerate(assetId: string, versionId: string) {
  return updateCloudVersionStatus(assetId, versionId, "DRAFT");
}

export async function setCloudMasterVersion(assetId: string, versionId: string) {
  if (!supabase) return;
  const rows = await findCloudAssetRows(assetId);
  await Promise.all(rows.map(async (row) => {
    const status = row.version_id === versionId ? "MASTER_REFERENCE" : row.status === "MASTER_REFERENCE" ? "APPROVED" : row.status;
    const { error } = await supabase.from(TABLE).update({ status }).eq("id", row.id);
    if (error) throw error;
  }));
  emitChange();
}

export async function updateCloudChecklist(assetId: string, versionId: string, checklist: ConsistencyChecklist) {
  await updateCloudVersion(assetId, versionId, { checklist });
}

export async function updateCloudRating(assetId: string, versionId: string, rating: AssetRating) {
  await updateCloudVersion(assetId, versionId, { rating });
}

export async function addCloudPromptVersion(assetId: string, versionId: string, prompt: string, reason: string) {
  const row = await findCloudVersion(assetId, versionId);
  if (!row) return;
  const current = row.prompt_versions?.length ? row.prompt_versions : [{ versionId: "Prompt V001", prompt: row.metadata.prompt, reason: "历史 Prompt", createdAt: row.uploaded_at }];
  await updateCloudVersion(assetId, versionId, {
    prompt_versions: [...current, { versionId: `Prompt V${String(current.length + 1).padStart(3, "0")}`, prompt, reason: reason.trim() || "手动保存 Prompt 新版本。", createdAt: new Date().toISOString() }]
  });
}

async function updateCloudVersion(assetId: string, versionId: string, patch: Record<string, unknown>) {
  const row = await findCloudVersion(assetId, versionId);
  if (!row || !supabase) return;
  const { error } = await supabase.from(TABLE).update(patch).eq("id", row.id);
  if (error) throw error;
  emitChange();
}

async function findCloudAssetRows(assetId: string) {
  const session = await requireSession(true);
  if (!supabase || !session) return [];
  const { data, error } = await supabase.from(TABLE).select("*").eq("asset_id", assetId).order("uploaded_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CloudRow[];
}

async function findCloudVersion(assetId: string, versionId: string) {
  const rows = await findCloudAssetRows(assetId);
  return rows.find((row) => row.version_id === versionId) ?? null;
}

async function mapRow(row: CloudRow): Promise<ManualAssetVersion> {
  if (!supabase) throw new Error("Supabase 未配置。");
  const { data, error } = await supabase.storage.from(CLOUD_ASSET_BUCKET).createSignedUrl(row.file_path, 60 * 60);
  if (error) throw error;
  return {
    versionId: row.version_id,
    fileName: row.file_name,
    dataUrl: data.signedUrl,
    mediaType: row.media_type,
    uploadedAt: row.uploaded_at,
    status: row.status,
    checklist: row.checklist ?? emptyChecklist(),
    rating: row.rating ?? emptyRating(),
    promptVersions: row.prompt_versions ?? [],
    metadata: { ...row.metadata, cloud_path: row.file_path }
  };
}

async function requireSession(required: boolean): Promise<Session | null> {
  if (!supabase) {
    if (required) throw new Error("云端资产库尚未配置。请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_KEY。");
    return null;
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session && required) throw new CloudAssetAuthRequiredError();
  return data.session;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

function emptyChecklist(): ConsistencyChecklist {
  return { face: false, hair: false, age: false, costume: false, world: false };
}

function emptyRating(): AssetRating {
  return { consistency: 0, quality: 0, cinematic: 0, reusable: 0 };
}

function emitChange() {
  window.dispatchEvent(new Event(EVENT));
}

export type CloudAuthState = { user: User | null; session: Session | null };
