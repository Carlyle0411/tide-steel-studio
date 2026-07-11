import type { MasterGenerationTask } from "./AssetGenerationQueue";
import { buildIdentityLockedPrompt, identityNegativePrompt } from "../identityLock/IdentityPromptBuilder";

export type GPTImage2ExecutionInput = {
  task: MasterGenerationTask;
  generatedImagePath?: string;
};

export type GPTImage2ExecutionResult =
  | {
      status: "generated";
      sourcePath: string;
      prompt: string;
      model: "GPT Image2";
    }
  | {
      status: "generation_failed";
      error: string;
      prompt: string;
      model: "GPT Image2";
    };

export function buildGPTImage2Prompt(task: MasterGenerationTask) {
  const basePrompt = task.sourceType === "character" ? buildIdentityLockedPrompt(task.name, task.prompt) : task.prompt;
  const negativePrompt = task.sourceType === "character" ? `${task.negativePrompt}, ${identityNegativePrompt()}` : task.negativePrompt;
  return [
    basePrompt,
    "",
    "PHASE22 QUALITY LOCK:",
    "16:9, cinematic composition, Hollywood Sci-Fi, ultra realistic, cinematic lighting, real photography feeling.",
    "Must follow VISUAL_STYLE_BIBLE.md.",
    "",
    `Negative Prompt: ${negativePrompt}`
  ].join("\n");
}

export function executeGPTImage2(input: GPTImage2ExecutionInput): GPTImage2ExecutionResult {
  const prompt = buildGPTImage2Prompt(input.task);
  if (!input.generatedImagePath) {
    return {
      status: "generation_failed",
      error: "GPT Image2 cannot be invoked from browser/runtime code directly. Use Codex built-in image generation, then pass the real generated PNG path into AssetImporter.",
      prompt,
      model: "GPT Image2"
    };
  }

  return {
    status: "generated",
    sourcePath: input.generatedImagePath,
    prompt,
    model: "GPT Image2"
  };
}
