export type AIProviderType = "image" | "video" | "voice";
export type AIProviderStatus = "connected" | "missing_key" | "disabled" | "planned";

export type AIProviderGenerateInput = Record<string, unknown>;
export type AIProviderGenerateOutput = {
  status: "completed" | "needs_key" | "failed";
  assetPath?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  error?: string;
};

export interface AIProvider {
  name: string;
  type: AIProviderType;
  generate(input: AIProviderGenerateInput): Promise<AIProviderGenerateOutput>;
  status(): AIProviderStatus;
}
