import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const projectRoot = path.join(root, "projects", "tide-steel-soul");
const outDir = path.join(projectRoot, "industrial-workflow");

function readJson(relativePath, fallback) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(name, value) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function now() {
  return "2026-07-10T00:00:00.000+08:00";
}

function statusCn(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("approved")) return "通过 Approved";
  if (normalized.includes("review")) return "审核 Review";
  if (normalized.includes("deprecated")) return "废弃 Deprecated";
  if (normalized.includes("generat") || normalized.includes("produc")) return "制作中 Producing";
  return "草稿 Draft";
}

function categoryCn(category) {
  return {
    characters: "角色",
    mechas: "机甲",
    creatures: "怪兽",
    environment: "场景",
    environments: "场景",
    props: "道具",
    keyframes: "关键帧",
    shots: "Shot",
    prompts: "Prompt",
    video: "视频片段",
    audio: "声音",
    subtitles: "字幕"
  }[category] || category;
}

function slugToCnName(slug) {
  const map = {
    linzhou: "林舟",
    xuran: "许燃",
    chenmu: "陈牧",
    tangxiaoman: "唐小满",
    lan: "AI澜",
    chiting01: "赤霆01",
    white_tide: "白潮",
    black_tide: "黑潮母体",
    hangzhou_bay: "杭州湾",
    deep_blue_base: "深蓝基地",
    cockpit: "驾驶舱",
    tide_gate: "潮门"
  };
  return map[slug] || slug.replace(/_/g, " ");
}

function makeAssetId(asset, index) {
  const category = String(asset.category || "asset").toUpperCase();
  const folder = String(asset.relativePath || "").split(/[\\/]/)[1] || String(asset.name || "asset");
  const prefixMap = {
    CHARACTERS: "CHAR",
    MECHAS: "MECHA",
    CREATURES: "CREATURE",
    ENVIRONMENT: "ENV",
    ENVIRONMENTS: "ENV",
    PROPS: "PROP"
  };
  const prefix = prefixMap[category] || "ASSET";
  return `${prefix}-${folder.replace(/[^a-z0-9]/gi, "").toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
}

function inferTags(asset) {
  const text = [asset.name, asset.prompt, asset.relativePath].join(" ").toLowerCase();
  const tags = new Set([categoryCn(asset.category), "本地图片"]);
  if (text.includes("lin zhou")) tags.add("林舟");
  if (text.includes("xu ran")) tags.add("许燃");
  if (text.includes("chiting") || text.includes("crt")) tags.add("赤霆01");
  if (text.includes("white tide")) tags.add("白潮");
  if (text.includes("cockpit")) tags.add("驾驶舱");
  if (text.includes("battle") || text.includes("damage")) tags.add("战斗");
  if (text.includes("portrait") || text.includes("emotion")) tags.add("情绪");
  if (text.includes("full body")) tags.add("全身");
  if (text.includes("pilot")) tags.add("驾驶服");
  return Array.from(tags);
}

const assetLibrary = readJson("projects/tide-steel-soul/assets/asset-library.json", { assets: [] });
const keyframeManifest = readJson("projects/tide-steel-soul/EP01/EP01_KEYFRAME_MANIFEST.json", { keyframes: [] });
const ep01AssetManifest = readJson("projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json", {
  characters: [],
  mechas: [],
  creatures: [],
  environment: []
});
const shotLibrary = readJson("projects/tide-steel-soul/asset-bible/SHOT_LIBRARY.json", { shots: [] });
const videoLibrary = readJson("projects/tide-steel-soul/asset-bible/VIDEO_CLIP_LIBRARY.json", { clips: [] });
const promptLibrary = readJson("projects/tide-steel-soul/asset-bible/KlingPrompt.json", { prompts: [] });
const audioTimeline = readJson("projects/tide-steel-soul/episodes/EP01/audio/AudioTimeline.json", { cues: [] });

const assets = assetLibrary.assets.map((asset, index) => {
  const id = makeAssetId(asset, index);
  const ownerSlug = String(asset.relativePath || "").split(/[\\/]/)[1] || "";
  const version = {
    id: `${id}-V001`,
    label: asset.version || "V001",
    note: "由本地真实图片导入，保留原始 Prompt 与文件路径。",
    updatedAt: asset.createdAt || now(),
    active: true
  };
  return {
    id,
    originalId: asset.id,
    name: asset.name,
    chineseName: slugToCnName(ownerSlug) || asset.name,
    type: categoryCn(asset.category),
    category: asset.category,
    project: "潮汐钢魂",
    episode: "EP01",
    shot: inferShotForAsset(asset, keyframeManifest.keyframes),
    path: `projects/tide-steel-soul/assets/${asset.relativePath}`,
    relativePath: asset.relativePath,
    prompt: asset.prompt,
    negativePrompt: "cartoon, anime, game render, plastic future, fake watermark, logo, subtitle",
    status: statusCn(asset.status),
    tags: inferTags(asset),
    favorite: index % 5 === 0,
    version: version.label,
    versions: [version],
    references: [],
    linkedCharacters: inferLinked(asset, ["linzhou", "xuran", "chenmu"]),
    linkedScenes: inferLinked(asset, ["deep_blue_base", "hangzhou_bay", "cockpit"]),
    linkedShots: [],
    usageCount: 0,
    createdAt: asset.createdAt || now(),
    updatedAt: asset.createdAt || now(),
    qualityScore: asset.qualityScore || 0,
    fileSize: asset.file_size || 0,
    actions: ["打开详情", "查看引用", "复制Prompt", "复制路径", "生成新Version", "加入收藏", "添加到Storyboard", "添加到Shot", "导出", "删除"]
  };
});

const shots = keyframeManifest.keyframes.map((shot, index) => {
  const required = shot.required_assets || [];
  const linkedAssets = assets.filter((asset) => required.some((key) => asset.relativePath?.toLowerCase().includes(key.toLowerCase()) || asset.prompt?.toLowerCase().includes(key.toLowerCase())));
  linkedAssets.forEach((asset) => {
    asset.linkedShots.push(shot.shot);
    asset.references.push({ type: "Shot", id: shot.shot, name: shot.title, episode: "EP01" });
    asset.usageCount += 1;
  });
  return {
    id: `SHOT-EP01-${String(index + 1).padStart(3, "0")}`,
    shotId: shot.shot,
    episode: "EP01",
    order: index + 1,
    name: shot.title,
    description: shot.purpose,
    type: index % 3 === 0 ? "远景" : index % 3 === 1 ? "中景" : "特写",
    camera: index % 4 === 0 ? "缓慢推镜" : index % 4 === 1 ? "固定镜头" : index % 4 === 2 ? "横移跟拍" : "低机位仰拍",
    lens: index % 4 === 0 ? "24mm" : index % 4 === 1 ? "35mm" : index % 4 === 2 ? "50mm" : "85mm",
    duration: index % 4 === 0 ? 8 : 5,
    status: statusCn(shot.status),
    tags: ["EP01", "Shot", index < 4 ? "建立恐惧" : index < 9 ? "人物进入" : index < 15 ? "战斗" : "未知"],
    characters: required.filter((item) => ["linzhou", "xuran", "chenmu"].includes(item)).map(slugToCnName),
    mechas: required.filter((item) => ["chiting01"].includes(item)).map(slugToCnName),
    creatures: required.filter((item) => ["white_tide", "black_tide_mother"].includes(item)).map(slugToCnName),
    scenes: required.filter((item) => ["hangzhou_bay", "deep_blue_base", "cockpit", "tide_gate"].includes(item)).map(slugToCnName),
    requiredAssets: required,
    linkedAssets: linkedAssets.map((asset) => asset.id),
    promptId: `PROMPT-EP01-${String(index + 1).padStart(3, "0")}`,
    videoPromptId: `KLING-EP01-${String(index + 1).padStart(3, "0")}`,
    review: linkedAssets.length ? "审核 Review" : "草稿 Draft",
    createdAt: now(),
    updatedAt: now()
  };
});

const characters = [
  ...ep01AssetManifest.characters.map((item, index) => entityRecord("CHAR", item, index, "角色")),
  { id: "CHAR-XURAN-001", name: "许燃", type: "角色", status: "草稿 Draft", tags: ["角色", "理性", "驾驶舱"], assets: [], shots: ["EP01_KF10"], notes: "待补齐角色 Reference 与驾驶舱表情资产。" },
  { id: "CHAR-CHENMU-001", name: "陈牧", type: "角色", status: "草稿 Draft", tags: ["角色", "指挥官", "经验"], assets: [], shots: ["EP01_KF04"], notes: "已有视觉参考图，待导入本地项目资产库。" }
];

const scenes = [
  ...ep01AssetManifest.environment.map((item, index) => entityRecord("SCENE", item, index, "场景")),
  { id: "SCENE-COCKPIT-001", name: "赤霆驾驶舱", type: "场景", status: "审核 Review", tags: ["场景", "驾驶舱", "蓝光"], assets: assets.filter((asset) => asset.relativePath?.includes("cockpit")).map((asset) => asset.id), shots: ["EP01_KF08", "EP01_KF09", "EP01_KF10"], notes: "赤霆启动与同步失败的核心空间。" }
];

const timeline = {
  id: "TIMELINE-EP01-001",
  episode: "EP01",
  title: "EP01 海面低频 Timeline",
  zoom: 1,
  duration: shots.reduce((sum, shot) => sum + shot.duration, 0),
  tracks: [
    track("视频", shots, "video"),
    track("图片", shots, "image"),
    track("对白", shots.slice(0, 6), "dialogue"),
    track("字幕", shots.slice(0, 8), "subtitle"),
    track("音乐", shots.slice(0, 4), "music"),
    track("音效", shots, "sfx")
  ]
};

const tags = [
  tag("主角", "#7ed6bd", "角色"),
  tag("配角", "#8fb3ff", "角色"),
  tag("主战", "#d64b4b", "机甲"),
  tag("辅助", "#6aa7d6", "机甲"),
  tag("城市", "#8f9aa8", "场景"),
  tag("海洋", "#3f8fb6", "场景"),
  tag("基地", "#617087", "场景"),
  tag("室内", "#9ca3af", "场景"),
  tag("战斗", "#d6b46a", "镜头"),
  tag("情绪", "#d68fb3", "镜头"),
  tag("转场", "#8b7ed6", "镜头"),
  tag("特写", "#7ed6bd", "镜头"),
  tag("远景", "#70a6ff", "镜头"),
  tag("已完成", "#7ed6bd", "视频"),
  tag("待制作", "#d6b46a", "视频"),
  tag("审核中", "#f59e0b", "视频")
];

const prompts = promptLibrary.prompts.slice(0, 60).map((prompt, index) => ({
  id: `PROMPT-LIB-${String(index + 1).padStart(3, "0")}`,
  type: "可灵视频 Prompt",
  name: prompt.name || prompt.id || `Prompt ${index + 1}`,
  prompt: prompt.prompt,
  negativePrompt: prompt.negative_prompt || "anime, cartoon, game render, fake motion, watermark",
  tags: ["Prompt", prompt.category || "视频", index % 2 ? "运镜" : "环境"],
  usageCount: index < 18 ? 1 : 0,
  linkedAssets: [],
  linkedShots: index < shots.length ? [shots[index].shotId] : [],
  favorite: index % 12 === 0,
  status: "草稿 Draft",
  version: "V001",
  updatedAt: now()
}));

const relationships = [
  ...assets.flatMap((asset) => asset.references.map((ref) => ({
    from: asset.id,
    fromName: asset.name,
    to: ref.id,
    toName: ref.name,
    relation: "被镜头引用",
    episode: ref.episode
  }))),
  ...shots.flatMap((shot) => shot.linkedAssets.map((assetId) => ({
    from: shot.shotId,
    fromName: shot.name,
    to: assetId,
    toName: assets.find((asset) => asset.id === assetId)?.name || assetId,
    relation: "使用素材",
    episode: "EP01"
  })))
];

const productionLog = [
  { id: "LOG-001", action: "导入图片", target: "本地 Asset Library", status: "完成", time: now(), detail: `已登记 ${assets.length} 张真实本地图片。` },
  { id: "LOG-002", action: "建立 Shot 索引", target: "EP01", status: "完成", time: now(), detail: `已登记 ${shots.length} 个镜头。` },
  { id: "LOG-003", action: "建立引用关系", target: "Asset Relationship", status: "完成", time: now(), detail: `已生成 ${relationships.length} 条引用关系。` }
];

writeJson("Asset.json", { schema: "Tide Steel Soul Industrial Asset", generatedAt: now(), assets });
writeJson("Shot.json", { schema: "Tide Steel Soul Industrial Shot", generatedAt: now(), shots });
writeJson("Character.json", { schema: "Tide Steel Soul Character", generatedAt: now(), characters });
writeJson("Scene.json", { schema: "Tide Steel Soul Scene", generatedAt: now(), scenes });
writeJson("Timeline.json", timeline);
writeJson("Tag.json", { schema: "Tide Steel Soul Tags", generatedAt: now(), tags });
writeJson("Prompt.json", { schema: "Tide Steel Soul Prompts", generatedAt: now(), prompts });
writeJson("Relationship.json", { schema: "Tide Steel Soul Asset Relationship", generatedAt: now(), relationships });
writeJson("ProductionLog.json", { schema: "Tide Steel Soul Production Log", generatedAt: now(), logs: productionLog, audio: audioTimeline });

console.log(`Industrial workflow generated: ${assets.length} assets, ${shots.length} shots, ${relationships.length} relationships.`);

function inferShotForAsset(asset, keyframes) {
  const text = [asset.name, asset.prompt, asset.relativePath].join(" ").toLowerCase();
  const hit = keyframes.find((shot) => (shot.required_assets || []).some((required) => text.includes(required.toLowerCase())));
  return hit?.shot || "";
}

function inferLinked(asset, slugs) {
  const text = [asset.name, asset.prompt, asset.relativePath].join(" ").toLowerCase();
  return slugs.filter((slug) => text.includes(slug.replace("_", " ")) || text.includes(slug)).map(slugToCnName);
}

function entityRecord(prefix, item, index, type) {
  const slug = String(item.id || item.name || `${type}-${index}`).replace(/[^a-z0-9]/gi, "").toUpperCase();
  return {
    id: `${prefix}-${slug}-${String(index + 1).padStart(3, "0")}`,
    originalId: item.id,
    name: item.name,
    type,
    status: item.generated?.length ? "审核 Review" : "草稿 Draft",
    tags: [type, item.name, item.generated?.length ? "已有资产" : "待制作"],
    assets: assets.filter((asset) => String(asset.relativePath).toLowerCase().includes(String(item.id || "").toLowerCase())).map((asset) => asset.id),
    shots: shots.filter((shot) => shot.requiredAssets?.includes(item.id)).map((shot) => shot.shotId),
    notes: `${item.name} 的制作资产包，来自 EP01 Asset Manifest。`
  };
}

function tag(name, color, group) {
  return { id: `TAG-${name}`, name, color, group, createdAt: now(), editable: true };
}

function track(name, shotList, type) {
  let cursor = 0;
  return {
    id: `TRACK-${type.toUpperCase()}`,
    name,
    type,
    locked: false,
    hidden: false,
    items: shotList.map((shot) => {
      const item = {
        id: `${type.toUpperCase()}-${shot.shotId}`,
        shot: shot.shotId,
        start: cursor,
        duration: shot.duration,
        label: shot.name,
        status: shot.status
      };
      cursor += shot.duration;
      return item;
    })
  };
}
