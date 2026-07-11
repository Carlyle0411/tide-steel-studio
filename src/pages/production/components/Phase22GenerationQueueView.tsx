import { useMemo, useState } from "react";
import { Image, RotateCcw, Search, Wand2 } from "lucide-react";
import { getMasterGenerationStats, listMasterGenerationTasks, type MasterGenerationTask } from "../../../mcp/masterAssetGenerator/AssetGenerationQueue";
import { getBatchGenerationState } from "../../../mcp/masterAssetGenerator/BatchGenerationEngine";
import { buildGPTImage2Prompt } from "../../../mcp/masterAssetGenerator/GPTImage2Executor";
import { ProductionCard } from "./ProductionShell";

export function Phase22GenerationQueueView() {
  const stats = getMasterGenerationStats();
  const batch = getBatchGenerationState();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MasterGenerationTask | null>(null);
  const tasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listMasterGenerationTasks().filter((task) => {
      const text = [task.taskId, task.assetId, task.name, task.category, task.variant, task.status, task.prompt].join(" ").toLowerCase();
      return !q || text.includes(q);
    });
  }, [query]);
  const current = selected ?? tasks[0];

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Master Asset Generation Engine</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">Generation Queue</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">真实母资产生成队列。没有真实PNG返回时，不允许进入APPROVED，也不能进入Kling Video Workflow。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="总任务" value={stats.total} />
        <Metric label="待生成" value={stats.pending} />
        <Metric label="生成中" value={stats.generating} />
        <Metric label="已生成" value={stats.generated} />
        <Metric label="Review" value={stats.review} />
        <Metric label="Approved" value={stats.approved} />
        <Metric label="失败" value={stats.failed} />
      </div>

      <ProductionCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Batch Control</div>
            <div className="mt-1 text-sm text-slate-300">总任务 {batch.total} / 完成 {batch.completed} / 处理中 {batch.processing} / 失败 {batch.failed} / 等待 {batch.waiting}</div>
          </div>
          <button className="btn h-9" onClick={() => setQuery("PENDING_GENERATION")}>Start Full Generation</button>
          <button className="btn h-9" onClick={() => setQuery("GENERATING")}>Pause</button>
          <button className="btn h-9" onClick={() => setQuery("PENDING_GENERATION")}>Resume</button>
          <button className="btn h-9" onClick={() => setQuery("GENERATION_FAILED")}>Retry Failed</button>
        </div>
        <div className="mt-3 rounded border border-gold/30 bg-gold/10 p-2 text-xs leading-5 text-gold">{batch.note}</div>
      </ProductionCard>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <ProductionCard className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex min-w-72 flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3">
                <Search size={16} className="text-jade" />
                <input className="h-10 w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务名称、类型、Prompt、状态..." />
              </div>
              <button className="btn h-10" onClick={() => setQuery("PENDING_GENERATION")}><Wand2 size={15} /> Generate Missing Assets</button>
            </div>
          </ProductionCard>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <button key={task.taskId} className={`rounded-md border p-4 text-left transition ${current?.taskId === task.taskId ? "border-jade bg-jade/10" : "border-white/10 bg-white/[0.03] hover:border-jade/40"}`} onClick={() => setSelected(task)}>
                <div className="font-mono text-[10px] text-jade">{task.assetId}</div>
                <div className="mt-1 text-sm font-semibold text-white">{task.name} / {task.variant}</div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Status status={task.status} />
                  <span className="text-xs text-slate-500">{task.sourceType}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <QueueDetail task={current} />
      </section>
    </div>
  );
}

function QueueDetail({ task }: { task?: MasterGenerationTask }) {
  const [message, setMessage] = useState("");
  if (!task) return null;
  const prompt = buildGPTImage2Prompt(task);
  return (
    <ProductionCard className="sticky top-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white"><Image size={16} /> {task.name} / {task.variant}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Info label="状态" value={task.status} />
        <Info label="类型" value={task.category} />
        <Info label="输出" value={task.outputPath} />
        <Info label="Metadata" value={task.metadataPath} />
      </div>
      <textarea className="mt-3 min-h-72 w-full resize-y rounded border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={prompt} readOnly />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="btn h-9" onClick={() => { void navigator.clipboard?.writeText(prompt); setMessage("GPT Image2 Prompt已复制。请用Codex图片生成后导入真实PNG。"); }}><Wand2 size={14} /> 复制Prompt</button>
        <button className="btn h-9" onClick={() => setMessage("重新生成需要真实调用GPT Image2；没有PNG返回时会保持generation_failed。")}><RotateCcw size={14} /> 重新生成</button>
      </div>
      {task.failureReason && <div className="mt-3 rounded border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-200">{task.failureReason}</div>}
      {message && <div className="mt-3 rounded border border-jade/30 bg-jade/10 p-2 text-xs text-jade">{message}</div>}
    </ProductionCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <ProductionCard className="p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </ProductionCard>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 line-clamp-2 text-xs text-slate-300">{value}</div>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const color = status === "REVIEW" ? "border-gold/40 bg-gold/10 text-gold" : status === "APPROVED" ? "border-jade/40 bg-jade/10 text-jade" : status === "GENERATION_FAILED" ? "border-red-400/40 bg-red-500/10 text-red-200" : "border-white/10 bg-white/5 text-slate-400";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] ${color}`}>{status}</span>;
}
