import { buildImagePrompt } from "../engine/PromptBuilder";
import { resolveShotContext } from "../engine/ContextResolver";
import { taskQueue } from "../queue/taskQueue";
import { videoTaskQueue } from "../video/VideoTaskQueue";
import { getEP01Shots } from "./EP01ShotData";

export function createEP01KeyframeTasks() {
  return getEP01Shots().map((shot) => {
    const context = resolveShotContext("EP01", shot.shot_id);
    const prompt = buildImagePrompt(context);
    return taskQueue.addTask({
      projectId: "tide-steel-soul",
      episodeId: "EP01",
      shotId: shot.shot_id,
      assetIds: [],
      type: "image_generation",
      toolId: "gpt_image2",
      model: "GPT Image2",
      reviewStatus: "draft",
      input: {
        prompt: prompt.prompt,
        negativePrompt: prompt.negative,
        referenceAssets: context.references,
        gate: "Reference -> Prompt -> Generate -> Review -> Approve"
      }
    });
  });
}

export function createEP01VideoTasks() {
  return getEP01Shots().map((shot) => videoTaskQueue.addTask({
    episode: "EP01",
    shot: shot.shot_id,
    imageAsset: `approved/${shot.shot_id}_KEYFRAME_APPROVED.png`,
    provider: "kling",
    duration: Number(shot.duration.replace("s", "")) || 5,
    status: "waiting_asset"
  }));
}
