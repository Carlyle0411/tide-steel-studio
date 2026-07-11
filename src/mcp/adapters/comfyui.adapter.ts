import { createBaseAdapter } from "./baseAdapter";

export const comfyuiAdapter = createBaseAdapter({
  toolId: "comfyui",
  requiredEnv: "COMFYUI_ENDPOINT",
  requiredFields: ["prompt"]
});
