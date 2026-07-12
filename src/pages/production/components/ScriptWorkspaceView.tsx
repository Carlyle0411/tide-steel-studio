import { useMemo, useState } from "react";
import { Copy, Download, RotateCcw, Save } from "lucide-react";
import episodeBibleRaw from "../../../../EPISODE_BIBLE_赤霆纪元_EP01-EP12.md?raw";
import scriptEp01Raw from "../../../../SCRIPT_EP01_海面低频_剧本开发版.md?raw";
import trailerRaw from "../../../../TRAILER_90S_母资产关键帧与可灵规划_V1.md?raw";
import type { ProductionSection } from "../types";
import { ProductionCard } from "./ProductionShell";

type ScriptDocument = { id: string; label: string; fileName: string; source: string };
type Section = { id: string; title: string; level: number; start: number; end: number; markdown: string };

const STORAGE_KEY = "tide-steel-soul-script-workspace-v1";
const documents: ScriptDocument[] = [
  { id: "script-ep01", label: "EP01正式剧本", fileName: "SCRIPT_EP01_海面低频_剧本开发版.md", source: scriptEp01Raw },
  { id: "episode-bible", label: "第一部12集 Episode Bible", fileName: "EPISODE_BIBLE_赤霆纪元_EP01-EP12.md", source: episodeBibleRaw },
  { id: "trailer-90", label: "90秒概念预告片", fileName: "TRAILER_90S_母资产关键帧与可灵规划_V1.md", source: trailerRaw }
];

export function ScriptWorkspaceView({ navigate }: { navigate: (section: ProductionSection) => void }) {
  const [contents, setContents] = useState<Record<string, string>>(() => loadContents());
  const [documentId, setDocumentId] = useState(documents[0].id);
  const [sectionId, setSectionId] = useState("");
  const [message, setMessage] = useState("");
  const doc = documents.find((item) => item.id === documentId) ?? documents[0];
  const content = contents[doc.id] ?? doc.source;
  const sections = useMemo(() => parseSections(content, doc.id), [content, doc.id]);
  const active = sections.find((section) => section.id === sectionId) ?? sections[0];

  function selectDocument(id: string) {
    setDocumentId(id);
    setSectionId("");
    setMessage("");
  }

  function updateSection(markdown: string) {
    if (!active) return;
    const next = `${content.slice(0, active.start)}${markdown}${content.slice(active.end)}`;
    setContents((current) => ({ ...current, [doc.id]: next }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
    setMessage(`已保存“${doc.label} / ${active?.title}”。`);
  }

  function restore() {
    if (!window.confirm(`确定恢复“${doc.label}”的项目原文吗？该文档在浏览器中的修改会被清除。`)) return;
    const next = { ...contents, [doc.id]: doc.source };
    setContents(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSectionId("");
    setMessage("已恢复项目原文。");
  }

  async function copySection() {
    await navigator.clipboard.writeText(active?.markdown ?? "");
    setMessage("当前章节已复制。");
  }

  function exportDocument() {
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = doc.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("当前完整文档已导出。");
  }

  return (
    <div className="space-y-4">
      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-jade/80">Script Workspace</div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">剧本管理</h2>
            <p className="mt-2 text-sm text-slate-400">直接编辑项目中的完整剧本、Episode Bible和预告片规划。章节修改会保存在当前浏览器。</p>
          </div>
          <div className="text-right text-xs text-slate-500">{content.length.toLocaleString()} 字符 · {sections.length} 章节</div>
        </div>
      </ProductionCard>

      <ProductionCard className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap gap-2">
          {documents.map((item) => <button key={item.id} className={`btn h-10 ${item.id === doc.id ? "border-jade bg-jade/10 text-jade" : ""}`} onClick={() => selectDocument(item.id)}>{item.label}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn h-9" onClick={() => navigate("storyboard")}>打开Storyboard</button>
          <button className="btn h-9" onClick={copySection}><Copy size={14} /> 复制章节</button>
          <button className="btn h-9" onClick={exportDocument}><Download size={14} /> 导出文档</button>
        </div>
      </ProductionCard>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <ProductionCard className="max-h-[760px] overflow-y-auto p-3">
          <div className="mb-3 px-2 text-xs uppercase tracking-[0.2em] text-slate-500">文档目录</div>
          <div className="grid gap-1">
            {sections.map((section) => (
              <button key={section.id} className={`rounded border px-3 py-2 text-left text-sm ${active?.id === section.id ? "border-jade bg-jade/10 text-jade" : "border-white/10 text-slate-300 hover:border-jade/40"}`} onClick={() => { setSectionId(section.id); setMessage(""); }}>
                <span className={section.level >= 3 ? "pl-3 text-xs" : ""}>{section.title}</span>
              </button>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{active?.title}</div>
              <div className="mt-1 text-xs text-slate-500">{doc.fileName}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn h-9" onClick={restore}><RotateCcw size={14} /> 恢复整篇原文</button>
              <button className="btn h-9 border-jade text-jade" onClick={save}><Save size={14} /> 保存章节</button>
            </div>
          </div>
          <textarea className="min-h-[680px] w-full resize-y rounded border border-white/10 bg-black/30 p-4 font-mono text-sm leading-7 text-slate-200 outline-none" value={active?.markdown ?? ""} onChange={(event) => updateSection(event.target.value)} />
          {message && <div className="mt-3 rounded border border-jade/30 bg-jade/10 px-3 py-2 text-xs text-jade">{message}</div>}
        </ProductionCard>
      </div>
    </div>
  );
}

function parseSections(markdown: string, prefix: string): Section[] {
  const matches = [...markdown.matchAll(/^(#{1,3})\s+(.+)$/gm)];
  if (!matches.length) return [{ id: `${prefix}-all`, title: "完整文档", level: 1, start: 0, end: markdown.length, markdown }];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? markdown.length;
    return { id: `${prefix}-${index}`, title: match[2].trim(), level: match[1].length, start, end, markdown: markdown.slice(start, end).trimEnd() };
  });
}

function loadContents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) as Record<string, string> : {};
    return Object.fromEntries(documents.map((doc) => [doc.id, parsed[doc.id] ?? doc.source]));
  } catch {
    return Object.fromEntries(documents.map((doc) => [doc.id, doc.source]));
  }
}
