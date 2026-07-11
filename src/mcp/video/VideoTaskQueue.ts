import type { VideoAdapterStatus, VideoProviderId } from "../production/VideoProductionAdapter";

export type VideoTask = {
  videoTaskId: string;
  episode: string;
  shot: string;
  imageAsset: string;
  provider: VideoProviderId;
  duration: number;
  status: VideoAdapterStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
};

type Listener = () => void;

class VideoTaskQueue {
  private tasks: VideoTask[] = [];
  private listeners = new Set<Listener>();

  addTask(input: Omit<VideoTask, "videoTaskId" | "createdAt" | "status"> & { status?: VideoAdapterStatus }) {
    const task: VideoTask = {
      ...input,
      videoTaskId: crypto.randomUUID(),
      status: input.status ?? "pending",
      createdAt: new Date().toISOString()
    };
    this.tasks.unshift(task);
    this.emit();
    return task;
  }

  patch(videoTaskId: string, patch: Partial<VideoTask>) {
    this.tasks = this.tasks.map((task) => task.videoTaskId === videoTaskId ? {
      ...task,
      ...patch,
      completedAt: ["completed", "video_review", "failed", "needs_key", "cancelled"].includes(patch.status ?? "") ? new Date().toISOString() : task.completedAt
    } : task);
    this.emit();
  }

  listTasks() {
    return [...this.tasks];
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const videoTaskQueue = new VideoTaskQueue();
