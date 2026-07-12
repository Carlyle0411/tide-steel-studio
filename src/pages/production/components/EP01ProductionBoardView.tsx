import { useMemo, useState } from "react";
import { Download, RotateCcw, Save } from "lucide-react";
import { getEP01Shots, type EP01ShotStatus } from "../../../mcp/ep01Production/EP01ShotData";
import { ProductionCard, StatusPill } from "./ProductionShell";

type ShotProgress = {
  reference: EP01ShotStatus;
  image: EP01ShotStatus;
  video: EP01ShotStatus;
  audio: EP01ShotStatus;
  review: EP01ShotStatus;
  notes: string;
  updatedAt: string;
};

type BoardStore = Record<string, ShotProgress>;

const STORAGE_KEY = "tide-steel-soul-ep01-production-board-v2";
const statuses: EP01ShotStatus[] = ["LOCKED", "GENERATING", "REVIEW", "APPROVED", "FAILED"];

export function EP01ProductionBoardView() {
  const shots = useMemo(() => getEP01Shots(), []);
  const [store, setStore] = useState<BoardStore>(() => loadBoard(shots.map((shot) => shot.shot_id)));
  const [selectedId, setSelectedId] = useState(shots[0]?.shot_id ?? "");
  const [message, setMessage] = useState("");
  const selected = shots.find((shot) => shot.shot_id === selectedId) ?? shots[0];
  const progress = selected ? store[selected.shot_id] : undefined;
  const summary = calculateSummary(shots.map((shot) => store[shot.shot_id]));

  function update(field: keyof ShotProgress, value: string) {
    if (!selected) return;
    setStore((current) => ({
      ...current,
      [selected.shot_id]: { ...current[selected.shot_id], [field]: value, updatedAt: new Date().toISOString() }
    }));
    setMessage("");
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    setMessage(`${selected.shot_id} 的制作状态已保存。`);
  }

  function reset() {
    if (!window.confirm("确定清空EP01生产板的手动状态吗？该操作不会删除任何图片或视频文件。")) return;
    const empty = createBoard(shots.map((shot) => shot.shot_id));
    setStore(empty);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    setMessage("生产板已恢复为未开始状态。");
  }

  function exportBoard() {
    const payload = {
      episode: "EP01",
      title: "海面低频",
      exportedAt: new Date().toISOString(),
      summary,
      shots: shots.map((shot) => ({ ...shot, production: store[shot.shot_id] }))
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "EP01_PRODUCTION_BOARD.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("EP01生产板已导出。 ");
  }

  return (
    <div className="space-y-4">
      <ProductionCard className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-jade/80">EP01 Production Board</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">EP01 海面低频</h2>
            <p className="mt-2 text-sm text-slate-400">18个真实Shot的人工制作状态。未执行的项目保持LOCKED，不自动伪造完成。</p>
          </div>
          <div className="flex gap-2">
            <button className="btn h-9" onClick={reset}><RotateCcw size={14} /> 重置状态</button>
            <button className="btn h-9" onClick={exportBoard}><Download size={14} /> 导出JSON</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <Mini label="Reference" value={`${summary.reference}/${shots.length}`} />
          <Mini label="Image" value={`${summary.image}/${shots.length}`} />
          <Mini label="Video" value={`${summary.video}/${shots.length}`} />
          <Mini label="Audio" value={`${summary.audio}/${shots.length}`} />
          <Mini label="Final Review" value={`${summary.review}/${shots.length}`} />
        </div>
      </ProductionCard>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <ProductionCard className="max-h-[780px] overflow-y-auto p-3">
          <div className="mb-3 px-2 text-xs uppercase tracking-[0.2em] text-slate-500">Shot清单</div>
          <div className="grid gap-2">
            {shots.map((shot) => {
              const item = store[shot.shot_id];
              return (
                <button key={shot.shot_id} className={`rounded border p-3 text-left ${shot.shot_id === selected?.shot_id ? "border-jade bg-jade/10" : "border-white/10 bg-black/20 hover:border-jade/40"}`} onClick={() => { setSelectedId(shot.shot_id); setMessage(""); }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-jade">{shot.shot_id}</span>
                    <StatusPill status={item.review} />
                  </div>
                  <div className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{shot.description}</div>
                  <div className="mt-2 text-[11px] text-slate-500">{shot.duration} · {shot.lens} · {shot.movement}</div>
                </button>
              );
            })}
          </div>
        </ProductionCard>

        {selected && progress && (
          <ProductionCard className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-sm text-jade">{selected.shot_id}</div>
                <h3 className="mt-2 text-lg font-semibold text-white">{selected.description}</h3>
                <div className="mt-2 text-xs text-slate-500">来源：{selected.sourceShotId} · 最后更新：{progress.updatedAt ? new Date(progress.updatedAt).toLocaleString("zh-CN") : "未保存"}</div>
              </div>
              <button className="btn h-9 border-jade text-jade" onClick={save}><Save size={14} /> 保存当前Shot</button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Info label="时长" value={selected.duration} />
              <Info label="角色" value={selected.character} />
              <Info label="场景" value={selected.environment} />
              <Info label="摄影机" value={selected.camera} />
              <Info label="焦段" value={selected.lens} />
              <Info label="运动" value={selected.movement} />
              <Info label="角色动作" value={selected.character_action} />
              <Info label="情绪" value={selected.emotion} />
              <Info label="光线" value={selected.lighting} />
              <Info label="VFX" value={selected.vfx} />
              <Info label="声音" value={selected.sound} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <StatusSelect label="Reference" value={progress.reference} onChange={(value) => update("reference", value)} />
              <StatusSelect label="Image" value={progress.image} onChange={(value) => update("image", value)} />
              <StatusSelect label="Video" value={progress.video} onChange={(value) => update("video", value)} />
              <StatusSelect label="Audio" value={progress.audio} onChange={(value) => update("audio", value)} />
              <StatusSelect label="Review" value={progress.review} onChange={(value) => update("review", value)} />
            </div>

            <div className="mt-5">
              <label className="text-xs uppercase tracking-[0.16em] text-slate-500">制作备注</label>
              <textarea className="mt-2 min-h-40 w-full resize-y rounded border border-white/10 bg-black/30 p-4 text-sm leading-6 text-slate-200 outline-none" value={progress.notes} onChange={(event) => update("notes", event.target.value)} placeholder="记录素材路径、版本选择、连续性问题、补拍需求和审核意见。" />
            </div>
            {message && <div className="mt-4 rounded border border-jade/30 bg-jade/10 px-3 py-2 text-xs text-jade">{message}</div>}
          </ProductionCard>
        )}
      </div>
    </div>
  );
}

function createBoard(ids: string[]): BoardStore {
  return Object.fromEntries(ids.map((id) => [id, { reference: "LOCKED", image: "LOCKED", video: "LOCKED", audio: "LOCKED", review: "LOCKED", notes: "", updatedAt: "" }]));
}

function loadBoard(ids: string[]) {
  const empty = createBoard(ids);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return empty;
    const parsed = JSON.parse(saved) as BoardStore;
    return Object.fromEntries(ids.map((id) => [id, { ...empty[id], ...parsed[id] }]));
  } catch {
    return empty;
  }
}

function calculateSummary(items: ShotProgress[]) {
  return {
    reference: items.filter((item) => item.reference === "APPROVED").length,
    image: items.filter((item) => item.image === "APPROVED").length,
    video: items.filter((item) => item.video === "APPROVED").length,
    audio: items.filter((item) => item.audio === "APPROVED").length,
    review: items.filter((item) => item.review === "APPROVED").length
  };
}

function StatusSelect({ label, value, onChange }: { label: string; value: EP01ShotStatus; onChange: (value: EP01ShotStatus) => void }) {
  return (
    <label className="rounded border border-white/10 bg-black/20 p-3">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <select className="mt-2 h-9 w-full rounded border border-white/10 bg-[#0b1016] px-2 text-xs text-slate-200 outline-none" value={value} onChange={(event) => onChange(event.target.value as EP01ShotStatus)}>
        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
    </label>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-white/10 bg-black/20 p-3"><div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-lg font-semibold text-white">{value}</div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-white/10 bg-black/20 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 text-xs leading-5 text-slate-300">{value || "无"}</div></div>;
}
