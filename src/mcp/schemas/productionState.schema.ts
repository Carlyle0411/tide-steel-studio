export type ProductionState =
  | "draft"
  | "director_review"
  | "approved_direction"
  | "generating"
  | "generated"
  | "asset_review"
  | "approved_asset"
  | "video_ready"
  | "completed"
  | "failed";

export const productionStateTransitions: Record<ProductionState, ProductionState[]> = {
  draft: ["director_review", "failed"],
  director_review: ["approved_direction", "failed"],
  approved_direction: ["generating", "failed"],
  generating: ["generated", "failed"],
  generated: ["asset_review", "failed"],
  asset_review: ["approved_asset", "failed"],
  approved_asset: ["video_ready", "failed"],
  video_ready: ["completed", "failed"],
  completed: [],
  failed: []
};

export function canTransitionProductionState(from: ProductionState, to: ProductionState) {
  return productionStateTransitions[from].includes(to);
}

export function assertProductionTransition(from: ProductionState, to: ProductionState) {
  if (!canTransitionProductionState(from, to)) {
    throw new Error(`Invalid production state transition: ${from} -> ${to}`);
  }
}

export type ProductionTaskRecord = {
  taskId: string;
  episode: string;
  shot: string;
  asset?: string;
  model: string;
  status: ProductionState | "needs_key";
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
};
