import { createBaseAdapter } from "./baseAdapter";

export const blenderAdapter = createBaseAdapter({
  toolId: "blender",
  planned: true,
  requiredEnv: "BLENDER_SCRIPT_PATH",
  requiredFields: ["sceneFile"]
});
