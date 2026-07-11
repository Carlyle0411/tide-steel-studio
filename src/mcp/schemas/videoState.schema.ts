export type VideoState =
  | "waiting_asset"
  | "director_ready"
  | "prompt_ready"
  | "generating"
  | "generated"
  | "video_review"
  | "approved_video"
  | "export_ready"
  | "failed";

export const videoStateTransitions: Record<VideoState, VideoState[]> = {
  waiting_asset: ["director_ready", "failed"],
  director_ready: ["prompt_ready", "failed"],
  prompt_ready: ["generating", "failed"],
  generating: ["generated", "failed"],
  generated: ["video_review", "failed"],
  video_review: ["approved_video", "failed"],
  approved_video: ["export_ready", "failed"],
  export_ready: ["failed"],
  failed: []
};

export function canTransitionVideoState(from: VideoState, to: VideoState) {
  return videoStateTransitions[from].includes(to);
}
