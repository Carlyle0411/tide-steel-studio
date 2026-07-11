import type { MCPTask } from "../../schemas/task.schema";
import { getEP01Shots, type EP01ShotProductionData } from "../EP01ShotData";
import { generateVisualTask } from "./AssetGenerator";

export type EP01KeyframeBatchItem = EP01ShotProductionData & {
  keyframeId: "KF01" | "KF02" | "KF03" | "KF04";
  batchGoal: string;
};

export function getEP01Batch01Keyframes(): EP01KeyframeBatchItem[] {
  const base = getEP01Shots();
  return [
    { ...base[0], shot_id: "EP01_KF01", keyframeId: "KF01", batchGoal: "2042 Hangzhou Bay coastline defense line" },
    { ...base[11], shot_id: "EP01_KF02", keyframeId: "KF02", description: "White Tide first appears only as an impossible white biological mass beneath the sea surface.", character_action: "White Tide approaches without attacking.", vfx: "partial White Tide presence, no full creature reveal", batchGoal: "White Tide first appearance" },
    { ...base[3], shot_id: "EP01_KF03", keyframeId: "KF03", batchGoal: "Deep Blue Base interior" },
    { ...base[16], shot_id: "EP01_KF04", keyframeId: "KF04", description: "CRT001 Red Thunder first appears as rear armor, cockpit seam, and blue reactor spill only.", character_action: "CRT001 remains still while alert light crosses the back armor.", vfx: "partial mecha reveal only", batchGoal: "CRT001 first appearance" }
  ];
}

export async function generateEP01Batch01Keyframes(): Promise<MCPTask[]> {
  const tasks: MCPTask[] = [];
  for (const shot of getEP01Batch01Keyframes()) {
    tasks.push(await generateVisualTask(shot));
  }
  return tasks;
}
