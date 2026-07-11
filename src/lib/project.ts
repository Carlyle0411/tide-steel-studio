import { defaultCharacters } from "../data/presets";
import { FormState, ProjectType, VideoProject } from "../types";

export function createInitialForm(type: ProjectType = "mecha"): FormState {
  return {
    projectType: type,
    theme: "潮汐钢魂：赤霆01在未来海岸防线迎战白潮怪兽",
    protagonist: "赤霆01机甲与年轻驾驶员",
    scene: "杭州湾未来海岸防线、深蓝海域防卫基地、雨夜海雾",
    duration: 45,
    shotCount: 8,
    aspectRatio: "9:16",
    styleKeywords: "电影级机甲科幻，真实金属，工业细节，克制热血，高级广告质感",
    mood: "紧张、克制、热血、有希望感",
    needCharacterConsistency: true,
    needFirstFramePrompt: true,
    needTailFramePrompt: true,
    activeCharacterIds: [defaultCharacters[1].id],
    activeAssetIds: []
  };
}

export function createProject(name = "未命名视频项目", type: ProjectType = "mecha"): VideoProject {
  const now = new Date().toISOString();
  const form = createInitialForm(type);
  return {
    id: crypto.randomUUID(),
    name,
    type,
    description: "",
    aspectRatio: form.aspectRatio,
    duration: form.duration,
    shotCount: form.shotCount,
    characterIds: form.activeCharacterIds,
    assetIds: [],
    assetGroupIds: [],
    shots: [],
    promptRecords: [],
    exportHistory: [],
    form,
    archived: false,
    createdAt: now,
    updatedAt: now
  };
}

export function syncProjectFromForm(project: VideoProject, form: FormState, shots = project.shots): VideoProject {
  return {
    ...project,
    type: form.projectType,
    aspectRatio: form.aspectRatio,
    duration: form.duration,
    shotCount: form.shotCount,
    characterIds: form.activeCharacterIds,
    assetIds: form.activeAssetIds,
    assetGroupIds: project.assetGroupIds,
    shots,
    form,
    updatedAt: new Date().toISOString()
  };
}
