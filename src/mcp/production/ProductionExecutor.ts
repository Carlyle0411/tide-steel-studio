import type { MCPTask } from "../schemas/task.schema";
import { taskQueue } from "../queue/taskQueue";
import { runWorkflowForTask } from "../workflows";
import { mcpLogger } from "../logs/mcpLogger";

export class ProductionExecutor {
  async execute(task: MCPTask) {
    mcpLogger.info({ scope: "workflow", taskId: task.taskId, toolId: task.toolId, message: "Production execution started" });
    await taskQueue.runTask(task.taskId, runWorkflowForTask);
    const updated = taskQueue.getTaskStatus(task.taskId);
    if (updated?.status === "completed") {
      mcpLogger.info({ scope: "workflow", taskId: task.taskId, toolId: task.toolId, message: "Production execution completed", output: updated.output });
    }
    if (updated?.status === "failed" || updated?.status === "needs_key") {
      mcpLogger.warn({ scope: "workflow", taskId: task.taskId, toolId: task.toolId, message: "Production execution stopped", reason: updated.errors.join("; ") });
    }
    return updated;
  }
}

export const productionExecutor = new ProductionExecutor();
