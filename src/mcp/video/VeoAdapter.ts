import { postVideoGeneration, type VideoProductionInput, type VideoProviderAdapter } from "../production/VideoProductionAdapter";

export const veoVideoAdapter: VideoProviderAdapter = {
  provider: "veo",
  async generateVideo(input: VideoProductionInput) {
    return postVideoGeneration("veo", input, "VEO_API_KEY");
  },
  async getStatus(providerTaskId: string) {
    return { status: "failed", error: "Veo status endpoint is not configured.", metadata: { providerTaskId } };
  },
  async cancelTask(providerTaskId: string) {
    return { status: "failed", error: "Veo cancel endpoint is not configured.", metadata: { providerTaskId } };
  },
  retryTask(input: VideoProductionInput) {
    return this.generateVideo(input);
  }
};
