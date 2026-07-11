import { useMemo, useState } from "react";
import { Clapperboard, Copy, Search, Video } from "lucide-react";
import { getKlingVideoTemplateCategories, getKlingVideoTemplateStats, searchKlingVideoTemplates, type KlingVideoTemplate } from "../../../mcp/klingVideoTemplateLibrary/KlingVideoTemplateLibraryData";
import { ProductionCard } from "./ProductionShell";

export function Phase21DKlingVideoTemplateView() {
  const stats = getKlingVideoTemplateStats();
  const categories = ["全部", ...getKlingVideoTemplateCategories().map((item) => item.name)];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState<KlingVideoTemplate | null>(null);
  const templates = useMemo(() => searchKlingVideoTemplates(query, category), [query, category]);
  const current = selected ?? templates[0];

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Kling Video Template Library</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">可灵视频模板库</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">不调用视频API。这里只管理可重复使用的首帧建议、尾帧建议、镜头运动、动作描述和可灵Prompt模板。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="模板总数" value={stats.total} />
        <Metric label="人物动作" value={stats.human} />
        <Metric label="机甲动作" value={stats.mecha} />
        <Metric label="怪兽动作" value={stats.creature} />
        <Metric label="环境/镜头" value={stats.environment + stats.camera} />
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <ProductionCard className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex min-w-72 flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3">
                <Search size={16} className="text-jade" />
                <input className="h-10 w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索赤霆启动、人物驾驶、白潮登陆、暴雨、推镜、情绪镜头..." />
              </div>
              {categories.map((item) => <button key={item} className={`btn h-10 ${category === item ? "border-jade text-jade" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
          </ProductionCard>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <button key={template.id} className={`rounded-md border p-4 text-left transition ${current?.id === template.id ? "border-jade bg-jade/10" : "border-white/10 bg-white/[0.03] hover:border-jade/40"}`} onClick={() => setSelected(template)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] text-jade">{template.id}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{template.name}</div>
                  </div>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">{template.duration}s</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Info label="分类" value={template.category} />
                  <Info label="运镜" value={template.cameraMovement} />
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{template.actionDescription}</p>
              </button>
            ))}
          </div>
        </div>
        <TemplateDetail template={current} />
      </section>
    </div>
  );
}

function TemplateDetail({ template }: { template?: KlingVideoTemplate }) {
  const [message, setMessage] = useState("");
  if (!template) return null;
  return (
    <ProductionCard className="sticky top-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white"><Video size={16} /> {template.name}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Info label="分类" value={template.category} />
        <Info label="时长" value={`${template.duration} seconds`} />
        <Info label="镜头运动" value={template.cameraMovement} />
        <Info label="气氛" value={template.atmosphere} />
      </div>
      <div className="mt-3 rounded border border-white/10 bg-black/20 p-3">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">图片模板</div>
        <div className="space-y-2 text-sm leading-6 text-slate-300">
          <div>参考图片：{template.referenceImage}</div>
          <div>首帧建议：{template.firstFrameSuggestion}</div>
          <div>尾帧建议：{template.lastFrameSuggestion}</div>
        </div>
      </div>
      <textarea className="mt-3 min-h-64 w-full resize-y rounded border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={template.klingPrompt} readOnly />
      <button className="btn mt-3 h-9 w-full" onClick={() => { void navigator.clipboard?.writeText(template.klingPrompt); setMessage("可灵Prompt已复制。"); }}><Copy size={14} /> 复制可灵Prompt</button>
      <textarea className="mt-3 min-h-20 w-full rounded border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-400 outline-none" value={`Negative Prompt:\n${template.negativePrompt}`} readOnly />
      {message && <div className="mt-2 text-xs text-jade">{message}</div>}
    </ProductionCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500"><Clapperboard size={14} /> {label}</div>
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
