import { useMemo, useState } from "react";
import { Archive, Box, Clapperboard, Copy, Database, Download, Film, Image, Link2, Music, Search, ShieldCheck, Sparkles, UserRound, Video, Waves } from "lucide-react";
import type { ProductionSection } from "../types";
import { getAssetBibleKlingPrompts, getAssetBibleManifest, getAssetBibleShots, getAssetBibleStats, getAssetBibleVideoClips } from "../../../mcp/assetBible/AssetBibleData";
import { listLocalAssets, localAssetUrl } from "../../../mcp/localAssetGenerator/LocalAssetManifest";
import { buildAllEP01KlingPrompts, getEP01AssetManifest, getEP01Keyframes, getTideSteelStudioStats } from "../../../mcp/tideSteelStudio/EP01StudioData";
import { ProductionCard, StatusPill } from "./ProductionShell";

type Navigate = (section: ProductionSection) => void;

const editableStore = new Map<string, string>();

export function ProjectOverviewPage({ navigate }: { navigate: Navigate }) {
  const stats = getAssetBibleStats();
  const ep01 = getEP01AssetManifest();
  const studio = getTideSteelStudioStats();
  const assets = listLocalAssets();
  const prompts = getAssetBibleKlingPrompts();
  const clips = getAssetBibleVideoClips();
  const completion = Math.round((studio.localAssets / Math.max(1, totalRequiredAssets(ep01))) * 100);
  return (
    <StudioFrame title="项目总览" subtitle="《潮汐钢魂》个人电影制作中心，所有数据来自当前项目文件。">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="剧集数量" value="36" />
        <Metric label="人物数量" value={ep01.characters.length} />
        <Metric label="机甲数量" value={ep01.mechas.length} />
        <Metric label="怪兽数量" value={ep01.creatures.length} />
        <Metric label="场景数量" value={ep01.environment.length} />
        <Metric label="素材数量" value={assets.length} />
        <Metric label="视频数量" value="0" />
        <Metric label="Prompt数量" value={prompts.length} />
        <Metric label="制作进度" value={`${completion}%`} />
        <Metric label="预算统计" value="本地制作" />
        <Metric label="完成率" value={`${completion}%`} />
        <Metric label="视频片段模板" value={clips.length} />
      </div>
      <WorkflowGraph />
      <EditablePanel id="project-overview" title="项目介绍 / 故事简介" defaultValue="《潮汐钢魂》是一套连续章节式AI科幻电影系列。当前制作重点：EP01《海面低频》的资产、关键帧、可灵提示词与视频制作规划。" />
      <QuickLinks navigate={navigate} items={[["资产库", "aiAssetLibrary"], ["关键帧", "image"], ["可灵提示词", "klingPromptLibrary"], ["时间线", "timeline"]]} />
    </StudioFrame>
  );
}

export function WorldBiblePage() {
  const sections = ["世界历史", "时间线", "科技树", "阵营", "组织", "国家", "城市", "地图", "名词解释", "术语", "图片参考"];
  return (
    <StudioFrame title="世界观" subtitle="World Bible，可直接编辑维护。">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ProductionCard className="p-3">{sections.map((item) => <div key={item} className="rounded border border-white/10 px-3 py-2 text-sm text-slate-300">{item}</div>)}</ProductionCard>
        <EditablePanel id="world-bible-md" title="World Bible Markdown" defaultValue={"# 潮汐钢魂 World Bible\n\n## 世界历史\n2042年后，海洋异常进入长期周期。\n\n## 科技树\n深海防线、同步驾驶、海洋低频观测、赤霆级工程机甲。\n\n## 名词解释\n潮门不是传送门，而是未知生态系统入口。"} />
      </div>
    </StudioFrame>
  );
}

export function ScriptManagerPage({ navigate }: { navigate: Navigate }) {
  const keyframes = getEP01Keyframes();
  return (
    <StudioFrame title="剧本管理" subtitle="按剧集、章节、Scene、Shot 管理脚本与镜头说明。">
      <EditablePanel id="script-ep01" title="EP01 剧本文档" defaultValue={"# EP01 海面低频\n\nScene 01：杭州湾海防线出现低频异常。\nScene 02：深蓝基地收到系统无法解释的信号。\nScene 03：林舟被召回，赤霆01进入启动准备。"} />
      <DataTable
        heads={["镜头编号", "章节", "对白", "旁白", "镜头说明", "状态", "引用"]}
        rows={keyframes.map((shot) => [shot.shot, shot.title, "待写", "待写", shot.purpose, "规划中", <Jump key={shot.shot} label="看分镜" to="storyboard" navigate={navigate} />])}
      />
    </StudioFrame>
  );
}

export function EntityLibraryPage({ kind, navigate }: { kind: "characters" | "mechas" | "creatures" | "environment" | "props"; navigate: Navigate }) {
  const manifest = getEP01AssetManifest();
  const source = kind === "characters" ? manifest.characters : kind === "mechas" ? manifest.mechas : kind === "creatures" ? manifest.creatures : kind === "environment" ? manifest.environment : [];
  const local = listLocalAssets().filter((asset) => categoryMatch(kind, asset.category));
  const titleMap = { characters: "角色设定", mechas: "机甲设定", creatures: "怪兽设定", environment: "场景设定", props: "道具设定" };
  return (
    <StudioFrame title={titleMap[kind]} subtitle="完整资料、图片、视频、Prompt 与出场信息集中管理。">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {source.map((item) => (
            <ProductionCard key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[11px] text-jade">{item.id}</div>
                  <h3 className="mt-1 text-lg font-semibold text-white">{item.name}</h3>
                </div>
                <StatusPill status={item.generated.length ? "审核中" : "规划中"} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <Mini label="资产" value={`${item.generated.length}/${item.assets.length}`} />
                <Mini label="出场" value="EP01" />
                <Mini label="Prompt" value={item.assets.length} />
              </div>
              <EditablePanel compact id={`${kind}-${item.id}`} title="资料编辑" defaultValue={defaultEntityText(kind, item.name)} />
            </ProductionCard>
          ))}
          {!source.length && <EditablePanel id={`${kind}-empty`} title="道具资料" defaultValue="当前项目尚未建立道具清单。可在此记录尺寸、用途、所属角色与所属场景。" />}
        </div>
        <ProductionCard className="p-4">
          <h3 className="text-sm font-semibold text-white">关联图片</h3>
          <div className="mt-3 grid gap-3">
            {local.map((asset) => (
              <button key={asset.id} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded border border-white/10 bg-black/20 p-2 text-left" onClick={() => navigate("aiAssetLibrary")}>
                <img src={localAssetUrl(asset)} alt={asset.name} className="aspect-video rounded object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">{asset.name}</div>
                  <div className="mt-1 text-xs text-slate-500">Version {asset.version}</div>
                </div>
              </button>
            ))}
          </div>
        </ProductionCard>
      </div>
    </StudioFrame>
  );
}

export function IndustrialAssetLibraryPage({ navigate }: { navigate: Navigate }) {
  const [mode, setMode] = useState<"grid" | "list" | "waterfall">("grid");
  const [query, setQuery] = useState("");
  const assets = listLocalAssets().filter((asset) => [asset.name, asset.category, asset.prompt].join(" ").toLowerCase().includes(query.toLowerCase()));
  return (
    <StudioFrame title="资产库" subtitle="图片模式、列表模式、瀑布流、标签筛选、版本管理与引用统计。">
      <div className="flex flex-wrap gap-3">
        <input className="field h-10 min-w-64 flex-1" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索资产、标签、Prompt..." />
        {(["grid", "list", "waterfall"] as const).map((item) => <button key={item} className="btn h-10" onClick={() => setMode(item)}>{item === "grid" ? "图片模式" : item === "list" ? "列表模式" : "瀑布流"}</button>)}
      </div>
      <div className={mode === "list" ? "grid gap-2" : mode === "waterfall" ? "columns-1 gap-4 md:columns-2 xl:columns-4" : "grid gap-4 md:grid-cols-2 xl:grid-cols-4"}>
        {assets.map((asset, index) => (
          <ProductionCard key={asset.id} className={`overflow-hidden ${mode === "waterfall" ? "mb-4 break-inside-avoid" : ""}`}>
            <img src={localAssetUrl(asset)} alt={asset.name} className={`w-full object-cover ${mode === "list" ? "hidden" : index % 3 === 0 && mode === "waterfall" ? "aspect-[4/5]" : "aspect-video"}`} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] text-jade">{asset.category}</div>
                  <h3 className="mt-1 text-sm font-semibold text-white">{asset.name}</h3>
                </div>
                <StatusPill status={asset.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Mini label="Version" value={asset.version} />
                <Mini label="引用" value={referenceCount(asset.relativePath)} />
                <Mini label="收藏" value="未标记" />
              </div>
              <button className="btn mt-3 h-9 w-full" onClick={() => navigate("reuseCenter")}><Link2 size={14} /> 查看引用</button>
            </div>
          </ProductionCard>
        ))}
      </div>
    </StudioFrame>
  );
}

export function KeyframeProductionPage({ navigate }: { navigate: Navigate }) {
  const keyframes = getEP01Keyframes();
  return (
    <StudioFrame title="关键帧" subtitle="电影 Storyboard 关键帧管理。">
      <DataTable
        heads={["镜头编号", "名称", "Prompt", "角色", "机甲", "场景", "镜头类型", "构图", "镜头运动", "Version", "Review", "生成时间"]}
        rows={keyframes.map((item, index) => [
          item.shot,
          item.title,
          item.purpose,
          inferAsset(item.required_assets, "角色"),
          inferAsset(item.required_assets, "机甲"),
          item.required_assets.join(", "),
          index % 3 === 0 ? "远景" : index % 3 === 1 ? "中景" : "特写",
          "电影横构图",
          index % 2 === 0 ? "缓慢推镜" : "固定停留",
          "TASK",
          <StatusPill key="s" status={item.status} />,
          "待生成"
        ])}
      />
      <QuickLinks navigate={navigate} items={[["跳分镜", "storyboard"], ["跳Prompt", "klingPromptLibrary"], ["跳视频", "video"]]} />
    </StudioFrame>
  );
}

export function StoryboardDesignPage() {
  const shots = getEP01Keyframes();
  return (
    <StudioFrame title="分镜设计" subtitle="每个 Shot 的画面、对白、声音、音乐、时长、摄影机和备注。">
      <div className="grid gap-4">
        {shots.map((shot, index) => (
          <ProductionCard key={shot.shot} className="grid gap-4 p-4 lg:grid-cols-[180px_minmax(0,1fr)_260px]">
            <div>
              <div className="font-mono text-xl text-jade">{shot.shot}</div>
              <StatusPill status={shot.status} />
              <div className="mt-3 text-xs text-slate-500">时长 {index % 4 === 0 ? "8秒" : "5秒"}</div>
            </div>
            <EditablePanel compact id={`storyboard-${shot.shot}`} title={shot.title} defaultValue={`镜头描述：${shot.purpose}\n对白：待写\n声音：低频、海风、机械噪声\n音乐：谨慎进入\n摄影机：${index % 2 === 0 ? "缓慢推镜" : "固定镜头"}`} />
            <div className="rounded border border-white/10 bg-black/20 p-3 text-sm text-slate-400">备注：所有分镜必须服务人物选择，不为炫技而存在。</div>
          </ProductionCard>
        ))}
      </div>
    </StudioFrame>
  );
}

export function PromptManagerPage() {
  const prompts = buildAllEP01KlingPrompts();
  return (
    <StudioFrame title="可灵提示词" subtitle="Prompt、Negative Prompt、镜头、运镜、动作、情绪、风格、复制、收藏、导出。">
      <div className="grid gap-4 xl:grid-cols-2">
        {prompts.map((item) => (
          <ProductionCard key={item.shot} className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm text-jade">{item.shot}</h3>
              <button className="btn h-8" onClick={() => navigator.clipboard?.writeText(item.prompt)}><Copy size={14} /> 复制</button>
            </div>
            <textarea className="mt-3 min-h-56 w-full resize-y rounded border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" defaultValue={item.prompt} />
          </ProductionCard>
        ))}
      </div>
    </StudioFrame>
  );
}

export function VideoPlanningPage() {
  const clips = getAssetBibleVideoClips().slice(0, 36);
  return (
    <StudioFrame title="视频制作" subtitle="首帧、尾帧、时长、镜头、动作、可灵Prompt、备注与状态。">
      <DataTable
        heads={["片段", "首帧", "尾帧", "时长", "镜头", "动作", "可灵Prompt", "备注", "状态"]}
        rows={clips.map((clip) => [clip.id, clip.first_frame, clip.last_frame, clip.duration, clip.camera_movement, clip.name, clip.prompt, "手动进入可灵制作", <StatusPill key={clip.id} status={clip.status} />])}
      />
    </StudioFrame>
  );
}

export function TimelinePage() {
  const tracks = ["图片轨道", "视频轨道", "字幕轨道", "BGM轨道", "音效轨道", "对白轨道"];
  const shots = getEP01Keyframes();
  return (
    <StudioFrame title="时间线" subtitle="电影 Timeline，按轨道组织 EP01。">
      <div className="space-y-3">
        {tracks.map((track, trackIndex) => (
          <ProductionCard key={track} className="p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">{trackIndex === 3 ? <Music size={16} /> : <Film size={16} />} {track}</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {shots.slice(0, trackIndex < 2 ? 18 : 8).map((shot, index) => <div key={`${track}-${shot.shot}`} className="min-w-32 rounded border border-white/10 bg-jade/10 px-3 py-2 text-xs text-slate-300">{shot.shot}<br />{index % 4 === 0 ? "8秒" : "5秒"}</div>)}
            </div>
          </ProductionCard>
        ))}
      </div>
    </StudioFrame>
  );
}

export function FinalPackagePage() {
  return (
    <StudioFrame title="成片输出" subtitle="图片、视频、字幕、Prompt、工程文件统一打包。">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["图片资产", "视频文件", "字幕文件", "Prompt文件", "工程文件", "制作报告"].map((item) => (
          <ProductionCard key={item} className="p-5">
            <Download className="text-jade" size={22} />
            <h3 className="mt-4 text-lg font-semibold text-white">{item}</h3>
            <p className="mt-2 text-sm text-slate-400">来自当前项目目录，可进入最终包。</p>
          </ProductionCard>
        ))}
      </div>
    </StudioFrame>
  );
}

export function ProductionLogPage() {
  const assets = listLocalAssets();
  const logs = [
    ...assets.slice(0, 12).map((asset) => ({ type: "导入", name: asset.name, time: asset.createdAt })),
    { type: "导出", name: "EP01_KLING_PROMPTS.json", time: new Date().toISOString() },
    { type: "生成", name: "Asset Bible 100镜头 / 150视频片段", time: new Date().toISOString() }
  ];
  return (
    <StudioFrame title="制作日志" subtitle="自动记录生成图片、修改Prompt、Review、导入、导出。">
      <DataTable heads={["类型", "对象", "时间", "状态"]} rows={logs.map((log) => [log.type, log.name, new Date(log.time).toLocaleString(), "已记录"])} />
    </StudioFrame>
  );
}

export function AssetReferencePage() {
  const assets = listLocalAssets();
  return (
    <StudioFrame title="素材复用中心" subtitle="显示引用次数、引用镜头、引用剧集、最近使用和关联素材。">
      <DataTable
        heads={["素材", "引用次数", "引用镜头", "引用剧集", "最近使用", "关联素材"]}
        rows={assets.map((asset) => [asset.name, referenceCount(asset.relativePath), referencedShots(asset.relativePath).join(", ") || "待引用", "EP01", new Date(asset.createdAt).toLocaleDateString(), relatedAssets(asset.category).join(", ")])}
      />
    </StudioFrame>
  );
}

function StudioFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-jade/80">Tide Steel Studio</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </ProductionCard>
      {children}
    </div>
  );
}

function WorkflowGraph() {
  const steps = ["世界观", "剧本", "角色", "机甲", "怪兽", "场景", "资产", "关键帧", "分镜", "可灵视频", "剪辑", "第一集完成"];
  return (
    <ProductionCard className="p-5">
      <h3 className="text-base font-semibold text-white">电影制作流程</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-6">
        {steps.map((step, index) => <div key={step} className="rounded border border-white/10 bg-black/20 p-3"><div className="font-mono text-xs text-jade">{String(index + 1).padStart(2, "0")}</div><div className="mt-2 text-sm text-white">{step}</div></div>)}
      </div>
    </ProductionCard>
  );
}

function EditablePanel({ id, title, defaultValue, compact = false }: { id: string; title: string; defaultValue: string; compact?: boolean }) {
  const [value, setValue] = useState(() => editableStore.get(id) ?? defaultValue);
  return (
    <ProductionCard className={compact ? "mt-4 p-3" : "p-4"}>
      <div className="mb-2 text-sm font-semibold text-white">{title}</div>
      <textarea className={`${compact ? "min-h-28" : "min-h-72"} w-full resize-y rounded border border-white/10 bg-black/30 p-3 text-sm leading-6 text-slate-300 outline-none`} value={value} onChange={(event) => { editableStore.set(id, event.target.value); setValue(event.target.value); }} />
    </ProductionCard>
  );
}

function DataTable({ heads, rows }: { heads: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <ProductionCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500"><tr>{heads.map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead>
          <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-white/5">{row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-[380px] px-4 py-3 text-slate-300">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </ProductionCard>
  );
}

function QuickLinks({ navigate, items }: { navigate: Navigate; items: Array<[string, ProductionSection]> }) {
  return <div className="flex flex-wrap gap-2">{items.map(([label, target]) => <button key={target} className="btn h-9" onClick={() => navigate(target)}>{label}</button>)}</div>;
}

function Jump({ label, to, navigate }: { label: string; to: ProductionSection; navigate: Navigate }) {
  return <button className="text-jade underline-offset-4 hover:underline" onClick={() => navigate(to)}>{label}</button>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <ProductionCard className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></ProductionCard>;
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded border border-white/10 bg-black/20 p-2"><div className="text-[10px] text-slate-500">{label}</div><div className="mt-1 text-xs text-white">{value}</div></div>;
}

function totalRequiredAssets(manifest: ReturnType<typeof getEP01AssetManifest>) {
  return [...manifest.characters, ...manifest.mechas, ...manifest.creatures, ...manifest.environment].reduce((sum, item) => sum + item.assets.length, 0);
}

function categoryMatch(kind: string, category: string) {
  if (kind === "mechas") return category === "mechas";
  if (kind === "characters") return category === "characters";
  if (kind === "creatures") return category === "creatures";
  if (kind === "environment") return category === "environment";
  return category === kind;
}

function defaultEntityText(kind: string, name: string) {
  if (kind === "characters") return `简介：${name}\n年龄：待定\n身高：待定\n体重：待定\n职业：待定\n性格：待补充\n经历：待补充\n关系图：待补充\n服装 / 表情 / 动作 / 台词：待补充`;
  if (kind === "mechas") return `模型：${name}\n尺寸：待定\n武器：待补充\n推进器：待补充\n驾驶舱：待补充\n能力 / 战损 / 动画：待补充`;
  if (kind === "creatures") return `生命体：${name}\n生命周期：待补充\n攻击方式：待补充\n弱点：待补充\n身体结构 / 进化 / 行为模式 / 叫声：待补充`;
  return `场景：${name}\n地区：待补充\n建筑：待补充\n灯光：待补充\n天气：待补充\n时间：待补充\n参考图 / 视频素材：待补充`;
}

function inferAsset(required: string[], type: "角色" | "机甲") {
  if (type === "角色") return required.find((item) => ["linzhou", "xuran", "chenmu"].includes(item)) ?? "待绑定";
  return required.find((item) => item.includes("chiting")) ?? "待绑定";
}

function referenceCount(path: string) {
  return referencedShots(path).length;
}

function referencedShots(path: string) {
  const keyframes = getEP01Keyframes();
  if (path.includes("chiting01")) return keyframes.filter((shot) => shot.required_assets.includes("chiting01")).map((shot) => shot.shot);
  if (path.includes("white_tide")) return keyframes.filter((shot) => shot.required_assets.includes("white_tide")).map((shot) => shot.shot);
  if (path.includes("linzhou")) return keyframes.filter((shot) => shot.required_assets.includes("linzhou")).map((shot) => shot.shot);
  return [];
}

function relatedAssets(category: string) {
  return listLocalAssets().filter((asset) => asset.category === category).slice(0, 3).map((asset) => asset.name);
}
