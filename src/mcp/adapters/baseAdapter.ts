import type { AdapterJob, AdapterValidation, MCPAdapter } from "./adapter.types";
import { envValue, needsKey } from "./adapter.types";
import { mcpLogger } from "../logs/mcpLogger";

export type BaseAdapterOptions = {
  toolId: string;
  requiredEnv?: string;
  planned?: boolean;
  disabled?: boolean;
  requiredFields?: string[];
};

export function createBaseAdapter(options: BaseAdapterOptions): MCPAdapter {
  return {
    toolId: options.toolId,
    validateInput(input) {
      const missingConfig = options.requiredEnv && !envValue(options.requiredEnv) ? [options.requiredEnv] : [];
      const missingFields = (options.requiredFields ?? []).filter((field) => input[field] === undefined || input[field] === "");
      const reasons = [
        ...missingConfig.map((key) => `Missing environment variable: ${key}`),
        ...missingFields.map((field) => `Missing required input: ${field}`)
      ];
      const status = options.disabled ? "disabled" : options.planned ? "planned" : missingConfig.length ? "needs_key" : reasons.length ? "failed" : "ready";
      return { ok: status === "ready", status, missingConfig, reasons } satisfies AdapterValidation;
    },
    buildPayload(input) {
      return { toolId: options.toolId, input };
    },
    async submitJob(input) {
      const validation = this.validateInput(input);
      if (!validation.ok) {
        const job = validation.status === "needs_key" && options.requiredEnv
          ? needsKey(options.toolId, options.requiredEnv, input)
          : { status: validation.status, payload: input, error: validation.reasons.join("; ") } satisfies AdapterJob;
        mcpLogger.warn({ scope: "adapter", toolId: options.toolId, message: "Adapter refused job", reason: job.error, input });
        return job;
      }
      mcpLogger.warn({ scope: "adapter", toolId: options.toolId, message: "Adapter has no live provider implementation yet", input });
      return { status: "planned", payload: this.buildPayload(input), error: "Live provider implementation is not connected in MCP Phase 01." };
    },
    async pollJob(jobId) {
      return { status: "planned", error: `Polling is not connected for ${options.toolId}.`, payload: { jobId } };
    },
    normalizeOutput(output) {
      return output;
    },
    handleError(error) {
      const message = error instanceof Error ? error.message : String(error);
      mcpLogger.error({ scope: "adapter", toolId: options.toolId, message: "Adapter error", reason: message });
      return { status: "failed", error: message };
    }
  };
}
