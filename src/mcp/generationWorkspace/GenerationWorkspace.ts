import { listMasterGenerationTasks } from "../masterAssetGenerator/AssetGenerationQueue";
import { buildGPTImage2Prompt } from "../masterAssetGenerator/GPTImage2Executor";
import { mapMasterTaskToProductionTask, type AssetProductionTask } from "./AssetProductionTask";
import { createGenerationSession, summarizeSession, type GenerationSession } from "./GenerationSession";
import { getReferenceForTask } from "./ReferenceRules";

export type WorkspaceStats = {
  total: number;
  ready: number;
  generating: number;
  waitingImport: number;
  review: number;
  master: number;
};

export function listWorkspaceTasks(): AssetProductionTask[] {
  return listMasterGenerationTasks().map((task) => mapMasterTaskToProductionTask(task, buildGPTImage2Prompt(task), getReferenceForTask(task)));
}

export function getWorkspaceStats(): WorkspaceStats {
  const tasks = listWorkspaceTasks();
  return {
    total: tasks.length,
    ready: tasks.filter((task) => task.status === "READY").length,
    generating: tasks.filter((task) => task.status === "GENERATING").length,
    waitingImport: tasks.filter((task) => task.status === "WAITING_IMPORT").length,
    review: tasks.filter((task) => task.status === "REVIEW").length,
    master: tasks.filter((task) => task.status === "MASTER").length
  };
}

export function createAdHocSession(taskIds: string[]): GenerationSession {
  const selected = listWorkspaceTasks().filter((task) => taskIds.includes(task.taskId));
  return createGenerationSession("ADHOC_SELECTED_ASSETS", "手动选中资产 Session", "当前 Session 只负责这些选中资产的真实生成与导入。", selected);
}

export function getCurrentSessionFallback(): GenerationSession {
  const tasks = listWorkspaceTasks()
    .filter((task) => task.status === "READY" || task.status === "REVIEW")
    .slice(0, 5);
  return createGenerationSession("WORKSPACE_NEXT_FIVE", "下一组待生成资产", "默认只显示 5 个任务，避免误以为后台可以连续跑完 213 张。", tasks);
}

export { getReferenceForTask, summarizeSession };
