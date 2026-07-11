import { useMemo, useState } from "react";
import { Box, Copy, Image, Search, ShieldCheck, Waves } from "lucide-react";
import { getHeroMechaCreatureRules, getHeroMechaCreatureStats, heroMechaCreatureAssetUrl, searchHeroMechaCreatureAssets, type HeroMechaCreatureAsset } from "../../../mcp/heroMechaCreatureLibrary/HeroMechaCreatureLibraryData";
import { ProductionCard } from "./ProductionShell";

export function Phase21BMechaCreatureBibleView({ domain }: { domain: "机甲" | "怪兽" }) {
  const stats = getHeroMechaCreatureStats();
  const rules = getHeroMechaCreatureRules();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HeroMechaCreatureAsset | null>(null);
  const assets = useMemo(() => searchHeroMechaCreatureAssets(query, domain), [query, domain]);
  const current = selected ?? assets[0];

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Hero Mecha & Creature Asset Library</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">{domain}母资产库</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">锁定《潮汐钢魂》的核心视觉。后续关键帧、Storyboard、GPT Image2图片、可灵视频、海报和宣传片必须引用这里。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="总资产" value={domain === "机甲" ? stats.mecha : stats.creature} />
        <Metric label="已落盘图片" value={stats.landedImages} />
        <Metric label="待生成" value={stats.pending} />
        <Metric label="当前筛选" value={assets.length} />
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-4">
          <ProductionCard className="p-4">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3">
              <Search size={16} className="text-jade" />
              <input className="h-10 w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索${domain}、姿态、暴雨、夜景、海报、战损...`} />
            </div>
          </ProductionCard>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => <AssetCard key={asset.assetId} asset={asset} active={current?.assetId === asset.assetId} onClick={() => setSelected(asset)} />)}
          </div>
        </div>
        <Detail asset={current} rules={rules} />
      </section>
    </div>
  );
}

function AssetCard({ asset, active, onClick }: { asset: HeroMechaCreatureAsset; active: boolean; onClick: () => void }) {
  const url = heroMechaCreatureAssetUrl(asset);
  return (
    <button className={`overflow-hidden rounded-md border text-left transition ${active ? "border-jade bg-jade/10" : "border-white/10 bg-white/[0.03] hover:border-jade/40"}`} onClick={onClick}>
      <div className="flex aspect-video items-center justify-center bg-black/25 text-sm text-slate-500">
        {url ? <img src={url} alt={asset.name} className="h-full w-full object-cover" /> : <><Image size={17} className="mr-2" /> PNG待生成</>}
      </div>
      <div className="p-3">
        <div className="font-mono text-[10px] text-jade">{asset.assetId}</div>
        <div className="mt-1 text-sm font-semibold text-white">{asset.name} / {asset.variant}</div>
        <div className="mt-2 flex flex-wrap gap-1">{asset.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">{tag}</span>)}</div>
        <div className="mt-2 text-xs text-slate-500">{asset.status}</div>
      </div>
    </button>
  );
}

function Detail({ asset, rules }: { asset?: HeroMechaCreatureAsset; rules: string[] }) {
  const [message, setMessage] = useState("");
  if (!asset) return null;
  const url = heroMechaCreatureAssetUrl(asset);
  return (
    <ProductionCard className="sticky top-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">{asset.domain === "机甲" ? <Box size={16} /> : <Waves size={16} />} {asset.name} / {asset.variant}</div>
      <div className="mt-3 flex aspect-video items-center justify-center rounded border border-white/10 bg-black/25 text-sm text-slate-500">
        {url ? <img src={url} alt={asset.name} className="h-full w-full rounded object-cover" /> : "真实PNG待生成"}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Info label="Version" value={asset.version} />
        <Info label="状态" value={asset.status} />
        <Info label="图片路径" value={asset.imagePath} />
        <Info label="Reference" value={asset.referencePath} />
      </div>
      <textarea className="mt-3 min-h-44 w-full resize-y rounded border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={asset.prompt} readOnly />
      <button className="btn mt-3 h-9 w-full" onClick={() => { void navigator.clipboard?.writeText(asset.prompt); setMessage("Prompt已复制，可用于GPT Image2。"); }}><Copy size={14} /> 复制GPT Image2 Prompt</button>
      {message && <div className="mt-2 text-xs text-jade">{message}</div>}
      <div className="mt-4 space-y-2">
        <div className="text-xs uppercase tracking-wide text-slate-500">Reference规则</div>
        {rules.slice(0, 4).map((rule) => <div key={rule} className="flex gap-2 rounded border border-white/10 bg-black/20 p-2 text-xs leading-5 text-slate-400"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-jade" />{rule}</div>)}
      </div>
    </ProductionCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <ProductionCard className="p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </ProductionCard>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 line-clamp-2 text-xs text-slate-300">{value}</div>
    </div>
  );
}
