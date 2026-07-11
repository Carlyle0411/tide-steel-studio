import { createBaseAdapter } from "./baseAdapter";

export const veoAdapter = createBaseAdapter({
  toolId: "veo",
  requiredEnv: "VEO_API_KEY",
  requiredFields: ["approvedKeyframe", "motionPrompt"]
});
