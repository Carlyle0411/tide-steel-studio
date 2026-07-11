export type AdapterStatus = "ready" | "needs_key" | "disabled" | "planned" | "failed";

export type AdapterValidation = {
  ok: boolean;
  status: AdapterStatus;
  missingConfig: string[];
  reasons: string[];
};

export type AdapterJob = {
  providerJobId?: string;
  status: AdapterStatus | "queued" | "running" | "completed";
  payload?: unknown;
  output?: unknown;
  error?: string;
};

export type MCPAdapter = {
  toolId: string;
  validateInput(input: Record<string, unknown>): AdapterValidation;
  buildPayload(input: Record<string, unknown>): unknown;
  submitJob(input: Record<string, unknown>): Promise<AdapterJob>;
  pollJob(jobId: string): Promise<AdapterJob>;
  normalizeOutput(output: unknown): unknown;
  handleError(error: unknown): AdapterJob;
};

export function envValue(key: string) {
  return import.meta.env[`VITE_${key}`] || import.meta.env[key] || "";
}

export function needsKey(toolId: string, key: string, input: Record<string, unknown>): AdapterJob {
  return {
    status: "needs_key",
    payload: input,
    error: `${toolId} requires ${key}. Configure it through environment variables.`
  };
}
