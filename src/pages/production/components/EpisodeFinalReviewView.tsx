import { useMemo } from "react";
import { CheckCircle2, Download, FileWarning } from "lucide-react";
import { buildEP01FinalPackageManifest, buildEP01FinalReview } from "../../../mcp/ep01Production/EP01FinalPackage";
import { buildEP01AudioTimeline } from "../../../mcp/ep01Production/EP01AudioPackage";
import { runEP01ContinuityCheck } from "../../../mcp/ep01Production/EP01ContinuityChecker";
import { buildEP01ProductionBoard } from "../../../mcp/ep01Production/EP01ProductionBoard";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function EpisodeFinalReviewView() {
  const review = useMemo(() => buildEP01FinalReview(), []);
  const manifest = useMemo(() => buildEP01FinalPackageManifest(), []);
  const continuity = useMemo(() => runEP01ContinuityCheck(), []);
  const audio = useMemo(() => buildEP01AudioTimeline(), []);
  const board = useMemo(() => buildEP01ProductionBoard(), []);

  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Episode Final Review</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">EP01 Final Package Gate</h2>
            <p className="mt-2 text-sm text-slate-400">Final approval is disabled until images, videos, audio mix, subtitles, and timeline review are complete.</p>
          </div>
          <StatusPill status={review.canApproveEpisode ? "APPROVED" : "LOCKED"} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn h-9" disabled={!review.canApproveEpisode}><CheckCircle2 size={15} /> Approve Episode</button>
          <button className="btn h-9" disabled={!review.canApproveEpisode}><Download size={15} /> Export Final Film</button>
        </div>
      </ProductionCard>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="18 Shots" value={`${board.length}`} />
        <Stat label="Approved Images" value={`${review.approvedImages}/18`} />
        <Stat label="Generated Videos" value={`${review.generatedVideos}/18`} />
        <Stat label="Audio" value={review.audioStatus} />
        <Stat label="Subtitle" value={review.subtitleStatus} />
        <Stat label="Final Timeline" value={review.finalTimelineStatus} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Blockers</h3>
          </div>
          <div className="divide-y divide-white/10">
            {review.blockers.map((blocker) => (
              <div key={blocker} className="flex items-start gap-3 p-4">
                <FileWarning size={16} className="mt-0.5 text-gold" />
                <p className="text-sm text-slate-300">{blocker}</p>
              </div>
            ))}
          </div>
        </ProductionCard>
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Continuity Report</h3>
          </div>
          <div className="divide-y divide-white/10">
            {continuity.items.map((item) => (
              <div key={`${item.subject}-${item.rule}`} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">{item.subject}</span>
                  <StatusPill status={item.status} />
                </div>
                <div className="mt-1 text-xs text-slate-500">{item.rule}</div>
                <p className="mt-2 text-sm text-slate-400">{item.note}</p>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">AudioTimeline.json</h3>
          </div>
          <div className="divide-y divide-white/10">
            {audio.events.map((event) => (
              <div key={`${event.timestamp}-${event.cue}`} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-jade">{event.timestamp}</span>
                  <StatusPill status={event.track} />
                </div>
                <p className="mt-2 text-sm text-slate-300">{event.cue}</p>
              </div>
            ))}
          </div>
        </ProductionCard>
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">EP01_FINAL_PACKAGE</h3>
          </div>
          <div className="divide-y divide-white/10">
            {Object.entries(manifest.media).map(([name, value]) => (
              <div key={name} className="flex items-center justify-between gap-3 p-4">
                <span className="font-mono text-xs text-slate-300">{name}</span>
                <StatusPill status={value.status} />
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <ProductionCard className="p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </ProductionCard>
  );
}
