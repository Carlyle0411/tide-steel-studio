import { createBaseAdapter } from "./baseAdapter";

export const runwayAdapter = createBaseAdapter({
  toolId: "runway",
  requiredEnv: "RUNWAY_API_KEY",
  requiredFields: ["approvedKeyframe", "motionPrompt"]
});
