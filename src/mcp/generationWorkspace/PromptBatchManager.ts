import { buildGPTImage2Prompt } from "../masterAssetGenerator/GPTImage2Executor";
import { listMasterGenerationTasks, type MasterGenerationTask } from "../masterAssetGenerator/AssetGenerationQueue";
import { mapMasterTaskToProductionTask } from "./AssetProductionTask";
import { createGenerationSession, type GenerationSession } from "./GenerationSession";
import { getReferenceForTask } from "./ReferenceRules";

export type SessionPreset = {
  id: string;
  title: string;
  description: string;
  predicate: (task: MasterGenerationTask) => boolean;
  limit?: number;
};

export const sessionPresets: SessionPreset[] = [
  {
    id: "LINZHOU_CHARACTER_BATCH_01",
    title: "林舟角色母资产 01",
    description: "标准头像、侧脸、全身、三视图、驾驶服。必须引用林舟 MASTER_REFERENCE。",
    predicate: (task) => task.outputPath.includes("characters/linzhou"),
    limit: 5
  },
  {
    id: "CHITING01_MECHA_BATCH_01",
    title: "赤霆01机甲母资产 01",
    description: "正面、背面、侧面、45度、全身比例。只生成当前选中资产，不后台连跑。",
    predicate: (task) => task.outputPath.includes("mecha/chiting01"),
    limit: 5
  },
  {
    id: "WHITE_TIDE_CREATURE_BATCH_01",
    title: "白潮怪兽母资产 01",
    description: "完整身体、头部、眼睛、甲壳、海面出现。保持深海生命逻辑。",
    predicate: (task) => task.outputPath.includes("creatures/white_tide"),
    limit: 5
  }
];

export function createSessionFromPreset(presetId: string): GenerationSession {
  const preset = sessionPresets.find((item) => item.id === presetId) ?? sessionPresets[0];
  const tasks = listMasterGenerationTasks()
    .filter((task) => task.status === "WAITING" || task.status === "PENDING_GENERATION" || task.status === "GENERATION_FAILED" || task.status === "REVIEW")
    .filter(preset.predicate)
    .slice(0, preset.limit)
    .map((task) => mapMasterTaskToProductionTask(task, buildGPTImage2Prompt(task), getReferenceForTask(task)));

  return createGenerationSession(preset.id, preset.title, preset.description, tasks);
}

export function createSelectedAssetSession(tasks: MasterGenerationTask[]): GenerationSession {
  const selected = tasks.map((task) => mapMasterTaskToProductionTask(task, buildGPTImage2Prompt(task), getReferenceForTask(task)));
  return createGenerationSession("SELECTED_ASSETS_SESSION", "选中资产生成 Session", "只处理当前勾选资产。未返回真实 PNG 之前，不会改变 Approved 状态。", selected);
}
