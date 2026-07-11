export type PipelineProvider = "gpt-image2" | "kling" | "veo" | "flux" | "comfyui" | "runway" | "pika" | "dream-machine";

export type ProviderJob = {
  id: string;
  provider: PipelineProvider;
  assetId: string;
  episodeId?: string;
  shotId?: string;
  prompt: string;
  referenceAssetIds: string[];
  status: "queued" | "running" | "review" | "approved" | "failed";
  createdAt: string;
  updatedAt: string;
};

export type ProductionRepository = {
  listAssets(): Promise<unknown[]>;
  moveAsset(assetId: string, targetStatus: "draft" | "review" | "approved" | "deprecated"): Promise<void>;
  createProviderJob(job: Omit<ProviderJob, "id" | "createdAt" | "updatedAt">): Promise<ProviderJob>;
  exportPackage(kind: "storyboard" | "prompts" | "assets" | "schedule" | "json" | "markdown" | "pdf"): Promise<Blob>;
};

export class BrowserProductionRepository implements ProductionRepository {
  async listAssets() {
    return [];
  }

  async moveAsset(assetId: string, targetStatus: "draft" | "review" | "approved" | "deprecated") {
    const approvalLog = JSON.parse(localStorage.getItem("tide-production-review-log") ?? "[]") as unknown[];
    approvalLog.unshift({ assetId, targetStatus, at: new Date().toISOString() });
    localStorage.setItem("tide-production-review-log", JSON.stringify(approvalLog.slice(0, 200)));
  }

  async createProviderJob(job: Omit<ProviderJob, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const next: ProviderJob = { ...job, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    const jobs = JSON.parse(localStorage.getItem("tide-production-provider-jobs") ?? "[]") as ProviderJob[];
    jobs.unshift(next);
    localStorage.setItem("tide-production-provider-jobs", JSON.stringify(jobs.slice(0, 500)));
    return next;
  }

  async exportPackage(kind: "storyboard" | "prompts" | "assets" | "schedule" | "json" | "markdown" | "pdf") {
    const payload = JSON.stringify({ kind, exportedAt: new Date().toISOString(), source: "Movie Control Center" }, null, 2);
    return new Blob([payload], { type: "application/json;charset=utf-8" });
  }
}

export const productionRepository = new BrowserProductionRepository();
