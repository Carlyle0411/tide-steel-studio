import { useMemo } from "react";
import { Music, RefreshCcw, Scissors, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { editorAgent } from "../../../mcp/editorDirector/EditorAgent";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function EditorReviewView() {
  const decision = useMemo(() => editorAgent.generateFinalEditDecision("EP01"), []);
  const topShots = decision.shotRanking.slice().sort((a, b) => b.shotScore - a.shotScore).slice(0, 6);

  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Editor Review</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">EP01 AI Edit Decision</h2>
            <p className="mt-2 text-sm text-slate-400">18 source shots analyzed. Original assets remain protected until manual approval.</p>
          </div>
          <StatusPill status={decision.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn h-9"><ShieldCheck size={15} /> Approve Edit</button>
          <button className="btn h-9"><RefreshCcw size={15} /> Regenerate Edit</button>
          <button className="btn h-9"><SlidersHorizontal size={15} /> Manual Adjust</button>
        </div>
      </ProductionCard>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <ProductionCard className="p-5">
          <h3 className="text-lg font-semibold text-white">Emotion Curve</h3>
          <div className="mt-4 space-y-3">
            {decision.emotionCurve.map((point) => (
              <div key={point.timestamp}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-jade">{point.timestamp}</span>
                  <span className="text-slate-400">{point.emotion} / {point.intensity}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-jade" style={{ width: `${point.intensity}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{point.description}</p>
              </div>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="p-5">
          <h3 className="text-lg font-semibold text-white">Music Recommendation</h3>
          <div className="mt-4 flex items-start gap-3 rounded-md border border-white/10 bg-black/20 p-3">
            <Music size={18} className="mt-1 text-jade" />
            <p className="text-sm leading-6 text-slate-300">{decision.editPlan.musicRecommendation}</p>
          </div>
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Subtitle Check</div>
            <div className="mt-2"><StatusPill status={decision.editPlan.subtitleCheck} /></div>
          </div>
        </ProductionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Shot Ranking</h3>
          </div>
          <div className="divide-y divide-white/10">
            {topShots.map((shot) => (
              <div key={shot.shotId} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-mono text-xs text-jade">{shot.shotId}</div>
                  <div className="mt-1 text-sm text-slate-300">{shot.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">{shot.shotScore}</div>
                  <StatusPill status={shot.recommendation} />
                </div>
              </div>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Timeline Preview</h3>
          </div>
          <div className="max-h-[480px] divide-y divide-white/10 overflow-y-auto">
            {decision.editPlan.decisions.slice(0, 10).map((item) => (
              <div key={item.shotId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-jade">{item.order}. {item.shotId}</div>
                  <StatusPill status={item.action} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400"><Scissors size={13} /> {item.cutPoint} / {item.transition}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>
    </div>
  );
}
