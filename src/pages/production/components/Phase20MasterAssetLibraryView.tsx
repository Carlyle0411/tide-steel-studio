import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CheckCircle2, Copy, Database, Film, Image, Layers, Pencil, RotateCcw, Save, Search, Trash2, Upload } from "lucide-react";
import {
  getMasterAssetManifest,
  getMasterAssets,
  getMasterCategories,
  getMasterLibraryStats,
  type MasterAsset
} from "../../../mcp/masterAssetLibrary/MasterAssetLibraryData";
import {
  buildAssetImagePrompt,
  buildAssetPromptDetails,
  getAssetImageStatusFromVersions,
  getPromptStatus,
  normalizeChecklist,
  normalizePromptVersions,
  normalizeRating,
  type AssetRating,
  type ConsistencyChecklist,
  type ManualAssetStore,
  type ManualAssetVersion,
  type ManualImageStatus
} from "../../../mcp/manualAssetImport/ManualAssetImport";
import {
  addPromptVersion,
  approveVersion,
  deleteAssetVersion,
  deleteAssetVersions,
  deleteManyAssetVersions,
  importAssetFiles,
  loadAssetStore,
  markRegenerate,
  migrateCurrentBrowserAssetsToCloud,
  rejectVersion,
  setMasterVersion,
  subscribeAssetStore,
  updateChecklist,
  updateRating
} from "../../../mcp/cloudAssetSync/AssetStoreGateway";
import {
  CloudAssetAuthRequiredError,
  getCloudSession,
  isCloudAssetSyncEnabled,
  signInCloud,
  signOutCloud,
  signUpCloud,
  subscribeCloudAuth
} from "../../../mcp/cloudAssetSync/CloudAssetRepository";
import { ProductionCard } from "./ProductionShell";
import {
  applyAssetContentOverride,
  getAssetContentOverride,
  resetAssetContentOverride,
  saveAssetContentOverride,
  subscribeAssetContentOverrides,
  type AssetContentOverride
} from "../../../mcp/masterAssetLibrary/AssetContentOverrideStore";

const categoryIcons: Record<string, JSX.Element> = {
  人物: <Image size={17} />,
  机甲: <Box size={17} />,
  怪兽: <Layers size={17} />,
  场景: <Film size={17} />,
  道具: <Database size={17} />
};

const imageStatusLabel: Record<ManualImageStatus, string> = {
  EMPTY: "EMPTY",
  DRAFT: "Draft",
  REVIEW: "Review",
  APPROVED: "APPROVED",
  MASTER_REFERENCE: "MASTER REFERENCE",
  REJECTED: "Rejected"
};

type Props = {
  initialCategory?: string;
};

export function Phase20MasterAssetLibraryView({ initialCategory = "全部" }: Props) {
  const manifest = getMasterAssetManifest();
  const stats = getMasterLibraryStats();
  const categories = getMasterCategories();
  const [contentRevision, setContentRevision] = useState(0);
  const allAssets = useMemo(() => getMasterAssets().map(applyAssetContentOverride), [contentRevision]);
  const [assetStore, setAssetStore] = useState<ManualAssetStore>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [selected, setSelected] = useState<MasterAsset | null>(null);
  const [pageMessage, setPageMessage] = useState("");

  useEffect(() => setCategory(initialCategory), [initialCategory]);

  useEffect(() => subscribeAssetContentOverrides(() => setContentRevision((value) => value + 1)), []);

  useEffect(() => {
    if (!selected) return;
    const refreshed = allAssets.find((asset) => asset.id === selected.id);
    if (refreshed && refreshed !== selected) setSelected(refreshed);
  }, [allAssets, selected]);

  useEffect(() => {
    let alive = true;
    async function reload() {
      const store = await loadAssetStore();
      if (alive) setAssetStore(store);
    }
    void reload();
    const unsubscribe = subscribeAssetStore(() => void reload());
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const assets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allAssets.filter((asset) => {
      const categoryOk = category === "全部" || asset.category === category;
      const text = [asset.id, asset.name, asset.baseName, asset.category, asset.variant, asset.description, ...asset.tags].join(" ").toLowerCase();
      return categoryOk && (!q || text.includes(q));
    });
  }, [allAssets, category, query]);

  const current = selected && assets.some((asset) => asset.id === selected.id) ? selected : assets[0] ?? null;
  const uploadedCount = allAssets.filter((asset) => (assetStore[asset.id] ?? []).length > 0).length;
  const reviewCount = Object.values(assetStore).flat().filter((version) => version.status === "REVIEW").length;

  async function clearCurrentCategory() {
    const ids = assets.map((asset) => asset.id);
    const containsApproved = ids.some((assetId) => hasApprovedVersion(assetStore[assetId] ?? []));
    if (containsApproved && !confirmApprovedDelete("当前分类里包含已通过或 Master Reference 素材，确定要删除这些本地素材吗？")) return;
    await deleteManyAssetVersions(ids);
    setPageMessage(`已清空当前筛选「${category}」下的 ${ids.length} 个资产本地素材。`);
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="text-xs uppercase tracking-[0.24em] text-jade/70">Master Asset Library</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">电影母资产库</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{manifest.purpose}</p>
        <div className="mt-3 rounded-md border border-jade/20 bg-jade/10 px-3 py-2 text-sm leading-6 text-jade">
          云端工作流：复制核心 Prompt，在 ChatGPT / GPT Image 出图后，将 PNG / JPG / WEBP / MP4 / WEBM 上传到个人云端资产库。只有登录自己的云端账户才能查看、审核、替换或删除资产。
        </div>
        <CloudAssetAccess />
      </header>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="资产分类" value={stats.categories} />
        <Metric label="母资产" value={stats.masterAssets} />
        <Metric label="Prompt状态" value="READY" />
        <Metric label="已上传素材" value={uploadedCount} />
        <Metric label="待审核" value={reviewCount} />
        <Metric label="当前筛选" value={category} />
      </div>

      <ProductionCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-72 flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3">
            <Search size={16} className="text-jade" />
            <input
              className="h-10 w-full bg-transparent text-sm outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索角色、机甲、怪兽、场景、道具、Prompt、标签..."
            />
          </div>
          <button className={`btn h-10 ${category === "全部" ? "border-jade text-jade" : ""}`} onClick={() => setCategory("全部")}>
            全部
          </button>
          {categories.map((item) => (
            <button key={item.id} className={`btn h-10 ${category === item.name ? "border-jade text-jade" : ""}`} onClick={() => setCategory(item.name)}>
              {item.name}
            </button>
          ))}
          <button
            className={`btn h-10 ${query === "90秒预告片" ? "border-gold bg-gold/10 text-gold" : "border-gold/40 text-gold"}`}
            onClick={() => {
              setCategory("全部");
              setQuery("90秒预告片");
              setSelected(null);
            }}
          >
            90秒预告优先资产
          </button>
          <button className="btn h-10 text-red-300" onClick={() => void clearCurrentCategory()}>
            清空当前分类素材
          </button>
        </div>
        {pageMessage && <div className="mt-3 rounded border border-jade/30 bg-jade/10 p-2 text-xs text-jade">{pageMessage}</div>}
      </ProductionCard>

      <ProductionQueue assets={assets} assetStore={assetStore} onSelect={setSelected} />

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_600px]">
        <div className="order-2 space-y-4 2xl:order-1">
          <ProductionCard className="overflow-hidden">
            <div className="border-b border-white/10 p-4">
              <h3 className="text-base font-semibold text-white">资产分类</h3>
              <p className="mt-1 text-xs text-slate-500">所有分类都进入同一套真实工作流：复制 Prompt、上传图片、保存 Version、设为 Master。</p>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((item) => (
                <button key={item.id} className="rounded-md border border-white/10 bg-black/20 p-4 text-left hover:border-jade/50" onClick={() => setCategory(item.name)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">{categoryIcons[item.name] ?? <Database size={17} />} {item.name}</div>
                    <span className="font-mono text-[10px] text-jade">{item.prefix}</span>
                  </div>
                  <div className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{item.variants.join(" / ")}</div>
                </button>
              ))}
            </div>
          </ProductionCard>

          <ProductionCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <h3 className="text-base font-semibold text-white">资产清单</h3>
                <p className="mt-1 text-xs text-slate-500">当前筛选：{category} / {assets.length} 项</p>
              </div>
              <span className="rounded-full border border-jade/30 bg-jade/10 px-3 py-1 text-xs text-jade">Prompt Ready</span>
            </div>
            <div className="grid max-h-[720px] gap-3 overflow-y-auto p-4 md:grid-cols-2">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  selected={current?.id === asset.id}
                  versions={assetStore[asset.id] ?? []}
                  onSelect={() => setSelected(asset)}
                />
              ))}
            </div>
          </ProductionCard>
        </div>

        <div className="order-1 2xl:order-2">
          <MasterAssetDetail asset={current} versions={current ? assetStore[current.id] ?? [] : []} />
        </div>
      </section>
    </div>
  );
}

function CloudAssetAccess() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isCloudAssetSyncEnabled()) return;
    let active = true;
    const refresh = async () => {
      const session = await getCloudSession();
      if (active) setAccount(session?.user.email ?? "");
    };
    void refresh();
    return subscribeCloudAuth(() => void refresh());
  }, []);

  if (!isCloudAssetSyncEnabled()) {
    return <div className="mt-3 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">云端资产库尚未配置。请设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_PUBLISHABLE_KEY。</div>;
  }

  async function run(action: "signin" | "signup" | "signout" | "migrate") {
    setBusy(true);
    try {
      if (action === "signin") {
        await signInCloud(email.trim(), password);
        setMessage("云端资产库已登录。");
      }
      if (action === "signup") {
        const result = await signUpCloud(email.trim(), password);
        setMessage(result.session ? "账号已创建并登录。" : "账号已创建，请到邮箱确认后再登录。");
      }
      if (action === "signout") {
        await signOutCloud();
        setMessage("已退出云端资产库。");
      }
      if (action === "migrate") {
        const count = await migrateCurrentBrowserAssetsToCloud();
        setMessage(count ? `已迁移 ${count} 个本机素材版本到云端。` : "没有可迁移的本机素材，或这些资产已存在于云端。");
      }
    } catch (error) {
      setMessage(`操作失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setBusy(false);
    }
  }

  if (account) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-jade/30 bg-black/20 px-3 py-2 text-sm">
        <span className="text-jade">云端已登录：{account}</span>
        <button className="btn h-8 text-xs" disabled={busy} onClick={() => void run("migrate")}>迁移本机素材到云端</button>
        <button className="btn h-8 text-xs text-slate-400" disabled={busy} onClick={() => void run("signout")}>退出登录</button>
        {message && <span className="text-xs text-slate-400">{message}</span>}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-black/20 p-3">
      <span className="mr-1 text-sm text-slate-300">登录个人云端资产库</span>
      <input className="h-9 min-w-48 rounded border border-white/10 bg-black/30 px-3 text-xs outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="邮箱" />
      <input className="h-9 min-w-40 rounded border border-white/10 bg-black/30 px-3 text-xs outline-none" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码（至少 6 位）" />
      <button className="btn h-9 text-xs" disabled={busy || !email || password.length < 6} onClick={() => void run("signin")}>登录</button>
      <button className="btn h-9 text-xs border-jade text-jade" disabled={busy || !email || password.length < 6} onClick={() => void run("signup")}>创建账号</button>
      {message && <span className="basis-full text-xs text-slate-400">{message}</span>}
    </div>
  );
}

function AssetCard({ asset, selected, versions, onSelect }: { asset: MasterAsset; selected: boolean; versions: ManualAssetVersion[]; onSelect: () => void }) {
  const imageStatus = getAssetImageStatusFromVersions(versions);
  const master = versions.find((version) => version.status === "MASTER_REFERENCE" || String(version.status) === "MASTER") ?? versions[versions.length - 1];

  return (
    <button className={`rounded-md border p-4 text-left transition ${selected ? "border-jade bg-jade/10" : "border-white/10 bg-black/20 hover:border-jade/40"}`} onClick={onSelect}>
      <div className="flex gap-3">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded border border-white/10 bg-white/[0.03]">
          {master ? <MediaPreview version={master} className="h-full w-full object-cover" /> : <Image size={20} className="text-slate-600" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] text-jade">{asset.id}</div>
          <div className="mt-1 truncate text-sm font-semibold text-white">{asset.name}</div>
          <div className="mt-1 truncate text-[11px] text-slate-500">当前变体：{asset.variant}</div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
            <StatusBox label="Prompt" value={getPromptStatus(asset)} tone="jade" />
            <StatusBox label="图片" value={imageStatusLabel[imageStatus]} tone={imageStatus === "EMPTY" ? "slate" : "gold"} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {asset.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">{tag}</span>)}
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{asset.description}</p>
    </button>
  );
}

function MasterAssetDetail({ asset, versions }: { asset: MasterAsset | null; versions: ManualAssetVersion[] }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AssetContentOverride>({});

  useEffect(() => {
    if (!asset) return;
    const details = buildAssetPromptDetails(asset);
    const override = getAssetContentOverride(asset.id);
    setDraft({
      name: override.name ?? asset.name,
      variant: override.variant ?? asset.variant,
      description: override.description ?? asset.description,
      identityLock: override.identityLock ?? details.identityLock,
      assetRequirement: override.assetRequirement ?? details.assetRequirement,
      composition: override.composition ?? details.composition,
      cameraRule: override.cameraRule ?? details.cameraRule,
      materialRule: override.materialRule ?? details.materialRule,
      backgroundRule: override.backgroundRule ?? details.backgroundRule,
      negativePrompt: override.negativePrompt ?? details.negativePrompt,
      usage: override.usage ?? details.usage
    });
    setEditing(false);
  }, [asset?.id]);

  if (!asset) return null;

  const prompt = buildAssetImagePrompt(asset);
  const promptDetails = buildAssetPromptDetails(asset);
  const imageStatus = getAssetImageStatusFromVersions(versions);
  const master = versions.find((version) => version.status === "MASTER_REFERENCE" || String(version.status) === "MASTER") ?? versions[versions.length - 1];
  const activeVersion = master ?? versions[0];

  function updateDraft(key: keyof AssetContentOverride, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateTitle(value: string) {
    const variant = variantFromTitle(value, asset.baseName);
    setDraft((current) => ({ ...current, name: value, ...(variant ? { variant } : {}) }));
  }

  function updateVariant(value: string) {
    setDraft((current) => ({
      ...current,
      variant: value,
      name: `${asset.baseName} / ${value.trim() || asset.variant}`
    }));
  }

  function saveContent() {
    const normalizedVariant = variantFromTitle(draft.name ?? "", asset.baseName) || draft.variant?.trim() || asset.variant;
    const normalized = {
      ...draft,
      variant: normalizedVariant,
      name: `${asset.baseName} / ${normalizedVariant}`
    };
    setDraft(normalized);
    saveAssetContentOverride(asset.id, normalized);
    setEditing(false);
    setMessage("资产名称、说明和Prompt字段已保存，卡片、搜索、完整Prompt与复制内容已同步更新。");
  }

  function restoreContent() {
    if (!window.confirm("确定恢复该资产的项目默认标题、说明和Prompt吗？上传图片及Version不会被删除。")) return;
    resetAssetContentOverride(asset.id);
    setEditing(false);
    setMessage("已恢复项目默认内容，上传素材未改变。");
  }

  async function handleFiles(files: FileList | File[]) {
    try {
      const imported = await importAssetFiles(asset, files);
      setMessage(imported.length > 0 ? `已上传 ${imported.length} 个素材版本到云端，其他设备登录后可见。` : "没有可导入的 PNG / JPG / WEBP / MP4 / WEBM / MOV 素材。");
    } catch (error) {
      setMessage(error instanceof CloudAssetAuthRequiredError ? error.message : `上传失败：${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async function clearCurrentAsset() {
    if (hasApprovedVersion(versions) && !confirmApprovedDelete("当前资产包含已通过或 Master Reference 素材，确定要删除本资产全部素材吗？")) return;
    await deleteAssetVersions(asset.id);
    setMessage("当前资产的所有本地素材已删除，可以重新导入。");
  }

  async function replaceCurrentAsset() {
    if (hasApprovedVersion(versions) && !confirmApprovedDelete("当前资产包含已通过或 Master Reference 素材，替换会先删除现有素材。确定继续吗？")) return;
    await deleteAssetVersions(asset.id);
    setMessage("当前资产已清空，请选择新的图片或视频导入。");
    inputRef.current?.click();
  }

  async function copyPrompt() {
    const ok = await copyTextToClipboard(prompt);
    setMessage(ok ? "Prompt 已真实复制到剪贴板。" : "复制失败：当前浏览器阻止了剪贴板写入，请手动选中文本复制。");
  }

  return (
    <ProductionCard className="sticky top-4 overflow-hidden">
      <div className="border-b border-white/10 p-4">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Asset Workbench</div>
            {editing ? (
              <input className="mt-2 h-10 w-full rounded border border-jade/40 bg-black/30 px-3 text-base font-semibold text-white outline-none" value={draft.name ?? ""} onChange={(event) => updateTitle(event.target.value)} />
            ) : <h3 className="mt-2 text-lg font-semibold text-white">{asset.name}</h3>}
            <p className="mt-1 text-xs text-slate-500">{asset.id} / {asset.category} / {asset.variant}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <button className="btn h-10 border-jade text-jade" onClick={saveContent}><Save size={15} /> 保存内容</button>
            ) : (
              <button className="btn h-10" onClick={() => setEditing(true)}><Pencil size={15} /> 编辑内容</button>
            )}
            <button className="btn h-10" onClick={restoreContent}><RotateCcw size={15} /> 恢复默认</button>
            <button className="btn h-10 border-jade text-jade" onClick={copyPrompt}><Copy size={15} /> 一键复制 Prompt</button>
            <button className="btn h-10" onClick={() => void replaceCurrentAsset()}><Upload size={15} /> 替换素材</button>
            <button className="btn h-10 text-red-300" onClick={() => void clearCurrentAsset()}><Trash2 size={15} /> 删除本资产素材</button>
          </div>
        </div>
      </div>

      <div className="grid border-b border-white/10 xl:grid-cols-[180px_minmax(0,1fr)]">
        <div className="border-b border-white/10 p-4 xl:border-b-0 xl:border-r">
          <div className="grid gap-2">
            <Info label="Asset ID" value={asset.id} />
            <Info label="分类" value={asset.category} />
            <Info label="资产类型" value={asset.variant} />
            <Info label="Version" value={asset.version} />
            <Info label="Prompt状态" value={getPromptStatus(asset)} />
            <Info label="图片状态" value={imageStatus} />
          </div>
        </div>

        <div className="p-4">
          <div
            className="flex aspect-video items-center justify-center overflow-hidden rounded-md border border-dashed border-white/15 bg-white/[0.03]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void handleFiles(event.dataTransfer.files);
            }}
          >
            {master ? (
              <MediaPreview version={master} className="h-full w-full object-cover" controls />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto text-jade" size={28} />
                <div className="mt-3 text-sm text-slate-300">拖拽图片或视频到这里</div>
                <div className="mt-1 text-xs text-slate-500">支持 PNG / JPG / WEBP / MP4 / WEBM / MOV。上传后自动保存到网页本地数据库。</div>
              </div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn h-9" onClick={() => inputRef.current?.click()}><Upload size={14} /> 上传素材</button>
            <button className="btn h-9" onClick={copyPrompt}><Copy size={14} /> 复制 Prompt</button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) void handleFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">核心 GPT IMAGE Prompt</div>
            <span className="rounded-full border border-jade/30 bg-jade/10 px-2 py-0.5 text-[11px] text-jade">READY</span>
          </div>
          <div className="mb-3 rounded border border-jade/20 bg-jade/5 px-3 py-2 text-xs leading-5 text-slate-400">
            以下分项与复制内容完全一致。复制完整 Prompt 后，连同对应 Reference 图片一起发送给 GPT Image。
          </div>
          {editing && (
            <div className="mb-3 grid gap-3 rounded border border-jade/25 bg-jade/[0.04] p-3 md:grid-cols-2">
              <EditablePromptField label="资产变体" value={draft.variant ?? ""} onChange={updateVariant} />
              <EditablePromptField label="资产说明" value={draft.description ?? ""} onChange={(value) => updateDraft("description", value)} />
            </div>
          )}
          <div className="mb-3 grid gap-2 md:grid-cols-2">
            <PromptInfo label="固定身份锁定" value={editing ? draft.identityLock ?? "" : promptDetails.identityLock} editing={editing} onChange={(value) => updateDraft("identityLock", value)} />
            <PromptInfo label="资产类型要求" value={editing ? draft.assetRequirement ?? "" : promptDetails.assetRequirement} editing={editing} onChange={(value) => updateDraft("assetRequirement", value)} />
            <PromptInfo label="构图要求" value={editing ? draft.composition ?? "" : promptDetails.composition} editing={editing} onChange={(value) => updateDraft("composition", value)} />
            <PromptInfo label="摄影要求" value={editing ? draft.cameraRule ?? "" : promptDetails.cameraRule} editing={editing} onChange={(value) => updateDraft("cameraRule", value)} />
            <PromptInfo label="材质要求" value={editing ? draft.materialRule ?? "" : promptDetails.materialRule} editing={editing} onChange={(value) => updateDraft("materialRule", value)} />
            <PromptInfo label="背景要求" value={editing ? draft.backgroundRule ?? "" : promptDetails.backgroundRule} editing={editing} onChange={(value) => updateDraft("backgroundRule", value)} />
            <PromptInfo label="Negative Prompt" value={editing ? draft.negativePrompt ?? "" : promptDetails.negativePrompt} editing={editing} onChange={(value) => updateDraft("negativePrompt", value)} />
            <PromptInfo label="用途说明" value={editing ? draft.usage ?? "" : promptDetails.usage} editing={editing} onChange={(value) => updateDraft("usage", value)} />
          </div>
          <textarea className="min-h-56 w-full resize-y rounded border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-200 outline-none" value={prompt} readOnly />
        </div>
        <VersionPanel asset={asset} versions={versions} onMessage={setMessage} />
      </div>
      {activeVersion && <ReviewPanel asset={asset} version={activeVersion} prompt={prompt} onMessage={setMessage} />}
      {message && <div className="mx-4 mb-4 rounded border border-jade/30 bg-jade/10 p-2 text-xs text-jade">{message}</div>}
    </ProductionCard>
  );
}

function ProductionQueue({ assets, assetStore, onSelect }: { assets: MasterAsset[]; assetStore: ManualAssetStore; onSelect: (asset: MasterAsset) => void }) {
  const queue = assets.filter((asset) => !assetStore[asset.id]?.some((version) => version.status === "MASTER_REFERENCE")).slice(0, 8);
  return (
    <ProductionCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <h3 className="text-base font-semibold text-white">资产生产队列</h3>
          <p className="mt-1 text-xs text-slate-500">今天优先处理这些还没有 Master Reference 的资产。Prompt 已准备好，可逐个复制出图。</p>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">{queue.length} 待生产</span>
      </div>
      <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-4">
        {queue.map((asset) => (
          <button key={asset.id} className="rounded border border-white/10 bg-black/20 p-3 text-left hover:border-jade/40" onClick={() => onSelect(asset)}>
            <div className="font-mono text-[10px] text-jade">{asset.id}</div>
            <div className="mt-1 truncate text-sm font-semibold text-white">{asset.name}</div>
            <div className="mt-2 text-xs text-slate-500">状态：Prompt Ready</div>
          </button>
        ))}
      </div>
    </ProductionCard>
  );
}

function ReviewPanel({ asset, version, prompt, onMessage }: { asset: MasterAsset; version: ManualAssetVersion; prompt: string; onMessage: (message: string) => void }) {
  const checklist = normalizeChecklist(version);
  const rating = normalizeRating(version);
  const promptVersions = normalizePromptVersions(version);
  const [reason, setReason] = useState("");

  async function updateCheck(key: keyof ConsistencyChecklist, value: boolean) {
    await updateChecklist(asset.id, version.versionId, { ...checklist, [key]: value });
    onMessage("一致性检查已保存。");
  }

  async function updateScore(key: keyof AssetRating, value: number) {
    await updateRating(asset.id, version.versionId, { ...rating, [key]: value });
    onMessage("评分已保存。");
  }

  const average = Math.round(((rating.consistency + rating.quality + rating.cinematic + rating.reusable) / 20) * 100);

  return (
    <div className="border-t border-white/10 p-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded border border-white/10 bg-black/20 p-3">
          <h4 className="text-sm font-semibold text-white">母资产审核流程</h4>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button className="btn h-9" onClick={async () => { await approveVersion(asset.id, version.versionId); await setMasterVersion(asset.id, version.versionId); onMessage(`${version.versionId} 已通过并设为 MASTER REFERENCE。`); }}>通过</button>
            <button className="btn h-9" onClick={async () => { await rejectVersion(asset.id, version.versionId); onMessage(`${version.versionId} 已退回。`); }}>退回</button>
            <button className="btn h-9" onClick={async () => { await markRegenerate(asset.id, version.versionId); await copyTextToClipboard(prompt); onMessage(`${version.versionId} 已标记为重新生成，Prompt 已复制。`); }}>重新生成</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">只有 MASTER REFERENCE 才允许进入后续 Storyboard 引用。</p>
        </div>

        <div className="rounded border border-white/10 bg-black/20 p-3">
          <h4 className="text-sm font-semibold text-white">Consistency Checklist</h4>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
            {[
              ["face", "脸型一致"],
              ["hair", "发型一致"],
              ["age", "年龄一致"],
              ["costume", "服装一致"],
              ["world", "世界观一致"]
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded border border-white/10 bg-black/20 p-2">
                <input type="checkbox" checked={checklist[key as keyof ConsistencyChecklist]} onChange={(event) => void updateCheck(key as keyof ConsistencyChecklist, event.target.checked)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded border border-white/10 bg-black/20 p-3">
          <h4 className="text-sm font-semibold text-white">素材评分</h4>
          <div className="mt-3 space-y-2">
            {[
              ["consistency", "一致性"],
              ["quality", "画质"],
              ["cinematic", "电影感"],
              ["reusable", "可复用性"]
            ].map(([key, label]) => (
              <RatingRow key={key} label={label} value={rating[key as keyof AssetRating]} onChange={(value) => void updateScore(key as keyof AssetRating, value)} />
            ))}
          </div>
          <div className="mt-3 text-xs text-jade">综合评分：{average}%</div>
        </div>

        <div className="rounded border border-white/10 bg-black/20 p-3">
          <h4 className="text-sm font-semibold text-white">Prompt 版本管理</h4>
          <div className="mt-3 max-h-32 space-y-2 overflow-y-auto">
            {promptVersions.map((item) => (
              <div key={item.versionId} className="rounded border border-white/10 bg-black/20 p-2 text-xs text-slate-400">
                <div className="font-mono text-jade">{item.versionId}</div>
                <div className="mt-1">{item.reason}</div>
              </div>
            ))}
          </div>
          <input className="mt-3 h-9 w-full rounded border border-white/10 bg-black/25 px-3 text-xs outline-none" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="修改原因，例如：增加 identity lock" />
          <button className="btn mt-2 h-9 w-full" onClick={async () => { await addPromptVersion(asset.id, version.versionId, prompt, reason); setReason(""); onMessage("Prompt 新版本已保存。"); }}>保存 Prompt 新版本</button>
        </div>
      </div>
    </div>
  );
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
      <span>{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button key={score} className={`h-6 w-6 rounded border ${score <= value ? "border-gold bg-gold/20 text-gold" : "border-white/10 text-slate-600"}`} onClick={() => onChange(score)}>★</button>
        ))}
      </div>
    </div>
  );
}

function VersionPanel({ asset, versions, onMessage }: { asset: MasterAsset; versions: ManualAssetVersion[]; onMessage: (message: string) => void }) {
  if (versions.length === 0) {
    return (
      <div className="rounded-md border border-white/10 bg-black/20 p-3">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Version</div>
        <p className="mt-3 text-sm leading-6 text-slate-500">暂无上传版本。上传图片或视频后会创建 V001、V002，并保存 metadata。</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Version</div>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {versions.map((version) => (
          <div key={version.versionId} className="rounded-md border border-white/10 bg-black/20 p-2">
            <div className="flex items-center gap-2">
              <MediaPreview version={version} className="h-12 w-16 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs text-jade">{version.versionId}</div>
                <div className="truncate text-[11px] text-slate-500">{version.fileName}</div>
              </div>
              <span className="text-[10px] text-gold">{version.status}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              <button
                className="btn h-8 text-[11px]"
                onClick={async () => {
                  await approveVersion(asset.id, version.versionId);
                  onMessage(`${version.versionId} 已标记为通过。`);
                }}
              >
                <CheckCircle2 size={13} /> 通过
              </button>
              <button
                className="btn h-8 text-[11px]"
                onClick={async () => {
                  await setMasterVersion(asset.id, version.versionId);
                  onMessage(`${version.versionId} 已设为 Master。`);
                }}
              >
                Set Master
              </button>
              <button
                className="btn h-8 text-[11px] text-red-300"
                onClick={async () => {
                  if (isApprovedVersion(version) && !confirmApprovedDelete(`${version.versionId} 是已通过或 Master Reference 素材，确定删除吗？`)) return;
                  await deleteAssetVersion(asset.id, version.versionId);
                  onMessage(`${version.versionId} 已从本地资产库删除。`);
                }}
              >
                <Trash2 size={13} /> 删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaPreview({ version, className, controls = false }: { version: ManualAssetVersion; className?: string; controls?: boolean }) {
  if (version.mediaType === "video") {
    return <video src={version.dataUrl} className={className} controls={controls} muted={!controls} playsInline />;
  }
  return <img src={version.dataUrl} alt={version.fileName} className={className} />;
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
      <div className="mt-1 line-clamp-2 text-xs text-slate-300">{value}</div>
    </div>
  );
}

function PromptInfo({ label, value, editing = false, onChange }: { label: string; value: string; editing?: boolean; onChange?: (value: string) => void }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      {editing ? (
        <textarea className="mt-2 min-h-28 w-full resize-y rounded border border-white/10 bg-black/30 p-2 text-xs leading-5 text-slate-200 outline-none" value={value} onChange={(event) => onChange?.(event.target.value)} />
      ) : <div className="mt-2 text-xs leading-5 text-slate-300">{value}</div>}
    </div>
  );
}

function EditablePromptField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <textarea className="mt-2 min-h-20 w-full resize-y rounded border border-white/10 bg-black/30 p-2 text-xs leading-5 text-slate-200 outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function StatusBox({ label, value, tone }: { label: string; value: string; tone: "jade" | "gold" | "slate" }) {
  const toneClass = tone === "jade" ? "text-jade" : tone === "gold" ? "text-gold" : "text-slate-500";
  return (
    <div className="rounded border border-white/10 bg-black/25 px-2 py-1">
      <div className="text-[10px] text-slate-600">{label}</div>
      <div className={`font-mono text-[10px] ${toneClass}`}>{value}</div>
    </div>
  );
}

async function copyTextToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to the legacy selection method below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function isApprovedVersion(version: ManualAssetVersion) {
  return version.status === "APPROVED" || version.status === "MASTER_REFERENCE" || String(version.status) === "MASTER";
}

function hasApprovedVersion(versions: ManualAssetVersion[]) {
  return versions.some(isApprovedVersion);
}

function confirmApprovedDelete(message: string) {
  return window.confirm(`${message}\n\n这个操作只会删除网页本地资产库中的上传版本，不会删除你电脑里的原始图片文件。`);
}

function variantFromTitle(title: string, baseName: string) {
  const trimmed = title.trim();
  if (!trimmed) return "";
  const slashIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("／"));
  if (slashIndex >= 0) return trimmed.slice(slashIndex + 1).trim();
  if (trimmed.startsWith(baseName)) return trimmed.slice(baseName.length).replace(/^\s*[-—:：]\s*/, "").trim();
  return trimmed;
}
