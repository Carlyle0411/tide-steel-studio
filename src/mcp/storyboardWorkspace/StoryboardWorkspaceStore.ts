import { trilogyStoryboardShots } from "../trilogy/TrilogyStoryData";

export type StoryboardStatus = "草稿" | "制作中" | "审核中" | "已通过" | "废弃";

export type StoryboardShot = {
  id: string;
  sourceShotId: string;
  keyframeId: string;
  order: number;
  title: string;
  description: string;
  duration: number;
  shotSize: string;
  camera: string;
  lens: string;
  movement: string;
  character: string;
  environment: string;
  lighting: string;
  emotion: string;
  sound: string;
  dialogue: string;
  music: string;
  notes: string;
  status: StoryboardStatus;
  updatedAt: string;
};

const STORAGE_KEY = "tide-steel-soul-storyboard-workspace-trilogy-v1";
const EVENT_NAME = "tide-steel-soul-storyboard-workspace-change";

export function createDefaultStoryboard(): StoryboardShot[] {
  return trilogyStoryboardShots.map((shot, index) => ({
    ...shot,
    sourceShotId: shot.id,
    order: index + 1,
    status: "草稿",
    updatedAt: ""
  }));
}

export function loadStoryboardWorkspace(): StoryboardShot[] {
  const fallback = createDefaultStoryboard();
  if (typeof localStorage === "undefined") return fallback;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as StoryboardShot[];
    return saved.length ? normalize(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStoryboardWorkspace(shots: StoryboardShot[]) {
  const normalized = normalize(shots).map((shot) => ({ ...shot, updatedAt: shot.updatedAt || new Date().toISOString() }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(EVENT_NAME));
  return normalized;
}

export function resetStoryboardWorkspace() {
  const shots = createDefaultStoryboard();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
  window.dispatchEvent(new Event(EVENT_NAME));
  return shots;
}

export function subscribeStoryboardWorkspace(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

function normalize(shots: StoryboardShot[]) {
  return shots.map((shot, index) => ({
    ...shot,
    order: index + 1,
    id: shot.id?.startsWith("SHOT-TRILOGY-") ? shot.id : `SHOT-TRILOGY-${String(index + 1).padStart(3, "0")}`,
    sourceShotId: shot.sourceShotId || shot.id || `SHOT-TRILOGY-${String(index + 1).padStart(3, "0")}`,
    keyframeId: shot.keyframeId || `TR${String(index + 1).padStart(2, "0")}`,
    status: normalizeStatus(shot.status),
    duration: Math.max(1, Number(shot.duration) || 4)
  }));
}

function normalizeStatus(status: string): StoryboardStatus {
  if (status === "制作中" || status.includes("作")) return "制作中";
  if (status === "审核中" || status.includes("审")) return "审核中";
  if (status === "已通过" || status.includes("通过")) return "已通过";
  if (status === "废弃" || status.includes("废")) return "废弃";
  return "草稿";
}
