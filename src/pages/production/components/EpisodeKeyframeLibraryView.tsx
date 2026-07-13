import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy, Image, Trash2, Upload } from "lucide-react";
import { getEP01Keyframes } from "../../../mcp/tideSteelStudio/EP01StudioData";
import { getVideoProjects, type VideoProjectId } from "../../../mcp/videoWorkspace/VideoProjectData";
import {
  approveKeyframeVersion,
  deleteAllKeyframeVersions,
  deleteKeyframeVersion,
  getBestKeyframeVersion,
  getKeyframeFrameStorageKey,
  getKeyframeFrameVersions,
  importKeyframeFiles,
  loadKeyframeStore,
  rejectKeyframeVersion,
  setMasterKeyframeVersion,
  subscribeKeyframeStore,
  type KeyframeAssetStore,
  type KeyframeAssetVersion,
  type KeyframeFrameRole
} from "../../../mcp/keyframeLibrary/KeyframeAssetStore";
import { ProductionCard } from "./ProductionShell";

type KeyframeItem = {
  id: string;
  storageId: string;
  shot: string;
  title: string;
  purpose: string;
  required_assets: string[];
  status: string;
  visual: string;
};

type KeyframeProject = { id: VideoProjectId; label: string; helper: string; keyframes: KeyframeItem[] };

export function EpisodeKeyframeLibraryView() {
  const projects = useMemo(getKeyframeProjects, []);
  const [episode, setEpisode] = useState<VideoProjectId>("TRAILER90");
  const project = projects.find((item) => item.id === episode) ?? projects[0];
  const keyframes = project.keyframes;
  const [store, setStore] = useState<KeyframeAssetStore>({});
  const [selectedId, setSelectedId] = useState(keyframes[0]?.storageId ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    const reload = async () => { const value = await loadKeyframeStore(); if (alive) setStore(value); };
    void reload();
    const unsubscribe = subscribeKeyframeStore(() => void reload());
    return () => { alive = false; unsubscribe(); };
  }, []);

  useEffect(() => setSelectedId(keyframes[0]?.storageId ?? ""), [episode, keyframes]);

  const selected = keyframes.find((item) => item.storageId === selectedId) ?? keyframes[0];
  const uploaded = keyframes.filter((item) => getKeyframeFrameVersions(store, item.storageId, "START").length || getKeyframeFrameVersions(store, item.storageId, "END").length).length;
  const review = keyframes.flatMap((item) => [
    ...getKeyframeFrameVersions(store, item.storageId, "START"),
    ...getKeyframeFrameVersions(store, item.storageId, "END")
  ]).filter((version) => version.status === "REVIEW").length;
  const paired = keyframes.filter((item) => Boolean(getBestKeyframeVersion(getKeyframeFrameVersions(store, item.storageId, "START"))) && Boolean(getBestKeyframeVersion(getKeyframeFrameVersions(store, item.storageId, "END")))).length;

  async function copyPrompt(keyframe: KeyframeItem, role: KeyframeFrameRole) {
    await copyText(buildKeyframeImagePrompt(keyframe, role));
    setMessage(`${keyframe.id} ${role === "START" ? "首帧" : "尾帧"} Prompt 已复制。`);
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Keyframe / First & Last Frame</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">关键帧制作</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">每个镜头分为首帧和尾帧两张真实图片。首帧定义动作起点，尾帧定义动作完成后的稳定画面；两张图均需按右侧列出的母资产参考图生成并分别上传审核。</p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] p-3">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">作品分区</span>
        <select className="min-w-[240px] rounded border border-jade/30 bg-[#0b1017] px-3 py-2 text-sm text-white outline-none" value={episode} onChange={(event) => setEpisode(event.target.value as VideoProjectId)}>
          {projects.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.id}</option>)}
        </select>
        <span className="text-xs text-slate-500">{project.helper}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="当前分区" value={project.label} />
        <Metric label="关键帧总数" value={`${keyframes.length} 组`} />
        <Metric label="已上传镜头" value={`${uploaded}/${keyframes.length}`} />
        <Metric label="首尾帧配对完成" value={`${paired}/${keyframes.length}`} />
      </div>
      {message && <div className="rounded-md border border-jade/25 bg-jade/10 px-3 py-2 text-sm text-jade">{message}</div>}

      {!keyframes.length ? <EmptyProject label={project.label} /> : <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_500px]">
        <ProductionCard className="order-2 p-4 2xl:order-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="text-lg font-semibold text-white">{project.label}关键帧清单</h3><p className="mt-1 text-xs text-slate-500">每张卡片显示首帧和尾帧的独立状态。可灵视频制作前，优先完成一对首尾帧。</p></div>
            <div className="rounded-full border border-jade/30 bg-jade/10 px-3 py-1 text-xs text-jade">配对完成 {paired}/{keyframes.length}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {keyframes.map((keyframe) => <KeyframeCard key={keyframe.id} keyframe={keyframe} startVersions={getKeyframeFrameVersions(store, keyframe.storageId, "START")} endVersions={getKeyframeFrameVersions(store, keyframe.storageId, "END")} selected={selected?.storageId === keyframe.storageId} onSelect={() => setSelectedId(keyframe.storageId)} onCopy={copyPrompt} />)}
          </div>
        </ProductionCard>
        {selected && <div className="order-1 2xl:order-2"><KeyframeInspector keyframe={selected} store={store} projectId={episode} onCopied={copyPrompt} onMessage={setMessage} /></div>}
      </div>}
    </div>
  );
}

function KeyframeCard({ keyframe, startVersions, endVersions, selected, onSelect, onCopy }: { keyframe: KeyframeItem; startVersions: KeyframeAssetVersion[]; endVersions: KeyframeAssetVersion[]; selected: boolean; onSelect: () => void; onCopy: (keyframe: KeyframeItem, role: KeyframeFrameRole) => void }) {
  const start = getBestKeyframeVersion(startVersions);
  const end = getBestKeyframeVersion(endVersions);
  return <button className={`overflow-hidden rounded-lg border bg-black/20 text-left transition hover:border-jade/40 ${selected ? "border-jade/70 ring-1 ring-jade/40" : "border-white/10"}`} onClick={onSelect}>
    <div className="grid aspect-video grid-cols-2 gap-px bg-white/10">
      <FramePreview version={start} label="首帧" />
      <FramePreview version={end} label="尾帧" />
    </div>
    <div className="p-3">
      <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-jade">{keyframe.id}</span><span className="text-[10px] text-slate-500">首 {start?.versionId ?? "EMPTY"} / 尾 {end?.versionId ?? "EMPTY"}</span></div>
      <h4 className="mt-2 line-clamp-1 text-sm font-semibold text-white">{keyframe.title}</h4>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{keyframe.purpose}</p>
      <div className="mt-3 flex gap-2"><span className="rounded border border-white/10 px-2 py-1 text-[11px] text-slate-400">{keyframe.shot}</span><button type="button" className="ml-auto rounded border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:border-jade/50 hover:text-jade" onClick={(event) => { event.stopPropagation(); onCopy(keyframe, "START"); }}>首帧 Prompt</button></div>
    </div>
  </button>;
}

function KeyframeInspector({ keyframe, store, projectId, onCopied, onMessage }: { keyframe: KeyframeItem; store: KeyframeAssetStore; projectId: VideoProjectId; onCopied: (keyframe: KeyframeItem, role: KeyframeFrameRole) => void; onMessage: (message: string) => void }) {
  const startVersions = getKeyframeFrameVersions(store, keyframe.storageId, "START");
  const endVersions = getKeyframeFrameVersions(store, keyframe.storageId, "END");
  return <ProductionCard className="sticky top-4 overflow-hidden">
    <div className="border-b border-white/10 p-4"><div className="font-mono text-xs text-jade">{keyframe.shot}</div><h3 className="mt-1 text-lg font-semibold text-white">{keyframe.id} / {keyframe.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{keyframe.purpose}</p></div>
    <div className="grid gap-3 p-4 md:grid-cols-2">
      <FrameColumn keyframe={keyframe} role="START" versions={startVersions} projectId={projectId} onCopied={() => onCopied(keyframe, "START")} onMessage={onMessage} />
      <FrameColumn keyframe={keyframe} role="END" versions={endVersions} projectId={projectId} onCopied={() => onCopied(keyframe, "END")} onMessage={onMessage} />
    </div>
    <div className="mx-4 mb-4 rounded border border-jade/25 bg-jade/[0.04] p-3"><div className="text-xs font-semibold tracking-wide text-jade">生成这组首尾帧前必须参考的母资产图片</div><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">{getReferences(keyframe).map((asset) => <li key={asset}>{asset}</li>)}</ol><p className="mt-2 text-xs text-slate-500">上传这些母资产作为 GPT Image 参考图，再分别复制首帧和尾帧 Prompt 出图。尾帧必须延续首帧中的人物、机甲、怪兽与场景结构。</p></div>
  </ProductionCard>;
}

function FrameColumn({ keyframe, role, versions, projectId, onCopied, onMessage }: { keyframe: KeyframeItem; role: KeyframeFrameRole; versions: KeyframeAssetVersion[]; projectId: VideoProjectId; onCopied: () => void; onMessage: (message: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const best = getBestKeyframeVersion(versions);
  const label = role === "START" ? "首帧" : "尾帧";
  const prompt = buildKeyframeImagePrompt(keyframe, role);
  const storageKey = getKeyframeFrameStorageKey(keyframe.storageId, role);
  async function upload(files: FileList | File[] | null) {
    if (!files?.length) return;
    const imported = await importKeyframeFiles({ id: keyframe.storageId, shot: keyframe.shot, title: keyframe.title }, files, prompt, projectId, role);
    onMessage(imported.length ? `${keyframe.id} ${label}已导入 ${imported.length} 个版本，等待审核。` : "没有可导入的图片，请使用 PNG / JPG / WEBP。");
  }
  async function removeAll() {
    if (versions.some(isLocked) && !window.confirm(`${label}含有已通过或 Master 图片。确定删除这个${label}的全部版本吗？`)) return;
    await deleteAllKeyframeVersions(storageKey);
    onMessage(`${keyframe.id} ${label}图片已删除。`);
  }
  return <div className="min-w-0 rounded border border-white/10 bg-black/15 p-3">
    <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-white">{label}图</span><span className="font-mono text-[11px] text-jade">{best?.versionId ?? "EMPTY"}</span></div>
    <div className="flex aspect-video items-center justify-center overflow-hidden rounded border border-dashed border-white/15 bg-white/[0.03]" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void upload(event.dataTransfer.files); }}>
      {best ? <img src={best.dataUrl} alt={`${keyframe.title}${label}`} className="h-full w-full object-cover" /> : <div className="px-4 text-center text-xs text-slate-500"><Upload className="mx-auto mb-2 text-jade" size={22} />拖拽上传{label}图</div>}
    </div>
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => void upload(event.target.files)} />
    <div className="mt-2 grid grid-cols-2 gap-2"><button className="btn h-9 px-2 text-xs" onClick={() => inputRef.current?.click()}><Upload size={14} />上传</button><button className="btn h-9 px-2 text-xs" onClick={onCopied}><Copy size={14} />复制 Prompt</button></div>
    <div className="mt-3"><div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">GPT Image {label} Prompt</div><textarea readOnly value={prompt} className="min-h-40 w-full resize-y rounded border border-white/10 bg-black/25 p-2 text-[11px] leading-5 text-slate-300 outline-none" /></div>
    {versions.length > 0 && <div className="mt-3 space-y-2"><div className="flex justify-between text-[11px] text-slate-500"><span>版本 {versions.length}</span><button className="hover:text-red-300" onClick={() => void removeAll()}>删除全部</button></div>{versions.map((version) => <div key={version.versionId} className="flex items-center gap-2 rounded border border-white/10 p-1.5"><img src={version.dataUrl} alt={version.fileName} className="h-10 w-14 rounded object-cover" /><span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-400">{version.versionId} · {version.status}</span><VersionActions storageKey={storageKey} version={version} /></div>)}</div>}
  </div>;
}

function VersionActions({ storageKey, version }: { storageKey: string; version: KeyframeAssetVersion }) {
  return <div className="flex gap-1"><button className="text-[10px] text-jade" onClick={() => void approveKeyframeVersion(storageKey, version.versionId)}>通过</button><button className="text-[10px] text-blue-200" onClick={() => void setMasterKeyframeVersion(storageKey, version.versionId)}><CheckCircle2 className="inline" size={11} />Master</button><button className="text-[10px] text-slate-400" onClick={() => void rejectKeyframeVersion(storageKey, version.versionId)}>退回</button><button className="text-[10px] text-red-300" onClick={() => { if (!isLocked(version) || window.confirm(`${version.versionId} 是已通过图片，确定删除吗？`)) void deleteKeyframeVersion(storageKey, version.versionId); }}><Trash2 className="inline" size={11} /></button></div>;
}

function FramePreview({ version, label }: { version: KeyframeAssetVersion | null; label: string }) {
  return <div className="relative flex items-center justify-center bg-white/[0.04]">{version ? <img src={version.dataUrl} alt={label} className="h-full w-full object-cover" /> : <div className="text-center text-[10px] text-slate-600"><Image className="mx-auto mb-1" size={18} />等待{label}</div>}<span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-slate-300">{label}</span></div>;
}

function buildKeyframeImagePrompt(keyframe: KeyframeItem, role: KeyframeFrameRole) {
  const isStart = role === "START";
  const references = getReferences(keyframe);
  const scene = keyframe.visual || visualDescriptions[keyframe.id] || keyframe.purpose;
  const motion = motionEndings[keyframe.id] ?? "主体完成一个克制、可连续衔接的动作后停住。";
  return [
    `${isStart ? "首帧" : "尾帧"}：${keyframe.id}《${keyframe.title}》`,
    `剧情目的：${keyframe.purpose}`,
    "参考图：必须上传并参考以下母资产图片：",
    ...references.map((asset, index) => `${index + 1}. ${asset}`),
    isStart ? `画面内容：动作开始前一秒的稳定构图。${scene}` : `画面内容：与首帧完全相同的人物、服装、机甲、怪兽、天气和场景结构，动作推进后的稳定结果。${motion}`,
    isStart ? "构图要求：16:9，明确交代主体、空间方向和动作起点，为可灵后续运动留出前进方向。" : "构图要求：16:9，与首帧保持同一镜头轴线、焦段和主光方向；仅改变动作完成后的姿势、位置或环境后果。",
    "摄影与材质：电影级真实科幻摄影，低饱和冷蓝工业实景光；湿金属、海盐腐蚀、玻璃反射、水汽和雨痕真实可见。",
    "一致性锁定：人物脸型与服装、机甲装甲结构、怪兽身体结构、基地与海防建筑必须严格沿用参考图，不重新设计主体。",
    "禁止：动漫、游戏CG、塑料材质、霓虹赛博朋克、英雄摆拍、换脸、结构漂移、文字、字幕、logo、水印。"
  ].join("\n");
}

const visualDescriptions: Record<string, string> = {
  KF01: "阴天的杭州湾海防线仍在正常运转，海洋占据画面大部分，远处海面只有极轻微的反向水纹。",
  KF02: "暴雨海面下出现巨大模糊白影，只露出潮湿白色甲壳的一角，不展示完整白潮。",
  KF03: "深蓝基地进入冷蓝警戒，工作人员仍在岗位，屏幕大部分正常，只有低频波形归零。",
  KF04: "陈牧停下记录动作，侧头看向监听设备；背景工作人员继续工作，自动系统仍显示正常。",
  KF05: "林舟在狭窄值班舱收到蓝色召回警报，抬头看向门外，警戒光扫过左眉浅伤痕。",
  KF06: "林舟穿深灰驾驶服沿潮湿工业通道向机库快步前行，远处机库冷蓝光引导方向。"
};

const motionEndings: Record<string, string> = {
  TR05: "林舟从值班舱冲入潮湿工业通道，身体向机库方向前倾，脚步落稳，蓝色警报光仍掠过左眉伤痕。",
  KF01: "远处水纹收束为更清晰的一道反向波纹，防线设备依然运转，世界刚刚显出不对劲。",
  KF02: "白色甲壳沉回浪下，只在雨幕里留下向内收束的水面痕迹。",
  KF04: "陈牧将手停在监听台上，目光锁定设备，背景系统仍没有发出警报。",
  KF05: "林舟已从床沿站起，握住门框，面向通道，惊醒后的呼吸尚未平复。",
  KF06: "林舟抵达机库入口，在巨大赤霆背部装甲前停下，人物尺度被工程结构压小。"
};

const assetReferenceDetails: Record<string, string[]> = {
  hangzhou_bay: ["场景母资产：杭州湾海防线 / 阴天正常世界", "场景母资产：杭州湾海防线 / 暴雨警戒"],
  white_tide: ["怪兽母资产：白潮 / 核心三视图", "怪兽母资产：白潮 / 甲壳细节或海雾局部显现"],
  deep_blue_base: ["场景母资产：深蓝基地 / 指挥中心", "场景母资产：深蓝基地 / 赤霆机库"],
  chenmu: ["角色母资产：陈牧 / 标准头像", "角色母资产：陈牧 / 指挥制服半身"],
  linzhou: ["角色母资产：林舟 / 标准头像", "角色母资产：林舟 / 驾驶服全身或驾驶舱坐姿"],
  chiting01: ["机甲母资产：赤霆01 / 核心三视图", "机甲母资产：赤霆01 / 对应局部结构参考"],
  cockpit: ["机甲母资产：赤霆01 / 驾驶舱内部", "角色母资产：林舟或许燃 / 驾驶姿态"],
  xuran: ["角色母资产：许燃 / 标准头像", "角色母资产：许燃 / 副同步位工作姿态"],
  tide_gate: ["场景母资产：潮门 / 海底压力边界远景", "场景母资产：潮门 / 边界逆流近景"],
  black_tide_mother: ["怪兽母资产：黑潮母体 / 核心结构参考", "场景母资产：潮门 / 深海压力边界"]
};

function getReferences(keyframe: KeyframeItem) { return keyframe.required_assets.flatMap((asset) => assetReferenceDetails[asset] ?? [asset]); }

function getKeyframeProjects(): KeyframeProject[] {
  const ep01 = getEP01Keyframes().map((keyframe) => ({ id: keyframe.id, storageId: keyframe.id, shot: keyframe.shot, title: keyframe.title, purpose: keyframe.purpose, required_assets: keyframe.required_assets, status: keyframe.status, visual: visualDescriptions[keyframe.id] ?? keyframe.purpose }));
  return getVideoProjects().map((project) => project.id === "EP01" ? { id: project.id, label: project.label, helper: project.helper, keyframes: ep01 } : { id: project.id, label: project.label, helper: project.helper, keyframes: project.shots.map((shot) => ({ id: shot.keyframeId, storageId: project.id === "TRAILER90" ? `TRAILER_${shot.keyframeId}` : `${project.id}_${shot.keyframeId}`, shot: shot.id, title: shot.title, purpose: shot.description, required_assets: project.requiredAssets[shot.id] ?? [], status: shot.status, visual: shot.notes || shot.description })) });
}

async function copyText(text: string) { try { await navigator.clipboard.writeText(text); } catch { const textarea = document.createElement("textarea"); textarea.value = text; textarea.style.position = "fixed"; textarea.style.opacity = "0"; document.body.appendChild(textarea); textarea.focus(); textarea.select(); document.execCommand("copy"); document.body.removeChild(textarea); } }
function Metric({ label, value }: { label: string; value: string | number }) { return <ProductionCard className="p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></ProductionCard>; }
function EmptyProject({ label }: { label: string }) { return <div className="rounded-md border border-white/10 bg-white/[0.02] p-16 text-center"><div className="text-lg font-semibold text-white">{label}尚未建立正式关键帧</div><p className="mt-2 text-sm text-slate-500">请先完成该集剧本和 Storyboard，镜头会自动进入此分区。</p></div>; }
function isLocked(version: KeyframeAssetVersion) { return version.status === "APPROVED" || version.status === "MASTER_REFERENCE"; }
