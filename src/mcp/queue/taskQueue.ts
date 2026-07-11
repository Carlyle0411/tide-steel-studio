import { createMCPTask, MCPTask, MCPTaskCreateInput, MCPTaskStatus } from "../schemas/task.schema";
import { mcpLogger } from "../logs/mcpLogger";

type Listener = () => void;

class MCPTaskQueue {
  private tasks: MCPTask[] = [];
  private listeners = new Set<Listener>();

  addTask(input: MCPTaskCreateInput) {
    const task = createMCPTask(input);
    this.tasks.unshift(task);
    mcpLogger.info({ scope: "queue", message: "Task added", taskId: task.taskId, toolId: task.toolId, input: task.input });
    this.emit();
    return task;
  }

  async runTask(taskId: string, runner?: (task: MCPTask) => Promise<Partial<MCPTask>>) {
    const task = this.getTaskStatus(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    this.patch(taskId, { status: "running" });
    try {
      const patch = runner ? await runner({ ...task, status: "running", progress: 10 }) : { status: "failed" as MCPTaskStatus, errors: ["No runner registered for task."] };
      this.patch(taskId, patch);
      mcpLogger.info({ scope: "queue", message: "Task run completed", taskId });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown task runner failure";
      this.patch(taskId, { status: "failed", errors: [...task.errors, reason] });
      mcpLogger.error({ scope: "queue", message: "Task run failed", taskId, reason });
    }
  }

  cancelTask(taskId: string) {
    this.patch(taskId, { status: "cancelled" });
    mcpLogger.warn({ scope: "queue", message: "Task cancelled", taskId });
  }

  retryTask(taskId: string) {
    const task = this.getTaskStatus(taskId);
    if (!task) return undefined;
    const retry = this.addTask({ ...task, taskId: undefined, status: "pending", reviewStatus: "draft" });
    mcpLogger.info({ scope: "queue", message: "Task retry created", taskId: retry.taskId, input: { sourceTaskId: taskId } });
    return retry;
  }

  getTaskStatus(taskId: string) {
    return this.tasks.find((task) => task.taskId === taskId);
  }

  listTasks() {
    return [...this.tasks];
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private patch(taskId: string, patch: Partial<MCPTask>) {
    this.tasks = this.tasks.map((task) => {
      if (task.taskId !== taskId) return task;
      const nextStatus = patch.status ?? task.status;
      return {
        ...task,
        ...patch,
        progress: patch.progress ?? (nextStatus === "completed" ? 100 : nextStatus === "failed" || nextStatus === "needs_key" ? task.progress ?? 10 : task.progress),
        completedAt: nextStatus === "completed" || nextStatus === "failed" || nextStatus === "cancelled" || nextStatus === "needs_key" ? new Date().toISOString() : task.completedAt,
        updatedAt: new Date().toISOString()
      };
    });
    this.emit();
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const taskQueue = new MCPTaskQueue();
