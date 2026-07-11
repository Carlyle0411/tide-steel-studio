import type { AIProvider } from "./AIProvider";
import { gptImage2Adapter } from "../adapters/gptImage2.adapter";
import { klingAdapter } from "../adapters/kling.adapter";
import { veoAdapter } from "../adapters/veo.adapter";
import { runwayAdapter } from "../adapters/runway.adapter";
import { fluxAdapter } from "../adapters/flux.adapter";

class AdapterProvider implements AIProvider {
  constructor(public name: string, public type: "image" | "video" | "voice", private toolId: string, private generateFn: (input: Record<string, unknown>) => Promise<any>, private statusFn: () => "connected" | "missing_key" | "disabled" | "planned") {}

  generate(input: Record<string, unknown>) {
    return this.generateFn(input);
  }

  status() {
    return this.statusFn();
  }
}

export const providerRegistry: AIProvider[] = [
  new AdapterProvider("GPT Image2", "image", "gpt_image2", (input) => gptImage2Adapter.generateImage(input as any), () => gptImage2Adapter.providerStatus()),
  new AdapterProvider("Kling", "video", "kling", (input) => klingAdapter.submitJob(input), () => "missing_key"),
  new AdapterProvider("Veo", "video", "veo", (input) => veoAdapter.submitJob(input), () => "missing_key"),
  new AdapterProvider("Runway", "video", "runway", (input) => runwayAdapter.submitJob(input), () => "missing_key"),
  new AdapterProvider("Flux", "image", "flux", (input) => fluxAdapter.submitJob(input), () => "planned")
];

export function getProvider(name: string) {
  return providerRegistry.find((provider) => provider.name === name);
}
