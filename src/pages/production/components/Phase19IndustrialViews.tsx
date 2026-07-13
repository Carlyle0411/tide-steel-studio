import { useEffect, useMemo, useState } from "react";
import { Archive, Copy, Download, Eye, Film, GitBranch, Heart, Image, Layers, Link2, Lock, MoreHorizontal, Search, Star, Tags, Unlock, Video } from "lucide-react";
import type { ProductionSection } from "../types";
import {
  getIndustrialAssets,
  getIndustrialCharacters,
  getIndustrialLogs,
  getIndustrialPrompts,
  getIndustrialRelationships,
  getIndustrialScenes,
  getIndustrialShots,
  getIndustrialTags,
  getIndustrialTimeline,
  getWorkflowStats,
  globalSearch,
  industrialAssetUrl,
  statusTone,
  type IndustrialAsset,
  type IndustrialPrompt,
  type IndustrialShot
} from "../../../mcp/industrialWorkflow/IndustrialWorkflowData";
import { getAssetBibleShots, getAssetBibleVideoClips } from "../../../mcp/assetBible/AssetBibleData";
import { trailer90Shots } from "../../../mcp/trailer/Trailer90StudioData";
import { getMasterAssets } from "../../../mcp/masterAssetLibrary/MasterAssetLibraryData";
import { loadAssetStore, subscribeAssetStore } from "../../../mcp/cloudAssetSync/AssetStoreGateway";
import type { ManualAssetStore } from "../../../mcp/manualAssetImport/ManualAssetImport";
import { ProductionCard } from "./ProductionShell";
import { TideDefense3DScene } from "./TideDefense3DScene";

type Navigate = (section: ProductionSection) => void;

export function Phase19DirectorDashboard({ navigate }: { navigate: Navigate }) {
  const assets = useMemo(() => getMasterAssets(), []);
  const episodeShots = getIndustrialShots();
  const [assetStore, setAssetStore] = useState<ManualAssetStore>({});

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const store = await loadAssetStore();
        if (alive) setAssetStore(store);
      } catch {
        if (alive) setAssetStore({});
      }
    };
    void refresh();
    const unsubscribe = subscribeAssetStore(() => void refresh());
    return () => { alive = false; unsubscribe(); };
  }, []);

  const versions = Object.values(assetStore).flat();
  const uploadedAssets = assets.filter((asset) => (assetStore[asset.id]?.length ?? 0) > 0).length;
  const masterAssets = assets.filter((asset) => assetStore[asset.id]?.some((version) => version.status === "MASTER_REFERENCE")).length;
  const reviewAssets = assets.filter((asset) => assetStore[asset.id]?.some((version) => version.status === "REVIEW")).length;
  const missingAssets = assets.length - uploadedAssets;
  const progress = assets.length ? Math.round((masterAssets / assets.length) * 100) : 0;
  const recent = [...versions].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 6);
  const priorityQueue = assets.filter((asset) => !(assetStore[asset.id]?.length)).slice(0, 6);
  const flow: Array<{ label: string; section: ProductionSection }> = [
    { label: "世界观", section: "story" }, { label: "剧本", section: "episode" }, { label: "角色", section: "characters" },
    { label: "机甲", section: "mechas" }, { label: "怪兽", section: "creatures" }, { label: "场景", section: "environment" },
    { label: "资产", section: "assetBible" }, { label: "关键帧", section: "image" }, { label: "分镜", section: "storyboard" },
    { label: "可灵视频", section: "klingPromptLibrary" }, { label: "时间线", section: "timeline" }, { label: "成片输出", section: "export" }
  ];
  return (
    <Page title="导演工作台" subtitle="《潮汐钢魂》当前生产状态。统计来自母资产库、上传版本、EP01与90秒预告片。">
      <section className="relative mb-6 overflow-hidden border-y border-white/10 bg-[#071018]">
        <TideDefense3DScene />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,24,.84),rgba(7,16,24,.22)_52%,rgba(7,16,24,.08))]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071018] to-transparent" />
        <div className="pointer-events-none absolute left-6 top-6 max-w-md">
          <div className="text-xs uppercase tracking-[.34em] text-jade">2042 Hangzhou Bay / Live Scene</div>
          <div className="mt-3 text-2xl font-semibold text-white">海洋防线仍在运转</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">拖拽观察海防墙、赤霆工程机体与潮门压力边界。这里不是宣传图，是工作台的实时三维尺度参考。</p>
        </div>
        <div className="pointer-events-none absolute bottom-5 right-6 flex gap-3 text-[11px] uppercase tracking-[.16em] text-slate-300"><span>拖拽旋转</span><span className="text-jade">滚轮缩放</span></div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="母资产完成率" value={`${progress}%`} />
        <Metric label="Master Reference" value={`${masterAssets} / ${assets.length}`} />
        <Metric label="已上传资产" value={`${uploadedAssets} 项 / ${versions.length} 个Version`} />
        <Metric label="待审核" value={`${reviewAssets} 项`} />
        <Metric label="待上传" value={`${missingAssets} 项`} />
        <Metric label="EP01镜头" value={`${episodeShots.length} Shot`} />
        <Metric label="90秒预告片" value={`${trailer90Shots.length} Shot`} />
        <Metric label="项目状态" value={reviewAssets > 0 ? "等待资产审核" : missingAssets > 0 ? "母资产生产中" : "可进入镜头制作"} />
      </div>

      <ProductionCard className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Film Workflow</div>
            <h2 className="mt-1 text-lg font-semibold text-white">电影制作流程</h2>
          </div>
          <button className="btn h-9" onClick={() => navigate("assets")}><Image size={15} /> 打开资产库</button>
        </div>
        <div className="grid gap-3 md:grid-cols-6">
          {flow.map((item, index) => (
            <button key={item.label} className="rounded-md border border-white/10 bg-black/20 p-3 text-left transition hover:border-jade/50 hover:bg-jade/5" onClick={() => navigate(item.section)}>
              <div className="font-mono text-[11px] text-jade">{String(index + 1).padStart(2, "0")}</div>
              <div className="mt-1 text-sm font-semibold text-white">{item.label}</div>
              {index < flow.length - 1 && <div className="mt-3 h-px bg-gradient-to-r from-jade/50 to-transparent" />}
            </button>
          ))}
        </div>
      </ProductionCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <ProductionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">当前优先生产</h3>
              <p className="mt-1 text-xs text-slate-500">尚未上传任何Version的母资产，点击直接进入对应卡片所在资产库。</p>
            </div>
            <button className="btn h-9" onClick={() => navigate("assetBible")}>打开母资产库</button>
          </div>
          <div className="mt-3 space-y-3">
            {priorityQueue.map((asset) => (
              <button key={asset.id} className="flex w-full items-center justify-between gap-3 rounded border border-white/10 bg-white/[0.03] p-3 text-left text-sm hover:border-jade/40" onClick={() => navigate(categoryToSection(asset.category))}>
                <span>
                  <span className="block text-white">{asset.name}</span>
                  <span className="mt-1 block font-mono text-[10px] text-slate-500">{asset.id}</span>
                </span>
                <Status label="Prompt Ready" />
              </button>
            ))}
            {!priorityQueue.length && <div className="rounded border border-jade/30 bg-jade/10 p-3 text-sm text-jade">全部母资产均已上传版本。</div>}
          </div>
        </ProductionCard>
        <ProductionCard className="p-4">
          <h3 className="text-sm font-semibold text-white">最近上传</h3>
          <div className="mt-3 space-y-3">
            {recent.map((version) => (
              <div key={`${version.metadata.asset_id}-${version.versionId}`} className="rounded border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-white">{version.metadata.asset_id}</span>
                  <Status label={version.status} />
                </div>
                <div className="mt-1 text-xs text-slate-500">{version.versionId} · {new Date(version.uploadedAt).toLocaleString("zh-CN")}</div>
              </div>
            ))}
            {!recent.length && <div className="rounded border border-white/10 p-3 text-xs leading-5 text-slate-500">尚未上传素材。进入母资产库复制Prompt并导入首个版本。</div>}
          </div>
        </ProductionCard>
      </div>
    </Page>
  );
}

function categoryToSection(category: string): ProductionSection {
  if (category === "人物") return "characters";
  if (category === "机甲") return "mechas";
  if (category === "怪兽") return "creatures";
  if (category === "场景") return "environment";
  if (category === "道具") return "props";
  return "assetBible";
}

export function Phase19ProjectOverview({ navigate }: { navigate: Navigate }) {
  const stats = getWorkflowStats();
  return (
    <Page title="项目总览" subtitle="潮汐钢魂本地电影项目中心。">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="剧集数量" value="12 / 第一部" />
        <Metric label="人物数量" value={getIndustrialCharacters().length} />
        <Metric label="场景数量" value={getIndustrialScenes().length} />
        <Metric label="素材数量" value={stats.assets} />
        <Metric label="Prompt数量" value={stats.prompts} />
        <Metric label="制作进度" value="EP01 视觉生产" />
      </div>
      <ProductionCard className="p-5">
        <h2 className="text-lg font-semibold text-white">项目介绍</h2>
        <textarea className="mt-4 min-h-48 w-full resize-y rounded-md border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-300 outline-none" defaultValue={"《潮汐钢魂》是一套连续章节式 AI 科幻电影系列。当前工作台只服务本地个人制作：世界观、剧本、资产、关键帧、Storyboard、可灵提示词、Timeline 与成片输出全部在同一套工业索引中互相关联。"} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn" onClick={() => navigate("story")}>进入世界观</button>
          <button className="btn" onClick={() => navigate("storyboard")}>进入Storyboard</button>
          <button className="btn" onClick={() => navigate("timeline")}>进入Timeline</button>
        </div>
      </ProductionCard>
    </Page>
  );
}

export function Phase19WorldBible() {
  const sections = ["世界历史", "时间线", "科技树", "阵营", "组织", "国家", "城市", "地图", "名词解释", "术语", "图片参考"];
  return (
    <Page title="世界观" subtitle="World Bible，可编辑 Markdown 工作区。">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ProductionCard className="p-3">
          {sections.map((item) => <button key={item} className="mb-2 w-full rounded border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:border-jade/50">{item}</button>)}
        </ProductionCard>
        <textarea className="min-h-[560px] rounded-md border border-white/10 bg-black/25 p-5 font-mono text-sm leading-7 text-slate-300 outline-none" defaultValue={"# 潮汐钢魂 World Bible\n\n## 世界历史\n2042 年后，海洋异常进入长期周期。人类在杭州湾建立深蓝基地与海洋防线。\n\n## 规则\n潮门不是传送门。潮兽不是传统敌人。赤霆不是救世主。\n\n## 制作原则\n每一次世界观信息都必须通过角色行动被观众发现。"} />
      </div>
    </Page>
  );
}

export function Phase19ScriptManager({ navigate }: { navigate: Navigate }) {
  const shots = getIndustrialShots();
  const [project, setProject] = useState<"episode" | "trailer">("trailer");
  return (
    <Page title="剧本管理" subtitle="剧集、Scene、Shot、对白、旁白、镜头说明和素材引用。">
      <ProductionCard className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap gap-2">
          <button className={`btn h-10 ${project === "trailer" ? "border-jade bg-jade/10 text-jade" : ""}`} onClick={() => setProject("trailer")}>90秒概念预告片</button>
          <button className={`btn h-10 ${project === "episode" ? "border-jade bg-jade/10 text-jade" : ""}`} onClick={() => setProject("episode")}>第一部《赤霆纪元》</button>
        </div>
        <div className="text-xs text-slate-500">{project === "trailer" ? "20 Shot / 90秒 / 10个首尾帧" : `${shots.length} Shot / 第一集`}</div>
      </ProductionCard>
      <div className="grid gap-4">
        {project === "trailer" && trailer90Shots.map((shot) => (
          <ProductionCard key={shot.id} className="grid gap-4 p-4 xl:grid-cols-[170px_minmax(0,1fr)_220px]">
            <div>
              <div className="font-mono text-jade">{shot.id}</div>
              <div className="mt-1 text-sm font-semibold text-white">{shot.title}</div>
              <div className="mt-2 text-xs text-slate-500">{shot.time} · {shot.mode}</div>
            </div>
            <div className="space-y-3 text-sm leading-6">
              <div><span className="text-slate-500">剧情作用：</span><span className="text-slate-300">{shot.purpose}</span></div>
              <div className="rounded border border-jade/20 bg-jade/[0.04] p-3"><span className="text-jade">关键帧 Prompt：</span><span className="text-slate-200">{shot.imagePrompt}</span></div>
              <div><span className="text-slate-500">对白/字幕：</span><span className="text-slate-300">{shot.dialogue}</span></div>
              <div><span className="text-slate-500">声音：</span><span className="text-slate-300">{shot.sound}</span></div>
            </div>
            <div className="space-y-3">
              <div className="rounded border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-400">
                <div className="mb-1 text-slate-500">引用母资产</div>
                {shot.assets.join(" / ")}
              </div>
              <button className="btn h-10 w-full" onClick={() => navigate("storyboard")}>打开Storyboard</button>
            </div>
          </ProductionCard>
        ))}
        {project === "episode" && shots.map((shot) => (
          <ProductionCard key={shot.id} className="grid gap-4 p-4 lg:grid-cols-[160px_minmax(0,1fr)_180px]">
            <div>
              <div className="font-mono text-jade">{shot.shotId}</div>
              <Status label={shot.status} />
            </div>
            <textarea className="min-h-28 rounded border border-white/10 bg-black/25 p-3 text-sm leading-6 text-slate-300 outline-none" defaultValue={`镜头说明：${shot.description}\n对白：待写\n旁白：无\n图片引用：${shot.linkedAssets.join(", ") || "待绑定"}`} />
            <button className="btn h-10 self-start" onClick={() => navigate("storyboard")}>打开Storyboard</button>
          </ProductionCard>
        ))}
      </div>
    </Page>
  );
}

export function Phase19EntityLibrary({ kind, navigate }: { kind: "characters" | "mechas" | "creatures" | "environment" | "props"; navigate: Navigate }) {
  const assets = getIndustrialAssets().filter((asset) => categoryMatch(kind, asset.category));
  const title = { characters: "角色设定", mechas: "机甲设定", creatures: "怪兽设定", environment: "场景设定", props: "道具设定" }[kind];
  return (
    <Page title={title} subtitle="资料、图片、视频、Prompt 与出场镜头集中管理。">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => <AssetCard key={asset.id} asset={asset} onOpen={() => navigate("assets")} />)}
        {!assets.length && <Empty title="当前分类暂无本地图片" body="可以在资产库中导入或复用已有素材，再回到这里建立资料页。" />}
      </div>
    </Page>
  );
}

export function Phase19AssetLibrary({ navigate }: { navigate: Navigate }) {
  const allAssets = getIndustrialAssets();
  const tags = getIndustrialTags();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [mode, setMode] = useState<"grid" | "list" | "waterfall">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(allAssets.filter((asset) => asset.favorite).map((asset) => asset.id)));
  const [detail, setDetail] = useState<IndustrialAsset | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; asset: IndustrialAsset } | null>(null);
  const assets = allAssets.filter((asset) => {
    const text = [asset.id, asset.name, asset.type, asset.prompt, asset.tags.join(" ")].join(" ").toLowerCase();
    const tagOk = activeTag === "全部" || asset.tags.includes(activeTag);
    return tagOk && text.includes(query.toLowerCase());
  });
  return (
    <Page title="资产库" subtitle="图片模式、列表模式、瀑布流、标签筛选、批量操作、Version 管理、引用次数与右键菜单。">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <ProductionCard className="p-4">
            <div className="flex flex-wrap gap-3">
              <input className="field h-10 min-w-64 flex-1" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索资产、文件名、标签、Prompt..." />
              {(["grid", "list", "waterfall"] as const).map((item) => <button key={item} className="btn h-10" onClick={() => setMode(item)}>{item === "grid" ? "图片模式" : item === "list" ? "列表模式" : "瀑布流"}</button>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["全部", ...tags.slice(0, 16).map((tag) => tag.name)].map((tag) => (
                <button key={tag} className={`rounded-full border px-3 py-1 text-xs ${activeTag === tag ? "border-jade bg-jade/15 text-jade" : "border-white/10 text-slate-400"}`} onClick={() => setActiveTag(tag)}>{tag}</button>
              ))}
            </div>
          </ProductionCard>
          {selected.length > 0 && <BatchToolbar count={selected.length} onClear={() => setSelected([])} />}
          <div className={mode === "list" ? "grid gap-2" : mode === "waterfall" ? "columns-1 gap-4 md:columns-2 xl:columns-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
            {assets.map((asset, index) => (
              <div key={asset.id} className={mode === "waterfall" ? "mb-4 break-inside-avoid" : ""} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", asset.id)} onContextMenu={(event) => { event.preventDefault(); setMenu({ x: event.clientX, y: event.clientY, asset }); }}>
                <AssetCard
                  asset={asset}
                  tall={mode === "waterfall" && index % 3 === 0}
                  selected={selected.includes(asset.id)}
                  favorite={favoriteIds.has(asset.id)}
                  onSelect={() => setSelected((value) => value.includes(asset.id) ? value.filter((id) => id !== asset.id) : [...value, asset.id])}
                  onFavorite={() => setFavoriteIds((value) => toggleSet(value, asset.id))}
                  onOpen={() => setDetail(asset)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <AssetInspector asset={detail ?? assets[0]} navigate={navigate} />
          <TagManager />
        </div>
      </div>
      {menu && <ContextMenu x={menu.x} y={menu.y} asset={menu.asset} onClose={() => setMenu(null)} onOpen={() => setDetail(menu.asset)} />}
    </Page>
  );
}

export function Phase19Keyframes({ navigate }: { navigate: Navigate }) {
  const shots = getIndustrialShots();
  return (
    <Page title="关键帧" subtitle="每张关键帧绑定剧情作用、剧本、角色、机甲、场景、视频 Prompt 与完成状态。">
      <div className="grid gap-4">
        {shots.map((shot) => (
          <ProductionCard key={shot.id} className="grid gap-4 p-4 lg:grid-cols-[130px_minmax(0,1fr)_260px]">
            <div>
              <div className="font-mono text-lg text-jade">{shot.shotId.replace("EP01_", "")}</div>
              <Status label={shot.status} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">《{shot.name}》</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">作用：{shot.description}</p>
              <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
                <Info label="角色" value={joinOr(shot.characters)} />
                <Info label="机甲" value={joinOr(shot.mechas)} />
                <Info label="场景" value={joinOr(shot.scenes)} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Info label="对应剧本" value="潮汐钢魂三部曲" />
              <Info label="对应视频Prompt" value={shot.videoPromptId} />
              <button className="btn h-9 w-full" onClick={() => navigate("prompt")}>打开Prompt</button>
            </div>
          </ProductionCard>
        ))}
      </div>
    </Page>
  );
}

export function Phase19Storyboard() {
  const [shots, setShots] = useState(() => getIndustrialShots());
  const [dragId, setDragId] = useState("");
  function move(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = shots.findIndex((shot) => shot.id === dragId);
    const to = shots.findIndex((shot) => shot.id === targetId);
    const next = [...shots];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setShots(next.map((shot, index) => ({ ...shot, order: index + 1, id: `SHOT-EP01-${String(index + 1).padStart(3, "0")}` })));
  }
  return (
    <Page title="分镜设计" subtitle="Storyboard 支持拖动排序、自动更新镜头编号、复制 Shot、拆分 Shot、合并 Shot。">
      <div className="grid gap-4">
        {shots.map((shot, index) => (
          <ProductionCard key={`${shot.id}-${shot.shotId}`} className="grid gap-4 p-4 lg:grid-cols-[140px_minmax(0,1fr)_260px]" draggable onDragStart={() => setDragId(shot.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => move(shot.id)}>
            <div>
              <div className="font-mono text-jade">{`SHOT-EP01-${String(index + 1).padStart(3, "0")}`}</div>
              <div className="mt-2 text-xs text-slate-500">{shot.duration}s / {shot.lens}</div>
              <Status label={shot.review} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{shot.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{shot.description}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                <Info label="景别" value={shot.type} />
                <Info label="运动" value={shot.camera} />
                <Info label="角色" value={joinOr(shot.characters)} />
                <Info label="场景" value={joinOr(shot.scenes)} />
              </div>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              <button className="btn h-8" onClick={() => setShots((value) => [...value, { ...shot, id: `${shot.id}-COPY`, shotId: `${shot.shotId}_COPY`, name: `${shot.name} Copy` }])}>复制Shot</button>
              <button className="btn h-8" onClick={() => setShots((value) => value.flatMap((item) => item.id === shot.id ? [item, { ...item, id: `${item.id}-B`, shotId: `${item.shotId}B`, duration: Math.max(3, Math.floor(item.duration / 2)), name: `${item.name} 拆分` }] : [item]))}>拆分Shot</button>
              <button className="btn h-8" onClick={() => index > 0 && setShots((value) => value.filter((_, i) => i !== index))}>合并Shot</button>
            </div>
          </ProductionCard>
        ))}
      </div>
    </Page>
  );
}

export function Phase19Timeline() {
  const source = getIndustrialTimeline();
  const [zoom, setZoom] = useState(1);
  const [tracks, setTracks] = useState(source.tracks);
  return (
    <Page title="时间线" subtitle="电影 Timeline：缩放、拖动、轨道锁定、轨道隐藏、图片/视频/字幕/BGM/音效/对白轨道。">
      <ProductionCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">缩放 {zoom.toFixed(1)}x</span>
          <button className="btn h-9" onClick={() => setZoom((value) => Math.max(0.6, value - 0.2))}>缩小</button>
          <button className="btn h-9" onClick={() => setZoom((value) => Math.min(2.2, value + 0.2))}>放大</button>
          <span className="ml-auto text-sm text-slate-500">总时长 {source.duration}s</span>
        </div>
      </ProductionCard>
      <div className="space-y-3">
        {tracks.map((track) => (
          <ProductionCard key={track.id} className="p-3" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
            const assetId = event.dataTransfer.getData("text/plain");
            if (!assetId) return;
            setTracks((value) => value.map((item) => item.id === track.id ? { ...item, items: [...item.items, { id: `${track.id}-${assetId}`, shot: assetId, start: source.duration, duration: 5, label: assetId, status: "草稿 Draft" }] } : item));
          }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Film size={16} /> {track.name}</div>
              <div className="flex gap-2">
                <button className="btn h-8 px-2" onClick={() => setTracks((value) => value.map((item) => item.id === track.id ? { ...item, locked: !item.locked } : item))}>{track.locked ? <Lock size={14} /> : <Unlock size={14} />}</button>
                <button className="btn h-8 px-2" onClick={() => setTracks((value) => value.map((item) => item.id === track.id ? { ...item, hidden: !item.hidden } : item))}><Eye size={14} /> {track.hidden ? "显示" : "隐藏"}</button>
              </div>
            </div>
            {!track.hidden && <div className="flex gap-2 overflow-x-auto pb-1" style={{ transformOrigin: "left center" }}>
              {track.items.map((item) => <div key={item.id} className="min-w-32 rounded border border-white/10 bg-jade/10 px-3 py-2 text-xs text-slate-300" style={{ width: `${Math.max(120, item.duration * 18 * zoom)}px` }}>{item.shot}<br />{item.duration}s</div>)}
            </div>}
          </ProductionCard>
        ))}
      </div>
    </Page>
  );
}

export function Phase19PromptCenter() {
  const prompts = getIndustrialPrompts();
  const [category, setCategory] = useState("全部");
  const categories = ["全部", "GPT Image Prompt", "Kling Video Prompt", "摄影Prompt", "角色Prompt", "场景Prompt", "动作Prompt"];
  const filtered = category === "全部" ? prompts : prompts.filter((prompt) => prompt.type.includes(category.replace("Kling Video Prompt", "可灵")));
  return (
    <Page title="Prompt中心" subtitle="GPT Image Prompt、Kling Video Prompt、摄影、角色、场景、动作 Prompt 统一管理。">
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => <button key={item} className={`btn h-9 ${category === item ? "border-jade text-jade" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.slice(0, 24).map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
      </div>
    </Page>
  );
}

export function Phase19VideoPlanning() {
  const clips = getAssetBibleVideoClips().slice(0, 40);
  return (
    <Page title="可灵制作中心" subtitle="只管理首帧、尾帧、视频Prompt、时长、镜头、状态和手动制作的视频，不调用 API。">
      <div className="grid gap-3">
        {clips.map((clip) => (
          <ProductionCard key={clip.id} className="grid gap-3 p-4 lg:grid-cols-[120px_1fr_1fr_140px]">
            <div className="font-mono text-jade">{clip.id}</div>
            <Info label="首帧 / 尾帧" value={`${clip.first_frame} → ${clip.last_frame}`} />
            <Info label="视频Prompt" value={clip.prompt} />
            <Info label="状态" value={clip.status} />
          </ProductionCard>
        ))}
      </div>
    </Page>
  );
}

export function Phase19AssetReference() {
  const relationships = getIndustrialRelationships();
  const assets = getIndustrialAssets();
  return (
    <Page title="素材复用中心" subtitle="显示引用次数、引用镜头、引用剧集、最近使用和关联素材。">
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <ProductionCard className="p-4">
          <h3 className="text-sm font-semibold text-white">可复用素材</h3>
          <div className="mt-3 space-y-2">
            {assets.map((asset) => <div key={asset.id} className="rounded border border-white/10 bg-black/20 p-3 text-sm"><div className="text-white">{asset.chineseName || asset.name}</div><div className="text-xs text-slate-500">引用 {asset.usageCount} 次 / {asset.version}</div></div>)}
          </div>
        </ProductionCard>
        <RelationshipGraph relationships={relationships.slice(0, 80)} />
      </div>
    </Page>
  );
}

export function Phase19ShotLibrary() {
  const shots = getAssetBibleShots().slice(0, 100);
  return (
    <Page title="镜头库" subtitle="100 个可重复使用的镜头模板：推镜、拉镜、升镜、俯拍、跟拍、横移、环绕。">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {shots.map((shot) => <ProductionCard key={shot.id} className="p-4"><div className="font-mono text-jade">{shot.id}</div><h3 className="mt-2 text-sm font-semibold text-white">{shot.name}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{shot.description}</p></ProductionCard>)}
      </div>
    </Page>
  );
}

export function Phase19FinalPackage() {
  const stats = getWorkflowStats();
  const [message, setMessage] = useState("");
  const exportIndex = {
    package: "EP01_FINAL_PACKAGE",
    assets: stats.assets,
    shots: stats.shots,
    prompts: stats.prompts,
    relationships: stats.relationships,
    exportedAt: "2026-07-10"
  };
  return (
    <Page title="成片输出" subtitle="Final Package：图片、视频、字幕、Prompt、工程文件一键整理。">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="图片资产" value={stats.assets} />
        <Metric label="Shot" value={stats.shots} />
        <Metric label="Prompt" value={stats.prompts} />
      </div>
      <ProductionCard className="p-5">
        <h3 className="text-lg font-semibold text-white">EP01_FINAL_PACKAGE</h3>
        <p className="mt-2 text-sm text-slate-400">当前阶段只整理本地工程数据，不调用视频 API，不生成假成片。</p>
        <button className="btn mt-4" onClick={() => { void navigator.clipboard?.writeText(JSON.stringify(exportIndex, null, 2)); setMessage("项目索引已复制，可写入本地交付包。"); }}><Download size={15} /> 导出项目索引</button>
        {message && <div className="mt-3 rounded border border-jade/30 bg-jade/10 p-2 text-sm text-jade">{message}</div>}
      </ProductionCard>
    </Page>
  );
}

export function Phase19ProductionLog() {
  const logs = getIndustrialLogs();
  return (
    <Page title="制作日志" subtitle="自动记录生成图片、修改 Prompt、Review、删除、导入、导出。">
      <div className="grid gap-3">
        {logs.map((log) => <ProductionCard key={log.id} className="p-4"><div className="flex items-center justify-between"><div className="text-white">{log.action}</div><Status label={log.status} /></div><div className="mt-2 text-sm text-slate-500">{log.detail}</div></ProductionCard>)}
      </div>
    </Page>
  );
}

function GlobalSearchPanel({ navigate }: { navigate: Navigate }) {
  const [query, setQuery] = useState("");
  const results = globalSearch(query);
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center gap-3">
        <Search size={18} className="text-jade" />
        <input className="w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="全局搜索：角色、机甲、怪兽、场景、Shot、Prompt、视频、字幕、标签..." />
      </div>
      <div className="mt-4 grid gap-3">
        {results.slice(0, 8).map((item) => (
          <button key={item.id} className="grid grid-cols-[72px_minmax(0,1fr)_90px] gap-3 rounded border border-white/10 bg-black/20 p-2 text-left hover:border-jade/40" onClick={() => navigate(item.type === "Shot" ? "storyboard" : item.type.includes("Prompt") ? "prompt" : "assets")}>
            <div className="aspect-video rounded bg-white/5">{item.thumbnail && <img src={item.thumbnail} alt={item.name} className="h-full w-full rounded object-cover" />}</div>
            <div className="min-w-0">
              <div className="truncate text-sm text-white">{item.name}</div>
              <div className="mt-1 truncate text-xs text-slate-500">{item.episode} / {item.shot || item.type}</div>
            </div>
            <div className="text-right text-xs text-jade">{item.type}</div>
          </button>
        ))}
      </div>
    </ProductionCard>
  );
}

function AssetCard({ asset, onOpen, onSelect, onFavorite, selected, favorite, tall }: { asset: IndustrialAsset; onOpen: () => void; onSelect?: () => void; onFavorite?: () => void; selected?: boolean; favorite?: boolean; tall?: boolean }) {
  return (
    <ProductionCard className={`group overflow-hidden ${selected ? "ring-2 ring-jade" : ""}`}>
      <button className="relative block w-full text-left" onClick={onOpen}>
        <img src={industrialAssetUrl(asset)} alt={asset.name} className={`w-full object-cover ${tall ? "aspect-[4/5]" : "aspect-video"}`} />
        <div className="absolute inset-0 hidden bg-black/55 p-3 text-xs leading-5 text-white group-hover:block">
          <div className="font-semibold">快速预览</div>
          <div className="mt-2 line-clamp-4">{asset.prompt}</div>
        </div>
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] text-jade">{asset.id}</div>
            <h3 className="mt-1 text-sm font-semibold text-white">{asset.chineseName || asset.name}</h3>
          </div>
          <Status label={asset.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">{asset.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">{tag}</span>)}</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Info label="Version" value={asset.version} />
          <Info label="引用" value={asset.usageCount} />
          <Info label="评分" value={asset.qualityScore || "待评"} />
        </div>
        <div className="mt-3 flex gap-2">
          {onSelect && <button className="btn h-8 flex-1" onClick={onSelect}>{selected ? "取消选择" : "选择"}</button>}
          {onFavorite && <button className="btn h-8 px-2" onClick={onFavorite}>{favorite ? <Star size={14} /> : <Heart size={14} />}</button>}
        </div>
      </div>
    </ProductionCard>
  );
}

function AssetInspector({ asset, navigate }: { asset?: IndustrialAsset; navigate: Navigate }) {
  const [message, setMessage] = useState("");
  if (!asset) return <Empty title="没有资产" body="当前筛选条件下没有素材。" />;
  return (
    <ProductionCard className="sticky top-4 p-4">
      <h3 className="text-sm font-semibold text-white">资产详情</h3>
      <img src={industrialAssetUrl(asset)} alt={asset.name} className="mt-3 aspect-video w-full rounded object-cover" />
      <div className="mt-3 space-y-2 text-sm">
        <Info label="名称" value={asset.name} />
        <Info label="类别" value={asset.type} />
        <Info label="Version" value={asset.version} />
        <Info label="引用位置" value={asset.linkedShots.join(", ") || "暂无"} />
        <Info label="关联角色" value={joinOr(asset.linkedCharacters)} />
        <Info label="关联场景" value={joinOr(asset.linkedScenes)} />
      </div>
      <textarea className="mt-3 min-h-28 w-full rounded border border-white/10 bg-black/25 p-3 text-xs leading-5 text-slate-300 outline-none" defaultValue={asset.prompt} />
      <div className="mt-3 rounded border border-white/10 bg-black/20 p-3">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Version历史</div>
        {asset.versions.map((version) => (
          <div key={version.id} className="mb-2 rounded border border-white/10 bg-white/[0.03] p-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-jade">{version.label}</span>
              <span className="text-slate-500">{version.active ? "当前使用" : "历史"}</span>
            </div>
            <div className="mt-1 text-slate-400">{version.note}</div>
            <div className="mt-2 flex gap-2">
              <button className="btn h-7 px-2 text-[11px]" onClick={() => setMessage(`已在本地标记：准备恢复 ${version.label}`)}>恢复此Version</button>
              <button className="btn h-7 px-2 text-[11px]" onClick={() => setMessage(`已打开本地比较：${asset.version} ↔ ${version.label}`)}>比较Version</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="btn h-9" onClick={() => navigator.clipboard?.writeText(asset.prompt)}><Copy size={14} /> 复制Prompt</button>
        <button className="btn h-9" onClick={() => navigator.clipboard?.writeText(asset.path)}><Archive size={14} /> 复制路径</button>
        <button className="btn h-9" onClick={() => navigate("reuseCenter")}><Link2 size={14} /> 查看引用</button>
        <button className="btn h-9" onClick={() => navigate("storyboard")}><Layers size={14} /> 加入Storyboard</button>
      </div>
      {message && <div className="mt-3 rounded border border-jade/30 bg-jade/10 p-2 text-xs text-jade">{message}</div>}
    </ProductionCard>
  );
}

function ContextMenu({ x, y, asset, onClose, onOpen }: { x: number; y: number; asset: IndustrialAsset; onClose: () => void; onOpen: () => void }) {
  const actions = ["打开详情", "查看引用", "复制Prompt", "生成新Version", "加入收藏", "添加到Storyboard", "添加到Shot", "导出", "删除"];
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute w-52 rounded-md border border-white/10 bg-[#0d131b] p-1 shadow-soft" style={{ left: x, top: y }} onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-white/10 px-3 py-2 text-xs text-slate-500">{asset.chineseName || asset.name}</div>
        {actions.map((action) => <button key={action} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => { if (action === "打开详情") onOpen(); if (action === "复制Prompt") void navigator.clipboard?.writeText(asset.prompt); onClose(); }}><MoreHorizontal size={14} /> {action}</button>)}
      </div>
    </div>
  );
}

function BatchToolbar({ count, onClear }: { count: number; onClear: () => void }) {
  const [message, setMessage] = useState("");
  const actions = ["批量修改标签", "批量移动分类", "批量导出", "批量生成Prompt", "批量加入Storyboard"];
  return (
    <ProductionCard className="p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm text-white">已选择 {count} 个素材</span>
        {actions.map((item) => <button key={item} className="btn h-8" onClick={() => setMessage(`${item} 已写入本地待处理队列：${count} 个素材`)}>{item}</button>)}
        <button className="btn h-8" onClick={onClear}>清空选择</button>
      </div>
      {message && <div className="mt-2 text-xs text-jade">{message}</div>}
    </ProductionCard>
  );
}

function TagManager() {
  const source = getIndustrialTags().slice(0, 10);
  const [tags, setTags] = useState(source);
  const [name, setName] = useState("");
  const colors = ["#7ed6bd", "#d6b46a", "#70a6ff", "#d68fb3", "#f87171"];
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white"><Tags size={15} /> 标签系统</div>
      <div className="mt-3 flex gap-2">
        <input className="field h-9" value={name} onChange={(event) => setName(event.target.value)} placeholder="新增标签" />
        <button className="btn h-9" onClick={() => { if (!name.trim()) return; setTags((value) => [...value, { id: `TAG-${name}`, name, color: colors[value.length % colors.length], group: "自定义", createdAt: "2026-07-10", editable: true }]); setName(""); }}>新增</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={tag.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">
            <button className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} title="修改标签颜色" onClick={() => setTags((value) => value.map((item) => item.id === tag.id ? { ...item, color: colors[(index + 1) % colors.length] } : item))} />
            {tag.name}
            <button className="text-slate-500 hover:text-red-300" onClick={() => setTags((value) => value.filter((item) => item.id !== tag.id))}>×</button>
          </span>
        ))}
      </div>
    </ProductionCard>
  );
}

function PromptCard({ prompt }: { prompt: IndustrialPrompt }) {
  const [value, setValue] = useState(prompt.prompt);
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] text-jade">{prompt.id}</div>
          <h3 className="mt-1 text-sm font-semibold text-white">{prompt.name}</h3>
        </div>
        <button className="btn h-8" onClick={() => navigator.clipboard?.writeText(value)}><Copy size={14} /> 复制</button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Info label="使用次数" value={prompt.usageCount} />
        <Info label="关联镜头" value={joinOr(prompt.linkedShots)} />
        <Info label="成功Version" value={prompt.version} />
      </div>
      <textarea className="mt-3 min-h-44 w-full resize-y rounded border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={value} onChange={(event) => setValue(event.target.value)} />
    </ProductionCard>
  );
}

function RelationshipGraph({ relationships }: { relationships: ReturnType<typeof getIndustrialRelationships> }) {
  return (
    <ProductionCard className="p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-white"><GitBranch size={16} /> 素材关联图谱</div>
      <div className="mt-4 grid gap-2">
        {relationships.map((item, index) => (
          <div key={`${item.from}-${item.to}-${index}`} className="grid grid-cols-[minmax(0,1fr)_90px_minmax(0,1fr)] items-center gap-2 rounded border border-white/10 bg-black/20 p-2 text-xs">
            <span className="truncate text-slate-300">{item.fromName}</span>
            <span className="text-center text-jade">{item.relation}</span>
            <span className="truncate text-slate-300">{item.toName}</span>
          </div>
        ))}
      </div>
    </ProductionCard>
  );
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Tide Steel Studio</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <ProductionCard className="p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
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

function Status({ label }: { label: string }) {
  const tone = statusTone(label);
  const color = tone === "jade" ? "border-jade/40 text-jade bg-jade/10" : tone === "gold" ? "border-gold/40 text-gold bg-gold/10" : tone === "red" ? "border-red-400/40 text-red-300 bg-red-500/10" : "border-white/10 text-slate-400 bg-white/5";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${color}`}>{label}</span>;
}

function Empty({ title, body }: { title: string; body: string }) {
  return <ProductionCard className="p-8 text-center"><div className="text-white">{title}</div><div className="mt-2 text-sm text-slate-500">{body}</div></ProductionCard>;
}

function categoryMatch(kind: string, category: string) {
  if (kind === "environment") return category === "environment" || category === "environments";
  return kind === category;
}

function joinOr(value: string[]) {
  return value.length ? value.join(" / ") : "待绑定";
}

function toggleSet(source: Set<string>, item: string) {
  const next = new Set(source);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}
