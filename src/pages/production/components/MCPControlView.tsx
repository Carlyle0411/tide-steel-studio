import { useEffect, useMemo, useState } from "react";
import { KeyRound, Play, RefreshCw, ShieldCheck, TerminalSquare } from "lucide-react";
import { toolRegistry } from "../../../mcp/registry/toolRegistry";
import { taskQueue } from "../../../mcp/queue/taskQueue";
import { MCPTask } from "../../../mcp/schemas/task.schema";
import { mcpLogger, MCPLogEntry } from "../../../mcp/logs/mcpLogger";
import { runWorkflowForTask } from "../../../mcp/workflows";
import { getSafetySourceDigest, runAssetSafetyCheck } from "../../../mcp/workflows/assetSafetyRules";
import { ProductionCard, StatusPill } from "./ProductionShell";
import { productionEngine } from "../../../mcp/engine/ProductionEngine";
import { resolveShotContext, contextItemCount } from "../../../mcp/engine/ContextResolver";
import { buildImagePrompt } from "../../../mcp/engine/PromptBuilder";
import { reviewQueue, type ReviewQueueItem } from "../../../mcp/review/ReviewQueue";
import { providerRegistry } from "../../../mcp/providers/ProviderRegistry";

export function MCPControlView() {
  const [tasks, setTasks] = useState<MCPTask[]>(() => taskQueue.listTasks());
  const [logs, setLogs] = useState<MCPLogEntry[]>(() => mcpLogger.list());
  const [reviewItems, setReviewItems] = useState<ReviewQueueItem[]>(() => reviewQueue.list());
  const [runnerEpisode, setRunnerEpisode] = useState("EP01");
  const [runnerShot, setRunnerShot] = useState("EP01_KF02");
  const safetyDigest = getSafetySourceDigest();
  const runnerContext = resolveShotContext(runnerEpisode, runnerShot);
  const runnerPrompt = buildImagePrompt(runnerContext);

  useEffect(() => taskQueue.subscribe(() => setTasks(taskQueue.listTasks())), []);
  useEffect(() => mcpLogger.subscribe(() => setLogs(mcpLogger.list())), []);
  useEffect(() => reviewQueue.subscribe(() => setReviewItems(reviewQueue.list())), []);

  async function runSelectedTask(task: MCPTask) {
    await taskQueue.runTask(task.taskId, runWorkflowForTask);
  }

  function createKeyframeProductionTask() {
    productionEngine.createProductionTask({ episodeId: runnerEpisode, shotId: runnerShot, taskType: "image_generation" });
  }

  const apiStatus = useMemo(() => toolRegistry.map((tool) => ({
    id: tool.id,
    name: tool.name,
    status: tool.status,
    authType: tool.authType,
    enabled: tool.enabled
  })), []);
  const providerStatus = useMemo(() => providerRegistry.map((provider) => ({ name: provider.name, type: provider.type, status: provider.status() })), [tasks.length, logs.length]);

  const safetyProbe = runAssetSafetyCheck({
    targetStage: "video",
    targetToolId: "kling",
    assetStatus: "draft",
    assetId: "EP01-KF02",
    episodeId: "EP01"
  });

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <ProductionCard className="p-5">
          <PanelHeader icon={<Play size={18} />} title="Production Runner" subtitle="选择镜头，自动解析上下文，生成Prompt，并创建真实Production Task。" compact />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="label">Episode</span>
              <select className="field" value={runnerEpisode} onChange={(event) => setRunnerEpisode(event.target.value)}>
                <option value="EP01">EP01</option>
              </select>
            </label>
            <label className="block">
              <span className="label">Shot</span>
              <select className="field" value={runnerShot} onChange={(event) => setRunnerShot(event.target.value)}>
                <option value="EP01_KF02">EP01_KF02</option>
              </select>
            </label>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <RunnerStat label="Context" value={contextItemCount(runnerContext)} />
            <RunnerStat label="References" value={runnerContext.references.length} />
            <RunnerStat label="Tool" value="GPT Image2" />
            <RunnerStat label="Status" value={runnerContext.assetGate === "approved" ? "Ready" : "Review Only"} />
          </div>
          <div className="mt-5">
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Prompt Preview</div>
            <pre className="max-h-56 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-6 text-slate-300">{runnerPrompt.prompt}</pre>
          </div>
          <button className="btn btn-primary mt-5" onClick={createKeyframeProductionTask}>Generate Keyframe</button>
        </ProductionCard>

        <ProductionCard className="p-5">
          <PanelHeader icon={<ShieldCheck size={18} />} title="Shot Inspector" subtitle="从Storyboard和资产库解析出的生产上下文。" compact />
          <div className="mt-4 space-y-3 text-sm">
            <InspectLine label="Shot ID" value={runnerContext.shotId} />
            <InspectLine label="Description" value={runnerContext.description} />
            <InspectLine label="Character" value={runnerContext.character} />
            <InspectLine label="Environment" value={runnerContext.environment} />
            <InspectLine label="Camera" value={runnerContext.camera} />
            <InspectLine label="Required Assets" value={runnerContext.references.map((item) => item.name).join(", ")} />
            <InspectLine label="Production Status" value={runnerContext.assetGate} />
          </div>
        </ProductionCard>
      </section>

      <ProductionCard className="p-5">
        <PanelHeader icon={<KeyRound size={18} />} title="API Settings" subtitle="不显示Key内容，只显示连接状态。" compact />
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {providerStatus.filter((provider) => ["GPT Image2", "Kling", "Veo", "Runway"].includes(provider.name)).map((provider) => (
            <div key={provider.name} className="rounded-md border border-white/10 bg-black/20 p-3">
              <div className="text-sm font-semibold text-white">{provider.name}</div>
              <div className="mt-2"><StatusPill status={provider.status === "connected" ? "CONNECTED" : "MISSING KEY"} /></div>
              <div className="mt-2 text-xs text-slate-500">{provider.type}</div>
            </div>
          ))}
        </div>
      </ProductionCard>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <ProductionCard className="overflow-hidden">
          <PanelHeader icon={<KeyRound size={18} />} title="Tool Registry" subtitle="真实工具注册表，未配置密钥显示 needs_key。" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-y border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr>{["Tool", "Type", "Status", "Auth", "Capabilities", "Enabled"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
              </thead>
              <tbody>
                {toolRegistry.map((tool) => (
                  <tr key={tool.id} className="border-b border-white/5">
                    <td className="px-4 py-3"><div className="font-medium text-white">{tool.name}</div><div className="font-mono text-xs text-jade">{tool.id}</div></td>
                    <td className="px-4 py-3 text-slate-400">{tool.type}</td>
                    <td className="px-4 py-3"><StatusPill status={tool.status} /></td>
                    <td className="px-4 py-3 text-slate-400">{tool.authType}</td>
                    <td className="px-4 py-3 text-slate-400">{tool.capabilities.join(", ")}</td>
                    <td className="px-4 py-3 text-slate-400">{tool.enabled ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ProductionCard>

        <ProductionCard className="p-5">
          <PanelHeader icon={<ShieldCheck size={18} />} title="Asset Safety Check" subtitle="规则来自资产库与视觉规范。" compact />
          <div className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 p-4">
            <div className="text-sm font-medium text-red-200">Draft {"->"} Kling Probe</div>
            <div className="mt-2 text-sm text-slate-300">{safetyProbe.allowed ? "Allowed" : "Blocked"}</div>
            <ul className="mt-3 list-inside list-disc text-sm leading-6 text-slate-400">
              {safetyProbe.reasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
            {Object.entries(safetyDigest).map(([key, value]) => <div key={key} className="rounded border border-white/10 p-2">{key}: {value}</div>)}
          </div>
        </ProductionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductionCard className="overflow-hidden">
          <PanelHeader icon={<Play size={18} />} title="Task Queue" subtitle="本地内存队列，未来可替换 Supabase / Redis。" />
          <div className="divide-y divide-white/10">
            {tasks.length ? tasks.map((task) => (
              <div key={task.taskId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-medium text-white">{task.type}</div>
                  <div className="font-mono text-xs text-slate-500">{task.taskId}</div>
                  <div className="mt-1 text-xs text-slate-400">{task.toolId} / {task.episodeId ?? "no episode"} / {task.shotId ?? "no shot"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={task.status} />
                  <StatusPill status={task.reviewStatus} />
                  <button className="btn h-9" onClick={() => runSelectedTask(task)} disabled={task.status === "running" || task.status === "cancelled"}><RefreshCw size={15} /> Run</button>
                </div>
              </div>
            )) : <EmptyQueue />}
          </div>
        </ProductionCard>

        <ProductionCard className="overflow-hidden">
          <PanelHeader icon={<TerminalSquare size={18} />} title="MCP Logs" subtitle="工具调用、失败原因、审核结果与资产版本记录。" />
          <div className="max-h-[520px] overflow-y-auto p-3">
            {logs.length ? logs.map((log) => (
              <div key={log.id} className="mb-2 rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={log.level} />
                  <span className="text-[11px] text-slate-500">{new Date(log.at).toLocaleTimeString()}</span>
                </div>
                <div className="mt-2 text-sm text-white">{log.message}</div>
                <div className="mt-1 text-xs text-slate-500">{log.scope} {log.toolId ? `/ ${log.toolId}` : ""} {log.taskId ? `/ ${log.taskId}` : ""}</div>
                {log.reason && <div className="mt-2 text-xs text-red-200">{log.reason}</div>}
              </div>
            )) : <div className="p-6 text-center text-sm text-slate-500">No MCP logs yet.</div>}
          </div>
        </ProductionCard>
      </section>

      <ProductionCard className="overflow-hidden">
        <PanelHeader icon={<ShieldCheck size={18} />} title="Review Queue" subtitle="生成输出只能进入 waiting_review，人工审核后才可Approved。" />
        <div className="divide-y divide-white/10">
          {reviewItems.length ? reviewItems.map((item) => (
            <div key={item.reviewId} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="text-sm font-medium text-white">{item.assetVersion.assetId} / {item.assetVersion.version}</div>
                <div className="mt-1 text-xs text-slate-500">{item.tool} / {new Date(item.createdAt).toLocaleString()}</div>
                <div className="mt-2 max-w-3xl truncate text-xs text-slate-400">{item.prompt}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={item.status} />
                <button className="btn h-9" onClick={() => reviewQueue.approve(item.reviewId)}>Approve</button>
                <button className="btn h-9" onClick={() => reviewQueue.reject(item.reviewId)}>Reject</button>
              </div>
            </div>
          )) : <div className="p-8 text-center text-sm text-slate-500">No assets waiting for review.</div>}
        </div>
      </ProductionCard>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductionCard className="p-5">
          <PanelHeader icon={<Play size={18} />} title="Workflow Runner" subtitle="命令创建任务，Run按钮执行已注册workflow。" compact />
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            {["generateKeyframe.workflow", "generateVideoShot.workflow", "reviewAsset.workflow", "exportEpisode.workflow", "consistencyCheck.workflow"].map((name) => (
              <div key={name} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
                <span>{name}</span>
                <StatusPill status="registered" />
              </div>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="p-5">
          <PanelHeader icon={<RefreshCw size={18} />} title="Model Routing" subtitle="当前只路由到已注册adapter；未配置API Key不会提交外部任务。" compact />
          <div className="mt-4 space-y-3 text-sm">
            <RouteLine label="Default Image" value="gpt_image2" />
            <RouteLine label="Default Video" value="kling / veo" />
            <RouteLine label="Default Voice" value="elevenlabs" />
            <RouteLine label="Local Graph" value="comfyui" />
          </div>
        </ProductionCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {apiStatus.map((item) => (
          <ProductionCard key={item.id} className="p-4">
            <div className="text-sm font-semibold text-white">{item.name}</div>
            <div className="mt-2"><StatusPill status={item.status} /></div>
            <div className="mt-3 text-xs text-slate-400">Auth: {item.authType}</div>
          </ProductionCard>
        ))}
      </section>
    </div>
  );
}

function RunnerStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function InspectLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-slate-300">{value}</div>
    </div>
  );
}

function RouteLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-jade">{value}</span>
    </div>
  );
}

function PanelHeader({ icon, title, subtitle, compact = false }: { icon: React.ReactNode; title: string; subtitle: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "border-b border-white/10 p-4"}>
      <div className="flex items-center gap-2 text-white">{icon}<h2 className="font-semibold">{title}</h2></div>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function EmptyQueue() {
  return <div className="p-8 text-center text-sm text-slate-500">No tasks yet. Use Command+K to create a real MCP task.</div>;
}
