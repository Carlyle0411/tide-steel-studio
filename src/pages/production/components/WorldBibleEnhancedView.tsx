import { useMemo, useState } from "react";
import { Download, RotateCcw, Save } from "lucide-react";
import worldBibleMd from "../../../../projects/tide-steel-soul/world-bible/WORLD_BIBLE.md?raw";
import { ProductionCard } from "./ProductionShell";

const STORAGE_KEY = "tide-steel-soul-world-bible-sections-v1";

type WorldSection = { id: string; title: string; markdown: string };

export function WorldBibleEnhancedView() {
  const sourceSections = useMemo(() => parseWorldBible(worldBibleMd), []);
  const [sections, setSections] = useState<WorldSection[]>(() => loadSections(sourceSections));
  const [activeId, setActiveId] = useState(sourceSections[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const active = sections.find((section) => section.id === activeId) ?? sections[0];

  function updateActive(markdown: string) {
    setSections((current) => current.map((section) => section.id === active?.id ? { ...section, markdown } : section));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    setMessage(`“${active?.title}”已保存到当前浏览器。`);
  }

  function restore() {
    const source = sourceSections.find((section) => section.id === active?.id);
    if (!source || !window.confirm(`确定恢复“${active?.title}”的项目原文吗？当前未保存修改会丢失。`)) return;
    updateActive(source.markdown);
    setMessage("已恢复项目原文，点击保存后生效。");
  }

  function exportMarkdown() {
    const markdown = ["# 潮汐钢魂 World Bible", ...sections.map((section, index) => `## ${String(index + 1).padStart(2, "0")} ${section.title}\n\n${section.markdown.trim()}`)].join("\n\n");
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "WORLD_BIBLE_潮汐钢魂.md";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("完整 World Bible 已导出。 ");
  }

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
              <button
                key={item.id}
                className={`rounded border px-3 py-2 text-left text-sm transition ${active?.id === item.id ? "border-jade bg-jade/10 text-jade" : "border-white/10 text-slate-300 hover:border-jade/40 hover:text-white"}`}
                onClick={() => { setActiveId(item.id); setMessage(""); }}
              >
                {item.title}
              </button>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{active?.title}</div>
              <div className="mt-1 text-xs text-slate-500">当前只编辑此章节，不会混入其他目录内容。</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn h-9" onClick={restore}><RotateCcw size={14} /> 恢复原文</button>
              <button className="btn h-9" onClick={exportMarkdown}><Download size={14} /> 导出全部</button>
              <button className="btn h-9 border-jade text-jade" onClick={save}><Save size={14} /> 保存章节</button>
            </div>
          </div>
          <textarea
            className="min-h-[680px] w-full resize-y rounded border border-white/10 bg-black/30 p-4 font-mono text-sm leading-6 text-slate-300 outline-none"
            value={active?.markdown ?? ""}
            onChange={(event) => updateActive(event.target.value)}
          />
          {message && <div className="mt-3 rounded border border-jade/30 bg-jade/10 px-3 py-2 text-xs text-jade">{message}</div>}
        </ProductionCard>
      </div>
    </div>
  );
}

function parseWorldBible(markdown: string): WorldSection[] {
  const matches = [...markdown.matchAll(/^##\s+\d+\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return { id: `world-${index + 1}`, title, markdown: markdown.slice(start, end).trim() };
  });
}

function loadSections(fallback: WorldSection[]) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as WorldSection[];
    return fallback.map((section) => parsed.find((savedSection) => savedSection.title === section.title) ?? section);
  } catch {
    return fallback;
  }
}
