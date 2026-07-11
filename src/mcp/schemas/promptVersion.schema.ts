export type PromptVersion = {
  promptId: string;
  shotId: string;
  version: string;
  model: "gpt_image2" | "kling" | "veo" | "flux" | "comfyui";
  prompt: string;
  negativePrompt: string;
  createdAt: string;
};

export function createPromptVersion(input: Omit<PromptVersion, "promptId" | "createdAt" | "version"> & { version?: string }): PromptVersion {
  return {
    ...input,
    promptId: crypto.randomUUID(),
    version: input.version ?? "V001",
    createdAt: new Date().toISOString()
  };
}
