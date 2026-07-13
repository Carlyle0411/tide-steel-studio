import { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, Download, FileJson, FileText, Film, ImageIcon, Layers3, MoveRight, Play, Search, ShieldCheck, SlidersHorizontal, Video } from "lucide-react";
import { approvedImages, buildDashboardMetrics, centerItems, episodes, productionAssets, productionDocs, storyboardShots } from "../data/productionData";
import type { AssetCenterKind, EpisodeRecord, ProductionAsset, ProductionCenterItem, ProductionImageAsset, StoryboardShotRecord } from "../types";
import { ProductionCard, StatusPill } from "./ProductionShell";
import { resolveShotContext } from "../../../mcp/engine/ContextResolver";
import { buildImagePrompt } from "../../../mcp/engine/PromptBuilder";
import { generationHistory, type GenerationHistoryItem } from "../../../mcp/logs/generationHistory";
import { taskQueue } from "../../../mcp/queue/taskQueue";
import type { MCPTask } from "../../../mcp/schemas/task.schema";
import { calculateEpisodeProgress } from "../../../mcp/episodeFactory/EpisodeProgress";
import { estimateEpisodeCost } from "../../../mcp/cost/CostTracker";
import { producerAgent } from "../../../mcp/producer/ProducerAgent";
import { createVideoProductionPackage } from "../../../mcp/videoDirector/VideoDirectorAgent";
import { videoTaskQueue, type VideoTask } from "../../../mcp/video/VideoTaskQueue";
import { producerManagementAgent } from "../../../mcp/producerAgent/ProducerAgent";
import { getEP01Completion } from "../../../mcp/ep01Production/EP01ProductionBoard";
import { getEP01VisualProductionStats } from "../../../mcp/ep01Production/visualProduction/VisualProductionStats";
import { assetGenerationQueue } from "../../../mcp/assetFactory/AssetGenerationQueue";
import { getFactoryStats } from "../../../mcp/assetFactory/AssetLibraryManager";

export function DashboardView() {
  const metrics = buildDashboardMetrics();
  const recent = [
    ["最近修改", "VISUAL_PIPELINE_BIBLE.md", "Production pipeline locked"],
    ["最近审核", "EP01_KEYFRAME_AUDIT_BATCH01.md", "KF01 / KF02 / KF04 / KF09 approved"],
    ["最近生成图片", "EP01_KF09_APPROVED_V01.png", "Observation gate closing"],
    ["最近生成视频", "None", "Waiting for Kling / Veo adapter"]
  ];
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <ProductionCard key={metric.label} className="p-4">
            <div className="text-xs text-slate-500">{metric.label}</div>
            <div className={`mt-2 text-2xl font-semibold ${metric.tone === "jade" ? "text-jade" : metric.tone === "gold" ? "text-gold" : "text-white"}`}>{metric.value}</div>
            <div className="mt-2 text-xs text-slate-400">{metric.helper}</div>
          </ProductionCard>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <ProductionCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Timeline</h2>
            <StatusPill status="Live" />
          </div>
          <div className="space-y-3">
            {["Story Bible", "Episode Bible", "Director Bible", "Design Bible", "Asset Library", "Storyboard", "GPT Image2", "人工审核", "Approved Assets", "Kling / Veo", "Editing", "Sound", "Render", "Final Episode"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${index <= 8 ? "border-jade/40 bg-jade/10 text-jade" : "border-white/10 text-slate-500"}`}>{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white">{step}</div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className={`h-full ${index <= 8 ? "w-full bg-jade/70" : "w-0 bg-jade/70"}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Activity</h2>
          <div className="space-y-3">
            {recent.map(([label, name, detail]) => (
              <div key={`${label}-${name}`} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
                <div className="mt-1 text-sm text-white">{name}</div>
                <div className="mt-1 text-xs text-slate-400">{detail}</div>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>
    </div>
  );
}

export function EpisodeProductionDashboardView() {
  const [tasks, setTasks] = useState<MCPTask[]>(() => taskQueue.listTasks());
  useEffect(() => taskQueue.subscribe(() => setTasks(taskQueue.listTasks())), []);
  const progress = calculateEpisodeProgress("EP01", tasks);
  const cost = estimateEpisodeCost("EP01", tasks);
  const recommendations = producerAgent.analyzeEpisode("EP01").slice(0, 5);
  const producerReport = producerManagementAgent.analyzeEpisode("EP01");
  const ep01Completion = getEP01Completion();
  const visualStats = getEP01VisualProductionStats();
  const factoryStats = getFactoryStats(assetGenerationQueue.list());
  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Episode Production Dashboard</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">潮汐钢魂三部曲制作总览</h2>
      </ProductionCard>
      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat label="Storyboard" value={`${progress.totalShots}/${progress.totalShots}`} />
        <MiniStat label="Director Completed" value={`${progress.directorCompleted}/${progress.totalShots}`} />
        <MiniStat label="Prompt Generated" value={`${progress.promptGenerated}/${progress.totalShots}`} />
        <MiniStat label="Image Generated" value={`${progress.imageGenerated}/${progress.totalShots}`} />
        <MiniStat label="Review Passed" value={`${progress.reviewPassed}/${progress.totalShots}`} />
        <MiniStat label="Video Ready" value={`${progress.videoReady}/${progress.totalShots}`} />
        <MiniStat label="Video Generated" value={`0/${progress.totalShots}`} />
        <MiniStat label="Estimated Cost" value={`$${cost.estimatedCost}`} />
      </div>
      <ProductionCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">AI Producer Status</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Production Health {producerReport.productionHealth}%</h3>
          </div>
          <StatusPill status={producerReport.risk.riskLevel} />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <MiniStat label="Budget" value={`$${producerReport.budget.actualCost}/$${producerReport.budget.budgetCap}`} />
          <MiniStat label="Risk" value={producerReport.risk.riskLevel} />
          <MiniStat label="Quality" value={`${producerReport.quality.qualityScore}/100`} />
          <MiniStat label="Next Action" value={producerReport.nextAction} />
        </div>
      </ProductionCard>
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">EP01 Completion</div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MiniStat label="Image" value={ep01Completion.image} />
          <MiniStat label="Video" value={ep01Completion.video} />
          <MiniStat label="Audio" value={ep01Completion.audio} />
          <MiniStat label="Edit" value={ep01Completion.edit} />
        </div>
      </ProductionCard>
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">EP01 Visual Production</div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <MiniStat label="Characters" value={visualStats.characters} />
          <MiniStat label="Mechas" value={visualStats.mechas} />
          <MiniStat label="Creatures" value={visualStats.creatures} />
          <MiniStat label="Environment" value={visualStats.environment} />
          <MiniStat label="Keyframes" value={visualStats.keyframes} />
        </div>
      </ProductionCard>
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">AI Asset Factory</div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MiniStat label="Generated Assets" value={factoryStats.generatedAssets} />
          <MiniStat label="Approved Assets" value={factoryStats.approvedAssets} />
          <MiniStat label="Pending Review" value={factoryStats.pendingReview} />
          <MiniStat label="Failed Generation" value={factoryStats.failedGeneration} />
          <MiniStat label="Characters" value={factoryStats.characters} />
          <MiniStat label="Mechas" value={factoryStats.mechas} />
          <MiniStat label="Creatures" value={factoryStats.creatures} />
          <MiniStat label="Environment" value={factoryStats.environment} />
        </div>
      </ProductionCard>
      <ProductionTimeline />
      <section className="grid gap-4 xl:grid-cols-2">
        <ProductionCard className="p-5">
          <h3 className="text-lg font-semibold text-white">Production Cost Tracker</h3>
          <div className="mt-4 space-y-2">
            {cost.byModel.map((item) => (
              <div key={item.model} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <span className="text-slate-300">{item.model}</span>
                <span className="text-jade">{item.units} units / ${item.estimatedCost}</span>
              </div>
            ))}
          </div>
        </ProductionCard>
        <ProductionCard className="p-5">
          <h3 className="text-lg font-semibold text-white">AI Producer Recommendations</h3>
          <div className="mt-4 space-y-2">
            {recommendations.map((item) => (
              <div key={item.shotId} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-jade">{item.shotId}</span>
                  <StatusPill status={item.priority} />
                </div>
                <div className="mt-2 text-sm text-slate-300">{item.recommendation}</div>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>
    </div>
  );
}

export function EpisodeManagerView() {
  const [selected, setSelected] = useState(episodes[0]);
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <ProductionCard className="p-3">
        <div className="mb-2 px-2 text-xs uppercase tracking-[0.2em] text-slate-500">Episodes</div>
        <div className="max-h-[calc(100vh-170px)] space-y-1 overflow-y-auto">
          {episodes.map((episode) => (
            <button key={episode.id} onClick={() => setSelected(episode)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${selected.id === episode.id ? "bg-jade/15 text-jade" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <span>{episode.id}</span>
              <span className="text-[11px]">{episode.part}</span>
            </button>
          ))}
        </div>
      </ProductionCard>
      <EpisodeDetail episode={selected} />
    </div>
  );
}

function EpisodeDetail({ episode }: { episode: EpisodeRecord }) {
  const tabs = ["Script", "Storyboard", "Characters", "Scenes", "Assets", "Images", "Videos", "Status"];
  return (
    <ProductionCard className="overflow-hidden">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{episode.part}</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{episode.id} {episode.title}</h2>
          </div>
          <StatusPill status={episode.status} />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-3">
        {tabs.map((tab) => <button key={tab} className="rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-jade/40 hover:text-white">{tab}</button>)}
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-4">
        <MiniStat label="Storyboard" value={episode.storyboard} />
        <MiniStat label="Assets" value={episode.assets} />
        <MiniStat label="Images" value={episode.images} />
        <MiniStat label="Videos" value={episode.videos} />
      </div>
      <div className="px-5 pb-5">
        <div className="rounded-md border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-medium text-white">Production Gate</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">EP01已进入视觉制作。后续集数必须先完成 Story Room 与 Episode Bible，再进入剧本、镜头表、关键帧与视频制作。</p>
        </div>
      </div>
    </ProductionCard>
  );
}

export function AssetDatabaseView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"id" | "name" | "category">("id");
  const filtered = useMemo(() => {
    return productionAssets
      .filter((asset) => status === "all" || asset.status === status)
      .filter((asset) => [asset.id, asset.name, asset.category, asset.reference, asset.firstEpisode].join(" ").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => String(a[sort]).localeCompare(String(b[sort])));
  }, [query, status, sort]);

  return (
    <ProductionCard className="overflow-hidden">
      <Toolbar query={query} setQuery={setQuery}>
        <select className="field h-10 w-36" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="deprecated">Deprecated</option>
        </select>
        <select className="field h-10 w-36" value={sort} onChange={(event) => setSort(event.target.value as "id" | "name" | "category")}>
          <option value="id">Sort ID</option>
          <option value="name">Sort Name</option>
          <option value="category">Sort Category</option>
        </select>
      </Toolbar>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["资产编号", "资产", "类别", "版本", "Reference", "首次出现", "状态", "GPT Image2", "Kling", "Veo"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => <AssetRow key={asset.id} asset={asset} />)}
          </tbody>
        </table>
      </div>
    </ProductionCard>
  );
}

function AssetRow({ asset }: { asset: ProductionAsset }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.025]">
      <td className="px-4 py-3 font-mono text-xs text-jade">{asset.id}</td>
      <td className="px-4 py-3 text-white">{asset.name}</td>
      <td className="px-4 py-3 text-slate-400">{asset.category}</td>
      <td className="px-4 py-3 text-slate-400">{asset.version}</td>
      <td className="max-w-[260px] truncate px-4 py-3 text-slate-400">{asset.reference}</td>
      <td className="px-4 py-3 text-slate-400">{asset.firstEpisode}</td>
      <td className="px-4 py-3"><StatusPill status={asset.status} /></td>
      <td className="px-4 py-3">{asset.gptImage2 ? <CheckCircle2 className="text-jade" size={16} /> : <span className="text-slate-600">No</span>}</td>
      <td className="px-4 py-3">{asset.kling ? <CheckCircle2 className="text-jade" size={16} /> : <span className="text-slate-600">No</span>}</td>
      <td className="px-4 py-3">{asset.veo ? <CheckCircle2 className="text-jade" size={16} /> : <span className="text-slate-600">No</span>}</td>
    </tr>
  );
}

export function CenterView({ kind, title }: { kind: AssetCenterKind; title: string }) {
  const items = centerItems.filter((item) => item.kind === kind);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <CenterCard key={item.id} item={item} />)}
      </div>
      {!items.length && <EmptyState title={`${title} awaiting registration`} text="资产目录已建立，但尚未完成Reference与Approved资产登记。" />}
    </div>
  );
}

function CenterCard({ item }: { item: ProductionCenterItem }) {
  return (
    <ProductionCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] text-jade">{item.id}</div>
          <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
        </div>
        <StatusPill status={item.status} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Version" value={item.version} />
        <MiniStat label="Shots" value={item.shotCount} />
        <MiniStat label="Images" value={item.approvedImages} />
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-400">
        <div><span className="text-slate-500">Reference:</span> {item.reference}</div>
        <div><span className="text-slate-500">Appear:</span> {item.firstAppearance} {"->"} {item.lastAppearance}</div>
        <div><span className="text-slate-500">Episodes:</span> {item.episodes.join(", ")}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{item.notes}</p>
    </ProductionCard>
  );
}

export function StoryboardView() {
  const [selectedId, setSelectedId] = useState(storyboardShots[0]?.id ?? "");
  const selected = storyboardShots.find((shot) => shot.id === selectedId) ?? storyboardShots[0];
  const context = resolveShotContext("EP01", selected?.id ?? "EP01_KF01");
  const prompt = buildImagePrompt(context);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-4">
        {storyboardShots.map((shot) => <ShotCard key={shot.id} shot={shot} selected={shot.id === selected?.id} onSelect={() => setSelectedId(shot.id)} />)}
      </div>
      <ProductionCard className="sticky top-5 h-fit p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Shot Inspector</div>
        <h3 className="mt-2 text-lg font-semibold text-white">{selected?.id ?? "No Shot"}</h3>
        <div className="mt-4 space-y-3 text-sm">
          <FieldBlock label="Description" value={selected?.storyFunction ?? ""} />
          <FieldBlock label="Required Assets" value={context.references.map((item) => `${item.name} (${item.status})`).join(", ")} />
          <FieldBlock label="Character" value={context.character} />
          <FieldBlock label="Environment" value={context.environment} />
          <FieldBlock label="Camera" value={context.camera} />
          <FieldBlock label="Prompt" value={prompt.prompt} />
          <FieldBlock label="Production Status" value={context.assetGate} />
        </div>
        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-500">Video Planning Tab</div>
          <VideoPlanningPanel shotId={selected?.id ?? "EP01_KF01"} />
        </div>
      </ProductionCard>
    </div>
  );
}

function VideoPlanningPanel({ shotId }: { shotId: string }) {
  const videoPackage = createVideoProductionPackage({ episodeId: "EP01", shotId, approvedImage: "EP01_KF01_APPROVED_V01.png" });
  return (
    <div className="space-y-2 text-xs text-slate-400">
      <div>Shot: {shotId}</div>
      <div>Image: Approved</div>
      <div>Camera: {videoPackage.cameraMovement}</div>
      <div>Motion: {videoPackage.environmentMotion} + {videoPackage.characterMotion}</div>
      <div>Duration: {videoPackage.duration}s</div>
      <div>Provider: Kling</div>
    </div>
  );
}

function ShotCard({ shot, selected, onSelect }: { shot: StoryboardShotRecord; selected: boolean; onSelect: () => void }) {
  return (
    <button className="block text-left" onClick={onSelect}>
      <ProductionCard className={`p-4 transition ${selected ? "border-jade/40 bg-jade/[0.04]" : ""}`}>
      <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)_220px]">
        <div>
          <div className="font-mono text-2xl font-semibold text-white">SHOT {shot.number}</div>
          <div className="mt-1 text-xs text-slate-500">{shot.time}</div>
          <div className="mt-3"><StatusPill status={shot.review} /></div>
        </div>
        <div className="space-y-3">
          <FieldBlock label="剧情" value={shot.storyFunction} />
          <FieldBlock label="画面" value={shot.frame} />
          <FieldBlock label="摄影" value={shot.camera} />
        </div>
        <div className="space-y-3">
          <FieldBlock label="Reference / Keyframe" value={shot.keyframe} />
          <FieldBlock label="Video" value={shot.video} />
          <FieldBlock label="Sound" value={shot.sound} />
        </div>
      </div>
      </ProductionCard>
    </button>
  );
}

export function PromptCenterView() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <PromptColumn title="GPT Image2 Prompt" body={productionDocs.ep01PromptMd} />
      <PromptColumn title="Kling / Veo Prompt Architecture" body={productionDocs.visualPipelineMd} />
      <PromptColumn title="Flux / ComfyUI Slot" body="Provider adapter exists. Prompt packs will be registered per shot after approved keyframes." />
      <PromptColumn title="Unified Shot Prompt Rule" body="每一个镜头只允许在一个中心维护prompt。Prompt必须绑定资产编号、Reference、审核状态和目标平台。" />
    </div>
  );
}

function PromptColumn({ title, body }: { title: string; body: string }) {
  return (
    <ProductionCard className="overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">{title}</div>
      <textarea className="min-h-[300px] w-full resize-y bg-black/20 p-4 font-mono text-xs leading-6 text-slate-300 outline-none" value={body} readOnly />
    </ProductionCard>
  );
}

export function ImageCenterView() {
  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => generationHistory.list());
  const [productionTasks, setProductionTasks] = useState<MCPTask[]>(() => taskQueue.listTasks());
  useEffect(() => generationHistory.subscribe(() => setHistory(generationHistory.list())), []);
  useEffect(() => taskQueue.subscribe(() => setProductionTasks(taskQueue.listTasks())), []);
  return (
    <div className="space-y-5">
      <ProductionTimeline />
      <ProductionQueueTable tasks={productionTasks} />
      <div className="grid gap-4 md:grid-cols-4">
        {["draft", "review", "approved", "deprecated"].map((status) => (
          <ProductionCard key={status} className="p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{status}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{approvedImages.filter((image) => image.status === status).length}</div>
          </ProductionCard>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {approvedImages.map((image) => <ImageAssetCard key={image.id} image={image} />)}
      </div>
      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Generation History</h3>
          <p className="mt-1 text-xs text-slate-500">真实模型调用记录：任务、Prompt、Model、Status。</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
              <tr>{["任务", "Model", "Status", "Prompt", "Output", "Time"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
            </thead>
            <tbody>
              {history.length ? history.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-jade">{item.taskId}</td>
                  <td className="px-4 py-3 text-slate-300">{item.model}</td>
                  <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                  <td className="max-w-[360px] truncate px-4 py-3 text-slate-400">{item.prompt}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-400">{item.outputAsset ?? item.error ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(item.at).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>No generation history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ProductionCard>
    </div>
  );
}

function ProductionQueueTable({ tasks }: { tasks: MCPTask[] }) {
  const rows = tasks.filter((task) => ["image_generation", "video_generation", "prompt_generation", "image_review"].includes(task.type));
  return (
    <ProductionCard className="overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Production Queue</h3>
        <p className="mt-1 text-xs text-slate-500">真实生产任务状态，不显示假进度。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
            <tr>{["Shot", "Prompt", "Model", "Status", "Progress", "Output"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((task) => (
              <tr key={task.taskId} className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-xs text-jade">{task.shotId ?? "-"}</td>
                <td className="max-w-[360px] truncate px-4 py-3 text-slate-400">{String(task.input.prompt ?? task.input.action ?? "-")}</td>
                <td className="px-4 py-3 text-slate-300">{task.model ?? task.toolId}</td>
                <td className="px-4 py-3"><StatusPill status={task.status} /></td>
                <td className="px-4 py-3">
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-jade" style={{ width: `${task.progress ?? 0}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{task.progress ?? 0}%</div>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-400">{JSON.stringify(task.output ?? task.errors[0] ?? "-")}</td>
              </tr>
            )) : (
              <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>No production tasks yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ProductionCard>
  );
}

function ProductionTimeline() {
  const steps = ["Reference", "Prompt", "Generation", "Review", "Approved", "Video"];
  return (
    <ProductionCard className="p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-500">Production Timeline</div>
      <div className="grid gap-2 md:grid-cols-6">
        {steps.map((step, index) => (
          <div key={step} className="rounded-md border border-white/10 bg-black/20 p-3">
            <div className="text-[11px] text-slate-500">0{index + 1}</div>
            <div className="mt-1 text-sm font-semibold text-white">{step}</div>
          </div>
        ))}
      </div>
    </ProductionCard>
  );
}

function ImageAssetCard({ image }: { image: ProductionImageAsset }) {
  return (
    <ProductionCard className="overflow-hidden">
      <div className="aspect-video bg-black/30"><img src={image.src} alt={image.name} className="h-full w-full object-cover" /></div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">{image.name}</h3>
          <StatusPill status={image.status} />
        </div>
        <div className="mt-3 space-y-1 text-xs text-slate-400">
          <div>Version: {image.version}</div>
          <div>Reference: {image.reference}</div>
          <div>Use: {image.usageCount} / {image.firstUse}</div>
        </div>
      </div>
    </ProductionCard>
  );
}

export function ReviewCenterView() {
  const candidates = [...approvedImages.map((item) => ({ id: item.id, name: item.name, type: "Image", status: item.status })), ...storyboardShots.slice(0, 4).map((shot) => ({ id: shot.id, name: `SHOT ${shot.number}`, type: "Storyboard", status: shot.review }))];
  return (
    <ProductionCard className="overflow-hidden">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-base font-semibold text-white">Unified Review Queue</h2>
        <p className="mt-1 text-sm text-slate-400">审核通过会进入Approved；没有Approved的图片禁止进入Kling / Veo。</p>
      </div>
      <div className="divide-y divide-white/10">
        {candidates.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="text-sm font-medium text-white">{item.name}</div>
              <div className="text-xs text-slate-500">{item.type} / {item.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={item.status} />
              <button className="btn h-9"><CheckCircle2 size={15} /> Approve</button>
              <button className="btn h-9"><Archive size={15} /> Deprecated</button>
            </div>
          </div>
        ))}
      </div>
    </ProductionCard>
  );
}

export function VideoCenterView() {
  const [tasks, setTasks] = useState<VideoTask[]>(() => videoTaskQueue.listTasks());
  useEffect(() => videoTaskQueue.subscribe(() => setTasks(videoTaskQueue.listTasks())), []);
  const providers = ["Kling", "Veo", "Runway", "Pika", "Dream Machine"];
  return (
    <div className="space-y-5">
      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Video Task Queue</h3>
          <p className="mt-1 text-xs text-slate-500">Kling / Veo / Runway must return real task state. Missing keys stay needs_key.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
              <tr>{["Video Task", "Shot", "Image", "Provider", "Duration", "Status", "Time"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
            </thead>
            <tbody>
              {tasks.length ? tasks.map((task) => (
                <tr key={task.videoTaskId} className="border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-jade">{task.videoTaskId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{task.shot}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-400">{task.imageAsset}</td>
                  <td className="px-4 py-3 text-slate-300">{task.provider}</td>
                  <td className="px-4 py-3 text-slate-400">{task.duration}s</td>
                  <td className="px-4 py-3"><StatusPill status={task.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(task.createdAt).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={7}>No video tasks yet. Use Command+K: Generate Video Shot.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ProductionCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => (
          <ProductionCard key={provider} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{provider}</h3>
              <StatusPill status="adapter" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">Live adapter slot. It requires API key and endpoint before real generation; otherwise it reports needs_key or failed without creating fake video.</p>
            <button className="btn mt-4 h-9"><Play size={15} /> Use Command+K</button>
          </ProductionCard>
        ))}
      </div>
    </div>
  );
}

export function ExportCenterView() {
  const exports = [
    ["整集Storyboard", "Markdown / PDF", FileText],
    ["全部Prompt", "GPT Image2 / Kling / Veo", FileJson],
    ["全部Assets", "JSON manifest", ImageIcon],
    ["拍摄计划", "Production schedule", Film],
    ["PDF", "Director packet", Download],
    ["JSON", "Pipeline package", FileJson]
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {exports.map(([name, detail, Icon]) => (
        <ProductionCard key={name as string} className="p-5">
          <Icon size={22} className="text-jade" />
          <h3 className="mt-4 text-lg font-semibold text-white">{name}</h3>
          <p className="mt-2 text-sm text-slate-400">{detail}</p>
          <button className="btn mt-4 h-9"><Download size={15} /> Prepare Export</button>
        </ProductionCard>
      ))}
    </div>
  );
}

export function TextDocView({ title, body }: { title: string; body: string }) {
  return (
    <ProductionCard className="overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">{title}</div>
      <pre className="max-h-[calc(100vh-180px)] overflow-auto whitespace-pre-wrap p-5 text-sm leading-7 text-slate-300">{body}</pre>
    </ProductionCard>
  );
}

export function SettingsView() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ProductionCard className="p-5">
        <h3 className="text-lg font-semibold text-white">Dock Layout</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">侧边栏、右侧Inspector、Command+K、多中心页面已启用。React Router / Zustand / Framer Motion 可在依赖可用后接入当前页面状态边界。</p>
      </ProductionCard>
      <ProductionCard className="p-5">
        <h3 className="text-lg font-semibold text-white">Future Connections</h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-400">
          {["OpenAI GPT Image2", "Kling API", "Veo API", "Flux", "ComfyUI", "Supabase", "Git"].map((item) => <div key={item} className="rounded border border-white/10 px-3 py-2">{item}</div>)}
        </div>
      </ProductionCard>
    </div>
  );
}

function Toolbar({ query, setQuery, children }: { query: string; setQuery: (value: string) => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
      <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3">
        <Search size={16} className="text-slate-500" />
        <input className="h-10 w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
      </div>
      <SlidersHorizontal size={18} className="text-slate-500" />
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <ProductionCard className="p-8 text-center">
      <Layers3 className="mx-auto text-slate-600" size={32} />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">{text}</p>
    </ProductionCard>
  );
}
