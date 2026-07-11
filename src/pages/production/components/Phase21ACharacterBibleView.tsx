import { useMemo, useState } from "react";
import { Copy, Image, Search, ShieldCheck, UserRound } from "lucide-react";
import { getAssetsForCharacter, getHeroCharacterBible, getHeroCharacterRules, getHeroCharacterStats, heroCharacterAssetUrl, searchHeroCharacterAssets, type HeroCharacter, type HeroCharacterAsset } from "../../../mcp/heroCharacterLibrary/HeroCharacterLibraryData";
import { ProductionCard } from "./ProductionShell";

export function Phase21ACharacterBibleView() {
  const bible = getHeroCharacterBible();
  const stats = getHeroCharacterStats();
  const rules = getHeroCharacterRules();
  const [selected, setSelected] = useState<HeroCharacter>(bible.characters[0]);
  const [query, setQuery] = useState("");
  const assets = useMemo(() => searchHeroCharacterAssets(query).filter((asset) => asset.character === selected.name), [query, selected.name]);
  const currentAssets = getAssetsForCharacter(selected.name);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Hero Character Asset Library</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">Character Bible / 英雄角色母资产库</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{bible.rule}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="核心角色" value={stats.characters} />
        <Metric label="应生成图片" value={stats.requiredImages} />
        <Metric label="已落盘图片" value={stats.landedImages} />
        <Metric label="待生成" value={stats.pending} />
      </div>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
        <ProductionCard className="p-3">
          <h3 className="mb-3 text-sm font-semibold text-white">角色列表</h3>
          {bible.characters.map((character) => (
            <button key={character.key} className={`mb-2 w-full rounded-md border p-3 text-left transition ${selected.key === character.key ? "border-jade bg-jade/10" : "border-white/10 bg-black/20 hover:border-jade/40"}`} onClick={() => setSelected(character)}>
              <div className="flex items-center gap-2 text-white"><UserRound size={15} /> {character.name}</div>
              <div className="mt-1 text-xs text-slate-500">{character.englishName} / {getAssetsForCharacter(character.name).length} 张标准图</div>
            </button>
          ))}
        </ProductionCard>

        <div className="space-y-4">
          <CharacterProfile character={selected} />
          <ProductionCard className="p-4">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3">
              <Search size={16} className="text-jade" />
              <input className="h-10 w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索头像、三视图、驾驶舱、表情、海报姿态..." />
            </div>
          </ProductionCard>
          <div className="grid gap-3 md:grid-cols-2">
            {assets.map((asset) => <CharacterAssetCard key={asset.assetId} asset={asset} />)}
          </div>
        </div>

        <ProductionCard className="sticky top-4 p-4">
          <h3 className="text-sm font-semibold text-white">Reference规则</h3>
          <div className="mt-3 space-y-2">
            {rules.map((rule) => (
              <div key={rule} className="flex gap-2 rounded border border-white/10 bg-black/20 p-3 text-sm leading-6 text-slate-300">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-jade" />
                {rule}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded border border-gold/30 bg-gold/10 p-3 text-xs leading-5 text-gold">
            已生成过一张聊天内林舟头像测试图，但图片工具未提供可复制到工作区的PNG路径，因此未登记为已落盘资产。
          </div>
          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-500">当前角色资产状态</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Info label="规划" value={currentAssets.length} />
              <Info label="落盘" value={currentAssets.filter((asset) => asset.status.includes("已落盘")).length} />
            </div>
          </div>
        </ProductionCard>
      </section>
    </div>
  );
}

function CharacterProfile({ character }: { character: HeroCharacter }) {
  return (
    <ProductionCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-jade/70">{character.englishName}</div>
          <h3 className="mt-1 text-xl font-semibold text-white">{character.name}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{character.brief}</p>
        </div>
        <span className="rounded-full border border-jade/30 bg-jade/10 px-3 py-1 text-xs text-jade">角色标准模型库</span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <Info label="年龄" value={character.age} />
        <Info label="身高" value={character.height} />
        <Info label="性格" value={character.personality} />
        <Info label="服装" value={character.costume} />
        <Info label="颜色" value={character.color} />
        <Info label="标志特征" value={character.feature} />
      </div>
    </ProductionCard>
  );
}

function CharacterAssetCard({ asset }: { asset: HeroCharacterAsset }) {
  const [message, setMessage] = useState("");
  const url = heroCharacterAssetUrl(asset);
  return (
    <ProductionCard className="overflow-hidden">
      <div className="flex aspect-video items-center justify-center border-b border-white/10 bg-white/[0.03] text-sm text-slate-500">
        {url ? <img src={url} alt={`${asset.character} ${asset.variant}`} className="h-full w-full object-cover" /> : <><Image size={18} className="mr-2 text-slate-600" /> PNG待生成</>}
      </div>
      <div className="p-4">
        <div className="font-mono text-[10px] text-jade">{asset.assetId}</div>
        <h4 className="mt-1 text-sm font-semibold text-white">{asset.character} / {asset.variant}</h4>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Info label="Version" value={asset.version} />
          <Info label="状态" value={asset.status} />
        </div>
        <textarea className="mt-3 min-h-36 w-full resize-y rounded border border-white/10 bg-black/25 p-3 font-mono text-xs leading-5 text-slate-300 outline-none" value={asset.prompt} readOnly />
        <button className="btn mt-3 h-9 w-full" onClick={() => { void navigator.clipboard?.writeText(asset.prompt); setMessage("Prompt已复制，可用于GPT Image2生成。"); }}><Copy size={14} /> 复制GPT Image2 Prompt</button>
        {message && <div className="mt-2 text-xs text-jade">{message}</div>}
      </div>
    </ProductionCard>
  );
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
    <div className="rounded border border-white/10 bg-black/20 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 line-clamp-3 text-xs text-slate-300">{value}</div>
    </div>
  );
}
