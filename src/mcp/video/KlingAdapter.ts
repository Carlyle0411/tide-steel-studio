import { postVideoGeneration, type VideoProductionInput, type VideoProviderAdapter } from "../production/VideoProductionAdapter";

export const klingVideoAdapter: VideoProviderAdapter = {
  provider: "kling",
  async generateVideo(input: VideoProductionInput) {
    return postVideoGeneration("kling", input, "KLING_API_KEY");
  },
  async getStatus(providerTaskId: string) {
    return { status: "failed", error: "Kling status endpoint is not configured.", metadata: { providerTaskId } };
  },
  async cancelTask(providerTaskId: string) {
    return { status: "failed", error: "Kling cancel endpoint is not configured.", metadata: { providerTaskId } };
  },
  retryTask(input: VideoProductionInput) {
    return this.generateVideo(input);
  }
};
