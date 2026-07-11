import { useState } from "react";
import { GripVertical } from "lucide-react";
import { createEpisodeTimeline } from "../../../mcp/timeline/EpisodeTimeline";
import { editorAgent } from "../../../mcp/editorDirector/EditorAgent";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function TimelineEditorView() {
  const [nodes, setNodes] = useState(() => createEpisodeTimeline("EP01").list());
  const [editDecision] = useState(() => editorAgent.generateFinalEditDecision("EP01"));

  function move(id: string, direction: -1 | 1) {
    const current = nodes.find((node) => node.id === id);
    if (!current) return;
    const targetOrder = Math.min(nodes.length, Math.max(1, current.order + direction));
    const target = nodes.find((node) => node.order === targetOrder);
    setNodes(nodes.map((node) => {
      if (node.id === id) return { ...node, order: targetOrder };
      if (target && node.id === target.id) return { ...node, order: current.order };
      return node;
    }).sort((a, b) => a.order - b.order));
  }

  return (
    <div className="space-y-5">
      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Episode Timeline</div>
          <h2 className="mt-2 text-xl font-semibold text-white">EP01 Editing Timeline</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <div className="flex min-w-max gap-3">
            {nodes.map((node) => (
              <div key={node.id} className="w-48 rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <GripVertical size={15} className="text-slate-600" />
                  <StatusPill status="offline" />
                </div>
                <div className="mt-3 font-mono text-xs text-jade">{node.shotId}</div>
                <div className="mt-3 grid gap-2 text-xs text-slate-400">
                  <div>Image: {node.image ?? "missing"}</div>
                  <div>Video: {node.video ?? "missing"}</div>
                  <div>Audio: {node.audio ?? "planned"}</div>
                  <div>Subtitle: {node.subtitle ?? "planned"}</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn h-8 flex-1" onClick={() => move(node.id, -1)}>Left</button>
                  <button className="btn h-8 flex-1" onClick={() => move(node.id, 1)}>Right</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ProductionCard>
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">AI Edit Mode</div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <TimelineColumn title="Original Timeline" rows={nodes.map((node) => ({ shotId: node.shotId, note: "source order protected" }))} />
          <TimelineColumn title="AI Recommended Timeline" rows={editDecision.editPlan.decisions.map((decision) => ({ shotId: decision.shotId, note: `${decision.action}: ${decision.reason}` }))} />
          <TimelineColumn title="Final Timeline" rows={editDecision.editPlan.decisions.map((decision) => ({ shotId: decision.shotId, note: "awaiting editor review" }))} />
        </div>
      </ProductionCard>
    </div>
  );
}

function TimelineColumn({ title, rows }: { title: string; rows: Array<{ shotId: string; note: string }> }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
        {rows.map((row) => (
          <div key={`${title}-${row.shotId}`} className="rounded border border-white/10 bg-white/[0.03] p-2">
            <div className="font-mono text-[11px] text-jade">{row.shotId}</div>
            <div className="mt-1 text-xs text-slate-400">{row.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
