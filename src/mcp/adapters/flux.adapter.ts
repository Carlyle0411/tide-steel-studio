import { createBaseAdapter } from "./baseAdapter";

export const fluxAdapter = createBaseAdapter({
  toolId: "flux",
  planned: true,
  requiredFields: ["prompt"]
});
