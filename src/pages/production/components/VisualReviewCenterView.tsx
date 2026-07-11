import { useEffect, useState } from "react";
import { reviewQueue, type ReviewQueueItem } from "../../../mcp/review/ReviewQueue";
import { scoreVisualQuality } from "../../../mcp/ep01Production/visualProduction/VisualReview";
import { assetFactory } from "../../../mcp/assetFactory/AssetFactory";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function VisualReviewCenterView() {
  const [items, setItems] = useState<ReviewQueueItem[]>(() => reviewQueue.list());
  useEffect(() => reviewQueue.subscribe(() => setItems(reviewQueue.list())), []);
  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Visual Review Center</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">EP01 Image Review Gate</h2>
        <p className="mt-2 text-sm text-slate-400">Images below 85 cannot enter video production. Approval remains manual.</p>
      </ProductionCard>
      <div className="grid gap-4 xl:grid-cols-2">
        {items.length ? items.map((item) => <VisualReviewCard key={item.reviewId} item={item} />) : (
          <ProductionCard className="p-8 text-center text-sm text-slate-500 xl:col-span-2">No visual assets waiting for review.</ProductionCard>
        )}
      </div>
    </div>
  );
}

function VisualReviewCard({ item }: { item: ReviewQueueItem }) {
  const score = scoreVisualQuality(item);
  async function generateAgain() {
    await assetFactory.generateFromPrompt({
      type: "KEYFRAME",
      assetName: item.assetVersion.parentAsset ?? item.assetVersion.assetId,
      variant: `Compare Version ${item.assetVersion.version}`,
      prompt: item.prompt
    });
  }
  return (
    <ProductionCard className="overflow-hidden">
      <div className="aspect-video bg-black/30">
        {item.image ? <img src={item.image} alt={item.assetVersion.assetId} className="h-full w-full object-cover" /> : (
          <div className="flex h-full items-center justify-center text-sm text-slate-600">Image preview pending</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-xs text-jade">{item.assetVersion.assetId}</div>
            <h3 className="mt-1 text-lg font-semibold text-white">{item.assetVersion.version}</h3>
          </div>
          <StatusPill status={item.status} />
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-5">
          <Mini label="Composition" value={score.composition} />
          <Mini label="Lighting" value={score.lighting} />
          <Mini label="Similarity" value={score.characterSimilarity} />
          <Mini label="World" value={score.worldConsistency} />
          <Mini label="Cinema" value={score.cinematicLevel} />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3">
          <span className="text-sm text-slate-400">VisualQualityScore</span>
          <span className={`text-xl font-semibold ${score.total >= 85 ? "text-jade" : "text-gold"}`}>{score.total}</span>
        </div>
        <div className="mt-3 text-xs text-slate-500">Reference: {item.assetVersion.parentAsset ?? "locked prompt references"}</div>
        <div className="mt-3 max-h-28 overflow-auto rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-400">{item.prompt}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn h-9" onClick={generateAgain}>Generate Again</button>
          <button className="btn h-9" disabled={score.total < 85} onClick={() => reviewQueue.approve(item.reviewId)}>Approve</button>
          <button className="btn h-9" onClick={() => reviewQueue.reject(item.reviewId)}>Reject</button>
          <button className="btn h-9" disabled>Compare Version</button>
          <StatusPill status={score.canEnterVideo ? "video_ready" : "video_blocked"} />
        </div>
      </div>
    </ProductionCard>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
