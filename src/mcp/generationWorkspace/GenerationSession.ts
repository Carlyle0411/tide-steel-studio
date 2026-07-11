import type { AssetProductionTask } from "./AssetProductionTask";

export type GenerationSessionStatus = "DRAFT" | "READY" | "ACTIVE" | "PAUSED" | "FINISHED";

export type GenerationSession = {
  sessionId: string;
  title: string;
  description: string;
  status: GenerationSessionStatus;
  createdAt: string;
  tasks: AssetProductionTask[];
};

export function createGenerationSession(sessionId: string, title: string, description: string, tasks: AssetProductionTask[]): GenerationSession {
  return {
    sessionId,
    title,
    description,
    status: tasks.length > 0 ? "READY" : "DRAFT",
    createdAt: "2026-07-10T00:00:00.000+08:00",
    tasks
  };
}

export function summarizeSession(session: GenerationSession) {
  return {
    total: session.tasks.length,
    ready: session.tasks.filter((task) => task.status === "READY").length,
    generating: session.tasks.filter((task) => task.status === "GENERATING").length,
    waitingImport: session.tasks.filter((task) => task.status === "WAITING_IMPORT").length,
    review: session.tasks.filter((task) => task.status === "REVIEW").length,
    master: session.tasks.filter((task) => task.status === "MASTER").length
  };
}
