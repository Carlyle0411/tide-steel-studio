import { createBaseAdapter } from "./baseAdapter";

export const davinciAdapter = createBaseAdapter({
  toolId: "davinci_resolve",
  planned: true,
  requiredFields: ["timeline", "mediaManifest"]
});
