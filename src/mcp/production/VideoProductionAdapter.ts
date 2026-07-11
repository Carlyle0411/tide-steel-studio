import { envValue } from "../adapters/adapter.types";

export type VideoProviderId = "kling" | "veo" | "runway";
export type VideoAdapterStatus =
  | "waiting_asset"
  | "pending"
  | "running"
  | "completed"
  | "generated"
  | "video_review"
  | "failed"
  | "needs_key"
  | "cancelled";

export type VideoProductionInput = {
  provider: VideoProviderId;
  approvedImage: string;
  shotDescription: string;
  cameraMovement: string;
  duration: number;
  style: string;
  prompt: string;
};

export type VideoProductionResult = {
  status: VideoAdapterStatus;
  providerTaskId?: string;
  videoUrl?: string;
  metadata?: Record<string, unknown>;
  error?: string;
};

export interface VideoProviderAdapter {
  provider: VideoProviderId;
  generateVideo(input: VideoProductionInput): Promise<VideoProductionResult>;
  getStatus(providerTaskId: string): Promise<VideoProductionResult>;
  cancelTask(providerTaskId: string): Promise<VideoProductionResult>;
  retryTask(input: VideoProductionInput): Promise<VideoProductionResult>;
}

export function missingVideoKey(provider: VideoProviderId, envKey: string): VideoProductionResult {
  return {
    status: "needs_key",
    error: `${provider} requires ${envKey}. No fake video task was created.`
  };
}

export function providerKey(provider: VideoProviderId) {
  const map: Record<VideoProviderId, string> = {
    kling: "KLING_API_KEY",
    veo: "VEO_API_KEY",
    runway: "RUNWAY_API_KEY"
  };
  return envValue(map[provider]);
}

export function providerEndpoint(provider: VideoProviderId) {
  const map: Record<VideoProviderId, string> = {
    kling: "KLING_ENDPOINT",
    veo: "VEO_ENDPOINT",
    runway: "RUNWAY_ENDPOINT"
  };
  return envValue(map[provider]);
}

export function missingVideoEndpoint(provider: VideoProviderId, envKey: string): VideoProductionResult {
  return {
    status: "failed",
    error: `${provider} requires ${envKey} before live video generation can run. No fake video URL was created.`
  };
}

export async function postVideoGeneration(
  provider: VideoProviderId,
  input: VideoProductionInput,
  envKey: string
): Promise<VideoProductionResult> {
  const key = providerKey(provider);
  if (!key) return missingVideoKey(provider, envKey);

  const endpoint = providerEndpoint(provider);
  if (!endpoint) return missingVideoEndpoint(provider, `${provider.toUpperCase()}_ENDPOINT`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: input.approvedImage,
        prompt: input.prompt,
        duration: input.duration,
        cameraMovement: input.cameraMovement,
        shotDescription: input.shotDescription,
        style: input.style
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return { status: "failed", error: `${provider} request failed: ${response.status} ${text}` };
    }

    const data = await response.json();
    if (typeof data.videoUrl === "string" && data.videoUrl.length) {
      return {
        status: "completed",
        providerTaskId: data.taskId ?? data.id,
        videoUrl: data.videoUrl,
        metadata: data
      };
    }

    if (typeof data.taskId === "string" || typeof data.id === "string") {
      return {
        status: "running",
        providerTaskId: data.taskId ?? data.id,
        metadata: data
      };
    }

    return { status: "failed", error: `${provider} response did not include a task id or video url.`, metadata: data };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}
