import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Database, Film, Image, ShieldCheck, Video } from "lucide-react";
import { assetGenerationQueue, type AssetGenerationTask } from "../../../mcp/assetFactory/AssetGenerationQueue";
import { listFactoryLibrary } from "../../../mcp/assetFactory/AssetLibraryManager";
import { buildAllEP01KlingPrompts, getEP01AssetManifest, getEP01Keyframes, getTideSteelStudioStats } from "../../../mcp/tideSteelStudio/EP01StudioData";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function TideSteelStudioView() {
  const [tasks, setTasks] = useState<AssetGenerationTask[]>(() => assetGenerationQueue.list());
  useEffect(() => assetGenerationQueue.subscribe(() => setTasks(assetGenerationQueue.list())), []);
  const stats = getTideSteelStudioStats();
  const manifest = getEP01AssetManifest();
  const keyframes = getEP01Keyframes();
  const library = useMemo(() => listFactoryLibrary(tasks), [tasks]);
  const prompts = buildAllEP01KlingPrompts();

  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Tide Steel Studio</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">潮汐钢魂三部曲制作总览</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">个人 AI 电影制作工作台。图片只来自 Codex GPT Image2 与本地真实 PNG；视频阶段只生成可灵提示词，由你手动制作。</p>
          </div>
          <StatusPill status="local" />
        </div>
      </ProductionCard>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <ProgressCard icon={<Database size={18} />} label="资产生产进度" done={stats.localAssets} total={totalManifestAssets(manifest)} />
        <ProgressCard icon={<Image size={18} />} label="角色制作进度" done={stats.assetProgress.characters.done} total={stats.assetProgress.characters.total} />
        <ProgressCard icon={<ShieldCheck size={18} />} label="机甲制作进度" done={stats.assetProgress.mechas.done} total={stats.assetProgress.mechas.total} />
        <ProgressCard icon={<Clapperboard size={18} />} label="怪兽制作进度" done={stats.assetProgress.creatures.done} total={stats.assetProgress.creatures.total} />
        <ProgressCard icon={<Film size={18} />} label="关键帧制作进度" done={stats.assetProgress.keyframes.done} total={stats.assetProgress.keyframes.total} />
        <ProgressCard icon={<Video size={18} />} label="可灵提示词进度" done={stats.assetProgress.klingPrompts.done} total={stats.assetProgress.klingPrompts.total} />
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 p-4">
            <h3 className="text-sm font-semibold text-white">EP01 资产清单</h3>
            <p className="mt-1 text-xs text-slate-500">对比应制作资产与已经导入的本地真实 PNG。</p>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            <ManifestGroup title="角色" rows={manifest.characters} />
            <ManifestGroup title="机甲" rows={manifest.mechas} />
            <ManifestGroup title="怪兽" rows={manifest.creatures} />
            <ManifestGroup title="场景" rows={manifest.environment} />
          </div>
        </ProductionCard>

        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 p-4">
            <h3 className="text-sm font-semibold text-white">本地 Asset Library</h3>
            <p className="mt-1 text-xs text-slate-500">这里只显示真实存在的本地图片文件。</p>
          </div>
          <div className="grid max-h-[560px] gap-3 overflow-y-auto p-4">
            {library.map((asset) => (
              <div key={asset.assetId} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-md border border-white/10 bg-black/20 p-2">
                <img src={asset.previewImage} alt={asset.name} className="aspect-video h-full w-full rounded object-cover" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-wide text-jade">{asset.category}</div>
                  <div className="truncate text-sm font-semibold text-white">{asset.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{asset.version}</div>
                </div>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>

      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white">EP01 关键帧清单</h3>
          <p className="mt-1 text-xs text-slate-500">18 个电影关键帧任务。这里是任务，不是假生成图。</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
              <tr>{["编号", "名称", "剧情作用", "对应角色/资产", "对应视频Prompt", "是否完成"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
            </thead>
            <tbody>
              {keyframes.map((keyframe) => (
                <tr key={keyframe.shot} className="border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-jade">{keyframe.id}</td>
                  <td className="px-4 py-3 text-white">{keyframe.title}</td>
                  <td className="max-w-[360px] px-4 py-3 text-slate-400">{keyframe.purpose}</td>
                  <td className="px-4 py-3 text-slate-400">{keyframe.required_assets.join(", ")}</td>
                  <td className="px-4 py-3 text-slate-400">已生成文本</td>
                  <td className="px-4 py-3"><StatusPill status={keyframe.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProductionCard>

      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white">可灵提示词包</h3>
          <p className="mt-1 text-xs text-slate-500">只生成文本，不调用任何视频 API。</p>
        </div>
        <div className="grid gap-3 p-4 xl:grid-cols-2">
          {prompts.slice(0, 6).map((item) => (
            <textarea key={item.shot} className="min-h-52 resize-y rounded-md border border-white/10 bg-black/20 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={item.prompt} readOnly />
          ))}
        </div>
      </ProductionCard>
    </div>
  );
}

function ProgressCard({ icon, label, done, total }: { icon: React.ReactNode; label: string; done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center justify-between text-slate-500">
        {icon}
        <span className="font-mono text-xs">{pct}%</span>
      </div>
      <div className="mt-3 text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{done}/{total}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-jade" style={{ width: `${pct}%` }} /></div>
    </ProductionCard>
  );
}

function ManifestGroup({ title, rows }: { title: string; rows: Array<{ id: string; name: string; assets: string[]; generated: string[] }> }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-300">{row.name}</span>
            <span className="font-mono text-xs text-jade">{row.generated.length}/{row.assets.length}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function totalManifestAssets(manifest: ReturnType<typeof getEP01AssetManifest>) {
  return [...manifest.characters, ...manifest.mechas, ...manifest.creatures, ...manifest.environment].reduce((sum, item) => sum + item.assets.length, 0);
}
