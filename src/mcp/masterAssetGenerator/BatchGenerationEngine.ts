import { getMasterGenerationStats, getMissingMasterAssets, listMasterGenerationTasks } from "./AssetGenerationQueue";

export type BatchStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED";

export type BatchGenerationState = {
  batchId: string;
  status: BatchStatus;
  total: number;
  completed: number;
  processing: number;
  failed: number;
  waiting: number;
  nextTaskIds: string[];
  note: string;
};

export function getBatchGenerationState(): BatchGenerationState {
  const stats = getMasterGenerationStats();
  const tasks = listMasterGenerationTasks();
  const waiting = stats.pending;
  const completed = stats.review + stats.approved + stats.masterReference;
  return {
    batchId: "BATCH-MASTER-ASSETS-001",
    status: waiting > 0 ? "IDLE" : "COMPLETED",
    total: stats.total,
    completed,
    processing: stats.generating + stats.generated,
    failed: stats.failed,
    waiting,
    nextTaskIds: getMissingMasterAssets(12).map((task) => task.taskId),
    note: "Built-in GPT Image2 must be invoked one image at a time by Codex. The batch engine tracks all tasks and forbids fake completion."
  };
}

export function planFullGenerationBatch() {
  return {
    state: getBatchGenerationState(),
    tasks: getMissingMasterAssets()
  };
}
