import type { MCPTask } from "../schemas/task.schema";

export type BatchStatus = "pending" | "running" | "completed" | "failed" | "paused";

export type ProductionBatch = {
  batchId: string;
  episode: string;
  totalShots: number;
  completedShots: number;
  failedShots: number;
  progress: number;
  status: BatchStatus;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
};

type Listener = () => void;

class BatchProductionStore {
  private batches: ProductionBatch[] = [];
  private listeners = new Set<Listener>();

  createBatch(episode: string, tasks: MCPTask[]) {
    const batch: ProductionBatch = {
      batchId: crypto.randomUUID(),
      episode,
      totalShots: tasks.length,
      completedShots: tasks.filter((task) => task.status === "completed").length,
      failedShots: tasks.filter((task) => task.status === "failed" || task.status === "needs_key").length,
      progress: 0,
      status: "pending",
      taskIds: tasks.map((task) => task.taskId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.batches.unshift(batch);
    this.emit();
    return batch;
  }

  updateFromTasks(batchId: string, tasks: MCPTask[]) {
    this.batches = this.batches.map((batch) => {
      if (batch.batchId !== batchId) return batch;
      const batchTasks = tasks.filter((task) => batch.taskIds.includes(task.taskId));
      const completedShots = batchTasks.filter((task) => task.status === "completed").length;
      const failedShots = batchTasks.filter((task) => task.status === "failed" || task.status === "needs_key").length;
      const progress = batch.totalShots ? Math.round((completedShots / batch.totalShots) * 100) : 0;
      return {
        ...batch,
        completedShots,
        failedShots,
        progress,
        status: completedShots === batch.totalShots ? "completed" : failedShots > 0 ? "running" : batch.status,
        updatedAt: new Date().toISOString()
      };
    });
    this.emit();
  }

  listBatches() {
    return [...this.batches];
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const batchProductionStore = new BatchProductionStore();
