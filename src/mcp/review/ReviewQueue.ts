import type { AssetVersion } from "../schemas/assetVersion.schema";
import { mcpLogger } from "../logs/mcpLogger";

export type ReviewQueueStatus = "waiting_review" | "approved" | "rejected";

export type ReviewQueueItem = {
  reviewId: string;
  taskId: string;
  assetVersion: AssetVersion;
  prompt: string;
  tool: string;
  createdAt: string;
  status: ReviewQueueStatus;
  image?: string;
  video?: string;
};

type Listener = () => void;

class ReviewQueue {
  private items: ReviewQueueItem[] = [];
  private listeners = new Set<Listener>();

  add(item: Omit<ReviewQueueItem, "reviewId" | "createdAt" | "status">) {
    const next: ReviewQueueItem = {
      ...item,
      reviewId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "waiting_review"
    };
    this.items.unshift(next);
    mcpLogger.info({ scope: "review", taskId: item.taskId, assetId: item.assetVersion.assetId, toolId: item.tool, message: "Asset entered review queue", input: item.assetVersion });
    this.emit();
    return next;
  }

  approve(reviewId: string, approvedBy = "human_reviewer") {
    this.patch(reviewId, "approved", approvedBy);
  }

  reject(reviewId: string, approvedBy = "human_reviewer") {
    this.patch(reviewId, "rejected", approvedBy);
  }

  list(status?: ReviewQueueStatus) {
    return status ? this.items.filter((item) => item.status === status) : [...this.items];
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private patch(reviewId: string, status: ReviewQueueStatus, approvedBy: string) {
    this.items = this.items.map((item) => item.reviewId === reviewId
      ? { ...item, status, assetVersion: { ...item.assetVersion, status, approvedBy } }
      : item
    );
    mcpLogger.info({ scope: "review", message: `Review ${status}`, input: { reviewId, approvedBy } });
    this.emit();
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const reviewQueue = new ReviewQueue();
