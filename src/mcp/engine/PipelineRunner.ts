import { taskQueue } from "../queue/taskQueue";
import { runWorkflowForTask } from "../workflows";
import type { MCPTask } from "../schemas/task.schema";

export async function runProductionTask(task: MCPTask) {
  await taskQueue.runTask(task.taskId, runWorkflowForTask);
  return taskQueue.getTaskStatus(task.taskId);
}
