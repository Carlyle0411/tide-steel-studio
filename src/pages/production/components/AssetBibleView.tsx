import { useMemo, useState } from "react";
import { Database, Film, Image, Recycle, Search, Video } from "lucide-react";
import { getAssetBibleKlingPrompts, getAssetBibleManifest, getAssetBibleShots, getAssetBibleStats, getAssetBibleVideoClips, searchReusableAssets } from "../../../mcp/assetBible/AssetBibleData";
import { localAssetUrl } from "../../../mcp/localAssetGenerator/LocalAssetManifest";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function AssetBibleView() {
  const [query, setQuery] = useState("驾驶舱");
  const manifest = getAssetBibleManifest();
  const shots = getAssetBibleShots();
  const clips = getAssetBibleVideoClips();
  const prompts = getAssetBibleKlingPrompts();
  const stats = getAssetBibleStats();
  const reusable = useMemo(() => searchReusableAssets(query), [query]);

  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-jade/80">Asset Bible</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">电影资产圣经</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">长期复用素材库。以后所有剧集、预告片、PV、海报和短视频都先从这里调用，已有同类素材时优先复用，不重复生成。</p>
          </div>
          <StatusPill status="规划中" />
        </div>
      </ProductionCard>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={<Database size={18} />} label="资产分类" value={stats.categories} />
        <Metric icon={<Image size={18} />} label="本地真实资产" value={stats.localAssets} />
        <Metric icon={<Film size={18} />} label="镜头模板" value={stats.shotTemplates} />
        <Metric icon={<Video size={18} />} label="视频片段模板" value={stats.videoClips} />
        <Metric icon={<Recycle size={18} />} label="可灵Prompt" value={stats.klingPrompts} />
      </div>

      <ProductionCard className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} className="text-jade" />
          <h3 className="text-base font-semibold text-white">智能搜索与素材复用</h3>
        </div>
        <input className="field h-11 w-full" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索：驾驶舱、赤霆、白潮、暴雨、警报红光..." />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reusable.length ? reusable.map((asset) => (
            <div key={asset.id} className="overflow-hidden rounded-md border border-white/10 bg-black/20">
              <img src={localAssetUrl(asset)} alt={asset.name} className="aspect-video w-full object-cover" />
              <div className="p-3">
                <div className="font-mono text-[10px] text-jade">{asset.category}</div>
                <div className="mt-1 truncate text-sm font-semibold text-white">{asset.name}</div>
                <div className="mt-1 text-xs text-slate-500">{asset.version}</div>
              </div>
            </div>
          )) : <div className="rounded-md border border-white/10 bg-black/20 p-4 text-sm text-slate-500 xl:col-span-4">没有找到同类素材。可以进入资产生成，但不要跳过审核。</div>}
        </div>
      </ProductionCard>

      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <h3 className="text-base font-semibold text-white">电影资产分类</h3>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {manifest.categories.map((category) => (
            <div key={category.name} className="rounded-md border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] text-jade">{category.prefix}</div>
                  <h4 className="mt-1 text-base font-semibold text-white">{category.name}</h4>
                </div>
                <StatusPill status={category.status} />
              </div>
              <div className="mt-3 text-xs leading-5 text-slate-500">{category.subjects.join(" / ")}</div>
              <div className="mt-3 line-clamp-3 text-xs leading-5 text-slate-400">{category.variants.join("、")}</div>
            </div>
          ))}
        </div>
      </ProductionCard>

      <section className="grid gap-5 xl:grid-cols-2">
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 p-4">
            <h3 className="text-base font-semibold text-white">电影镜头库</h3>
            <p className="mt-1 text-xs text-slate-500">100 个可复用镜头模板。</p>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {shots.slice(0, 100).map((shot) => (
              <div key={shot.id} className="grid grid-cols-[92px_minmax(0,1fr)_90px] gap-3 border-b border-white/5 px-4 py-3 text-sm">
                <span className="font-mono text-xs text-jade">{shot.id}</span>
                <span className="text-white">{shot.name}</span>
                <span className="text-slate-500">{shot.type}</span>
              </div>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 p-4">
            <h3 className="text-base font-semibold text-white">视频片段素材库</h3>
            <p className="mt-1 text-xs text-slate-500">150 个可灵制作模板，只生成首帧、尾帧与文本 Prompt。</p>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {clips.slice(0, 150).map((clip) => (
              <div key={clip.id} className="border-b border-white/5 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-jade">{clip.id}</span>
                  <StatusPill status={clip.status} />
                </div>
                <div className="mt-1 text-white">{clip.name}</div>
                <div className="mt-1 text-xs text-slate-500">{clip.duration} / {clip.camera_movement} / {clip.shot_language}</div>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>

      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <h3 className="text-base font-semibold text-white">可灵Prompt库</h3>
          <p className="mt-1 text-xs text-slate-500">来自 `KlingPrompt.json`，供手动可灵制作使用。</p>
        </div>
        <div className="grid gap-3 p-4 xl:grid-cols-2">
          {prompts.slice(0, 8).map((item) => (
            <textarea key={item.id} className="min-h-48 rounded-md border border-white/10 bg-black/20 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={item.prompt} readOnly />
          ))}
        </div>
      </ProductionCard>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center justify-between text-slate-500">{icon}<span className="font-mono text-xs">Bible</span></div>
      <div className="mt-3 text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </ProductionCard>
  );
}
