import { AssetGroup, MediaAsset } from "../types";

const DB_NAME = "ai-video-workbench";
const DB_VERSION = 1;
const ASSETS = "assets";
const GROUPS = "asset-groups";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ASSETS)) db.createObjectStore(ASSETS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(GROUPS)) db.createObjectStore(GROUPS, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function store<T>(name: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(name, mode);
    const objectStore = tx.objectStore(name);
    const request = run(objectStore);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getAllAssets() {
  return store<MediaAsset[]>(ASSETS, "readonly", (s) => s.getAll());
}

export async function saveAsset(asset: MediaAsset) {
  return store<IDBValidKey>(ASSETS, "readwrite", (s) => s.put(asset));
}

export async function deleteAsset(id: string) {
  return store<undefined>(ASSETS, "readwrite", (s) => s.delete(id) as IDBRequest<undefined>);
}

export async function deleteAssetsByProject(projectId: string) {
  const assets = await getAllAssets();
  await Promise.all(assets.filter((asset) => asset.projectId === projectId).map((asset) => deleteAsset(asset.id)));
}

export async function getAllGroups() {
  return store<AssetGroup[]>(GROUPS, "readonly", (s) => s.getAll());
}

export async function saveGroup(group: AssetGroup) {
  return store<IDBValidKey>(GROUPS, "readwrite", (s) => s.put(group));
}

export async function deleteGroup(id: string) {
  return store<undefined>(GROUPS, "readwrite", (s) => s.delete(id) as IDBRequest<undefined>);
}

export async function deleteGroupsByProject(projectId: string) {
  const groups = await getAllGroups();
  await Promise.all(groups.filter((group) => group.projectId === projectId).map((group) => deleteGroup(group.id)));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
