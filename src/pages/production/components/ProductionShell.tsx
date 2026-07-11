import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Box,
  Boxes,
  BrainCircuit,
  Clapperboard,
  Command,
  Database,
  Download,
  Eye,
  Film,
  FolderKanban,
  Image,
  Layers,
  MonitorPlay,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Scissors,
  Sparkles,
  UsersRound,
  Wand2,
  UserRound,
  Waves
} from "lucide-react";
import type { ProductionSection } from "../types";
import { taskQueue } from "../../../mcp/queue/taskQueue";
import { productionOrchestrator } from "../../../mcp/production/ProductionOrchestrator";
import { episodeFactory } from "../../../mcp/episodeFactory/EpisodeFactory";
import { videoTaskQueue } from "../../../mcp/video/VideoTaskQueue";
import { exportEpisodePackage } from "../../../mcp/export/EpisodePackageExporter";
import { editorAgent } from "../../../mcp/editorDirector/EditorAgent";
import { producerManagementAgent } from "../../../mcp/producerAgent/ProducerAgent";
import { createEP01KeyframeTasks, createEP01VideoTasks } from "../../../mcp/ep01Production/EP01TaskFactory";
import { runEP01ContinuityCheck } from "../../../mcp/ep01Production/EP01ContinuityChecker";
import { buildEP01FinalPackageManifest } from "../../../mcp/ep01Production/EP01FinalPackage";
import { assetGenerationQueue, type AssetTaskType } from "../../../mcp/assetFactory/AssetGenerationQueue";
import { listFactoryLibrary } from "../../../mcp/assetFactory/AssetLibraryManager";
import { generateKlingPromptFromAsset } from "../../../mcp/assetFactory/KlingVideoPromptGenerator";
import { createLocalAssetRecords } from "../../../mcp/localAssetGenerator/TideSteelAssetPlan";
import type { LocalAssetCategory, LocalAssetRecord } from "../../../mcp/localAssetGenerator/LocalAssetTypes";
import { buildAllEP01KlingPrompts, getEP01Keyframes } from "../../../mcp/tideSteelStudio/EP01StudioData";

const navItems: Array<{ id: ProductionSection; label: string; icon: ReactNode }> = [
  { id: "dashboard", label: "导演工作台", icon: <Sparkles size={17} /> },
  { id: "assetBible", label: "电影资产圣经", icon: <Database size={17} /> },
  { id: "tideSteelStudio", label: "项目总览", icon: <Film size={17} /> },
  { id: "story", label: "世界观", icon: <Layers size={17} /> },
  { id: "episode", label: "剧本管理", icon: <Clapperboard size={17} /> },
  { id: "characters", label: "角色设定", icon: <UserRound size={17} /> },
  { id: "mechas", label: "机甲设定", icon: <ShieldCheck size={17} /> },
  { id: "creatures", label: "怪兽设定", icon: <Waves size={17} /> },
  { id: "environment", label: "场景设定", icon: <MonitorPlay size={17} /> },
  { id: "props", label: "道具设定", icon: <Box size={17} /> },
  { id: "aiAssetLibrary", label: "资产库", icon: <Database size={17} /> },
  { id: "image", label: "关键帧", icon: <Image size={17} /> },
  { id: "storyboard", label: "分镜设计", icon: <FolderKanban size={17} /> },
  { id: "klingPromptLibrary", label: "可灵提示词", icon: <Film size={17} /> },
  { id: "video", label: "视频制作", icon: <MonitorPlay size={17} /> },
  { id: "timeline", label: "时间线", icon: <Scissors size={17} /> },
  { id: "export", label: "成片输出", icon: <Download size={17} /> },
  { id: "review", label: "制作日志", icon: <Archive size={17} /> },
  { id: "reuseCenter", label: "素材复用中心", icon: <Boxes size={17} /> },
  { id: "shotLibrary", label: "镜头库", icon: <Clapperboard size={17} /> },
  { id: "gptPromptLibrary", label: "Prompt库", icon: <Wand2 size={17} /> }
];

export function ProductionShell({
  active,
  onChange,
  inspector,
  children
}: {
  active: ProductionSection;
  onChange: (section: ProductionSection) => void;
  inspector: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const contentRef = useRef<HTMLElement | null>(null);
  const activeItem = navItems.find((item) => item.id === active);
  const commandItems = [
    ...navItems.map((item) => ({ ...item, command: false })),
    { id: "generate-keyframe", label: "生成关键帧", icon: <Image size={17} />, command: true },
    { id: "review-asset", label: "审核资产", icon: <Eye size={17} />, command: true },
    { id: "export-episode", label: "导出第一集", icon: <Download size={17} />, command: true },
    { id: "generate-director-prompt", label: "生成导演Prompt", icon: <Wand2 size={17} />, command: true },
    { id: "create-episode-production", label: "创建第一集生产任务", icon: <Boxes size={17} />, command: true },
    { id: "resume-episode-production", label: "继续第一集生产", icon: <PlayCircleIcon />, command: true },
    { id: "retry-failed-shots", label: "重试失败镜头", icon: <RefreshIcon />, command: true },
    { id: "create-episode-video", label: "创建视频制作清单", icon: <MonitorPlay size={17} />, command: true },
    { id: "export-episode-final", label: "导出成片包", icon: <Download size={17} />, command: true },
    { id: "generate-ai-edit", label: "生成剪辑方案", icon: <Scissors size={17} />, command: true },
    { id: "analyze-episode-rhythm", label: "分析本集节奏", icon: <Layers size={17} />, command: true },
    { id: "optimize-timeline", label: "优化时间线", icon: <Settings size={17} />, command: true },
    { id: "run-ep01-continuity", label: "检查第一集连续性", icon: <ShieldCheck size={17} />, command: true },
    { id: "generate-character-assets", label: "生成角色资产", icon: <UserRound size={17} />, command: true },
    { id: "generate-chiting01-assets", label: "生成赤霆01资产", icon: <ShieldCheck size={17} />, command: true },
    { id: "generate-creature-assets", label: "生成怪兽资产", icon: <Waves size={17} />, command: true },
    { id: "generate-environment-assets", label: "生成场景资产", icon: <MonitorPlay size={17} />, command: true },
    { id: "generate-ep01-keyframes", label: "生成EP01关键帧", icon: <Image size={17} />, command: true },
    { id: "generate-ep01-asset-pack", label: "生成EP01资产包", icon: <Database size={17} />, command: true },
    { id: "generate-kling-prompts", label: "生成可灵提示词", icon: <Film size={17} />, command: true }
  ];
  const filtered = useMemo(
    () => commandItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.id.includes(query.toLowerCase())),
    [query]
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [active]);

  return (
    <div className="min-h-screen min-w-[1280px] bg-[#07090c] text-mist">
      <div className="flex min-h-screen">
        <aside className={`border-r border-white/10 bg-[#090d12]/95 transition-all ${collapsed ? "w-[76px]" : "w-[260px]"}`}>
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold text-white">潮汐钢魂</div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-jade/70">Tide Steel Studio</div>
              </div>
            )}
            <button className="btn h-9 w-9 px-0" onClick={() => setCollapsed((value) => !value)} title="Toggle sidebar">
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
          <nav className="grid gap-1 p-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm transition ${active === item.id ? "bg-jade/15 text-jade" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                onClick={() => onChange(item.id)}
                title={item.label}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1017]/85 px-5 backdrop-blur">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>潮汐钢魂</span>
                <span>/</span>
                <span>电影制作</span>
                <span>/</span>
                <span className="text-jade">{activeItem?.label ?? "Dashboard"}</span>
              </div>
              <h1 className="mt-1 text-lg font-semibold text-white">{activeItem?.label ?? "Dashboard"}</h1>
            </div>
            <button className="hidden min-w-[280px] items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-500 transition hover:border-jade/40 md:flex" onClick={() => setCommandOpen(true)}>
              <span className="flex items-center gap-2"><Search size={16} /> 搜索制作内容</span>
              <span className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-[11px]"><Command size={11} /> K</span>
            </button>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section ref={contentRef} className="min-w-0 overflow-y-auto p-5">{children}</section>
            <aside className="hidden border-l border-white/10 bg-[#090d12]/70 p-4 xl:block">{inspector}</aside>
          </div>
        </main>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          <div className="mx-auto mt-24 max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#0d131b] shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search size={18} className="text-jade" />
              <input className="w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="搜索资产、镜头、Prompt、审核..." />
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2">
              {filtered.map((item) => (
                <button key={item.id} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => { item.command ? void runCommand(item.id, onChange) : onChange(item.id as ProductionSection); setCommandOpen(false); }}>
                  {item.icon}
                  <span>{item.label}</span>
                  {item.command && <span className="ml-auto rounded border border-white/10 px-2 py-0.5 text-[11px] text-slate-500">命令</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function runCommand(commandId: string, onChange: (section: ProductionSection) => void) {
  const common = { projectId: "tide-steel-soul", episodeId: "EP01", shotId: "EP01_KF01", assetIds: [] as string[], output: undefined };
  if (commandId === "generate-keyframe") {
    createLocalGenerationBatch(createLocalAssetRecords().slice(0, 1), "generate_single_local_keyframe_asset");
    onChange("aiAssetLibrary");
    return;
  }
  if (commandId === "generate-video-shot") {
    createPausedVideoTask();
    onChange("video");
    return;
  }
  if (commandId === "run-consistency-check") {
    taskQueue.addTask({ ...common, type: "consistency_check", toolId: "mcp_internal", assetIds: ["EP01-KF01"], reviewStatus: "draft", input: { subject: "EP01 asset consistency", registered: true, prompt: "Check EP01 approved visual style." } });
  }
  if (commandId === "review-asset") {
    taskQueue.addTask({ ...common, type: "asset_review", toolId: "mcp_internal", assetIds: ["EP01-KF01"], reviewStatus: "review", input: { approved: false, consistencyPassed: false, assetStatus: "review" } });
  }
  if (commandId === "export-episode") {
    taskQueue.addTask({ ...common, type: "export_episode", toolId: "mcp_internal", reviewStatus: "draft", input: { format: "markdown", package: exportEpisodePackage("EP01").name } });
  }
  if (commandId === "open-mcp-logs") {
    taskQueue.addTask({ ...common, type: "style_check", toolId: "mcp_internal", reviewStatus: "draft", input: { action: "open_mcp_logs" } });
  }
  if (commandId === "open-tool-registry") {
    taskQueue.addTask({ ...common, type: "style_check", toolId: "mcp_internal", reviewStatus: "draft", input: { action: "open_tool_registry" } });
  }
  if (commandId === "generate-director-prompt") {
    taskQueue.addTask({ ...common, type: "prompt_generation", toolId: "director_engine", shotId: "EP01_KF01", reviewStatus: "draft", input: { action: "generate_director_prompt", episodeId: "EP01", shotId: "EP01_KF01" } });
    onChange("directorReview");
    return;
  }
  if (commandId === "generate-production-shot") {
    productionOrchestrator.createProductionShot({ episodeId: "EP01", shotId: "EP01_KF01", directionApproved: true, autoRun: false }).catch(() => undefined);
    onChange("image");
    return;
  }
  if (commandId === "create-episode-production") {
    episodeFactory.createEpisodeProduction("EP01");
    onChange("dashboard");
    return;
  }
  if (commandId === "resume-episode-production") {
    episodeFactory.resumeEpisodeProduction("EP01");
    onChange("dashboard");
    return;
  }
  if (commandId === "retry-failed-shots") {
    episodeFactory.retryFailedShots("EP01");
    onChange("dashboard");
    return;
  }
  if (commandId === "retry-video-task") {
    createPausedVideoTask();
    onChange("video");
    return;
  }
  if (commandId === "create-episode-video") {
    for (let index = 1; index <= 18; index += 1) {
      const shot = `EP01_KF${String(index).padStart(2, "0")}`;
      videoTaskQueue.addTask({
        episode: "EP01",
        shot,
        imageAsset: "missing-approved-image",
        provider: "kling",
        duration: 5,
        status: "waiting_asset"
      });
    }
    onChange("timeline");
    return;
  }
  if (commandId === "export-episode-final") {
    const pack = exportEpisodePackage("EP01");
    taskQueue.addTask({ ...common, type: "export_episode", toolId: "mcp_internal", reviewStatus: "draft", input: { packageId: pack.packageId, packageName: pack.name } });
    onChange("export");
    return;
  }
  if (commandId === "generate-ai-edit") {
    const decision = editorAgent.generateFinalEditDecision("EP01");
    taskQueue.addTask({ ...common, type: "edit_generation", toolId: "editor_agent", reviewStatus: "review", input: { episodeId: "EP01", sourceShotCount: decision.sourceShotCount }, output: { editPlan: decision.editPlan, status: decision.status } });
    onChange("editorReview");
    return;
  }
  if (commandId === "create-trailer") {
    const decision = editorAgent.generateFinalEditDecision("EP01");
    taskQueue.addTask({ ...common, type: "trailer_generation", toolId: "trailer_generator", reviewStatus: "review", input: { episodeId: "EP01", duration: 30 }, output: { trailerPlan: decision.trailerPlan } });
    onChange("editorReview");
    return;
  }
  if (commandId === "analyze-episode-rhythm") {
    const decision = editorAgent.generateFinalEditDecision("EP01");
    taskQueue.addTask({ ...common, type: "rhythm_analysis", toolId: "rhythm_analyzer", reviewStatus: "draft", input: { episodeId: "EP01", shots: decision.sourceShotCount }, output: { rhythm: decision.rhythm } });
    onChange("editorReview");
    return;
  }
  if (commandId === "optimize-timeline") {
    const decision = editorAgent.generateFinalEditDecision("EP01");
    taskQueue.addTask({ ...common, type: "timeline_optimization", toolId: "editor_agent", reviewStatus: "review", input: { episodeId: "EP01", protectedOriginalAssets: true }, output: { decisions: decision.editPlan.decisions } });
    onChange("timeline");
    return;
  }
  if (commandId === "export-trailer") {
    const decision = editorAgent.generateFinalEditDecision("EP01");
    taskQueue.addTask({ ...common, type: "trailer_export", toolId: "mcp_internal", reviewStatus: "draft", input: { episodeId: "EP01" }, output: { trailerPlan: decision.trailerPlan } });
    onChange("export");
    return;
  }
  if (commandId === "open-producer-meeting") {
    const report = producerManagementAgent.analyzeEpisode("EP01");
    taskQueue.addTask({ ...common, type: "producer_meeting", toolId: "producer_agent", reviewStatus: "draft", input: { episodeId: "EP01" }, output: { meeting: report.meeting } });
    onChange("producerDashboard");
    return;
  }
  if (commandId === "analyze-production-risk") {
    const report = producerManagementAgent.analyzeEpisode("EP01");
    taskQueue.addTask({ ...common, type: "risk_analysis", toolId: "producer_agent", reviewStatus: "draft", input: { episodeId: "EP01" }, output: { risk: report.risk } });
    onChange("producerDashboard");
    return;
  }
  if (commandId === "generate-budget-report") {
    const report = producerManagementAgent.analyzeEpisode("EP01");
    taskQueue.addTask({ ...common, type: "budget_report", toolId: "producer_agent", reviewStatus: "draft", input: { episodeId: "EP01" }, output: { budget: report.budget } });
    onChange("producerDashboard");
    return;
  }
  if (commandId === "optimize-production") {
    const report = producerManagementAgent.analyzeEpisode("EP01");
    taskQueue.addTask({ ...common, type: "production_optimization", toolId: "producer_agent", reviewStatus: "review", input: { episodeId: "EP01", protectedAssets: true, protectedTimeline: true }, output: { decision: report.decision, resources: report.resources } });
    onChange("producerDashboard");
    return;
  }
  if (commandId === "create-weekly-report") {
    const report = producerManagementAgent.analyzeEpisode("EP01");
    taskQueue.addTask({ ...common, type: "weekly_report", toolId: "producer_agent", reviewStatus: "draft", input: { episodeId: "EP01" }, output: { producerReport: report } });
    onChange("producerDashboard");
    return;
  }
  if (commandId === "create-ep01-keyframe-tasks") {
    const tasks = createEP01KeyframeTasks();
    taskQueue.addTask({ ...common, type: "style_check", toolId: "ep01_production", reviewStatus: "draft", input: { action: "create_ep01_keyframe_tasks", count: tasks.length } });
    onChange("ep01Production");
    return;
  }
  if (commandId === "create-ep01-video-tasks") {
    const tasks = createEP01VideoTasks();
    taskQueue.addTask({ ...common, type: "style_check", toolId: "ep01_production", reviewStatus: "draft", input: { action: "create_ep01_video_tasks", count: tasks.length } });
    onChange("ep01Production");
    return;
  }
  if (commandId === "run-ep01-continuity") {
    const report = runEP01ContinuityCheck();
    taskQueue.addTask({ ...common, type: "consistency_check", toolId: "ep01_continuity_checker", reviewStatus: "draft", input: { episodeId: "EP01" }, output: { report } });
    onChange("ep01FinalReview");
    return;
  }
  if (commandId === "open-ep01-final-review") {
    const manifest = buildEP01FinalPackageManifest();
    taskQueue.addTask({ ...common, type: "export_episode", toolId: "ep01_final_package", reviewStatus: "draft", input: { episodeId: "EP01", packageName: manifest.packageName }, output: { finalReview: manifest.finalReview } });
    onChange("ep01FinalReview");
    return;
  }
  if (commandId === "generate-ep01-visual-batch-01") {
    createLocalGenerationBatch(createLocalAssetRecords().slice(0, 4), "generate_ep01_local_visual_batch_01");
    onChange("aiAssetLibrary");
    return;
  }
  if (commandId === "generate-character-assets") {
    createLocalGenerationBatch(filterLocalAssets("characters"), "generate_local_character_assets");
    onChange("aiAssetLibrary");
    return;
  }
  if (commandId === "generate-chiting01-assets" || commandId === "generate-mecha-assets") {
    createLocalGenerationBatch(filterLocalAssets("mechas"), "generate_local_mecha_assets");
    onChange("aiAssetLibrary");
    return;
  }
  if (commandId === "generate-creature-assets") {
    createLocalGenerationBatch(filterLocalAssets("creatures"), "generate_local_creature_assets");
    onChange("aiAssetLibrary");
    return;
  }
  if (commandId === "generate-environment-assets") {
    createLocalGenerationBatch(filterLocalAssets("environment"), "generate_local_environment_assets");
    onChange("aiAssetLibrary");
    return;
  }
  if (commandId === "generate-ep01-keyframes") {
    createEP01KeyframeTaskBatch();
    onChange("tideSteelStudio");
    return;
  }
  if (commandId === "generate-ep01-asset-pack") {
    createLocalGenerationBatch(createLocalAssetRecords(), "generate_ep01_asset_pack");
    createEP01KeyframeTaskBatch();
    onChange("tideSteelStudio");
    return;
  }
  if (commandId === "generate-tide-steel-assets") {
    createLocalGenerationBatch(createLocalAssetRecords(), "generate_tide_steel_assets");
    onChange("aiAssetLibrary");
    return;
  }
  if (commandId === "generate-kling-prompts") {
    const assetPrompts = listFactoryLibrary(assetGenerationQueue.list()).map((asset) => ({ assetId: asset.assetId, prompt: generateKlingPromptFromAsset(asset) }));
    const keyframePrompts = buildAllEP01KlingPrompts();
    taskQueue.addTask({ ...common, type: "prompt_generation", toolId: "local_kling_prompt_generator", reviewStatus: "draft", input: { source: "EP01 keyframe manifest and local asset library", count: assetPrompts.length + keyframePrompts.length, videoApiDisabled: true }, output: { assetPrompts, keyframePrompts } });
    onChange("tideSteelStudio");
    return;
  }
  onChange("mcp");
}

function filterLocalAssets(category: LocalAssetCategory) {
  return createLocalAssetRecords().filter((asset) => asset.category === category);
}

function createLocalGenerationBatch(records: LocalAssetRecord[], action: string) {
  records.forEach((asset) => {
    assetGenerationQueue.add({
      type: categoryToTaskType(asset.category),
      assetName: asset.name,
      variant: asset.version,
      prompt: asset.prompt,
      version: asset.version,
      status: "draft",
      outputAssetPath: `projects/tide-steel-soul/assets/${asset.relativePath}`
    });
  });

  taskQueue.addTask({
    projectId: "tide-steel-soul",
    episodeId: "EP01",
    shotId: "LOCAL_ASSET_FACTORY",
    assetIds: [],
    type: "image_generation",
    toolId: "local_codex_imagegen",
    model: "Codex Image Generation",
    reviewStatus: "draft",
    status: "pending",
    input: {
      action,
      workflow: "LOCAL AI ASSET GENERATION WORKFLOW",
      count: records.length,
      targetRoot: "projects/tide-steel-soul/assets",
      assets: records.map((asset) => ({
        name: asset.name,
        category: asset.category,
        target: asset.relativePath,
        prompt: asset.prompt,
        reference: asset.reference
      }))
    }
  });
}

function createEP01KeyframeTaskBatch() {
  const keyframes = getEP01Keyframes();
  keyframes.forEach((keyframe) => {
    assetGenerationQueue.add({
      type: "KEYFRAME",
      assetName: keyframe.title,
      variant: keyframe.id,
      prompt: `${keyframe.shot}: ${keyframe.purpose}`,
      version: "TASK",
      status: "draft",
      outputAssetPath: `projects/tide-steel-soul/assets/keyframes/ep01/${keyframe.shot}.png`
    });
  });

  taskQueue.addTask({
    projectId: "tide-steel-soul",
    episodeId: "EP01",
    shotId: "EP01_ALL_KEYFRAMES",
    assetIds: keyframes.map((keyframe) => keyframe.shot),
    type: "image_generation",
    toolId: "local_codex_imagegen",
    model: "Codex Image Generation",
    reviewStatus: "draft",
    status: "pending",
    input: {
      action: "generate_ep01_keyframes",
      workflow: "LOCAL AI ASSET GENERATION WORKFLOW",
      count: keyframes.length,
      rule: "Create tasks only. A keyframe is generated only when a real PNG is saved and imported.",
      keyframes
    }
  });
}

function categoryToTaskType(category: LocalAssetCategory): AssetTaskType {
  if (category === "characters") return "CHARACTER";
  if (category === "mechas") return "MECHA";
  if (category === "creatures") return "CREATURE";
  if (category === "environment") return "ENVIRONMENT";
  return "PROP";
}

function createPausedVideoTask() {
  taskQueue.addTask({
    projectId: "tide-steel-soul",
    episodeId: "EP01",
    shotId: "EP01_KF01",
    assetIds: [],
    type: "video_generation",
    toolId: "manual_kling_workflow",
    model: "Manual Kling",
    status: "pending",
    reviewStatus: "draft",
    input: {
      action: "video_generation_paused",
      reason: "Phase 13 LOCAL AI ASSET GENERATION WORKFLOW only produces image assets. Kling/Veo API calls are disabled."
    }
  });
}

function PlayCircleIcon() {
  return <MonitorPlay size={17} />;
}

function RefreshIcon() {
  return <Settings size={17} />;
}

function CheckIcon() {
  return <ShieldCheck size={17} />;
}

export function InspectorPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">导演侧栏</div>
        <h2 className="mt-1 text-base font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function ProductionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-white/10 bg-white/[0.035] shadow-soft ${className}`}>{children}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const label = translateStatus(status);
  const normalized = status.toLowerCase();
  const color = normalized.includes("approved") || status === "approved" || label === "已通过"
    ? "border-jade/30 bg-jade/10 text-jade"
    : normalized.includes("review") || label === "审核中"
      ? "border-gold/30 bg-gold/10 text-gold"
      : normalized.includes("rejected") || normalized.includes("deprecated") || label === "已驳回"
        ? "border-red-400/30 bg-red-400/10 text-red-300"
        : "border-slate-500/30 bg-slate-500/10 text-slate-300";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${color}`}>{label}</span>;
}

function translateStatus(status: string) {
  const map: Record<string, string> = {
    approved: "已通过",
    review: "审核中",
    rejected: "已驳回",
    draft: "草稿",
    planned: "规划中",
    planning: "规划中",
    generating: "生成中",
    generated: "已生成",
    completed: "已完成",
    pending: "等待中",
    locked: "锁定",
    local: "本地制作",
    missing: "缺失",
    deprecated: "已弃用",
    ready: "就绪",
    "task_ready": "任务就绪",
    "in-progress": "制作中",
    "not-started": "未开始"
  };
  return map[status] ?? map[status.toLowerCase()] ?? status;
}
