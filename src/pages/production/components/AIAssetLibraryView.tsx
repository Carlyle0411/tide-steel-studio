import { useEffect, useMemo, useState } from "react";
import { Copy, Video } from "lucide-react";
import { assetGenerationQueue, type AssetGenerationTask } from "../../../mcp/assetFactory/AssetGenerationQueue";
import { getFactoryStats, listFactoryLibrary } from "../../../mcp/assetFactory/AssetLibraryManager";
import { generateKlingPromptFromAsset } from "../../../mcp/assetFactory/KlingVideoPromptGenerator";
import { reusableVideoTemplates } from "../../../mcp/assetFactory/VideoTemplateLibrary";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function AIAssetLibraryView() {
  const [tasks, setTasks] = useState<AssetGenerationTask[]>(() => assetGenerationQueue.list());
  const [selectedPrompt, setSelectedPrompt] = useState("");
  useEffect(() => assetGenerationQueue.subscribe(() => setTasks(assetGenerationQueue.list())), []);
  const library = useMemo(() => listFactoryLibrary(tasks), [tasks]);
  const stats = getFactoryStats(tasks);
  const categories = ["Characters", "Mechas", "Creatures", "Environment", "Props"];

  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">AI Asset Library</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">Tide Steel Soul Asset Factory</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Mini label="Generated Assets" value={stats.generatedAssets} />
          <Mini label="Approved Assets" value={stats.approvedAssets} />
          <Mini label="Pending Review" value={stats.pendingReview} />
          <Mini label="Failed Generation" value={stats.failedGeneration} />
        </div>
      </ProductionCard>

      <ProductionCard className="p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => <span key={category} className="chip">{category}</span>)}
        </div>
      </ProductionCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {library.length ? library.map((asset) => (
            <ProductionCard key={asset.assetId} className="overflow-hidden">
              <div className="aspect-video bg-black/30">
                <img src={asset.previewImage} alt={asset.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[11px] text-jade">{asset.category}</div>
                    <h3 className="mt-1 text-sm font-semibold text-white">{asset.name}</h3>
                  </div>
                  <StatusPill status={asset.status} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Mini label="Version" value={asset.version} />
                  <Mini label="Quality" value={asset.qualityScore} />
                  <Mini label="Used" value={asset.usedCount} />
                </div>
                <div className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">{asset.prompt}</div>
                <button className="btn mt-4 h-9 w-full" onClick={() => setSelectedPrompt(generateKlingPromptFromAsset(asset))}><Video size={15} /> Kling Prompt</button>
              </div>
            </ProductionCard>
          )) : <ProductionCard className="p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">No local asset images found yet. Use Command+K: Generate Tide Steel Assets, then import the saved PNG files into the local asset library.</ProductionCard>}
        </div>

        <div className="space-y-4">
          <ProductionCard className="p-4">
            <h3 className="text-sm font-semibold text-white">Kling Prompt Generator</h3>
            <textarea className="mt-3 min-h-64 w-full resize-y rounded-md border border-white/10 bg-black/20 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={selectedPrompt} readOnly placeholder="Select an approved/generated image to create a reusable Kling prompt." />
            <button className="btn mt-3 h-9" onClick={() => navigator.clipboard?.writeText(selectedPrompt)} disabled={!selectedPrompt}><Copy size={15} /> Copy</button>
          </ProductionCard>
          <ProductionCard className="p-4">
            <h3 className="text-sm font-semibold text-white">Reusable Video Templates</h3>
            <div className="mt-3 space-y-3">
              {Object.entries(reusableVideoTemplates).map(([key, values]) => (
                <div key={key}>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{key}</div>
                  <div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <span key={value} className="chip">{value}</span>)}</div>
                </div>
              ))}
            </div>
          </ProductionCard>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
