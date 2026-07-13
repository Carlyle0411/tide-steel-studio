import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy, Image, Trash2, Upload } from "lucide-react";
import { getEP01Keyframes } from "../../../mcp/tideSteelStudio/EP01StudioData";
import { trailer90Shots } from "../../../mcp/trailer/Trailer90StudioData";
import { getVideoProjects, type VideoProjectId } from "../../../mcp/videoWorkspace/VideoProjectData";
import {
  approveKeyframeVersion,
  deleteAllKeyframeFrameVersions,
  deleteKeyframeVersion,
  getBestKeyframeVersion,
  getKeyframeFrameStorageKey,
  getKeyframeFrameVersionOwnerKey,
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
  frameMode: "SINGLE" | "PAIR";
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
  const uploaded = keyframes.filter((item) => getKeyframeFrameVersions(store, item.storageId, "START").length || (item.frameMode === "PAIR" && getKeyframeFrameVersions(store, item.storageId, "END").length)).length;
  const review = keyframes.flatMap((item) => [
    ...getKeyframeFrameVersions(store, item.storageId, "START"),
    ...(item.frameMode === "PAIR" ? getKeyframeFrameVersions(store, item.storageId, "END") : [])
  ]).filter((version) => version.status === "REVIEW").length;
  const completed = keyframes.filter((item) => {
    const hasStart = Boolean(getBestKeyframeVersion(getKeyframeFrameVersions(store, item.storageId, "START")));
    if (item.frameMode === "SINGLE") return hasStart;
    return hasStart && Boolean(getBestKeyframeVersion(getKeyframeFrameVersions(store, item.storageId, "END")));
  }).length;
  const pairedTotal = keyframes.filter((item) => item.frameMode === "PAIR").length;

  async function copyPrompt(keyframe: KeyframeItem, role: KeyframeFrameRole) {
    await copyText(buildKeyframeImagePrompt(keyframe, role));
    setMessage(`${keyframe.id} ${keyframe.frameMode === "PAIR" ? (role === "START" ? "首帧" : "尾帧") : "关键帧"} Prompt 已复制。`);
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Keyframe / First & Last Frame</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">关键帧制作</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">这里按剧本要求区分单关键帧和首尾帧。只有脚本明确写了“首帧 / 尾帧”的镜头才需要两张图；普通镜头只上传一张关键帧，避免多余画面干扰可灵制作。</p>
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
        <Metric label="关键帧任务" value={`${keyframes.length} 组`} />
        <Metric label="已上传镜头" value={`${uploaded}/${keyframes.length}`} />
        <Metric label="已完成" value={`${completed}/${keyframes.length}`} />
        <Metric label="首尾帧镜头" value={`${pairedTotal} 组`} />
      </div>
      {message && <div className="rounded-md border border-jade/25 bg-jade/10 px-3 py-2 text-sm text-jade">{message}</div>}

      {!keyframes.length ? <EmptyProject label={project.label} /> : <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_500px]">
        <ProductionCard className="order-2 p-4 2xl:order-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="text-lg font-semibold text-white">{project.label}关键帧清单</h3><p className="mt-1 text-xs text-slate-500">单关键帧只显示一张图；首尾帧镜头会显示独立的首帧和尾帧上传区。</p></div>
            <div className="rounded-full border border-jade/30 bg-jade/10 px-3 py-1 text-xs text-jade">完成 {completed}/{keyframes.length}</div>
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
  const isPair = keyframe.frameMode === "PAIR";
  return <button className={`overflow-hidden rounded-lg border bg-black/20 text-left transition hover:border-jade/40 ${selected ? "border-jade/70 ring-1 ring-jade/40" : "border-white/10"}`} onClick={onSelect}>
    <div className={`grid aspect-video gap-px bg-white/10 ${isPair ? "grid-cols-2" : "grid-cols-1"}`}>
      <FramePreview version={start} label={isPair ? "首帧" : "关键帧"} />
      {isPair && <FramePreview version={end} label="尾帧" />}
    </div>
    <div className="p-3">
      <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-jade">{keyframe.id}</span><span className="text-[10px] text-slate-500">{isPair ? `首 ${start?.versionId ?? "EMPTY"} / 尾 ${end?.versionId ?? "EMPTY"}` : (start?.versionId ?? "EMPTY")}</span></div>
      <h4 className="mt-2 line-clamp-1 text-sm font-semibold text-white">{keyframe.title}</h4>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{keyframe.purpose}</p>
      <div className="mt-3 flex gap-2"><span className="rounded border border-white/10 px-2 py-1 text-[11px] text-slate-400">{keyframe.shot}</span><span className="rounded border border-white/10 px-2 py-1 text-[11px] text-slate-500">{isPair ? "首尾帧" : "单关键帧"}</span><button type="button" className="ml-auto rounded border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:border-jade/50 hover:text-jade" onClick={(event) => { event.stopPropagation(); onCopy(keyframe, "START"); }}>{isPair ? "首帧 Prompt" : "复制 Prompt"}</button></div>
    </div>
  </button>;
}

function KeyframeInspector({ keyframe, store, projectId, onCopied, onMessage }: { keyframe: KeyframeItem; store: KeyframeAssetStore; projectId: VideoProjectId; onCopied: (keyframe: KeyframeItem, role: KeyframeFrameRole) => void; onMessage: (message: string) => void }) {
  const startVersions = getKeyframeFrameVersions(store, keyframe.storageId, "START");
  const endVersions = getKeyframeFrameVersions(store, keyframe.storageId, "END");
  const isPair = keyframe.frameMode === "PAIR";
  return <ProductionCard className="sticky top-4 overflow-hidden">
    <div className="border-b border-white/10 p-4"><div className="font-mono text-xs text-jade">{keyframe.shot}</div><h3 className="mt-1 text-lg font-semibold text-white">{keyframe.id} / {keyframe.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{keyframe.purpose}</p></div>
    <div className={`grid gap-3 p-4 ${isPair ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
      <FrameColumn keyframe={keyframe} role="START" versions={startVersions} store={store} projectId={projectId} onCopied={() => onCopied(keyframe, "START")} onMessage={onMessage} />
      {isPair && <FrameColumn keyframe={keyframe} role="END" versions={endVersions} store={store} projectId={projectId} onCopied={() => onCopied(keyframe, "END")} onMessage={onMessage} />}
    </div>
    <div className="mx-4 mb-4 rounded border border-jade/25 bg-jade/[0.04] p-3"><div className="text-xs font-semibold tracking-wide text-jade">{isPair ? "生成这组首尾帧前必须参考的母资产图片" : "生成这张关键帧前必须参考的母资产图片"}</div><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">{getReferences(keyframe).map((asset) => <li key={asset}>{asset}</li>)}</ol><p className="mt-2 text-xs text-slate-500">{isPair ? "上传这些母资产作为 GPT Image 参考图，再分别复制首帧和尾帧 Prompt 出图。尾帧必须延续首帧中的人物、机甲、怪兽与场景结构。" : "上传这些母资产作为 GPT Image 参考图，只生成一张可灵首帧/关键帧图；这个镜头不需要额外尾帧。"}</p></div>
  </ProductionCard>;
}

function FrameColumn({ keyframe, role, versions, store, projectId, onCopied, onMessage }: { keyframe: KeyframeItem; role: KeyframeFrameRole; versions: KeyframeAssetVersion[]; store: KeyframeAssetStore; projectId: VideoProjectId; onCopied: () => void; onMessage: (message: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const best = getBestKeyframeVersion(versions);
  const label = keyframe.frameMode === "PAIR" ? (role === "START" ? "首帧" : "尾帧") : "关键帧";
  const prompt = buildKeyframeImagePrompt(keyframe, role);
  const storageKey = getKeyframeFrameStorageKey(keyframe.storageId, role);
  async function upload(files: FileList | File[] | null) {
    if (!files?.length) return;
    const imported = await importKeyframeFiles({ id: keyframe.storageId, shot: keyframe.shot, title: keyframe.title }, files, prompt, projectId, role);
    onMessage(imported.length ? `${keyframe.id} ${label}已导入 ${imported.length} 个版本，等待审核。` : "没有可导入的图片，请使用 PNG / JPG / WEBP。");
  }
  async function removeAll() {
    if (versions.some(isLocked) && !window.confirm(`${label}含有已通过或 Master 图片。确定删除这个${label}的全部版本吗？`)) return;
    await deleteAllKeyframeFrameVersions(keyframe.storageId, role);
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
    {versions.length > 0 && <div className="mt-3 space-y-2"><div className="flex justify-between text-[11px] text-slate-500"><span>版本 {versions.length}</span><button className="hover:text-red-300" onClick={() => void removeAll()}>删除全部</button></div>{versions.map((version) => <div key={version.versionId} className="flex items-center gap-2 rounded border border-white/10 p-1.5"><img src={version.dataUrl} alt={version.fileName} className="h-10 w-14 rounded object-cover" /><span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-400">{version.versionId} · {version.status}</span><VersionActions storageKey={getKeyframeFrameVersionOwnerKey(store, keyframe.storageId, role, version.versionId)} version={version} /></div>)}</div>}
  </div>;
}

function VersionActions({ storageKey, version }: { storageKey: string; version: KeyframeAssetVersion }) {
  return <div className="flex gap-1"><button className="text-[10px] text-jade" onClick={() => void approveKeyframeVersion(storageKey, version.versionId)}>通过</button><button className="text-[10px] text-blue-200" onClick={() => void setMasterKeyframeVersion(storageKey, version.versionId)}><CheckCircle2 className="inline" size={11} />Master</button><button className="text-[10px] text-slate-400" onClick={() => void rejectKeyframeVersion(storageKey, version.versionId)}>退回</button><button className="text-[10px] text-red-300" onClick={() => { if (!isLocked(version) || window.confirm(`${version.versionId} 是已通过图片，确定删除吗？`)) void deleteKeyframeVersion(storageKey, version.versionId); }}><Trash2 className="inline" size={11} /></button></div>;
}

function FramePreview({ version, label }: { version: KeyframeAssetVersion | null; label: string }) {
  return <div className="relative flex items-center justify-center bg-white/[0.04]">{version ? <img src={version.dataUrl} alt={label} className="h-full w-full object-cover" /> : <div className="text-center text-[10px] text-slate-600"><Image className="mx-auto mb-1" size={18} />等待{label}</div>}<span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-slate-300">{label}</span></div>;
}

function buildKeyframeImagePrompt(keyframe: KeyframeItem, role: KeyframeFrameRole) {
  const references = getReferences(keyframe);
  const isPair = keyframe.frameMode === "PAIR";
  const isStart = role === "START" || !isPair;
  const pairDetail = isPair ? pairFrameDetails[keyframe.id] : undefined;
  const content = pairDetail
    ? (isStart ? pairDetail.start : pairDetail.end)
    : (keyframe.visual || visualDescriptions[keyframe.id] || keyframe.purpose);
  const frameName = isPair ? (isStart ? "首帧" : "尾帧") : "关键帧";
  return [
    `${frameName}：${keyframe.id}《${keyframe.title}》`,
    `剧情目的：${keyframe.purpose}`,
    "参考图：必须上传并参考以下母资产图片：",
    ...references.map((asset, index) => `${index + 1}. ${asset}`),
    `画面内容：${content}`,
    isPair
      ? (isStart ? "构图要求：16:9，建立动作起点，保留主体运动方向和空间余量。" : "构图要求：16:9，必须延续首帧同一镜头轴线、焦段、主光方向和主体设计，只改变动作完成后的姿势、位置或环境后果。")
      : "构图要求：16:9，直接生成这一张可灵可用关键帧，画面完整、主体清晰、空间方向可读；不要额外设计尾帧。",
    "摄影与材质：电影级真实科幻摄影，低饱和冷蓝工业实景光；湿金属、海盐腐蚀、玻璃反射、水汽和雨痕真实可见。",
    "一致性锁定：人物脸型与服装、机甲装甲结构、怪兽身体结构、基地与海防建筑必须严格沿用参考图，不重新设计主体。",
    isPair && !isStart ? "尾帧连续性：人物、机甲、怪兽、场景、天气、光线、服装和比例必须与首帧一致，像同一条视频运动后的结果。" : "",
    "禁止：动漫、游戏CG、塑料材质、霓虹赛博朋克、英雄摆拍、换脸、结构漂移、文字、字幕、logo、水印。"
  ].filter(Boolean).join("\n");
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

const pairFrameDetails: Record<string, { start: string; end: string }> = {
  TR02: {
    start: "深蓝基地观测站内，85mm微距固定机位，旧金属杯占画面主体。杯中水面完全平静，无波纹；杯子、潮湿桌面和窗外海防背景保持静止，不发光。",
    end: "完全复用首帧同一旧金属杯、同一桌面、同一窗外背景与85mm微距固定机位。仅杯中水面出现细小水纹，水纹缓慢向杯心聚拢；不发光，不出现能量和特效。"
  },
  TR05: {
    start: "林舟在值班舱中被低频声惊醒，近景，蓝色警报光扫过左眉浅伤痕；他仍坐在床沿，眼神从睡眠中突然收紧。",
    end: "同一林舟、同一深灰服装，出现在潮湿工业通道中向机库奔跑；35mm侧后方跟拍构图，身体前倾，手臂自然摆动，表情急促但克制。"
  },
  TR06: {
    start: "深蓝基地赤霆机库内，35mm低机位，暗红赤霆01背部装甲占据主体，背部驾驶舱门完全闭合，冷蓝维护灯压低。",
    end: "同一机位、同一赤霆01背部结构，液压舱门已经开启，冷蓝同步光从舱内照出林舟剪影；装甲分块和机库背景必须完全一致。"
  },
  TR07: {
    start: "赤霆01腿部局部，50mm低机位，巨大脚掌悬在机库积水上方，暗红装甲和黑色骨架湿润反光，尚未落地。",
    end: "同一机位和同一脚部结构，赤霆01脚掌压入积水，水被重量水平推开形成低矮波纹；不要展示完整机甲，不要飞溅夸张化。"
  },
  TR08: {
    start: "杭州湾暴雨海面远景，探照灯穿过雨幕，只在水下照出巨大白色影子；白潮没有露出完整身体。",
    end: "同一海域和暴雨条件下，一片巨大白色生物甲壳短暂穿过浪面，带有湿润裂纹和海盐质感；禁止张嘴咆哮和冲向镜头。"
  },
  TR10: {
    start: "海防墙缺口附近，35mm低机位，赤霆01受损左臂伸向变形墙体，撤离车停在远处等待，雨水沿装甲流下。",
    end: "同一位置，赤霆01拳头已经撑住变形海防墙，一辆撤离车从拳头和墙体形成的空间下通过；比例、墙体破损和雨势连续。"
  },
  TR13: {
    start: "赤霆01右臂链刃局部特写，链刃仍处于折叠状态，雨水沿机械锁扣流下，蓝色能源尚未点亮。",
    end: "同一右臂结构，链刃锁扣逐节展开，边缘出现克制的蓝白等离子光；机械结构不能增生，雨水在热边缘形成少量蒸汽。"
  },
  TR14: {
    start: "暴雨闸口前，赤霆01以低重心起步，35mm侧后方低机位，暗红装甲、黑色骨架、右臂链刃和雨线方向清晰。",
    end: "同一赤霆01穿过海防闸口，身体前冲但仍有重量感；装甲结构、链刃位置、暴雨方向和地面积水必须与首帧连续，禁止飞行。"
  },
  TR18: {
    start: "海底24mm广角，潮门表现为冰川裂缝般的压力边界和逆流水体，悬浮物停在水中，色彩低饱和，不是传送门。",
    end: "同一海底机位，沿潮门边缘短暂浮现旧文明几何结构，像被水压揭开的生物组织纹理；禁止紫色能量、闪电和虫洞。"
  },
  TR19: {
    start: "赤霆01右臂与拳头特写，链刃高温点亮，拳头紧握，雨水靠近刀刃处蒸发，画面压抑。",
    end: "同一右臂和拳头机位，链刃能量逐节熄灭，拳头松开，雨水重新落在冷却金属上；动作结果是停止攻击，不是胜利姿态。"
  }
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
  const ep01 = getEP01Keyframes().map((keyframe) => ({ id: keyframe.id, storageId: keyframe.id, shot: keyframe.shot, title: keyframe.title, purpose: keyframe.purpose, required_assets: keyframe.required_assets, status: keyframe.status, visual: visualDescriptions[keyframe.id] ?? keyframe.purpose, frameMode: "SINGLE" as const }));
  const trailerMode = new Map(trailer90Shots.map((shot) => [shot.id, shot.mode]));
  return getVideoProjects().map((project) => project.id === "EP01" ? { id: project.id, label: project.label, helper: project.helper, keyframes: ep01 } : { id: project.id, label: project.label, helper: project.helper, keyframes: project.shots.map((shot) => ({ id: shot.keyframeId, storageId: project.id === "TRAILER90" ? `TRAILER_${shot.keyframeId}` : `${project.id}_${shot.keyframeId}`, shot: shot.id, title: shot.title, purpose: shot.description, required_assets: project.requiredAssets[shot.id] ?? [], status: shot.status, visual: shot.notes || shot.description, frameMode: project.id === "TRAILER90" && trailerMode.get(shot.keyframeId) === "首尾帧" ? "PAIR" as const : "SINGLE" as const })) });
}

async function copyText(text: string) { try { await navigator.clipboard.writeText(text); } catch { const textarea = document.createElement("textarea"); textarea.value = text; textarea.style.position = "fixed"; textarea.style.opacity = "0"; document.body.appendChild(textarea); textarea.focus(); textarea.select(); document.execCommand("copy"); document.body.removeChild(textarea); } }
function Metric({ label, value }: { label: string; value: string | number }) { return <ProductionCard className="p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></ProductionCard>; }
function EmptyProject({ label }: { label: string }) { return <div className="rounded-md border border-white/10 bg-white/[0.02] p-16 text-center"><div className="text-lg font-semibold text-white">{label}尚未建立正式关键帧</div><p className="mt-2 text-sm text-slate-500">请先完成该集剧本和 Storyboard，镜头会自动进入此分区。</p></div>; }
function isLocked(version: KeyframeAssetVersion) { return version.status === "APPROVED" || version.status === "MASTER_REFERENCE"; }
