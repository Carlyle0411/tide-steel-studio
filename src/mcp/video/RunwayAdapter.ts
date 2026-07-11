import { postVideoGeneration, type VideoProductionInput, type VideoProviderAdapter } from "../production/VideoProductionAdapter";

export const runwayVideoAdapter: VideoProviderAdapter = {
  provider: "runway",
  async generateVideo(input: VideoProductionInput) {
    return postVideoGeneration("runway", input, "RUNWAY_API_KEY");
  },
  async getStatus(providerTaskId: string) {
    return { status: "failed", error: "Runway status endpoint is not configured.", metadata: { providerTaskId } };
  },
  async cancelTask(providerTaskId: string) {
    return { status: "failed", error: "Runway cancel endpoint is not configured.", metadata: { providerTaskId } };
  },
  retryTask(input: VideoProductionInput) {
    return this.generateVideo(input);
  }
};
