import { useMemo, useState } from "react";
import { CheckCircle2, Clapperboard, Copy, Wand2 } from "lucide-react";
import { directorEngine } from "../../../mcp/director/DirectorEngine";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function DirectorReviewView() {
  const [episodeId, setEpisodeId] = useState("EP01");
  const [shotId, setShotId] = useState("EP01_KF02");
  const [approved, setApproved] = useState(false);
  const directorPackage = useMemo(() => directorEngine.generateDirectorPrompt(episodeId, shotId), [episodeId, shotId]);

  async function copyPrompt() {
    await navigator.clipboard.writeText(directorPackage.finalPrompt);
  }

  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500"><Clapperboard size={15} /> Director Review</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{shotId}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">先验证导演理解，不生成图片。Director Engine 会锁定故事意图、角色、机甲、场景、摄影语言与负面约束。</p>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={copyPrompt}><Copy size={15} /> Copy Prompt</button>
            <button className="btn btn-primary" onClick={() => setApproved(true)}><CheckCircle2 size={15} /> Approve Direction</button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label>
            <span className="label">Episode</span>
            <select className="field" value={episodeId} onChange={(event) => setEpisodeId(event.target.value)}>
              <option value="EP01">EP01</option>
            </select>
          </label>
          <label>
            <span className="label">Shot</span>
            <select className="field" value={shotId} onChange={(event) => setShotId(event.target.value)}>
              <option value="EP01_KF02">EP01_KF02</option>
            </select>
          </label>
        </div>
      </ProductionCard>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <ProductionCard className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Direction Checks</h3>
          <div className="grid gap-3">
            <CheckLine label="Story Intent" value={directorPackage.storyIntent} status="PASS" />
            <CheckLine label="Character Lock" value={directorPackage.characterLock.lockPrompt} status={directorPackage.characterLock.status} />
            <CheckLine label="Mecha Lock" value={directorPackage.mechaLock.lockPrompt} status={directorPackage.mechaLock.status} />
            <CheckLine label="Scene Lock" value={directorPackage.sceneLock.lockPrompt} status={directorPackage.sceneLock.status} />
            <CheckLine label="Visual Style" value={directorPackage.visualStyle.styleLock} status={directorPackage.visualStyle.status} />
            <CheckLine label="Direction Approval" value={approved ? "Direction approved for prompt generation." : "Awaiting human direction approval."} status={approved ? "PASS" : "WARNING"} />
          </div>
        </ProductionCard>

        <ProductionCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Wand2 size={16} /> Director Prompt</div>
            <StatusPill status={directorPackage.promptVersion.version} />
          </div>
          <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap p-5 text-xs leading-6 text-slate-300">{directorPackage.finalPrompt}</pre>
        </ProductionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <PromptBox title="Kling Prompt" body={directorPackage.klingPrompt} />
        <PromptBox title="Veo Prompt" body={directorPackage.veoPrompt} />
      </section>
    </div>
  );
}

function CheckLine({ label, value, status }: { label: string; value: string; status: "PASS" | "WARNING" | "FAIL" }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <StatusPill status={status} />
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{value}</div>
    </div>
  );
}

function PromptBox({ title, body }: { title: string; body: string }) {
  return (
    <ProductionCard className="overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">{title}</div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-4 text-xs leading-6 text-slate-300">{body}</pre>
    </ProductionCard>
  );
}
