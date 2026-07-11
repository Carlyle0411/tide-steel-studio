import { createBaseAdapter } from "./baseAdapter";

export const klingAdapter = createBaseAdapter({
  toolId: "kling",
  requiredEnv: "KLING_API_KEY",
  requiredFields: ["approvedKeyframe", "motionPrompt"]
});
