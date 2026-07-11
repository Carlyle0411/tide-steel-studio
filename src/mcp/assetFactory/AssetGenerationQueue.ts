export type AssetTaskType = "CHARACTER" | "MECHA" | "CREATURE" | "ENVIRONMENT" | "PROP" | "KEYFRAME";
export type AssetTaskStatus = "draft" | "generating" | "generated" | "review" | "approved" | "rejected" | "needs_key" | "failed";

export type AssetGenerationTask = {
  taskId: string;
  type: AssetTaskType;
  assetName: string;
  variant: string;
  prompt?: string;
  status: AssetTaskStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  outputAssetPath?: string;
  imageUrl?: string;
  error?: string;
  qualityScore?: number;
};

type Listener = () => void;

class AssetGenerationQueue {
  private tasks: AssetGenerationTask[] = [];
  private listeners = new Set<Listener>();

  add(input: Omit<AssetGenerationTask, "taskId" | "status" | "createdAt" | "updatedAt"> & { status?: AssetTaskStatus }) {
    const now = new Date().toISOString();
    const task: AssetGenerationTask = {
      ...input,
      taskId: crypto.randomUUID(),
      status: input.status ?? "draft",
      createdAt: now,
      updatedAt: now
    };
    this.tasks.unshift(task);
    this.emit();
    return task;
  }

  patch(taskId: string, patch: Partial<AssetGenerationTask>) {
    this.tasks = this.tasks.map((task) => task.taskId === taskId ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task);
    this.emit();
  }

  list(type?: AssetTaskType) {
    return type ? this.tasks.filter((task) => task.type === type) : [...this.tasks];
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const assetGenerationQueue = new AssetGenerationQueue();
