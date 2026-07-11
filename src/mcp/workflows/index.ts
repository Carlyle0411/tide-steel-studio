import { MCPTask } from "../schemas/task.schema";
import { exportEpisodeWorkflow } from "./exportEpisode.workflow";
import { generateKeyframeWorkflow } from "./generateKeyframe.workflow";
import { generateVideoShotWorkflow } from "./generateVideoShot.workflow";
import { reviewAssetWorkflow } from "./reviewAsset.workflow";
import { consistencyCheckWorkflow } from "./consistencyCheck.workflow";
import { createKeyframeProductionWorkflow } from "./createKeyframeProduction.workflow";
import { runConsistencyCheckWorkflow } from "./runConsistencyCheck.workflow";

export async function runWorkflowForTask(task: MCPTask): Promise<Partial<MCPTask>> {
  switch (task.type) {
    case "image_generation":
      if (task.input.productionEngine === true) return createKeyframeProductionWorkflow(task);
      return generateKeyframeWorkflow(task);
    case "video_generation":
      return generateVideoShotWorkflow(task);
    case "asset_review":
      return reviewAssetWorkflow(task);
    case "storyboard_export":
    case "render_export":
      return exportEpisodeWorkflow(task);
    case "consistency_check":
      return runConsistencyCheckWorkflow(task);
    case "style_check":
      return consistencyCheckWorkflow(task);
    default:
      return { status: "failed", errors: [`No workflow registered for task type ${task.type}`] };
  }
}
