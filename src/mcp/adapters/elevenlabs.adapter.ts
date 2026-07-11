import { createBaseAdapter } from "./baseAdapter";

export const elevenlabsAdapter = createBaseAdapter({
  toolId: "elevenlabs",
  requiredEnv: "ELEVENLABS_API_KEY",
  requiredFields: ["scriptText", "voiceId"]
});
