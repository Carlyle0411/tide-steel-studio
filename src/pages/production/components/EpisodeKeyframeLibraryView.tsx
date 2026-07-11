import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy, Image, Trash2, Upload } from "lucide-react";
import { getEP01Keyframes, type EP01Keyframe } from "../../../mcp/tideSteelStudio/EP01StudioData";
import {
  approveKeyframeVersion,
  deleteAllKeyframeVersions,
  deleteKeyframeVersion,
  getBestKeyframeVersion,
  importKeyframeFiles,
  loadKeyframeStore,
  rejectKeyframeVersion,
  setMasterKeyframeVersion,
  subscribeKeyframeStore,
  type KeyframeAssetStore,
  type KeyframeAssetVersion
} from "../../../mcp/keyframeLibrary/KeyframeAssetStore";
import { ProductionCard } from "./ProductionShell";

type EpisodeId = "EP01";

export function EpisodeKeyframeLibraryView() {
  const [episode] = useState<EpisodeId>("EP01");
  const keyframes = useMemo(() => getEP01Keyframes(), []);
  const [store, setStore] = useState<KeyframeAssetStore>({});
  const [selectedId, setSelectedId] = useState(keyframes[0]?.id ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    async function reload() {
      const value = await loadKeyframeStore();
      if (alive) setStore(value);
    }
    void reload();
    const unsubscribe = subscribeKeyframeStore(() => void reload());
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const selected = keyframes.find((item) => item.id === selectedId) ?? keyframes[0];
  const uploaded = keyframes.filter((item) => (store[item.id] ?? []).length > 0).length;
  const approved = keyframes.filter((item) => (store[item.id] ?? []).some((version) => version.status === "MASTER_REFERENCE" || version.status === "APPROVED")).length;
  const review = Object.values(store).flat().filter((version) => version.status === "REVIEW").length;

  async function copyPrompt(keyframe: EP01Keyframe) {
    const prompt = buildKlingPrompt(keyframe);
    await copyText(prompt);
    setMessage(`${keyframe.id} 可灵 Prompt 已复制。`);
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Keyframe / Kling First Frame</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">关键帧制作</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          这里管理每一集用于可灵制作的关键帧图片。当前开放 EP01《海面低频》18 张关键帧：复制 Prompt 到 ChatGPT 出图，审核后把 PNG / JPG / WEBP 拖回对应镜头，素材会保存在本地 IndexedDB，刷新和重启后仍会保留。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="当前剧集" value={episode} />
        <Metric label="关键帧总数" value={`${keyframes.length} 张`} />
        <Metric label="已上传" value={`${uploaded}/${keyframes.length}`} />
        <Metric label="待审核" value={review} />
      </div>

      {message && (
        <div className="rounded-md border border-jade/25 bg-jade/10 px-3 py-2 text-sm text-jade">{message}</div>
      )}

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <ProductionCard className="order-2 p-4 2xl:order-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">EP01 关键帧清单</h3>
              <p className="mt-1 text-xs text-slate-500">每张图都是一个可灵视频镜头的首帧或完整画面参考。</p>
            </div>
            <div className="rounded-full border border-jade/30 bg-jade/10 px-3 py-1 text-xs text-jade">已通过 {approved}/{keyframes.length}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {keyframes.map((keyframe) => (
              <KeyframeCard
                key={keyframe.id}
                keyframe={keyframe}
                versions={store[keyframe.id] ?? []}
                selected={selected?.id === keyframe.id}
                onSelect={() => setSelectedId(keyframe.id)}
                onCopy={() => void copyPrompt(keyframe)}
              />
            ))}
          </div>
        </ProductionCard>

        {selected && (
          <div className="order-1 2xl:order-2">
            <KeyframeInspector
              keyframe={selected}
              versions={store[selected.id] ?? []}
              onCopied={() => void copyPrompt(selected)}
              onMessage={setMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function KeyframeCard({ keyframe, versions, selected, onSelect, onCopy }: { keyframe: EP01Keyframe; versions: KeyframeAssetVersion[]; selected: boolean; onSelect: () => void; onCopy: () => void }) {
  const best = getBestKeyframeVersion(versions);
  const status = best?.status ?? "EMPTY";
  return (
    <button
      className={`overflow-hidden rounded-lg border bg-black/20 text-left transition hover:border-jade/40 ${selected ? "border-jade/70 ring-1 ring-jade/40" : "border-white/10"}`}
      onClick={onSelect}
    >
      <div className="aspect-video bg-white/[0.04]">
        {best ? (
          <img src={best.dataUrl} alt={keyframe.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
            <Image size={24} />
            <span className="text-xs">等待上传关键帧</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-jade">{keyframe.id}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${status === "MASTER_REFERENCE" ? "border-jade/40 text-jade" : status === "APPROVED" ? "border-blue-300/40 text-blue-200" : status === "REVIEW" ? "border-gold/40 text-gold" : "border-white/10 text-slate-500"}`}>{status}</span>
        </div>
        <h4 className="mt-2 line-clamp-1 text-sm font-semibold text-white">{keyframe.title}</h4>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{keyframe.purpose}</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded border border-white/10 px-2 py-1 text-[11px] text-slate-400">{keyframe.shot}</span>
          <button type="button" className="ml-auto rounded border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:border-jade/50 hover:text-jade" onClick={(event) => { event.stopPropagation(); onCopy(); }}>
            复制 Prompt
          </button>
        </div>
      </div>
    </button>
  );
}

function KeyframeInspector({ keyframe, versions, onCopied, onMessage }: { keyframe: EP01Keyframe; versions: KeyframeAssetVersion[]; onCopied: () => void; onMessage: (message: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const best = getBestKeyframeVersion(versions);
  const prompt = buildKlingPrompt(keyframe);

  async function upload(files: FileList | File[] | null) {
    if (!files?.length) return;
    const imported = await importKeyframeFiles(keyframe, files, prompt);
    onMessage(imported.length ? `${keyframe.id} 已导入 ${imported.length} 个版本，状态为 Review。` : "没有可导入的图片，请使用 PNG / JPG / WEBP。");
  }

  async function deleteAll() {
    if (versions.some(isLockedKeyframeVersion) && !confirmLockedKeyframeDelete("本镜头包含已通过或 Master 关键帧，确定删除本镜头全部本地图片吗？")) return;
    await deleteAllKeyframeVersions(keyframe.id);
    onMessage(`${keyframe.id} 的本地上传图片已删除。`);
  }

  return (
    <ProductionCard className="sticky top-4 overflow-hidden">
      <div className="border-b border-white/10 p-4">
        <div className="font-mono text-xs text-jade">{keyframe.shot}</div>
        <h3 className="mt-1 text-lg font-semibold text-white">{keyframe.id} / {keyframe.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{keyframe.purpose}</p>
      </div>

      <div
        className="m-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void upload(event.dataTransfer.files);
        }}
      >
        {best ? (
          <img src={best.dataUrl} alt={keyframe.title} className="h-full w-full rounded-lg object-cover" />
        ) : (
          <div className="text-center text-sm text-slate-500">
            <Upload className="mx-auto mb-3 text-jade" size={28} />
            拖拽关键帧图片到这里
            <div className="mt-1 text-xs">支持 PNG / JPG / WEBP</div>
          </div>
        )}
      </div>

      <div className="grid gap-2 px-4 md:grid-cols-2">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => void upload(event.target.files)} />
        <button className="btn h-10" onClick={() => inputRef.current?.click()}><Upload size={15} /> 上传/替换</button>
        <button className="btn h-10" onClick={onCopied}><Copy size={15} /> 复制可灵 Prompt</button>
        <button className="btn h-10" onClick={deleteAll} disabled={!versions.length}><Trash2 size={15} /> 删除本镜头图片</button>
      </div>

      <div className="grid gap-2 p-4 text-sm md:grid-cols-2">
        <Info label="关联资产" value={keyframe.required_assets.join(" / ")} />
        <Info label="源状态" value={keyframe.status} />
        <Info label="版本数量" value={versions.length} />
        <Info label="当前版本" value={best?.versionId ?? "EMPTY"} />
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Kling Prompt</div>
        <textarea className="min-h-44 w-full resize-y rounded-md border border-white/10 bg-black/25 p-3 text-xs leading-5 text-slate-300 outline-none" value={prompt} readOnly />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-500">Version</div>
        {!versions.length && <div className="rounded border border-white/10 bg-black/20 p-3 text-sm text-slate-500">暂无上传版本。复制 Prompt 出图后，把图片拖回来即可。</div>}
        <div className="space-y-2">
          {versions.map((version) => (
            <div key={version.versionId} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded border border-white/10 bg-black/20 p-2">
              <img src={version.dataUrl} alt={version.fileName} className="aspect-video rounded object-cover" />
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-jade">{version.versionId}</span>
                  <span className="text-[11px] text-slate-500">{version.status}</span>
                </div>
                <div className="mt-1 truncate text-xs text-slate-400">{version.fileName}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn h-7 px-2 text-[11px]" onClick={() => void approveKeyframeVersion(keyframe.id, version.versionId)}>通过</button>
                  <button className="btn h-7 px-2 text-[11px]" onClick={() => void setMasterKeyframeVersion(keyframe.id, version.versionId)}><CheckCircle2 size={13} /> Master</button>
                  <button className="btn h-7 px-2 text-[11px]" onClick={() => void rejectKeyframeVersion(keyframe.id, version.versionId)}>退回</button>
                  <button
                    className="btn h-7 px-2 text-[11px]"
                    onClick={() => {
                      if (isLockedKeyframeVersion(version) && !confirmLockedKeyframeDelete(`${version.versionId} 是已通过或 Master 关键帧，确定删除吗？`)) return;
                      void deleteKeyframeVersion(keyframe.id, version.versionId);
                    }}
                  >
                    <Trash2 size={13} /> 删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProductionCard>
  );
}

function buildKlingPrompt(keyframe: EP01Keyframe) {
  return [
    `Scene: ${keyframe.title}`,
    `Shot: ${keyframe.shot}`,
    `Action: ${keyframe.purpose}`,
    `Assets: ${keyframe.required_assets.join(", ")}`,
    "Camera: cinematic realistic sci-fi, controlled camera movement, no short-video shake",
    "Lighting: cold ocean industrial light, low saturation, humid air, rain or sea mist when appropriate",
    "Duration: 5 seconds",
    "Motion Physics: real weight, real ocean scale, no game-like movement",
    "Negative Prompt: anime, cartoon, game render, plastic texture, neon cyberpunk, text, logo, watermark, unstable character face, changed mech design"
  ].join("\n");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
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
    <div className="rounded border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm text-slate-200">{value}</div>
    </div>
  );
}

function isLockedKeyframeVersion(version: KeyframeAssetVersion) {
  return version.status === "APPROVED" || version.status === "MASTER_REFERENCE";
}

function confirmLockedKeyframeDelete(message: string) {
  return window.confirm(`${message}\n\n这个操作只会删除网页本地关键帧库中的上传版本，不会删除你电脑里的原始图片文件。`);
}
