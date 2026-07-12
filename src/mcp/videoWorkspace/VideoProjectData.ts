import { trailer90Shots } from "../trailer/Trailer90StudioData";
import { loadStoryboardWorkspace, type StoryboardShot } from "../storyboardWorkspace/StoryboardWorkspaceStore";

export type VideoProjectId = "TRAILER90" | `EP${string}`;
export type VideoProject = { id: VideoProjectId; label: string; helper: string; shots: StoryboardShot[]; requiredAssets: Record<string, string[]> };

export function getVideoProjects(): VideoProject[] {
  const episodes: VideoProject[] = Array.from({ length: 12 }, (_, index) => {
    const id = `EP${String(index + 1).padStart(2, "0")}` as VideoProjectId;
    return { id, label: `第${chineseNumber(index + 1)}集`, helper: id === "EP01" ? "《海面低频》" : "尚未建立正式 Shot", shots: id === "EP01" ? loadStoryboardWorkspace() : [], requiredAssets: {} };
  });
  return [
    { id: "TRAILER90", label: "90秒预告片", helper: "20 Shot · 00:00-01:30", shots: trailerShots(), requiredAssets: Object.fromEntries(trailer90Shots.map((shot) => [`SHOT-TRAILER-${shot.id.slice(2).padStart(3, "0")}`, shot.assets])) },
    ...episodes
  ];
}

function trailerShots(): StoryboardShot[] {
  return trailer90Shots.map((shot, index) => ({
    id: `SHOT-TRAILER-${String(index + 1).padStart(3, "0")}`,
    sourceShotId: shot.id,
    keyframeId: shot.id,
    order: index + 1,
    title: shot.title,
    description: shot.purpose,
    duration: durationOf(shot.time),
    shotSize: readToken(shot.imagePrompt, ["微距", "近景", "中近景", "远景", "特写"], "电影景别"),
    camera: readToken(shot.imagePrompt, ["固定", "低机位", "侧后方", "正视"], "按画面规划"),
    lens: shot.imagePrompt.match(/\d+mm/)?.[0] ?? "按画面规划",
    movement: shot.mode === "首尾帧" ? "首尾帧连续运动" : "克制的单镜头运动",
    character: inferCharacter(shot.assets),
    environment: shot.assets.filter((asset) => asset.includes("杭州湾") || asset.includes("基地") || asset.includes("通道") || asset.includes("潮门")).join("、") || "按母资产Reference",
    lighting: "遵循首帧真实光源，不无故跳变",
    emotion: "以具体表情和动作呈现，不使用抽象情绪表演",
    sound: shot.sound,
    dialogue: shot.dialogue,
    music: "按预告片节奏设计",
    notes: shot.imagePrompt,
    status: "制作中",
    updatedAt: new Date(0).toISOString()
  }));
}

function durationOf(value: string) { const [start, end] = value.split("-").map(toSeconds); return Math.max(1, end - start); }
function toSeconds(value: string) { const [minutes, seconds] = value.split(":").map(Number); return minutes * 60 + seconds; }
function readToken(value: string, choices: string[], fallback: string) { return choices.find((choice) => value.includes(choice)) ?? fallback; }
function inferCharacter(assets: string[]) { return ["林舟", "许燃", "陈牧", "AI澜"].filter((name) => assets.some((asset) => asset.includes(name))).join("、") || "无"; }
function chineseNumber(value: number) { return ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][value]; }
