import { useState } from "react";
import worldBibleMd from "../../../../projects/tide-steel-soul/world-bible/WORLD_BIBLE.md?raw";
import { ProductionCard } from "./ProductionShell";

const sections = ["世界历史", "时间线", "科技树", "阵营", "组织", "国家", "城市", "地图", "名词解释", "术语", "图片参考", "EP01落点"];

export function WorldBibleEnhancedView() {
  const [value, setValue] = useState(worldBibleMd);

  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-jade/80">Tide Steel Studio</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">世界观</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">World Bible，可编辑 Markdown 工作区。当前内容来自项目真实世界观文档。</p>
      </ProductionCard>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ProductionCard className="p-3">
          <div className="mb-3 px-2 text-xs uppercase tracking-[0.22em] text-slate-500">目录</div>
          <div className="grid gap-2">
            {sections.map((item) => (
              <button key={item} className="rounded border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:border-jade/40 hover:text-white">
                {item}
              </button>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">World Bible Markdown</div>
            <div className="text-xs text-slate-500">projects/tide-steel-soul/world-bible/WORLD_BIBLE.md</div>
          </div>
          <textarea
            className="min-h-[680px] w-full resize-y rounded border border-white/10 bg-black/30 p-4 font-mono text-sm leading-6 text-slate-300 outline-none"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </ProductionCard>
      </div>
    </div>
  );
}
