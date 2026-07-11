import { useMemo } from "react";
import { buildEP01ProductionBoard, getEP01Completion } from "../../../mcp/ep01Production/EP01ProductionBoard";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function EP01ProductionBoardView() {
  const board = useMemo(() => buildEP01ProductionBoard(), []);
  const completion = getEP01Completion();
  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">EP01 Production Board</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">EP01 海面低频</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Mini label="Image" value={completion.image} />
          <Mini label="Video" value={completion.video} />
          <Mini label="Audio" value={completion.audio} />
          <Mini label="Edit" value={completion.edit} />
        </div>
      </ProductionCard>
      <ProductionCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {["Shot ID", "Description", "Character", "Environment", "Reference", "Image", "Video", "Audio", "Review", "Camera", "Lens", "Movement", "Emotion"].map((head) => (
                  <th key={head} className="px-4 py-3">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {board.map((shot) => (
                <tr key={shot.shot_id} className="border-b border-white/5 align-top hover:bg-white/[0.025]">
                  <td className="px-4 py-3 font-mono text-xs text-jade">{shot.shot_id}</td>
                  <td className="max-w-[280px] px-4 py-3 text-slate-300">{shot.description}</td>
                  <td className="px-4 py-3 text-slate-400">{shot.character}</td>
                  <td className="px-4 py-3 text-slate-400">{shot.environment}</td>
                  <td className="px-4 py-3"><StatusPill status={shot.referenceStatus} /></td>
                  <td className="px-4 py-3"><StatusPill status={shot.imageStatus} /></td>
                  <td className="px-4 py-3"><StatusPill status={shot.videoStatus} /></td>
                  <td className="px-4 py-3"><StatusPill status={shot.audioStatus} /></td>
                  <td className="px-4 py-3"><StatusPill status={shot.reviewStatus} /></td>
                  <td className="max-w-[220px] px-4 py-3 text-slate-400">{shot.camera}</td>
                  <td className="px-4 py-3 text-slate-400">{shot.lens}</td>
                  <td className="px-4 py-3 text-slate-400">{shot.movement}</td>
                  <td className="px-4 py-3 text-slate-400">{shot.emotion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProductionCard>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
