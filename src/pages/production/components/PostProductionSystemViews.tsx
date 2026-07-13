import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clipboard, Download, Film, Music, Plus, Save, Trash2, Upload } from "lucide-react";
import { getVideoProjects, type VideoProjectId } from "../../../mcp/videoWorkspace/VideoProjectData";
import { bestVideoVersion, deleteVideoVersion, importVideoClips, loadVideoClipStore, subscribeVideoClips, updateVideoVersion, type VideoClipStore, type VideoClipVersion, type VideoVersionStatus } from "../../../mcp/videoWorkspace/VideoClipStore";
import { getKlingPrompt } from "../../../mcp/videoWorkspace/KlingPromptStore";
import {
  addAudio,
  addSubtitle,
  addVoice,
  buildSrt,
  createFinalPackageManifest,
  deleteAudio,
  deleteSubtitle,
  deleteVoice,
  loadPostProductionState,
  moveTrailerShot,
  savePostProductionState,
  setTransitionPreview,
  subscribePostProduction,
  updateAudio,
  updateIntro,
  updateSubtitle,
  updateTrailerShot,
  updateTransition,
  updateVoice,
  upsertVideoMetadata,
  type AudioCategory,
  type PostCategory,
  type PostProductionState,
  type SubtitleKind,
  type TrailerEditShot,
  type TrailerCutType,
  type TransitionItem,
  type VideoMaterialMetadata,
  type VoiceRole
} from "../../../mcp/postProduction/PostProductionStore";

const videoStatusText: Record<VideoVersionStatus, string> = { REVIEW: "待审核", APPROVED: "已通过", MASTER: "Master", REJECTED: "已退回" };
const categories: PostCategory[] = ["角色动作", "机甲动作", "怪兽动作", "场景运动", "战斗镜头", "情绪镜头", "转场素材"];
const cutTypes: TrailerCutType[] = ["15秒预告", "30秒预告", "90秒预告", "4分钟短片"];
const subtitleTypes: SubtitleKind[] = ["旁白字幕", "角色对白字幕", "信息字幕", "预告片大字标题"];
const audioCategories: AudioCategory[] = ["海洋环境", "风暴", "巨兽低吼", "机甲启动", "能源声", "金属碰撞", "战斗爆炸", "情绪音乐"];

export function VideoMaterialLibraryView() {
  const projects = useMemo(() => getVideoProjects(), []);
  const [projectId, setProjectId] = useState<VideoProjectId>("TRAILER90");
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const shots = project.shots;
  const [selectedShot, setSelectedShot] = useState(shots[0]?.id ?? "");
  const [clips, setClips] = useState<VideoClipStore>({});
  const [state, setState] = usePostState();
  const [filter, setFilter] = useState<PostCategory | "全部">("全部");
  const fileRef = useRef<HTMLInputElement>(null);
  const shot = shots.find((item) => item.id === selectedShot) ?? shots[0];
  const versions = shot ? (clips[shot.id] ?? []) : [];
  const current = bestVideoVersion(versions);
  const metaKey = current && shot ? videoMetaKey(shot.id, current.versionId) : "";
  const meta = metaKey ? state.videoMetadata[metaKey] ?? defaultMetadata(metaKey, shot?.id ?? "") : null;
  const visible = shots.flatMap((item) => (clips[item.id] ?? []).map((version) => ({ shot: item, version, meta: state.videoMetadata[videoMetaKey(item.id, version.versionId)] ?? defaultMetadata(videoMetaKey(item.id, version.versionId), item.id) }))).filter((row) => filter === "全部" || row.meta.category === filter);

  useEffect(() => {
    const reload = () => loadVideoClipStore().then(setClips);
    reload();
    return subscribeVideoClips(reload);
  }, []);
  useEffect(() => setSelectedShot(shots[0]?.id ?? ""), [projectId]);

  async function upload(files: FileList | File[] | null) {
    if (!shot || !files?.length) return;
    const imported = await importVideoClips(shot.id, files, getKlingPrompt(shot));
    imported.forEach((version) => upsertVideoMetadata(videoMetaKey(shot.id, version.versionId), { videoId: `VID-${shot.id}-${version.versionId}`, category: "场景运动", shotType: shot.shotSize, tool: "可灵", linkedAssets: project.requiredAssets[shot.id] ?? [], notes: shot.description }));
  }
  async function updateStatus(status: VideoVersionStatus) {
    if (shot && current) await updateVideoVersion(shot.id, current.versionId, { status });
  }
  async function removeVersion() {
    if (!shot || !current) return;
    const warning = current.status === "APPROVED" || current.status === "MASTER" ? "这是已通过或 Master 视频，确定永久删除吗？" : "确定删除这个视频版本吗？";
    if (confirm(warning)) await deleteVideoVersion(shot.id, current.versionId);
  }
  function saveMeta(patch: Partial<VideoMaterialMetadata>) {
    if (!metaKey) return;
    upsertVideoMetadata(metaKey, patch);
  }

  return <Page eyebrow="POST PRODUCTION" title="视频素材库" subtitle="管理可灵生成的视频片段。上传后进入待审核，补齐分类、标签、关联资产、镜头类型和生成工具。">
    <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} />
    <div className="grid gap-4 md:grid-cols-4">
      <Metric label="当前分区" value={project.label} />
      <Metric label="已上传视频" value={String(Object.values(clips).reduce((sum, list) => sum + list.length, 0))} />
      <Metric label="可见素材" value={String(visible.length)} />
      <Metric label="Master版本" value={String(visible.filter((item) => item.version.status === "MASTER").length)} />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">{(["全部", ...categories] as const).map((item) => <button key={item} className={`btn ${filter === item ? "border-jade/50 text-jade" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Panel title="视频片段清单">
        <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
          {visible.length ? visible.map(({ shot, version, meta }) => <button key={`${shot.id}-${version.versionId}`} onClick={() => setSelectedShot(shot.id)} className={`w-full rounded border p-3 text-left ${shot.id === selectedShot && version.versionId === current?.versionId ? "border-jade/60 bg-jade/10" : "border-white/10 bg-black/20 hover:border-white/25"}`}>
            <div className="flex justify-between text-xs"><span className="text-jade">{meta.videoId}</span><span>{version.duration || 0}s</span></div>
            <div className="mt-1 font-semibold text-white">{shot.title}</div>
            <div className="mt-2 flex flex-wrap gap-1 text-[11px]">{[meta.category, version.status, meta.tool].map((tag) => <span key={tag} className="rounded border border-white/10 px-2 py-0.5 text-slate-400">{tag}</span>)}</div>
          </button>) : <Empty text="当前分类还没有上传视频。" />}
        </div>
      </Panel>
      <Panel title={shot ? `${shot.id} / ${shot.title}` : "选择 Shot"} actions={<button className="btn" onClick={() => fileRef.current?.click()}><Upload size={15} />上传视频</button>}>
        <input ref={fileRef} hidden type="file" multiple accept="video/mp4,video/webm,video/quicktime,.mov" onChange={(event) => void upload(event.target.files)} />
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void upload(event.dataTransfer.files); }} className="rounded border border-dashed border-jade/30 bg-black/20 p-5 text-center text-sm text-slate-400">
          <Upload className="mx-auto mb-2 text-jade" />拖拽 MP4 / WEBM / MOV 到这里，或点击右上角上传。
        </div>
        <div className="mt-4 aspect-video overflow-hidden rounded border border-white/10 bg-black">{current ? <VideoPreview version={current} /> : <Empty text="尚未选择或上传视频" />}</div>
        {current && meta && <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Info label="Video ID" value={meta.videoId} onChange={(value) => saveMeta({ videoId: value })} />
          <SelectInfo label="分类" value={meta.category} options={categories} onChange={(value) => saveMeta({ category: value as PostCategory })} />
          <Info label="Episode" value={project.id} readOnly />
          <Info label="Shot ID" value={shot?.id ?? ""} readOnly />
          <Info label="关联资产" value={meta.linkedAssets.join(" / ")} onChange={(value) => saveMeta({ linkedAssets: splitTags(value) })} />
          <Info label="镜头类型" value={meta.shotType} onChange={(value) => saveMeta({ shotType: value })} />
          <SelectInfo label="生成工具" value={meta.tool} options={["可灵", "Veo", "Runway", "手动导入"]} onChange={(value) => saveMeta({ tool: value as VideoMaterialMetadata["tool"] })} />
          <Info label="标签" value={meta.tags.join(" / ")} onChange={(value) => saveMeta({ tags: splitTags(value) })} />
        </div>}
        {current && <div className="mt-4 flex flex-wrap gap-2"><button className="btn" onClick={() => updateStatus("APPROVED")}><Check size={15} />通过</button><button className="btn" onClick={() => updateStatus("MASTER")}><Film size={15} />设为 Master</button><button className="btn text-red-300" onClick={removeVersion}><Trash2 size={15} />删除视频</button></div>}
      </Panel>
    </div>
  </Page>;
}

export function TrailerEditorView() {
  const [state, setState] = usePostState();
  const [cutType, setCutType] = useState<TrailerCutType>("90秒预告");
  const shots = state.trailerShots.filter((item) => item.cutType === cutType).sort((a, b) => a.order - b.order);
  const total = shots.reduce((sum, item) => sum + Number(item.duration || 0), 0);
  function exportPlan() { downloadText(`${cutType}_剪辑规划.json`, JSON.stringify(shots, null, 2), "application/json"); }
  return <Page eyebrow="TRAILER EDITOR" title="预告片剪辑规划" subtitle="电影预剪辑管理：排序、节奏、情绪、镜头作用和备注都会保存在本地工作台。">
    <div className="flex flex-wrap items-center gap-2">{cutTypes.map((item) => <button key={item} className={`btn ${cutType === item ? "border-jade/50 text-jade" : ""}`} onClick={() => setCutType(item)}>{item}</button>)}<button className="btn ml-auto" onClick={exportPlan}><Download size={15} />导出规划</button></div>
    <div className="mt-4 grid gap-4 md:grid-cols-4"><Metric label="镜头数" value={shots.length} /><Metric label="规划时长" value={`${total}s`} /><Metric label="快节奏" value={shots.filter((item) => item.rhythm === "快").length} /><Metric label="关联资产" value={new Set(shots.flatMap((item) => item.linkedAssets)).size} /></div>
    <Panel title={`${cutType} 时间线`}>
      <div className="space-y-2">{shots.map((shot, index) => <div key={shot.id} className="grid gap-3 rounded border border-white/10 bg-black/20 p-3 xl:grid-cols-[64px_minmax(0,1fr)_280px]">
        <div className="font-mono text-jade">Shot {String(index + 1).padStart(2, "0")}</div>
        <div className="grid gap-2 md:grid-cols-2">
          <Info label="镜头名称" value={shot.name} onChange={(value) => updateTrailerShot(shot.id, { name: value })} />
          <Info label="对应资产" value={shot.linkedAssets.join(" / ")} onChange={(value) => updateTrailerShot(shot.id, { linkedAssets: splitTags(value) })} />
          <Info label="情绪" value={shot.emotion} onChange={(value) => updateTrailerShot(shot.id, { emotion: value })} />
          <Info label="作用" value={shot.function} onChange={(value) => updateTrailerShot(shot.id, { function: value })} />
          <Info label="时长" value={String(shot.duration)} onChange={(value) => updateTrailerShot(shot.id, { duration: Number(value) || 0 })} />
          <SelectInfo label="节奏" value={shot.rhythm} options={["慢", "中", "快"]} onChange={(value) => updateTrailerShot(shot.id, { rhythm: value as TrailerEditShot["rhythm"] })} />
        </div>
        <div className="space-y-2"><textarea className="min-h-28 w-full rounded border border-white/10 bg-black/30 p-2 text-xs leading-5" value={shot.notes} onChange={(event) => updateTrailerShot(shot.id, { notes: event.target.value })} /><div className="flex gap-2"><button className="btn h-8 text-xs" onClick={() => moveTrailerShot(shot.id, -1)}>上移</button><button className="btn h-8 text-xs" onClick={() => moveTrailerShot(shot.id, 1)}>下移</button></div></div>
      </div>)}</div>
    </Panel>
  </Page>;
}

export function SubtitleStudioView() {
  const [state] = usePostState();
  function exportSrt() { downloadText("TRAILER_SUBTITLE.srt", buildSrt(state.subtitles), "text/plain"); }
  return <Page eyebrow="SUBTITLE STUDIO" title="字幕系统" subtitle="管理旁白字幕、对白字幕、信息字幕和预告片大字标题。">
    <div className="mb-4 flex gap-2"><button className="btn" onClick={addSubtitle}><Plus size={15} />新增字幕</button><button className="btn" onClick={exportSrt}><Download size={15} />导出 SRT</button></div>
    <div className="grid gap-3">{state.subtitles.map((item) => <Panel key={item.id} title={`${item.id} · ${item.type}`} actions={<button className="btn text-red-300" onClick={() => deleteSubtitle(item.id)}><Trash2 size={15} />删除</button>}>
      <div className="grid gap-3 lg:grid-cols-4"><SelectInfo label="类型" value={item.type} options={subtitleTypes} onChange={(value) => updateSubtitle(item.id, { type: value as SubtitleKind })} /><Info label="出现时间" value={item.start} onChange={(value) => updateSubtitle(item.id, { start: value })} /><Info label="消失时间" value={item.end} onChange={(value) => updateSubtitle(item.id, { end: value })} /><Info label="说话人" value={item.speaker} onChange={(value) => updateSubtitle(item.id, { speaker: value })} /><Info label="字体" value={item.font} onChange={(value) => updateSubtitle(item.id, { font: value })} /><Info label="大小" value={String(item.size)} onChange={(value) => updateSubtitle(item.id, { size: Number(value) || item.size })} /><Info label="位置" value={item.position} onChange={(value) => updateSubtitle(item.id, { position: value })} /><Info label="动画效果" value={item.animation} onChange={(value) => updateSubtitle(item.id, { animation: value })} /></div>
      <textarea className="mt-3 min-h-24 w-full rounded border border-white/10 bg-black/30 p-3 text-sm" value={item.text} onChange={(event) => updateSubtitle(item.id, { text: event.target.value })} />
    </Panel>)}</div>
  </Page>;
}

export function VoiceStudioView() {
  const [state] = usePostState();
  function exportVoice() { downloadText("VOICE_STUDIO.json", JSON.stringify(state.voices, null, 2), "application/json"); }
  return <Page eyebrow="VOICE STUDIO" title="AI配音系统" subtitle="管理旁白、角色声音和AI声音版本。这里保存文本、声音类型、语速、情绪和版本。">
    <div className="mb-4 flex gap-2"><button className="btn" onClick={addVoice}><Plus size={15} />新增配音</button><button className="btn" onClick={exportVoice}><Download size={15} />导出配音表</button></div>
    <div className="grid gap-3 lg:grid-cols-2">{state.voices.map((item) => <Panel key={item.id} title={`${item.id} · ${item.role}`} actions={<button className="btn text-red-300" onClick={() => deleteVoice(item.id)}><Trash2 size={15} />删除</button>}>
      <div className="grid gap-3 sm:grid-cols-2"><SelectInfo label="角色" value={item.role} options={["旁白", "林舟", "许燃", "陈牧", "AI澜"]} onChange={(value) => updateVoice(item.id, { role: value as VoiceRole })} /><Info label="声音类型" value={item.voiceType} onChange={(value) => updateVoice(item.id, { voiceType: value })} /><Info label="语速" value={item.speed} onChange={(value) => updateVoice(item.id, { speed: value })} /><Info label="版本" value={item.version} onChange={(value) => updateVoice(item.id, { version: value })} /></div>
      <Info className="mt-3" label="情绪" value={item.emotion} onChange={(value) => updateVoice(item.id, { emotion: value })} />
      <textarea className="mt-3 min-h-24 w-full rounded border border-white/10 bg-black/30 p-3 text-sm" value={item.text} onChange={(event) => updateVoice(item.id, { text: event.target.value })} />
    </Panel>)}</div>
  </Page>;
}

export function AudioLibraryView() {
  const [state] = usePostState();
  const fileRef = useRef<HTMLInputElement>(null);
  async function upload(files: FileList | null) { if (files?.[0]) await addAudio(files[0]); }
  return <Page eyebrow="AUDIO LIBRARY" title="音效与BGM系统" subtitle="管理海洋环境、风暴、巨兽低吼、机甲启动、能源声、金属碰撞、战斗爆炸和情绪音乐。">
    <div className="mb-4 flex gap-2"><button className="btn" onClick={() => fileRef.current?.click()}><Upload size={15} />上传音频</button><input ref={fileRef} hidden type="file" accept="audio/*" onChange={(event) => void upload(event.target.files)} /></div>
    <div className="grid gap-3 lg:grid-cols-2">{state.audio.map((item) => <Panel key={item.id} title={`${item.id} · ${item.name}`} actions={<button className="btn text-red-300" onClick={() => deleteAudio(item.id)}><Trash2 size={15} />删除</button>}>
      {item.dataUrl ? <audio src={item.dataUrl} controls className="mb-3 w-full" /> : <div className="mb-3 rounded border border-white/10 bg-black/20 p-4 text-sm text-slate-500">未上传音频文件，仅作为声音设计占位。</div>}
      <div className="grid gap-3 sm:grid-cols-2"><Info label="名称" value={item.name} onChange={(value) => updateAudio(item.id, { name: value })} /><SelectInfo label="分类" value={item.category} options={audioCategories} onChange={(value) => updateAudio(item.id, { category: value as AudioCategory })} /><Info label="关联镜头" value={item.shotId} onChange={(value) => updateAudio(item.id, { shotId: value })} /><Info label="标签" value={item.tags.join(" / ")} onChange={(value) => updateAudio(item.id, { tags: splitTags(value) })} /></div>
      <textarea className="mt-3 min-h-20 w-full rounded border border-white/10 bg-black/30 p-3 text-sm" value={item.notes} onChange={(event) => updateAudio(item.id, { notes: event.target.value })} />
    </Panel>)}</div>
  </Page>;
}

export function TransitionLibraryView() {
  const [state] = usePostState();
  return <Page eyebrow="TRANSITION LIBRARY" title="转场系统" subtitle="管理电影级转场：黑场、闪白、能量波纹、海水遮挡、镜头推进和故障效果。">
    <div className="grid gap-3 lg:grid-cols-2">{state.transitions.map((item) => <Panel key={item.id} title={`${item.id} · ${item.name}`}>
      <div className="aspect-video overflow-hidden rounded border border-white/10 bg-black/30">{item.preview ? item.preview.startsWith("data:video") ? <video src={item.preview} controls className="h-full w-full object-cover" /> : <img src={item.preview} className="h-full w-full object-cover" /> : <Empty text="可上传预览图或视频" />}</div>
      <div className="mt-3"><input type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" onChange={(event) => event.target.files?.[0] && void setTransitionPreview(item.id, event.target.files[0])} className="text-sm text-slate-400" /></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><Info label="名称" value={item.name} onChange={(value) => updateTransition(item.id, { name: value })} /><SelectInfo label="类型" value={item.type} options={["黑场", "闪白", "能量波纹", "海水遮挡", "镜头推进", "故障效果"]} onChange={(value) => updateTransition(item.id, { type: value as TransitionItem["type"] })} /><Info label="用途" value={item.usage} onChange={(value) => updateTransition(item.id, { usage: value })} /><Info label="时长" value={String(item.duration)} onChange={(value) => updateTransition(item.id, { duration: Number(value) || item.duration })} /></div>
      <textarea className="mt-3 min-h-20 w-full rounded border border-white/10 bg-black/30 p-3 text-sm" value={item.notes} onChange={(event) => updateTransition(item.id, { notes: event.target.value })} />
    </Panel>)}</div>
  </Page>;
}

export function FilmIntroductionView() {
  const [state] = usePostState();
  function exportCards() { downloadText("FILM_INTRO_CARDS.json", JSON.stringify(state.intros, null, 2), "application/json"); }
  return <Page eyebrow="FILM INTRODUCTION" title="角色/场景介绍包装" subtitle="为预告片生成角色出场卡、场景介绍卡和机甲介绍卡。">
    <div className="mb-4 flex justify-end"><button className="btn" onClick={exportCards}><Download size={15} />导出介绍卡</button></div>
    <div className="grid gap-3 lg:grid-cols-2">{state.intros.map((item) => <Panel key={item.id} title={`${item.id} · ${item.kind}`}>
      <div className="rounded border border-jade/20 bg-black/30 p-5"><div className="text-xs uppercase tracking-[0.24em] text-jade">{item.line1}</div><div className="mt-2 text-2xl font-bold text-white">{item.target}</div><div className="mt-2 text-sm text-slate-400">{item.line2}</div></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><Info label="对象" value={item.target} onChange={(value) => updateIntro(item.id, { target: value })} /><Info label="第一行" value={item.line1} onChange={(value) => updateIntro(item.id, { line1: value })} /><Info label="第二行" value={item.line2} onChange={(value) => updateIntro(item.id, { line2: value })} /><Info label="时间" value={`${item.start} - ${item.end}`} readOnly /><Info label="动画" value={item.animation} onChange={(value) => updateIntro(item.id, { animation: value })} /><Info label="关联资产" value={item.linkedAsset} onChange={(value) => updateIntro(item.id, { linkedAsset: value })} /></div>
    </Panel>)}</div>
  </Page>;
}

export function PostFinalPackageView() {
  const [state] = usePostState();
  const [clips, setClips] = useState<VideoClipStore>({});
  useEffect(() => { const reload = () => loadVideoClipStore().then(setClips); reload(); return subscribeVideoClips(reload); }, []);
  const videoCount = Object.values(clips).reduce((sum, list) => sum + list.length, 0);
  const manifest = createFinalPackageManifest(state, videoCount);
  function exportJson() { downloadText("TIDE_STEEL_POST_PACKAGE.json", JSON.stringify(manifest, null, 2), "application/json"); }
  function exportMarkdown() { downloadText("TIDE_STEEL_POST_PACKAGE.md", packageMarkdown(manifest), "text/markdown"); }
  return <Page eyebrow="FINAL PACKAGE" title="后期导出中心" subtitle="导出给剪映继续精修的后期制作包：素材索引、字幕、配音、BGM、镜头清单和 Prompt 记录。">
    <div className="grid gap-4 md:grid-cols-4"><Metric label="视频素材" value={videoCount} /><Metric label="字幕" value={state.subtitles.length} /><Metric label="配音" value={state.voices.length} /><Metric label="音效/BGM" value={state.audio.length} /></div>
    <Panel title="导出内容"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{manifest.exportTargets.map((item) => <div key={item} className="rounded border border-white/10 bg-black/20 p-4 text-sm text-slate-300">{item}</div>)}</div><div className="mt-4 flex gap-2"><button className="btn" onClick={exportJson}><Download size={15} />导出 JSON</button><button className="btn" onClick={exportMarkdown}><Download size={15} />导出 Markdown</button></div></Panel>
  </Page>;
}

function usePostState(): [PostProductionState, (value: PostProductionState) => void] {
  const [state, setState] = useState(loadPostProductionState);
  useEffect(() => subscribePostProduction(() => setState(loadPostProductionState())), []);
  return [state, (value) => { savePostProductionState(value); setState(value); }];
}

function Page({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="space-y-5"><header><div className="text-xs uppercase tracking-[0.28em] text-jade">{eyebrow}</div><h2 className="mt-2 text-2xl font-bold text-white">{title}</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{subtitle}</p></header>{children}</div>;
}
function Panel({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-lg border border-white/10 bg-white/[0.02]"><div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-4"><h3 className="font-semibold text-white">{title}</h3><div className="flex gap-2">{actions}</div></div><div className="p-4">{children}</div></section>; }
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded border border-white/10 bg-white/[0.02] p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-bold text-white">{value}</div></div>; }
function Info({ label, value, onChange, readOnly, className = "" }: { label: string; value: string; onChange?: (value: string) => void; readOnly?: boolean; className?: string }) { return <label className={`block rounded border border-white/10 bg-black/20 p-3 ${className}`}><div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div><input className="mt-1 w-full bg-transparent text-sm text-slate-200 outline-none" value={value} readOnly={readOnly || !onChange} onChange={(event) => onChange?.(event.target.value)} /></label>; }
function SelectInfo({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) { return <label className="block rounded border border-white/10 bg-black/20 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div><select className="mt-1 w-full bg-transparent text-sm text-slate-200 outline-none" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>; }
function Empty({ text }: { text: string }) { return <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">{text}</div>; }
function ProjectSelector({ projects, value, onChange }: { projects: ReturnType<typeof getVideoProjects>; value: VideoProjectId; onChange: (value: VideoProjectId) => void }) { return <div className="flex flex-wrap items-center gap-3 rounded border border-white/10 bg-white/[0.02] p-3"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">作品分区</div><select className="min-w-[260px] rounded border border-jade/30 bg-[#0b1017] px-3 py-2 text-sm text-white outline-none" value={value} onChange={(event) => onChange(event.target.value as VideoProjectId)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.label} · {project.id}</option>)}</select></div>; }
function VideoPreview({ version }: { version: VideoClipVersion }) { const [url, setUrl] = useState(""); useEffect(() => { const next = URL.createObjectURL(version.blob); setUrl(next); return () => URL.revokeObjectURL(next); }, [version.blob]); return url ? <video src={url} controls className="h-full w-full object-contain" /> : null; }
function videoMetaKey(shotId: string, versionId: string) { return `${shotId}::${versionId}`; }
function defaultMetadata(key: string, shotId: string): VideoMaterialMetadata { return { key, videoId: `VID-${shotId}`, category: "场景运动", tags: ["待整理"], linkedAssets: [], shotType: "电影镜头", tool: "可灵", notes: "" }; }
function splitTags(value: string) { return value.split(/[\/,，、\n]/).map((item) => item.trim()).filter(Boolean); }
async function copyText(value: string) { try { await navigator.clipboard.writeText(value); } catch { const area = document.createElement("textarea"); area.value = value; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); } }
function downloadText(name: string, value: string, type: string) { const url = URL.createObjectURL(new Blob([value], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); }
function packageMarkdown(manifest: ReturnType<typeof createFinalPackageManifest>) { return [`# ${manifest.project} 后期制作包`, `生成时间：${manifest.generatedAt}`, `视频素材：${manifest.videoMaterials}`, `字幕：${manifest.subtitles.length}`, `配音：${manifest.voices.length}`, `音效/BGM：${manifest.audio.length}`, "", "## 导出内容", ...manifest.exportTargets.map((item) => `- ${item}`)].join("\n"); }
