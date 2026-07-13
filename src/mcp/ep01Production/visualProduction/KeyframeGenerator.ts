import type { MCPTask } from "../../schemas/task.schema";
import { getEP01Shots, type EP01ShotProductionData } from "../EP01ShotData";
import { generateVisualTask } from "./AssetGenerator";

export type EP01KeyframeBatchItem = EP01ShotProductionData & {
  keyframeId: "KF02" | "KF03" | "KF04";
  batchGoal: string;
};

export function getEP01Batch01Keyframes(): EP01KeyframeBatchItem[] {
  return getEP01Shots()
    .filter((shot) => ["KF02", "KF03", "KF04"].includes(shot.keyframe_id))
    .map((shot) => ({
      ...shot,
      keyframeId: shot.keyframe_id as "KF02" | "KF03" | "KF04",
      batchGoal: shot.description
    }));
}

export async function generateEP01Batch01Keyframes(): Promise<MCPTask[]> {
  const tasks: MCPTask[] = [];
  for (const shot of getEP01Batch01Keyframes()) {
    tasks.push(await generateVisualTask(shot));
  }
  return tasks;
}
