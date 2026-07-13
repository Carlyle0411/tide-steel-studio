import { Clapperboard, Clock, Database, Film, Image, ListChecks, Recycle, Video } from "lucide-react";
import { listFactoryLibrary } from "../../../mcp/assetFactory/AssetLibraryManager";
import { assetGenerationQueue } from "../../../mcp/assetFactory/AssetGenerationQueue";
import { buildAllEP01KlingPrompts, getEP01AssetManifest, getEP01Keyframes, getTideSteelStudioStats } from "../../../mcp/tideSteelStudio/EP01StudioData";
import { getAssetBibleKlingPrompts, getAssetBibleShots } from "../../../mcp/assetBible/AssetBibleData";
import { listLocalAssets } from "../../../mcp/localAssetGenerator/LocalAssetManifest";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function DirectorWorkstationView() {
  const stats = getTideSteelStudioStats();
  const manifest = getEP01AssetManifest();
  const totalAssets = [...manifest.characters, ...manifest.mechas, ...manifest.creatures, ...manifest.environment].reduce((sum, item) => sum + item.assets.length, 0);
  const keyframes = getEP01Keyframes();
  const assets = listFactoryLibrary(assetGenerationQueue.list());
  const localAssets = listLocalAssets();
  const diskMb = (localAssets.reduce((sum, asset) => sum + (asset.file_size ?? 0), 0) / 1024 / 1024).toFixed(1);
  const latestAssets = [...localAssets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const assetPct = Math.round((stats.localAssets / totalAssets) * 100);
  const keyframePct = Math.round((stats.assetProgress.keyframes.done / keyframes.length) * 100);

  return (
    <div className="space-y-5">
      <ProductionCard className="overflow-hidden p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.26em] text-jade/80">Tide Steel Studio</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">导演工作台</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">这里不是后台。这里是第一集的导演控制室：看进度、看缺口、看今天要推进的镜头。</p>
          </div>
          <StatusPill status="制作中" />
        </div>
      </ProductionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<Film size={18} />} label="第一集制作进度" value={`${Math.round((assetPct + keyframePct) / 2)}%`} />
        <Metric icon={<Database size={18} />} label="资产完成率" value={`${stats.localAssets}/${totalAssets}`} />
        <Metric icon={<Image size={18} />} label="关键帧完成率" value={`${stats.assetProgress.keyframes.done}/${keyframes.length}`} />
        <Metric icon={<Video size={18} />} label="视频完成率" value="0/18" />
        <Metric icon={<Clock size={18} />} label="预计剩余制作时间" value="4-6 天" />
        <Metric icon={<Database size={18} />} label="磁盘占用" value={`${diskMb} MB`} />
      </div>

      <ProductionCard className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">电影制作流程</div>
            <h3 className="mt-2 text-lg font-semibold text-white">从世界观到第一集完成</h3>
          </div>
          <StatusPill status="规划中" />
        </div>
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
          {["世界观", "剧本", "角色", "机甲", "怪兽", "场景", "资产", "关键帧", "分镜", "可灵视频", "剪辑", "第一集完成"].map((step, index) => (
            <div key={step} className="rounded-md border border-white/10 bg-black/25 p-4">
              <div className="font-mono text-xs text-jade">{String(index + 1).padStart(2, "0")}</div>
              <div className="mt-2 text-sm font-semibold text-white">{step}</div>
              <div className="mt-3 h-1 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-jade/80" style={{ width: index <= 6 ? "100%" : index <= 8 ? "35%" : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </ProductionCard>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ProductionCard className="p-5">
          <div className="flex items-center gap-2 text-white"><ListChecks size={18} className="text-jade" /><h3 className="font-semibold">今日制作内容</h3></div>
          <div className="mt-4 grid gap-3">
            {[
              "审核赤霆01五张基础资产，确认结构是否统一。",
              "补齐许燃、陈牧、唐小满、AI澜的角色资产计划。",
              "从 KF02-KF04 开始生成第一批关键帧，不跳过审核。",
              "为已通过关键帧生成可灵提示词文本。"
            ].map((item) => <div key={item} className="rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300">{item}</div>)}
          </div>
        </ProductionCard>
        <ProductionCard className="p-5">
          <div className="flex items-center gap-2 text-white"><Recycle size={18} className="text-jade" /><h3 className="font-semibold">可复用素材提示</h3></div>
          <div className="mt-4 space-y-3">
            {assets.slice(0, 5).map((asset) => (
              <div key={asset.assetId} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <span className="truncate text-slate-300">{asset.name}</span>
                <span className="font-mono text-xs text-jade">{asset.version}</span>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">最近修改 / 最近生成</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {latestAssets.map((asset) => (
            <div key={asset.id} className="rounded border border-white/10 bg-black/20 p-3">
              <div className="truncate text-sm font-semibold text-white">{asset.name}</div>
              <div className="mt-1 text-xs text-slate-500">{new Date(asset.createdAt).toLocaleString()}</div>
              <div className="mt-2 font-mono text-[11px] text-jade">{asset.relativePath}</div>
            </div>
          ))}
        </div>
      </ProductionCard>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center justify-between text-slate-500">{icon}<span className="text-[11px]">EP01</span></div>
      <div className="mt-3 text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </ProductionCard>
  );
}

export function ReuseCenterView() {
  const assets = listFactoryLibrary(assetGenerationQueue.list());
  return (
    <LibraryFrame title="素材复用中心" subtitle="以后生成任何图片前，先确认这里是否已经有可复用资产。">
      {assets.map((asset) => (
        <ProductionCard key={asset.assetId} className="overflow-hidden">
          <img src={asset.previewImage} alt={asset.name} className="aspect-video w-full object-cover" />
          <div className="p-4">
            <div className="font-mono text-[11px] text-jade">{asset.category}</div>
            <h3 className="mt-1 text-sm font-semibold text-white">{asset.name}</h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{asset.prompt}</p>
          </div>
        </ProductionCard>
      ))}
    </LibraryFrame>
  );
}

export function ShotLibraryView() {
  const shots = getAssetBibleShots();
  return (
    <LibraryFrame title="镜头库" subtitle="所有剧集复用的导演运镜语言。">
      {shots.map((shot) => (
        <ProductionCard key={shot.id} className="p-4">
          <div className="font-mono text-[11px] text-jade">{shot.id}</div>
          <h3 className="mt-2 text-lg font-semibold text-white">{shot.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{shot.type} / {shot.lens}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{shot.rule}</p>
        </ProductionCard>
      ))}
    </LibraryFrame>
  );
}

export function GPTPromptLibraryView() {
  const assets = listFactoryLibrary(assetGenerationQueue.list());
  return (
    <LibraryFrame title="GPT Image2 Prompt库" subtitle="所有图片生成提示词都在这里保留，方便重新生成与版本对比。">
      {assets.map((asset) => (
        <textarea key={asset.assetId} className="min-h-44 rounded-md border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={asset.prompt} readOnly />
      ))}
    </LibraryFrame>
  );
}

export function KlingPromptLibraryView() {
  const prompts = getAssetBibleKlingPrompts();
  return (
    <LibraryFrame title="可灵Prompt库" subtitle="只生成文本。视频由你手动进入可灵制作。">
      {prompts.map((item) => (
        <textarea key={item.id} className="min-h-56 rounded-md border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={item.prompt} readOnly />
      ))}
    </LibraryFrame>
  );
}

export function KlingProductionCenterView() {
  const prompts = buildAllEP01KlingPrompts();
  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">可灵制作中心</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">EP01 视频制作清单</h2>
        <p className="mt-2 text-sm text-slate-400">这里只管理首帧、尾帧、视频Prompt、时长、镜头与状态。视频由你手动进入可灵制作。</p>
      </ProductionCard>
      <ProductionCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
              <tr>{["镜头", "首帧", "尾帧", "时长", "镜头运动", "视频Prompt", "我手动制作的视频", "状态"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
            </thead>
            <tbody>
              {prompts.map((item, index) => (
                <tr key={item.shot} className="border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-jade">{item.shot}</td>
                  <td className="px-4 py-3 text-slate-400">待选择</td>
                  <td className="px-4 py-3 text-slate-400">待选择</td>
                  <td className="px-4 py-3 text-slate-300">5 秒</td>
                  <td className="px-4 py-3 text-slate-400">{index < 4 ? "缓慢推进" : index < 12 ? "跟拍 / 横移" : "固定停留"}</td>
                  <td className="max-w-[360px] truncate px-4 py-3 text-slate-400">{item.prompt}</td>
                  <td className="px-4 py-3 text-slate-500">未导入</td>
                  <td className="px-4 py-3"><StatusPill status="规划中" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProductionCard>
    </div>
  );
}

function LibraryFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Tide Steel Studio</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </ProductionCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}
