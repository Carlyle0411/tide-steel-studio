import type { AdapterJob, AdapterValidation, MCPAdapter } from "./adapter.types";
import { envValue } from "./adapter.types";
import { mcpLogger } from "../logs/mcpLogger";
import { generationHistory } from "../logs/generationHistory";
import { assetStorage } from "../storage/AssetStorage";
import { nextAssetVersion } from "../schemas/assetVersion.schema";

export type GPTImage2GenerateInput = {
  taskId: string;
  assetType?: string;
  assetName?: string;
  prompt: string;
  size?: "1024x1024" | "1024x1536" | "1536x1024" | "auto";
  quality?: "low" | "medium" | "high" | "auto";
  referenceImages?: string[];
  episodeId?: string;
  shotId?: string;
  version?: string;
};

export type GPTImage2GenerateOutput =
  | { status: "completed"; imageUrl: string; localPath: string; assetPath: string; url?: string; metadata: Record<string, unknown> }
  | { status: "needs_key"; error: string }
  | { status: "failed"; error: string };

function apiKey() {
  return envValue("OPENAI_API_KEY");
}

function imageModel() {
  return envValue("OPENAI_IMAGE_MODEL") || "gpt-image-1";
}

async function generateImage(input: GPTImage2GenerateInput): Promise<GPTImage2GenerateOutput> {
  const key = apiKey();
  const taskId = input.taskId || crypto.randomUUID();
  if (!key) {
    const error = "OPENAI_API_KEY is missing. In Vite browser builds use VITE_OPENAI_API_KEY or connect a backend secret proxy.";
    generationHistory.add({
      taskId,
      model: "gpt_image2",
      prompt: input.prompt,
      inputReference: input.referenceImages ?? [],
      status: "needs_key",
      error
    });
    mcpLogger.warn({ scope: "adapter", toolId: "gpt_image2", taskId, message: "GPT Image2 missing API key", reason: error });
    return { status: "needs_key", error };
  }

  if (!input.prompt?.trim()) {
    const error = "Prompt is required for GPT Image2 generation.";
    generationHistory.add({ taskId, model: "gpt_image2", prompt: "", inputReference: input.referenceImages ?? [], status: "failed", error });
    return { status: "failed", error };
  }

  generationHistory.add({
    taskId,
    model: imageModel(),
    prompt: input.prompt,
    inputReference: input.referenceImages ?? [],
    status: "running"
  });

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: imageModel(),
        prompt: input.prompt,
        size: input.size ?? "1536x1024",
        quality: input.quality ?? "high"
      })
    });

    if (!response.ok) {
      const body = await response.text();
      const error = `OpenAI Image API failed: ${response.status} ${body}`;
      generationHistory.add({ taskId, model: imageModel(), prompt: input.prompt, inputReference: input.referenceImages ?? [], status: "failed", error });
      mcpLogger.error({ scope: "adapter", toolId: "gpt_image2", taskId, message: "GPT Image2 API failed", reason: error });
      return { status: "failed", error };
    }

    const result = await response.json();
    const image = result?.data?.[0];
    let dataUrl = image?.b64_json ? `data:image/png;base64,${image.b64_json}` : undefined;
    const url = image?.url || dataUrl;
    if (!url) {
      const error = "OpenAI Image API returned no image url or b64_json.";
      generationHistory.add({ taskId, model: imageModel(), prompt: input.prompt, inputReference: input.referenceImages ?? [], status: "failed", error });
      return { status: "failed", error };
    }

    if (!dataUrl && image?.url) {
      dataUrl = await tryLoadImageAsDataUrl(image.url);
    }

    const episode = input.episodeId ?? "EP01";
    const shot = input.shotId ?? "KF02";
    const version = input.version ?? nextAssetVersion();
    const stored = await assetStorage.saveGeneratedAsset({
      episode,
      shot,
      assetType: input.assetType,
      assetName: input.assetName,
      version,
      prompt: input.prompt,
      model: imageModel(),
      status: "waiting_review",
      url: image?.url,
      dataUrl,
      metadata: {
        taskId,
        revisedPrompt: image?.revised_prompt,
        referenceImages: input.referenceImages ?? [],
        rawCreated: result?.created
      }
    });

    generationHistory.add({
      taskId,
      model: imageModel(),
      prompt: input.prompt,
      inputReference: input.referenceImages ?? [],
      outputAsset: stored.assetPath,
      status: "completed"
    });
    mcpLogger.info({ scope: "adapter", toolId: "gpt_image2", taskId, assetId: stored.assetId, version: stored.version, message: "GPT Image2 generation completed", output: stored.assetPath });

    return {
      status: "completed",
      imageUrl: url,
      localPath: stored.localPath,
      assetPath: stored.assetPath,
      url,
      metadata: assetStorage.saveAssetJson(stored)
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    generationHistory.add({ taskId, model: imageModel(), prompt: input.prompt, inputReference: input.referenceImages ?? [], status: "failed", error: message });
    mcpLogger.error({ scope: "adapter", toolId: "gpt_image2", taskId, message: "GPT Image2 generation failed", reason: message });
    return { status: "failed", error: message };
  }
}

function providerStatus() {
  return apiKey() ? "connected" as const : "missing_key" as const;
}

export const gptImage2Adapter: MCPAdapter & {
  generateImage(input: GPTImage2GenerateInput): Promise<GPTImage2GenerateOutput>;
  providerStatus(): "connected" | "missing_key";
} = {
  toolId: "gpt_image2",
  validateInput(input: Record<string, unknown>): AdapterValidation {
    const missingConfig = apiKey() ? [] : ["OPENAI_API_KEY"];
    const reasons = [...missingConfig.map((key) => `Missing environment variable: ${key}`)];
    if (!input.prompt) reasons.push("Missing required input: prompt");
    return { ok: reasons.length === 0, status: missingConfig.length ? "needs_key" : reasons.length ? "failed" : "ready", missingConfig, reasons };
  },
  buildPayload(input: Record<string, unknown>) {
    return {
      taskId: input.taskId,
      prompt: input.prompt,
      size: input.size ?? "1536x1024",
      quality: input.quality ?? "high",
      referenceImages: input.referenceImages ?? input.references ?? []
    };
  },
  async submitJob(input: Record<string, unknown>): Promise<AdapterJob> {
    const result = await generateImage({
      taskId: String(input.taskId ?? crypto.randomUUID()),
      prompt: String(input.prompt ?? ""),
      assetType: input.assetType ? String(input.assetType) : undefined,
      assetName: input.assetName ? String(input.assetName) : undefined,
      size: input.size as GPTImage2GenerateInput["size"],
      quality: input.quality as GPTImage2GenerateInput["quality"],
      referenceImages: Array.isArray(input.referenceImages) ? input.referenceImages.map(String) : Array.isArray(input.references) ? input.references.map((item) => JSON.stringify(item)) : [],
      episodeId: String(input.episodeId ?? "EP01"),
      shotId: String(input.shotId ?? "KF02"),
      version: input.version ? String(input.version) : undefined
    });
    if (result.status === "completed") return { status: "completed", output: result, providerJobId: result.assetPath };
    return { status: result.status, error: result.error, output: result };
  },
  async pollJob(jobId: string): Promise<AdapterJob> {
    return { status: "planned", payload: { jobId }, error: "OpenAI Image generation is synchronous in this adapter; polling is not used." };
  },
  normalizeOutput(output: unknown) {
    return output;
  },
  handleError(error: unknown): AdapterJob {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "failed", error: message };
  },
  generateImage,
  providerStatus
};

async function tryLoadImageAsDataUrl(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}
