import { getEP01Shots } from "../ep01Production/EP01ShotData";
import { getEP01Keyframes } from "../tideSteelStudio/EP01StudioData";

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

const STORAGE_KEY = "tide-steel-soul-storyboard-workspace-v2";
const EVENT_NAME = "tide-steel-soul-storyboard-workspace-change";

export function createDefaultStoryboard(): StoryboardShot[] {
  const keyframes = getEP01Keyframes();
  return getEP01Shots().map((shot, index) => {
    const keyframe = keyframes[index];
    return {
      id: `SHOT-EP01-${String(index + 1).padStart(3, "0")}`,
      sourceShotId: shot.shot_id,
      keyframeId: keyframe?.id ?? `KF${String(index + 1).padStart(2, "0")}`,
      order: index + 1,
      title: keyframe?.title ?? `镜头${index + 1}`,
      description: keyframe?.purpose ?? shot.description,
      duration: Number.parseFloat(shot.duration) || 5,
      shotSize: inferShotSize(shot.lens),
      camera: shot.camera,
      lens: shot.lens,
      movement: shot.movement,
      character: shot.character === "None" ? "无" : shot.character,
      environment: shot.environment,
      lighting: shot.lighting,
      emotion: shot.emotion,
      sound: shot.sound,
      dialogue: "无",
      music: index < 4 ? "无音乐，仅环境声与低频" : "待设计",
      notes: "",
      status: "草稿",
      updatedAt: ""
    };
  });
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
  return shots.map((shot, index) => ({ ...shot, order: index + 1, id: `SHOT-EP01-${String(index + 1).padStart(3, "0")}` }));
}

function inferShotSize(lens: string) {
  if (lens.includes("85")) return "特写";
  if (lens.includes("50")) return "中近景";
  if (lens.includes("35")) return "中景";
  return "远景";
}
