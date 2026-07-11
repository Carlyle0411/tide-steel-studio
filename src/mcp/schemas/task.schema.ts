export type MCPTaskType =
  | "image_generation"
  | "video_generation"
  | "voice_generation"
  | "storyboard_export"
  | "export_episode"
  | "asset_review"
  | "prompt_generation"
  | "style_check"
  | "consistency_check"
  | "render_export"
  | "edit_generation"
  | "trailer_generation"
  | "rhythm_analysis"
  | "timeline_optimization"
  | "trailer_export"
  | "producer_meeting"
  | "risk_analysis"
  | "budget_report"
  | "production_optimization"
  | "weekly_report";

export type MCPTaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "needs_key";
export type MCPReviewStatus = "draft" | "review" | "approved" | "rejected";

export type MCPTaskLog = {
  at: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: unknown;
};

export type MCPTask = {
  taskId: string;
  type: MCPTaskType;
  projectId: string;
  episodeId?: string;
  shotId?: string;
  assetIds: string[];
  toolId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: MCPTaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  progress?: number;
  model?: string;
  asset?: string;
  reviewStatus: MCPReviewStatus;
  logs: MCPTaskLog[];
  errors: string[];
};

export type MCPTaskCreateInput = Omit<MCPTask, "taskId" | "status" | "createdAt" | "updatedAt" | "logs" | "errors"> & {
  taskId?: string;
  status?: MCPTaskStatus;
};

export function createMCPTask(input: MCPTaskCreateInput): MCPTask {
  const now = new Date().toISOString();
  return {
    ...input,
    taskId: input.taskId ?? crypto.randomUUID(),
    status: input.status ?? "pending",
    createdAt: now,
    updatedAt: now,
    logs: [],
    errors: []
  };
}
