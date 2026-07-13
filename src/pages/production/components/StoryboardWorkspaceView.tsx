import { useEffect, useRef, useState } from "react";
import { Copy, Download, GitMerge, Save, Scissors } from "lucide-react";
import { getBestKeyframeVersion, getKeyframeFrameVersions, loadKeyframeStore, subscribeKeyframeStore, type KeyframeAssetStore } from "../../../mcp/keyframeLibrary/KeyframeAssetStore";
import { loadStoryboardWorkspace, saveStoryboardWorkspace, type StoryboardShot, type StoryboardStatus } from "../../../mcp/storyboardWorkspace/StoryboardWorkspaceStore";
import { ProductionCard } from "./ProductionShell";

const statuses: StoryboardStatus[] = ["草稿", "制作中", "审核中", "已通过", "废弃"];

export function StoryboardWorkspaceView() {
  const [shots, setShots] = useState(() => loadStoryboardWorkspace());
  const [selectedId, setSelectedId] = useState(shots[0]?.id ?? "");
  const [keyframes, setKeyframes] = useState<KeyframeAssetStore>({});
  const [message, setMessage] = useState("");
  const dragIndex = useRef<number | null>(null);
  const selectedIndex = shots.findIndex((shot) => shot.id === selectedId);
  const selected = shots[selectedIndex] ?? shots[0];

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const store = await loadKeyframeStore();
      if (alive) setKeyframes(store);
    };
    void refresh();
    const unsubscribe = subscribeKeyframeStore(() => void refresh());
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  function update<K extends keyof StoryboardShot>(key: K, value: StoryboardShot[K]) {
    setShots((current) => current.map((shot) => shot.id === selected.id ? { ...shot, [key]: value, updatedAt: new Date().toISOString() } : shot));
    setMessage("");
  }

  function save() {
    const next = saveStoryboardWorkspace(shots);
    setShots(next);
    setSelectedId(next[Math.max(0, selectedIndex)]?.id ?? "");
    setMessage("Storyboard已保存，Camera设计、可灵提示词和视频素材库会读取同一份三部曲镜头数据。");
  }

  function reorder(targetIndex: number) {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    const next = [...shots];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(targetIndex, 0, moved);
    const normalized = saveStoryboardWorkspace(next);
    setShots(normalized);
    setSelectedId(normalized[targetIndex].id);
    dragIndex.current = null;
  }

  function duplicate() {
    const next = [...shots];
    next.splice(selectedIndex + 1, 0, { ...selected, id: `${selected.id}-COPY`, title: `${selected.title}（复制）`, status: "草稿", updatedAt: new Date().toISOString() });
    const normalized = saveStoryboardWorkspace(next);
    setShots(normalized);
    setSelectedId(normalized[selectedIndex + 1].id);
  }

  function split() {
    const firstDuration = Math.max(1, Number((selected.duration / 2).toFixed(1)));
    const next = [...shots];
    next.splice(selectedIndex, 1,
      { ...selected, duration: firstDuration, title: `${selected.title} A`, updatedAt: new Date().toISOString() },
      { ...selected, id: `${selected.id}-B`, duration: Math.max(1, selected.duration - firstDuration), title: `${selected.title} B`, status: "草稿", updatedAt: new Date().toISOString() }
    );
    const normalized = saveStoryboardWorkspace(next);
    setShots(normalized);
    setSelectedId(normalized[selectedIndex].id);
  }

  function mergePrevious() {
    if (selectedIndex <= 0) return;
    const previous = shots[selectedIndex - 1];
    const merged = {
      ...previous,
      title: `${previous.title} / ${selected.title}`,
      description: `${previous.description}\n${selected.description}`,
      duration: previous.duration + selected.duration,
      notes: [previous.notes, selected.notes].filter(Boolean).join("\n"),
      updatedAt: new Date().toISOString()
    };
    const next = [...shots];
    next.splice(selectedIndex - 1, 2, merged);
    const normalized = saveStoryboardWorkspace(next);
    setShots(normalized);
    setSelectedId(normalized[selectedIndex - 1].id);
  }

  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ project: "Tide Steel Soul Trilogy", exportedAt: new Date().toISOString(), shots }, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "TIDE_STEEL_SOUL_TRILOGY_STORYBOARD.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const best = selected ? getBestKeyframeVersion(getKeyframeFrameVersions(keyframes, selected.keyframeId, "START")) : null;

  return (
    <div className="space-y-4">
      <ProductionCard className="flex flex-wrap items-end justify-between gap-3 p-5">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-jade/80">Trilogy Storyboard</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">三部曲分镜设计</h2>
          <p className="mt-2 text-sm text-slate-400">
            当前只显示《潮汐钢魂》三部曲正式预告片/章节分镜，不再加载旧版EP01故事。拖动左侧镜头可排序，修改后会同步到Camera设计、可灵提示词和视频素材库。
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn h-9" onClick={exportJson}><Download size={14} /> 导出JSON</button>
          <button className="btn h-9 border-jade text-jade" onClick={save}><Save size={14} /> 保存Storyboard</button>
        </div>
      </ProductionCard>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <ProductionCard className="max-h-[820px] overflow-y-auto p-3">
          <div className="grid gap-2">
            {shots.map((shot, index) => {
              const frame = getBestKeyframeVersion(getKeyframeFrameVersions(keyframes, shot.keyframeId, "START"));
              return (
                <button
                  key={shot.id}
                  draggable
                  onDragStart={() => { dragIndex.current = index; }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => reorder(index)}
                  className={`grid grid-cols-[112px_minmax(0,1fr)] gap-3 rounded border p-2 text-left ${selected?.id === shot.id ? "border-jade bg-jade/10" : "border-white/10 bg-black/20 hover:border-jade/40"}`}
                  onClick={() => setSelectedId(shot.id)}
                >
                  <div className="aspect-video overflow-hidden rounded bg-white/5">
                    {frame ? <img src={frame.dataUrl} alt={shot.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-slate-600">{shot.keyframeId}</div>}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-jade">{shot.id}</div>
                    <div className="mt-1 truncate text-sm font-semibold text-white">{shot.title}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{shot.duration}s / {shot.shotSize} / {shot.lens}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{shot.status}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </ProductionCard>

        {selected && (
          <ProductionCard className="p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="font-mono text-xs text-jade">{selected.id} / {selected.keyframeId}</div>
                <Field label="镜头标题" value={selected.title} onChange={(value) => update("title", value)} />
                <Field label="剧情与画面说明" value={selected.description} multiline onChange={(value) => update("description", value)} />
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="时长（秒）" value={String(selected.duration)} onChange={(value) => update("duration", Math.max(1, Number(value) || 1))} />
                  <Field label="景别" value={selected.shotSize} onChange={(value) => update("shotSize", value)} />
                  <Field label="焦段" value={selected.lens} onChange={(value) => update("lens", value)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="摄影机位置" value={selected.camera} onChange={(value) => update("camera", value)} />
                  <Field label="运镜" value={selected.movement} onChange={(value) => update("movement", value)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="角色" value={selected.character} onChange={(value) => update("character", value)} />
                  <Field label="场景" value={selected.environment} onChange={(value) => update("environment", value)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="光线" value={selected.lighting} onChange={(value) => update("lighting", value)} />
                  <Field label="情绪" value={selected.emotion} onChange={(value) => update("emotion", value)} />
                </div>
                <Field label="声音" value={selected.sound} multiline onChange={(value) => update("sound", value)} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="对白" value={selected.dialogue} multiline onChange={(value) => update("dialogue", value)} />
                  <Field label="音乐" value={selected.music} multiline onChange={(value) => update("music", value)} />
                </div>
                <Field label="导演备注" value={selected.notes} multiline onChange={(value) => update("notes", value)} />
              </div>
              <div>
                <div className="aspect-video overflow-hidden rounded border border-white/10 bg-white/[0.03]">
                  {best ? <img src={best.dataUrl} alt={selected.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">等待上传 {selected.keyframeId}</div>}
                </div>
                <label className="mt-3 block text-xs text-slate-500">
                  制作状态
                  <select className="mt-2 h-10 w-full rounded border border-white/10 bg-[#0b1016] px-3 text-sm text-slate-200" value={selected.status} onChange={(event) => update("status", event.target.value as StoryboardStatus)}>
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
                <div className="mt-4 grid gap-2">
                  <button className="btn h-9" onClick={duplicate}><Copy size={14} /> 复制Shot</button>
                  <button className="btn h-9" onClick={split}><Scissors size={14} /> 拆分Shot</button>
                  <button className="btn h-9" disabled={selectedIndex <= 0} onClick={mergePrevious}><GitMerge size={14} /> 与上一Shot合并</button>
                </div>
              </div>
            </div>
            {message && <div className="mt-4 rounded border border-jade/30 bg-jade/10 p-2 text-xs text-jade">{message}</div>}
          </ProductionCard>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, multiline = false, onChange }: { label: string; value: string; multiline?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="mt-3 block">
      <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {multiline ? (
        <textarea className="mt-2 min-h-24 w-full resize-y rounded border border-white/10 bg-black/30 p-3 text-sm leading-6 text-slate-200 outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="mt-2 h-10 w-full rounded border border-white/10 bg-black/30 px-3 text-sm text-slate-200 outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
