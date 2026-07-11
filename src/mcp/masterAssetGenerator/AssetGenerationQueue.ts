import queueData from "../../../projects/tide-steel-soul/master-generation-queue/GENERATION_QUEUE.json";

export type MasterGenerationStatus =
  | "PENDING_GENERATION"
  | "WAITING"
  | "GENERATING"
  | "DOWNLOADING"
  | "IMPORTING"
  | "VALIDATING"
  | "GENERATED"
  | "REVIEW"
  | "APPROVED"
  | "MASTER_REFERENCE"
  | "GENERATION_FAILED";

export type MasterGenerationTask = (typeof queueData.tasks)[number] & {
  status: MasterGenerationStatus;
};

export function listMasterGenerationTasks(): MasterGenerationTask[] {
  return queueData.tasks as MasterGenerationTask[];
}

export function getMissingMasterAssets(limit?: number) {
  const pending = listMasterGenerationTasks().filter((task) => task.status === "WAITING" || task.status === "PENDING_GENERATION" || task.status === "GENERATION_FAILED");
  return typeof limit === "number" ? pending.slice(0, limit) : pending;
}

export function getMasterGenerationStats() {
  const tasks = listMasterGenerationTasks();
  return {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "WAITING" || task.status === "PENDING_GENERATION").length,
    generating: tasks.filter((task) => task.status === "GENERATING").length,
    generated: tasks.filter((task) => task.status === "GENERATED").length,
    review: tasks.filter((task) => task.status === "REVIEW").length,
    approved: tasks.filter((task) => task.status === "APPROVED").length,
    masterReference: tasks.filter((task) => task.status === "MASTER_REFERENCE").length,
    failed: tasks.filter((task) => task.status === "GENERATION_FAILED").length
  };
}

export function canEnterKling(status: MasterGenerationStatus) {
  return status === "APPROVED" || status === "MASTER_REFERENCE";
}
