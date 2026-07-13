import { getEP01Keyframes } from "../tideSteelStudio/EP01StudioData";
import { loadStoryboardWorkspace, type StoryboardShot } from "../storyboardWorkspace/StoryboardWorkspaceStore";

export type VideoProjectId = "TRAILER90" | `EP${string}`;

export type VideoProject = {
  id: VideoProjectId;
  label: string;
  helper: string;
  shots: StoryboardShot[];
  requiredAssets: Record<string, string[]>;
};

export function getVideoProjects(): VideoProject[] {
  const trailerShots = loadStoryboardWorkspace();
  const ep01Shots = getEP01VideoShots();
  const episodes: VideoProject[] = Array.from({ length: 12 }, (_, index) => {
    const id = `EP${String(index + 1).padStart(2, "0")}` as VideoProjectId;
    if (id === "EP01") {
      return {
        id,
        label: "第一集 · EP01《海面低频》",
        helper: `${ep01Shots.length} Shot · 正式EP01《海面低频》`,
        shots: ep01Shots,
        requiredAssets: Object.fromEntries(
          ep01Shots.map((shot) => [shot.id, inferRequiredAssets(shot)])
        )
      };
    }
    return {
      id,
      label: `第${chineseNumber(index + 1)}集 · ${id}`,
      helper: "三部曲正式分集 Shot 待建立",
      shots: [],
      requiredAssets: {}
    };
  });

  return [
    {
      id: "TRAILER90",
      label: "90秒预告片 · TRAILER90",
      helper: `${trailerShots.length} Shot · 三部曲正式预告片`,
      shots: trailerShots,
      requiredAssets: Object.fromEntries(
        trailerShots.map((shot) => [shot.id, inferRequiredAssets(shot)])
      )
    },
    ...episodes
  ];
}

function getEP01VideoShots(): StoryboardShot[] {
  return getEP01Keyframes().map((keyframe, index) => ({
    id: `SHOT-EP01-${String(index + 1).padStart(3, "0")}`,
    sourceShotId: keyframe.shot,
    keyframeId: keyframe.id,
    order: index + 1,
    title: keyframe.title,
    description: keyframe.purpose,
    duration: 15,
    shotSize: keyframe.shotSize ?? "",
    camera: `景别：${keyframe.shotSize ?? "待定"}。镜头：${keyframe.movement ?? "待定"}。焦段：${keyframe.lens ?? "待定"}。`,
    lens: keyframe.lens ?? "",
    movement: keyframe.movement ?? "",
    character: keyframe.character ?? "",
    environment: keyframe.environment ?? "",
    lighting: keyframe.lighting ?? "",
    emotion: keyframe.emotion ?? "",
    sound: keyframe.sound ?? "",
    dialogue: "无",
    music: "无",
    notes: keyframe.notes ?? "",
    status: "草稿" as StoryboardShot["status"],
    updatedAt: keyframe.updatedAt ?? new Date().toISOString()
  }));
}

function inferRequiredAssets(shot: StoryboardShot) {
  const keyframe = getEP01Keyframes().find((item) => item.id === shot.keyframeId || item.shot === shot.sourceShotId);
  if (keyframe) return keyframe.required_assets;

  const values = [shot.character, shot.environment]
    .filter(Boolean)
    .join(" / ")
    .split(/[、/]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => value !== "无" && value !== "待绑定");

  return Array.from(new Set(values));
}

function chineseNumber(value: number) {
  return ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][value] ?? String(value);
}
