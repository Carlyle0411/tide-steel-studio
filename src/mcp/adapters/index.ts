import type { MCPAdapter } from "./adapter.types";
import { blenderAdapter } from "./blender.adapter";
import { comfyuiAdapter } from "./comfyui.adapter";
import { davinciAdapter } from "./davinci.adapter";
import { elevenlabsAdapter } from "./elevenlabs.adapter";
import { fluxAdapter } from "./flux.adapter";
import { gptImage2Adapter } from "./gptImage2.adapter";
import { klingAdapter } from "./kling.adapter";
import { runwayAdapter } from "./runway.adapter";
import { veoAdapter } from "./veo.adapter";

export const adapters: Record<string, MCPAdapter> = {
  gpt_image2: gptImage2Adapter,
  kling: klingAdapter,
  veo: veoAdapter,
  runway: runwayAdapter,
  flux: fluxAdapter,
  comfyui: comfyuiAdapter,
  blender: blenderAdapter,
  elevenlabs: elevenlabsAdapter,
  davinci_resolve: davinciAdapter
};

export function getAdapter(toolId: string) {
  return adapters[toolId];
}
