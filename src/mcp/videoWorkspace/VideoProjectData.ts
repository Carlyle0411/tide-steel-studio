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
  const trilogyTrailerShots = loadStoryboardWorkspace();
  const episodes: VideoProject[] = Array.from({ length: 12 }, (_, index) => {
    const id = `EP${String(index + 1).padStart(2, "0")}` as VideoProjectId;
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
      helper: `${trilogyTrailerShots.length} Shot · 三部曲正式预告片`,
      shots: trilogyTrailerShots,
      requiredAssets: Object.fromEntries(
        trilogyTrailerShots.map((shot) => [shot.id, inferRequiredAssets(shot)])
      )
    },
    ...episodes
  ];
}

function inferRequiredAssets(shot: StoryboardShot) {
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
