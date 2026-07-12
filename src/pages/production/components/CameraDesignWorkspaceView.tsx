import { useEffect, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { loadStoryboardWorkspace, saveStoryboardWorkspace, subscribeStoryboardWorkspace, type StoryboardShot } from "../../../mcp/storyboardWorkspace/StoryboardWorkspaceStore";
import { ProductionCard } from "./ProductionShell";

type CameraTemplate = { id: string; name: string; shotSize: string; lens: string; camera: string; movement: string; lighting: string; purpose: string };

const STORAGE_KEY = "tide-steel-soul-camera-templates-v2";

export function CameraDesignWorkspaceView() {
  const [mode, setMode] = useState<"shots" | "templates">("shots");
  const [shots, setShots] = useState(() => loadStoryboardWorkspace());
  const [selectedId, setSelectedId] = useState(shots[0]?.id ?? "");
  const [templates, setTemplates] = useState<CameraTemplate[]>(loadTemplates);
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const selected = shots.find((shot) => shot.id === selectedId) ?? shots[0];
  const selectedTemplate = templates.find((template) => template.id === templateId) ?? templates[0];

  useEffect(() => subscribeStoryboardWorkspace(() => setShots(loadStoryboardWorkspace())), []);

  function updateShot<K extends keyof StoryboardShot>(key: K, value: StoryboardShot[K]) {
    setShots((current) => current.map((shot) => shot.id === selected.id ? { ...shot, [key]: value, updatedAt: new Date().toISOString() } : shot));
    setMessage("");
  }

  function saveShot() {
    setShots(saveStoryboardWorkspace(shots));
    setMessage("摄影方案已保存，并同步到Storyboard。");
  }

  function applyTemplate(template: CameraTemplate) {
    const next = shots.map((shot) => shot.id === selected.id ? { ...shot, shotSize: template.shotSize, lens: template.lens, camera: template.camera, movement: template.movement, lighting: template.lighting, updatedAt: new Date().toISOString() } : shot);
    setShots(saveStoryboardWorkspace(next));
    setMessage(`已将“${template.name}”应用到${selected.id}。`);
  }

  function updateTemplate(key: keyof CameraTemplate, value: string) {
    setTemplates((current) => current.map((template) => template.id === selectedTemplate.id ? { ...template, [key]: value } : template));
  }

  function saveTemplates(next = templates) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTemplates(next);
    setMessage("镜头模板库已保存。");
  }

  function addTemplate() {
    const id = `CAM-${String(Date.now()).slice(-6)}`;
    const next = [...templates, { id, name: "新镜头模板", shotSize: "中景", lens: "35mm", camera: "人物视线高度", movement: "固定", lighting: "自然实景光", purpose: "待填写镜头目的" }];
    saveTemplates(next);
    setTemplateId(id);
  }

  function removeTemplate() {
    if (!selectedTemplate || !window.confirm(`确定删除镜头模板“${selectedTemplate.name}”吗？`)) return;
    const next = templates.filter((template) => template.id !== selectedTemplate.id);
    saveTemplates(next);
    setTemplateId(next[0]?.id ?? "");
  }

  function exportJson() {
    const payload = mode === "shots" ? { episode: "EP01", cameraPlans: shots } : { cameraTemplates: templates };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = mode === "shots" ? "EP01_CAMERA_PLAN.json" : "CAMERA_TEMPLATE_LIBRARY.json"; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <ProductionCard className="flex flex-wrap items-end justify-between gap-3 p-5">
        <div><div className="text-xs uppercase tracking-[0.22em] text-jade/80">Camera Design</div><h2 className="mt-2 text-2xl font-semibold text-white">Camera设计</h2><p className="mt-2 text-sm text-slate-400">编辑EP01逐镜头摄影方案，维护可复用模板，并与Storyboard双向同步。</p></div>
        <button className="btn h-9" onClick={exportJson}><Download size={14} /> 导出JSON</button>
      </ProductionCard>
      <ProductionCard className="flex gap-2 p-3"><button className={`btn h-10 ${mode === "shots" ? "border-jade text-jade" : ""}`} onClick={() => setMode("shots")}>EP01摄影方案</button><button className={`btn h-10 ${mode === "templates" ? "border-jade text-jade" : ""}`} onClick={() => setMode("templates")}>可复用镜头模板</button></ProductionCard>

      {mode === "shots" && <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
        <ProductionCard className="max-h-[760px] overflow-y-auto p-3"><div className="grid gap-2">{shots.map((shot) => <button key={shot.id} className={`rounded border p-3 text-left ${selected?.id === shot.id ? "border-jade bg-jade/10" : "border-white/10 bg-black/20 hover:border-jade/40"}`} onClick={() => { setSelectedId(shot.id); setMessage(""); }}><div className="font-mono text-[10px] text-jade">{shot.id}</div><div className="mt-1 truncate text-sm font-semibold text-white">{shot.title}</div><div className="mt-1 text-[11px] text-slate-500">{shot.shotSize} · {shot.lens} · {shot.movement}</div></button>)}</div></ProductionCard>
        {selected && <ProductionCard className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="font-mono text-xs text-jade">{selected.id}</div><h3 className="mt-2 text-lg font-semibold text-white">{selected.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{selected.description}</p></div><button className="btn h-9 border-jade text-jade" onClick={saveShot}><Save size={14} /> 保存摄影方案</button></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2"><Field label="景别" value={selected.shotSize} onChange={(value) => updateShot("shotSize", value)} /><Field label="焦段" value={selected.lens} onChange={(value) => updateShot("lens", value)} /><Field label="摄影机位置与高度" value={selected.camera} multiline onChange={(value) => updateShot("camera", value)} /><Field label="摄影机运动" value={selected.movement} multiline onChange={(value) => updateShot("movement", value)} /><Field label="光线" value={selected.lighting} multiline onChange={(value) => updateShot("lighting", value)} /><Field label="镜头情绪" value={selected.emotion} multiline onChange={(value) => updateShot("emotion", value)} /></div>
          <div className="mt-5"><div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">应用镜头模板</div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => <button key={template.id} className="rounded border border-white/10 bg-black/20 p-3 text-left hover:border-jade/40" onClick={() => applyTemplate(template)}><div className="text-sm font-semibold text-white">{template.name}</div><div className="mt-1 text-[11px] text-slate-500">{template.shotSize} · {template.lens}</div><div className="mt-2 line-clamp-2 text-xs text-slate-400">{template.purpose}</div></button>)}</div></div>
          {message && <Message text={message} />}
        </ProductionCard>}
      </div>}

      {mode === "templates" && <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
        <ProductionCard className="p-3"><div className="mb-3 flex items-center justify-between"><span className="text-xs uppercase tracking-[0.18em] text-slate-500">镜头模板</span><button className="btn h-8" onClick={addTemplate}><Plus size={13} /> 新建</button></div><div className="grid gap-2">{templates.map((template) => <button key={template.id} className={`rounded border p-3 text-left ${template.id === selectedTemplate?.id ? "border-jade bg-jade/10" : "border-white/10 bg-black/20 hover:border-jade/40"}`} onClick={() => setTemplateId(template.id)}><div className="font-mono text-[10px] text-jade">{template.id}</div><div className="mt-1 text-sm font-semibold text-white">{template.name}</div><div className="mt-1 text-[11px] text-slate-500">{template.shotSize} · {template.lens} · {template.movement}</div></button>)}</div></ProductionCard>
        {selectedTemplate && <ProductionCard className="p-5"><div className="flex justify-between gap-3"><h3 className="text-lg font-semibold text-white">编辑镜头模板</h3><div className="flex gap-2"><button className="btn h-9 text-red-300" onClick={removeTemplate}><Trash2 size={14} /> 删除</button><button className="btn h-9 border-jade text-jade" onClick={() => saveTemplates()}><Save size={14} /> 保存模板</button></div></div><div className="mt-4 grid gap-3 md:grid-cols-2"><Field label="模板名称" value={selectedTemplate.name} onChange={(value) => updateTemplate("name", value)} /><Field label="景别" value={selectedTemplate.shotSize} onChange={(value) => updateTemplate("shotSize", value)} /><Field label="焦段" value={selectedTemplate.lens} onChange={(value) => updateTemplate("lens", value)} /><Field label="摄影机位置" value={selectedTemplate.camera} onChange={(value) => updateTemplate("camera", value)} /><Field label="运镜" value={selectedTemplate.movement} onChange={(value) => updateTemplate("movement", value)} /><Field label="光线" value={selectedTemplate.lighting} onChange={(value) => updateTemplate("lighting", value)} /><div className="md:col-span-2"><Field label="适用目的" value={selectedTemplate.purpose} multiline onChange={(value) => updateTemplate("purpose", value)} /></div></div>{message && <Message text={message} />}</ProductionCard>}
      </div>}
    </div>
  );
}

function loadTemplates(): CameraTemplate[] {
  const defaults: CameraTemplate[] = [
    { id: "CAM-001", name: "世界建立远景", shotSize: "超远景", lens: "24mm", camera: "稳定地面机位，接近人物可抵达的位置", movement: "极慢推进", lighting: "阴天自然光与海面反射", purpose: "建立杭州湾防线与海洋尺度，不制造威胁表演" },
    { id: "CAM-002", name: "物理异常微距", shotSize: "微距特写", lens: "85mm微距", camera: "与桌面齐平的固定机位", movement: "固定，不摇移", lighting: "观测站实景冷光", purpose: "让观众发现水纹、金属或仪表的细小规则变化" },
    { id: "CAM-003", name: "人物经验中近景", shotSize: "中近景", lens: "50mm", camera: "人物视线高度，主体偏离中心", movement: "缓慢推进", lighting: "屏幕侧光与环境暗部", purpose: "拍人物先于系统察觉异常的瞬间" },
    { id: "CAM-004", name: "关系双人中景", shotSize: "中景", lens: "35mm", camera: "两人同一空间平面，保持距离可读", movement: "轻微横移", lighting: "真实工作灯，不单独美化人物", purpose: "呈现人物目标冲突和关系变化" },
    { id: "CAM-005", name: "机甲重量低机位", shotSize: "局部全景", lens: "35mm", camera: "接近地面的低机位，维护人员作比例", movement: "跟随承重方向缓慢移动", lighting: "机库冷蓝工作灯", purpose: "表现机甲落脚、承重和结构代价，不拍英雄全景" },
    { id: "CAM-006", name: "机械结构特写", shotSize: "特写", lens: "85mm", camera: "与机械接触点平齐", movement: "固定或短距离推进", lighting: "硬质工作灯勾出磨损边缘", purpose: "展示锁扣、液压、接口和接触后果" },
    { id: "CAM-007", name: "克制跟拍", shotSize: "中景", lens: "35mm", camera: "人物侧后方肩部高度", movement: "稳定跟拍，保留轻微脚步反馈", lighting: "通道现有维护灯", purpose: "跟随人物进入空间，不使用短视频式剧烈晃动" },
    { id: "CAM-008", name: "长焦情绪压缩", shotSize: "近景", lens: "85mm", camera: "人物眼睛高度，背景压缩", movement: "固定后极慢推进", lighting: "自然面部反射光", purpose: "表现克制疼痛、怀疑和沉默，不依赖对白" },
    { id: "CAM-009", name: "建筑压迫广角", shotSize: "大全景", lens: "24mm", camera: "人物身后地面机位，建筑占主画面", movement: "缓慢后拉", lighting: "海光被建筑逐步遮断", purpose: "让闸门、防线或基地结构压过人物尺度" },
    { id: "CAM-010", name: "潮兽未知远景", shotSize: "远景", lens: "50mm长距离", camera: "防线或观测平台可成立的机位", movement: "固定", lighting: "海雾、探照灯和自然闪电", purpose: "只显示环境变化和局部轮廓，不给Boss登场" },
    { id: "CAM-011", name: "对峙长焦", shotSize: "中远景", lens: "85mm", camera: "压缩机甲与潮兽距离的侧向机位", movement: "固定停留", lighting: "暴雨环境反射光", purpose: "让未完成的攻击和停顿成为画面核心" },
    { id: "CAM-012", name: "结尾静止镜头", shotSize: "局部中景", lens: "50mm", camera: "稳定固定机位，保留负空间", movement: "完全固定", lighting: "单一冷蓝状态光由暗到亮", purpose: "让余波和下集问题停留，不用悬疑摇镜" }
  ];
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CameraTemplate[]; return saved.length ? saved : defaults; } catch { return defaults; }
}

function Field({ label, value, multiline = false, onChange }: { label: string; value: string; multiline?: boolean; onChange: (value: string) => void }) { return <label className="block"><span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</span>{multiline ? <textarea className="mt-2 min-h-24 w-full resize-y rounded border border-white/10 bg-black/30 p-3 text-sm leading-6 text-slate-200 outline-none" value={value} onChange={(event) => onChange(event.target.value)} /> : <input className="mt-2 h-10 w-full rounded border border-white/10 bg-black/30 px-3 text-sm text-slate-200 outline-none" value={value} onChange={(event) => onChange(event.target.value)} />}</label>; }
function Message({ text }: { text: string }) { return <div className="mt-4 rounded border border-jade/30 bg-jade/10 p-2 text-xs text-jade">{text}</div>; }
