import { mcpLogger } from "../logs/mcpLogger";
import { MCPTask } from "../schemas/task.schema";

export async function exportEpisodeWorkflow(task: MCPTask): Promise<Partial<MCPTask>> {
  const format = String(task.input.format ?? "markdown");
  const episodeId = task.episodeId ?? "UNKNOWN";
  mcpLogger.info({ scope: "workflow", taskId: task.taskId, message: "Episode export requested", input: { episodeId, format } });
  return {
    status: "completed",
    reviewStatus: "approved",
    output: {
      episodeId,
      format,
      note: "Export payload prepared. File writer/backend export adapter is not connected in MCP Phase 01."
    }
  };
}
