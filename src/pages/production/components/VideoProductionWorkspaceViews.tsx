import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clipboard, Download, Film, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import { loadStoryboardWorkspace, subscribeStoryboardWorkspace, type StoryboardShot } from "../../../mcp/storyboardWorkspace/StoryboardWorkspaceStore";
import { getKlingPrompt, resetKlingPrompt, saveKlingPrompt, subscribeKlingPrompts } from "../../../mcp/videoWorkspace/KlingPromptStore";
import { bestVideoVersion, deleteVideoVersion, importVideoClips, loadVideoClipStore, subscribeVideoClips, updateVideoVersion, type VideoClipStore, type VideoClipVersion, type VideoVersionStatus } from "../../../mcp/videoWorkspace/VideoClipStore";
import { getBestKeyframeVersion, loadKeyframeStore, subscribeKeyframeStore, type KeyframeAssetStore } from "../../../mcp/keyframeLibrary/KeyframeAssetStore";

const statusText: Record<VideoVersionStatus, string> = { REVIEW: "待审核", APPROVED: "已通过", MASTER: "Master 版本", REJECTED: "已退回" };

export function KlingPromptWorkspaceView() {
  const [shots, setShots] = useState(() => loadStoryboardWorkspace());
  const [selectedId, setSelectedId] = useState(shots[0]?.id ?? "");
  const selected = shots.find((shot) => shot.id === selectedId) ?? shots[0];
  const [prompt, setPrompt] = useState(selected ? getKlingPrompt(selected) : "");
  const [saved, setSaved] = useState(true);

  useEffect(() => subscribeStoryboardWorkspace(() => setShots(loadStoryboardWorkspace())), []);
  useEffect(() => subscribeKlingPrompts(() => selected && setPrompt(getKlingPrompt(selected))), [selected?.id]);
  useEffect(() => { if (selected) { setPrompt(getKlingPrompt(selected)); setSaved(true); } }, [selected?.id]);

  async function copy() { await copyText(prompt); }
  function save() { if (!selected) return; saveKlingPrompt(selected.id, prompt.trim()); setSaved(true); }
  function restore() { if (!selected || !confirm("恢复这个 Shot 的默认中文 Prompt？")) return; resetKlingPrompt(selected.id); setPrompt(getKlingPrompt(selected)); setSaved(true); }
  function exportAll() {
    downloadText("EP01_可灵提示词.json", JSON.stringify(shots.map((shot) => ({ shotId: shot.id, keyframeId: shot.keyframeId, title: shot.title, prompt: getKlingPrompt(shot) })), null, 2), "application/json");
  }

  return <Page title="可灵提示词" subtitle="EP01 的逐镜头中文视频 Prompt。人物表演拆分为表情、动作与说话语气，修改后保存在本机工作台。">
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Panel title={`EP01 Shot · ${shots.length}`}>
        <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">{shots.map((shot) => <button key={shot.id} onClick={() => setSelectedId(shot.id)} className={`w-full rounded border p-3 text-left ${shot.id === selected?.id ? "border-jade/60 bg-jade/10" : "border-white/10 bg-black/20 hover:border-white/25"}`}>
          <div className="flex justify-between text-xs"><span className="text-jade">{shot.id}</span><span className="text-slate-500">{shot.duration} 秒</span></div>
          <div className="mt-1 font-semibold text-white">{shot.title}</div><div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{shot.description}</div>
        </button>)}</div>
      </Panel>
      {selected && <Panel title={`${selected.keyframeId} / ${selected.title}`} actions={<><button className="btn" onClick={copy}><Clipboard size={15}/>复制 Prompt</button><button className="btn" onClick={exportAll}><Download size={15}/>导出全部</button></>}>
        <div className="grid gap-3 sm:grid-cols-4"><Info label="角色" value={selected.character}/><Info label="场景" value={selected.environment}/><Info label="摄影" value={`${selected.shotSize} · ${selected.lens}`}/><Info label="运镜" value={selected.movement}/></div>
        <textarea className="mt-4 min-h-[520px] w-full resize-y rounded border border-white/10 bg-black/30 p-4 text-sm leading-7 text-slate-200 outline-none focus:border-jade/50" value={prompt} onChange={(event) => { setPrompt(event.target.value); setSaved(false); }} />
        <div className="mt-3 flex items-center justify-between"><span className={saved ? "text-xs text-jade" : "text-xs text-amber-300"}>{saved ? "当前修改已保存" : "存在未保存修改"}</span><div className="flex gap-2"><button className="btn" onClick={restore}><RotateCcw size={15}/>恢复默认</button><button className="btn border-jade/40 text-jade" onClick={save}><Save size={15}/>保存 Prompt</button></div></div>
      </Panel>}
    </div>
  </Page>;
}

export function VideoClipWorkspaceView() {
  const shots = useMemo(() => loadStoryboardWorkspace(), []);
  const [selectedId, setSelectedId] = useState(shots[0]?.id ?? "");
  const [store, setStore] = useState<VideoClipStore>({});
  const [keyframes, setKeyframes] = useState<KeyframeAssetStore>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = shots.find((shot) => shot.id === selectedId) ?? shots[0];
  const versions = store[selectedId] ?? [];
  const current = bestVideoVersion(versions);
  const firstFrame = selected ? getBestKeyframeVersion(keyframes[selected.keyframeId]) : null;
  const refresh = () => loadVideoClipStore().then(setStore);
  useEffect(() => { refresh(); loadKeyframeStore().then(setKeyframes); return subscribeVideoClips(refresh); }, []);
  useEffect(() => subscribeKeyframeStore(() => loadKeyframeStore().then(setKeyframes)), []);

  async function upload(files: FileList | File[]) { if (!selected) return; const imported = await importVideoClips(selected.id, files, getKlingPrompt(selected)); if (!imported.length) alert("请选择 MP4、WEBM 或 MOV 视频文件。"); }
  async function changeStatus(status: VideoVersionStatus) { if (current) await updateVideoVersion(selectedId, current.versionId, { status }); }
  async function remove() { if (!current) return; const warning = current.status === "MASTER" || current.status === "APPROVED" ? "该版本已通过审核。确认永久删除？" : "确认删除这个视频版本？"; if (confirm(warning)) await deleteVideoVersion(selectedId, current.versionId); }

  const uploadedShots = Object.values(store).filter((items) => items.length).length;
  return <Page title="视频片段" subtitle="上传你在可灵中制作的真实视频。文件保存在浏览器 IndexedDB，版本、Prompt 与对应 Shot 同步管理。">
    <div className="grid gap-4 md:grid-cols-4"><Stat label="已有视频的 Shot" value={`${uploadedShots}/${shots.length}`}/><Stat label="视频版本" value={String(Object.values(store).flat().length)}/><Stat label="待审核" value={String(Object.values(store).flat().filter(v=>v.status==="REVIEW").length)}/><Stat label="Master" value={String(Object.values(store).flat().filter(v=>v.status==="MASTER").length)}/></div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]"><Panel title="EP01 Shot">
      <div className="max-h-[700px] space-y-2 overflow-y-auto">{shots.map((shot) => { const version = bestVideoVersion(store[shot.id] ?? []); return <button key={shot.id} onClick={()=>setSelectedId(shot.id)} className={`w-full rounded border p-3 text-left ${shot.id===selectedId?"border-jade/60 bg-jade/10":"border-white/10"}`}><div className="flex justify-between"><span className="text-xs text-jade">{shot.id}</span><span className="text-xs text-slate-500">{version ? statusText[version.status] : "未上传"}</span></div><div className="mt-1 text-sm font-semibold">{shot.title}</div></button>; })}</div>
    </Panel>{selected && <Panel title={`${selected.keyframeId} / ${selected.title}`} actions={<button className="btn" onClick={()=>copyText(getKlingPrompt(selected))}><Clipboard size={15}/>复制可灵 Prompt</button>}>
      <div className="grid gap-4 lg:grid-cols-2"><div><div className="mb-2 text-xs text-slate-500">首帧参考</div><div className="aspect-video overflow-hidden rounded border border-white/10 bg-white/[0.03]">{firstFrame ? <img src={firstFrame.dataUrl} className="h-full w-full object-cover"/> : <Empty text="该 Shot 尚无关键帧"/>}</div></div><div><div className="mb-2 text-xs text-slate-500">当前视频</div><div className="aspect-video overflow-hidden rounded border border-white/10 bg-white/[0.03]">{current ? <BlobVideo version={current}/> : <Empty text="尚未上传视频"/>}</div></div></div>
      <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); upload(e.dataTransfer.files);}} className="mt-4 rounded border border-dashed border-jade/30 p-6 text-center"><Upload className="mx-auto text-jade"/><div className="mt-2 text-sm">拖拽 MP4 / WEBM / MOV 到这里</div><button className="btn mt-3" onClick={()=>fileRef.current?.click()}>选择视频文件</button><input ref={fileRef} hidden type="file" multiple accept="video/mp4,video/webm,video/quicktime,.mov" onChange={e=>e.target.files&&upload(e.target.files)}/></div>
      {current && <><div className="mt-4 grid gap-3 sm:grid-cols-4"><Info label="Version" value={current.versionId}/><Info label="状态" value={statusText[current.status]}/><Info label="时长" value={`${current.duration || "未知"} 秒`}/><Info label="文件" value={current.fileName}/></div><div className="mt-3 flex flex-wrap gap-2"><button className="btn" onClick={()=>changeStatus("APPROVED")}><Check size={15}/>通过</button><button className="btn" onClick={()=>changeStatus("MASTER")}><Film size={15}/>设为 Master</button><button className="btn" onClick={()=>changeStatus("REJECTED")}><X size={15}/>退回</button><button className="btn text-red-300" onClick={remove}><Trash2 size={15}/>删除版本</button></div></>}
    </Panel>}</div>
  </Page>;
}

export function VideoVersionManagerView() {
  const shots = useMemo(() => loadStoryboardWorkspace(), []);
  const [store, setStore] = useState<VideoClipStore>({});
  const [status, setStatus] = useState<"ALL"|VideoVersionStatus>("ALL");
  const [selectedKey, setSelectedKey] = useState("");
  const refresh=()=>loadVideoClipStore().then(setStore);
  useEffect(()=>{refresh(); return subscribeVideoClips(refresh);},[]);
  const rows = Object.entries(store).flatMap(([shotId, versions]) => versions.map(version=>({shotId,version,shot:shots.find(s=>s.id===shotId)}))).filter(row=>status==="ALL"||row.version.status===status);
  const selected = rows.find(row=>`${row.shotId}-${row.version.versionId}`===selectedKey) ?? rows[0];
  async function setState(next:VideoVersionStatus){if(selected) await updateVideoVersion(selected.shotId,selected.version.versionId,{status:next});}
  async function remove(){if(!selected)return; if(confirm(selected.version.status==="APPROVED"||selected.version.status==="MASTER"?"这是已通过版本，确认永久删除？":"确认删除该版本？")) await deleteVideoVersion(selected.shotId,selected.version.versionId);}
  function exportIndex(){downloadText("EP01_视频版本索引.json",JSON.stringify(rows.map(({shotId,shot,version})=>({shotId,title:shot?.title,version:{...version,blob:undefined}})),null,2),"application/json");}
  return <Page title="视频版本管理" subtitle="这里只管理实际上传的视频。审核状态、Master 选择和删除会立即同步到“视频片段”。">
    <div className="flex flex-wrap gap-2">{(["ALL","REVIEW","APPROVED","MASTER","REJECTED"] as const).map(item=><button key={item} className={`btn ${status===item?"border-jade/50 text-jade":""}`} onClick={()=>setStatus(item)}>{item==="ALL"?"全部":statusText[item]}</button>)}<button className="btn ml-auto" onClick={exportIndex}><Download size={15}/>导出版本索引</button></div>
    {!rows.length ? <div className="mt-4 rounded border border-white/10 p-16 text-center text-slate-500">当前没有符合条件的真实视频版本。请先在“视频片段”上传。</div> : <div className="mt-4 grid gap-4 xl:grid-cols-[440px_minmax(0,1fr)]"><Panel title={`版本列表 · ${rows.length}`}><div className="max-h-[720px] space-y-2 overflow-y-auto">{rows.map(row=><button key={`${row.shotId}-${row.version.versionId}`} onClick={()=>setSelectedKey(`${row.shotId}-${row.version.versionId}`)} className={`w-full rounded border p-3 text-left ${selected?.shotId===row.shotId&&selected.version.versionId===row.version.versionId?"border-jade/60 bg-jade/10":"border-white/10"}`}><div className="flex justify-between text-xs"><span className="text-jade">{row.shotId} · {row.version.versionId}</span><span>{statusText[row.version.status]}</span></div><div className="mt-1 font-semibold">{row.shot?.title??row.version.fileName}</div><div className="mt-1 text-xs text-slate-500">{row.version.fileName} · {formatBytes(row.version.size)}</div></button>)}</div></Panel>{selected&&<Panel title={`${selected.shot?.title} · ${selected.version.versionId}`}><div className="aspect-video overflow-hidden rounded border border-white/10 bg-black"><BlobVideo version={selected.version}/></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Info label="状态" value={statusText[selected.version.status]}/><Info label="上传时间" value={new Date(selected.version.uploadedAt).toLocaleString("zh-CN")}/><Info label="大小" value={formatBytes(selected.version.size)}/></div><NotesEditor shotId={selected.shotId} version={selected.version}/><div className="mt-3 flex flex-wrap gap-2"><button className="btn" onClick={()=>setState("APPROVED")}><Check size={15}/>通过</button><button className="btn" onClick={()=>setState("MASTER")}><Film size={15}/>设为 Master</button><button className="btn" onClick={()=>setState("REJECTED")}><X size={15}/>退回</button><button className="btn text-red-300" onClick={remove}><Trash2 size={15}/>删除</button></div><div className="mt-4 rounded border border-white/10 p-3"><div className="text-xs text-slate-500">生成时使用的可灵 Prompt</div><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-300">{selected.version.prompt}</pre></div></Panel>}</div>}
  </Page>;
}

function Page({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <div><div className="mb-5"><div className="text-xs uppercase tracking-[.28em] text-jade">Tide Steel Studio</div><h2 className="mt-2 text-2xl font-bold text-white">{title}</h2><p className="mt-2 text-sm text-slate-400">{subtitle}</p></div>{children}</div>}
function Panel({title,actions,children}:{title:string;actions?:React.ReactNode;children:React.ReactNode}){return <section className="rounded border border-white/10 bg-white/[.02]"><div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-4"><h3 className="font-semibold text-white">{title}</h3><div className="flex gap-2">{actions}</div></div><div className="p-4">{children}</div></section>}
function Info({label,value}:{label:string;value:string}){return <div className="min-w-0 rounded border border-white/10 bg-black/20 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 truncate text-sm text-slate-200" title={value}>{value}</div></div>}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded border border-white/10 bg-white/[.02] p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-bold text-white">{value}</div></div>}
function Empty({text}:{text:string}){return <div className="flex h-full items-center justify-center text-sm text-slate-600">{text}</div>}
function BlobVideo({version}:{version:VideoClipVersion}){const [url,setUrl]=useState("");useEffect(()=>{const next=URL.createObjectURL(version.blob);setUrl(next);return()=>URL.revokeObjectURL(next)},[version.blob]);return url?<video src={url} controls className="h-full w-full object-contain"/>:null}
function NotesEditor({shotId,version}:{shotId:string;version:VideoClipVersion}){const [notes,setNotes]=useState(version.notes);useEffect(()=>setNotes(version.notes),[version.versionId,version.notes]);return <textarea className="mt-4 min-h-28 w-full rounded border border-white/10 bg-black/30 p-3 text-sm" placeholder="版本备注，失焦后自动保存" value={notes} onChange={event=>setNotes(event.target.value)} onBlur={()=>updateVideoVersion(shotId,version.versionId,{notes})}/>}
async function copyText(value:string){try{await navigator.clipboard.writeText(value)}catch{const area=document.createElement("textarea");area.value=value;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()} }
function downloadText(name:string,value:string,type:string){const url=URL.createObjectURL(new Blob([value],{type}));const anchor=document.createElement("a");anchor.href=url;anchor.download=name;anchor.click();URL.revokeObjectURL(url)}
function formatBytes(size:number){if(size<1024*1024)return `${(size/1024).toFixed(1)} KB`;return `${(size/1024/1024).toFixed(1)} MB`}
