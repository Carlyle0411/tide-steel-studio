import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Clapperboard,
  Command,
  Database,
  Download,
  Film,
  FolderKanban,
  Image,
  Layers,
  MonitorPlay,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Scissors,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wand2,
  Waves
} from "lucide-react";
import type { ProductionSection } from "../types";
import { getIndustrialShots, globalSearch } from "../../../mcp/industrialWorkflow/IndustrialWorkflowData";
import { getMasterAssets } from "../../../mcp/masterAssetLibrary/MasterAssetLibraryData";
import { loadAssetStore, subscribeAssetStore } from "../../../mcp/cloudAssetSync/AssetStoreGateway";
import type { ManualAssetStore } from "../../../mcp/manualAssetImport/ManualAssetImport";

type NavEntry = {
  key: string;
  id: ProductionSection;
  label: string;
  helper?: string;
  icon: ReactNode;
};

type NavGroup = {
  title: string;
  entries: NavEntry[];
};

const navGroups: NavGroup[] = [
  {
    title: "核心",
    entries: [
      { key: "dashboard", id: "dashboard", label: "导演工作台", helper: "今日制作与项目状态", icon: <Sparkles size={17} /> },
      { key: "project", id: "tideSteelStudio", label: "项目总览", helper: "三部曲与第一集进度", icon: <Film size={17} /> }
    ]
  },
  {
    title: "故事世界",
    entries: [
      { key: "world", id: "story", label: "世界观", helper: "World Bible", icon: <Layers size={17} /> },
      { key: "script", id: "episode", label: "剧本管理", helper: "章节、Scene、Shot", icon: <Clapperboard size={17} /> },
      { key: "episode-manager", id: "ep01Production", label: "分集管理", helper: "EP01 制作板", icon: <FolderKanban size={17} /> }
    ]
  },
  {
    title: "资产中心",
    entries: [
      { key: "characters", id: "characters", label: "角色", helper: "Character Bible", icon: <UserRound size={17} /> },
      { key: "mechas", id: "mechas", label: "机甲", helper: "Mecha Bible", icon: <ShieldCheck size={17} /> },
      { key: "creatures", id: "creatures", label: "怪兽", helper: "Creature Bible", icon: <Waves size={17} /> },
      { key: "environment", id: "environment", label: "场景视觉", helper: "场景 / 天气 / 灯光 / VFX", icon: <MonitorPlay size={17} /> },
      { key: "props", id: "props", label: "道具", helper: "Props Library", icon: <Box size={17} /> },
      { key: "asset-bible", id: "assetBible", label: "电影资产圣经", helper: "母资产库", icon: <Database size={17} /> }
    ]
  },
  {
    title: "镜头制作",
    entries: [
      { key: "keyframes", id: "image", label: "关键帧", helper: "Keyframe", icon: <Image size={17} /> },
      { key: "storyboard", id: "storyboard", label: "Storyboard", helper: "分镜设计", icon: <FolderKanban size={17} /> },
      { key: "camera", id: "shotLibrary", label: "Camera设计", helper: "镜头库与运镜", icon: <Clapperboard size={17} /> }
    ]
  },
  {
    title: "视频制作",
    entries: [
      { key: "kling", id: "klingPromptLibrary", label: "Kling Prompt", helper: "可灵提示词", icon: <Wand2 size={17} /> },
      { key: "video", id: "video", label: "视频片段", helper: "首帧、尾帧、时长", icon: <MonitorPlay size={17} /> },
      { key: "video-version", id: "visualReview", label: "视频版本管理", helper: "Review 与版本", icon: <Film size={17} /> }
    ]
  },
  {
    title: "后期",
    entries: [
      { key: "timeline", id: "timeline", label: "时间线", helper: "Timeline", icon: <Scissors size={17} /> },
      { key: "export", id: "export", label: "成片输出", helper: "Final Package", icon: <Download size={17} /> },
      { key: "settings", id: "settings", label: "系统设置", helper: "本地工作台", icon: <Settings size={17} /> }
    ]
  }
];

const hiddenCommands: Array<{ id: ProductionSection; label: string; helper: string; icon: ReactNode }> = [
  { id: "generationQueue", label: "导入工作区", helper: "手动上传图片、复制 Prompt、管理 Version，不自动生成图片", icon: <Wand2 size={16} /> },
  { id: "assets", label: "独立资产库", helper: "低频管理入口，主流程由资产中心替代", icon: <Database size={16} /> },
  { id: "prompt", label: "Prompt库", helper: "低频维护入口，主流程由 Kling Prompt 与镜头页承载", icon: <Wand2 size={16} /> },
  { id: "review", label: "制作日志", helper: "历史记录与导入导出日志", icon: <Clapperboard size={16} /> },
  { id: "reuseCenter", label: "素材复用中心", helper: "查看引用次数与复用关系", icon: <Database size={16} /> },
  { id: "gptPromptLibrary", label: "GPT Image Prompt库", helper: "图片 Prompt 的低频维护入口", icon: <Image size={16} /> }
];

const flatNavItems = navGroups.flatMap((group) => group.entries);

export function Phase19ProductionShell({
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
  const activeItem = flatNavItems.find((item) => item.id === active) ?? hiddenCommands.find((item) => item.id === active);
  const searchResults = useMemo(() => globalSearch(query), [query]);
  const commandItems = [...flatNavItems, ...hiddenCommands];
  const commandResults = commandItems.filter((item) => [item.label, item.helper, item.id].join(" ").toLowerCase().includes(query.toLowerCase()));

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
        <aside className={`border-r border-white/10 bg-[#090d12]/95 transition-all ${collapsed ? "w-[78px]" : "w-[292px]"}`}>
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            {!collapsed && (
              <div>
                <div className="text-base font-semibold tracking-wide text-white">潮汐钢魂</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-jade/70">Tide Steel Studio</div>
              </div>
            )}
            <button className="btn h-9 w-9 px-0" onClick={() => setCollapsed((value) => !value)} title="折叠侧栏">
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          <nav className="space-y-4 overflow-y-auto p-3">
            {navGroups.map((group) => (
              <div key={group.title}>
                {!collapsed && <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.22em] text-slate-600">{group.title}</div>}
                <div className="grid gap-1">
                  {group.entries.map((item) => {
                    const selected = active === item.id || (item.id === "environment" && ["environment"].includes(active));
                    return (
                      <button
                        key={item.key}
                        className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                          selected ? "bg-jade/15 text-jade" : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                        onClick={() => onChange(item.id)}
                        title={item.label}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        {!collapsed && (
                          <span className="min-w-0">
                            <span className="block truncate">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block truncate text-[11px] text-slate-600">{item.helper}</span>}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                <span className="text-jade">{activeItem?.label ?? "导演工作台"}</span>
              </div>
              <h1 className="mt-1 text-lg font-semibold text-white">{activeItem?.label ?? "导演工作台"}</h1>
            </div>
            <button className="hidden min-w-[340px] items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-500 transition hover:border-jade/40 md:flex" onClick={() => setCommandOpen(true)}>
              <span className="flex items-center gap-2"><Search size={16} /> 全局搜索 / Command Center</span>
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
          <div className="mx-auto mt-20 max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#0d131b] shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search size={18} className="text-jade" />
              <input className="w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="搜索角色、机甲、怪兽、场景、Shot、Prompt、视频、字幕、文件名、标签..." />
            </div>
            <div className="grid max-h-[520px] gap-3 overflow-y-auto p-3 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">工作台入口</div>
                {commandResults.map((item) => (
                  <button key={`${item.id}-${item.label}`} className="mb-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => { onChange(item.id); setCommandOpen(false); }}>
                    {item.icon}
                    <span>
                      <span className="block">{item.label}</span>
                      <span className="block text-xs text-slate-500">{item.helper}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">全局搜索结果</div>
                {searchResults.slice(0, 10).map((item) => (
                  <button key={item.id} className="mb-2 grid w-full grid-cols-[72px_minmax(0,1fr)_84px] gap-3 rounded-md border border-white/10 bg-black/20 p-2 text-left hover:border-jade/40" onClick={() => { onChange(item.type === "Shot" ? "storyboard" : item.type.includes("Prompt") ? "klingPromptLibrary" : "assetBible"); setCommandOpen(false); }}>
                    <div className="aspect-video rounded bg-white/5">{item.thumbnail && <img src={item.thumbnail} alt={item.name} className="h-full w-full rounded object-cover" />}</div>
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white">{item.name}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{item.episode} / {item.shot || item.id}</div>
                    </div>
                    <div className="text-right text-xs text-jade">{item.type}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Phase19Inspector({ active }: { active: ProductionSection }) {
  const assets = useMemo(() => getMasterAssets(), []);
  const [store, setStore] = useState<ManualAssetStore>({});

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const next = await loadAssetStore();
        if (alive) setStore(next);
      } catch {
        if (alive) setStore({});
      }
    };
    void refresh();
    const unsubscribe = subscribeAssetStore(() => void refresh());
    return () => { alive = false; unsubscribe(); };
  }, []);

  const uploaded = assets.filter((asset) => (store[asset.id]?.length ?? 0) > 0).length;
  const review = assets.filter((asset) => store[asset.id]?.some((version) => version.status === "REVIEW")).length;
  const master = assets.filter((asset) => store[asset.id]?.some((version) => version.status === "MASTER_REFERENCE")).length;
  const versions = Object.values(store).reduce((total, items) => total + items.length, 0);
  return (
    <div className="space-y-4">
      <ProductionMiniCard title="制作状态">
        <div className="space-y-2 text-sm text-slate-300">
          <Row label="当前页面" value={active} />
          <Row label="母资产" value={assets.length} />
          <Row label="已上传" value={uploaded} />
          <Row label="Version" value={versions} />
          <Row label="待审核" value={review} />
          <Row label="Master Reference" value={master} />
          <Row label="EP01 Shot" value={getIndustrialShots().length} />
        </div>
      </ProductionMiniCard>
      <ProductionMiniCard title="当前任务">
        <p className="text-sm leading-6 text-slate-400">{review > 0 ? `审核 ${review} 项已上传素材，确认后设为 Master Reference。` : uploaded < assets.length ? `继续生产并上传 ${assets.length - uploaded} 项缺失母资产。` : "母资产已上传完成，可以进入关键帧与Storyboard制作。"}</p>
      </ProductionMiniCard>
      <ProductionMiniCard title="当前工作流">
        <p className="text-sm leading-6 text-slate-400">故事世界 → 资产中心 → 镜头制作 → 视频制作 → 时间线 → 成片输出。所有图片仍必须来自真实 PNG，不能伪造完成状态。</p>
      </ProductionMiniCard>
    </div>
  );
}

function ProductionMiniCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return <div className="flex items-center justify-between gap-3"><span>{label}</span><span className="text-jade">{value}</span></div>;
}
