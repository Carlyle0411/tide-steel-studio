import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const projectDir = path.join(root, "projects", "tide-steel-soul", "world-asset-library");
const worldRoot = path.join(root, "assets", "world");
const now = "2026-07-10T00:00:00.000+08:00";

const style = "16:9, cinematic realistic sci-fi, Hollywood production design, high detail, low saturation, real materials, 2042 Hangzhou Bay ocean-defense future, not cyberpunk, no anime, no game render, no text, no logo, no watermark";
const negative = "placeholder, mock image, anime, cartoon, game render, cyberpunk neon city, plastic sci-fi, over-saturated, fantasy portal, magic glow, text, logo, watermark";

const groups = [
  ["HANGZHOU_BAY", "hangzhou_bay_future_city", "杭州湾未来城市", "2042杭州湾未来城市，海洋防线、未来港口、工业城市边缘，海洋比城市更大。", ["白天", "黄昏", "夜晚", "暴雨", "海雾", "高空", "街道", "港口", "防线", "电影海报"]],
  ["DEEP_BLUE_BASE", "deep_blue_base", "深蓝基地", "运行三十年的湿冷海洋防御基地，巨大工程结构、金属、玻璃、水汽、盐雾腐蚀。", ["外观", "大厅", "指挥中心", "机库", "维修区", "驾驶舱入口", "实验室", "通道", "警报状态", "夜景"]],
  ["TIDE_GATE_RIFT", "tide_gate_rift", "潮门裂口", "潮门不是传送门，是未知海洋生命系统与地球连接的位置，深海压力、冰川裂缝、生物组织感。", ["远景", "近景", "开启", "能量", "内部", "海底", "巨大尺度", "边缘组织", "低频波纹", "电影海报"]],
  ["UNDERSEA_RUINS", "undersea_ruins", "海底废墟", "海底旧文明遗迹，被深海压力、盐蚀和未知生态覆盖，非游戏副本。", ["远景", "近景", "入口", "大厅", "断裂结构", "旧文明符号", "深海光束", "沉积层", "巨大尺度", "电影海报"]],
  ["PROPS", "props", "道具", "潮汐钢魂标准电影道具，真实工业用途，服务角色动作和世界规则。", ["头盔01", "头盔02", "控制器01", "控制器02", "能源核心01", "能源核心02", "AI终端01", "AI终端02", "维修工具01", "维修工具02", "武器模块01", "武器模块02", "身份卡", "同步装置", "声呐模块", "浮标终端", "机械手套", "数据盒", "海水采样器", "应急灯"]],
  ["WEATHER", "weather", "天气库", "杭州湾海洋防线天气母资产，作为所有剧集气氛和可灵视频模板Reference。", ["暴雨01", "暴雨02", "暴雨03", "海雾01", "海雾02", "海雾03", "雷暴01", "雷暴02", "雷暴03", "夕阳01", "夕阳02", "夕阳03", "夜晚01", "夜晚02", "夜晚03", "黎明01", "黎明02", "黎明03", "低云", "潮湿空气"]],
  ["LIGHTING", "lighting", "灯光库", "潮汐钢魂电影灯光母资产，所有镜头必须遵守真实光源逻辑。", ["蓝色基地光01", "蓝色基地光02", "红色警报光01", "红色警报光02", "海洋反射光01", "海洋反射光02", "逆光01", "逆光02", "电影光影01", "电影光影02"]]
];

fs.mkdirSync(projectDir, { recursive: true });

const assets = [];
for (const [prefix, slug, name, description, variants] of groups) {
  const dir = path.join(worldRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  variants.forEach((variant, index) => {
    const version = `V${String(index + 1).padStart(3, "0")}`;
    const fileName = `${prefix}_${version}`;
    const assetId = `WORLD-${prefix}-${version}`;
    const prompt = [
      `Create a master world asset reference image for Tide Steel Soul.`,
      `Asset: ${name}. Variant: ${variant}.`,
      description,
      "This is a reusable standard world asset for 12 episodes, not a story screenshot.",
      style
    ].join("\n");
    const record = {
      assetId,
      category: name,
      slug,
      variant,
      version,
      status: "待图片落盘",
      imagePath: `assets/world/${slug}/${fileName}.png`,
      metadataPath: `assets/world/${slug}/${fileName}.json`,
      promptPath: `assets/world/${slug}/${fileName}_PROMPT.md`,
      referencePath: `assets/world/${slug}/${fileName}_REFERENCE.json`,
      prompt,
      negativePrompt: negative,
      tags: ["世界资产", name, variant, "母资产", "Reference"],
      consistencyLock: {
        description,
        cannotChange: ["2042杭州湾世界观", "工业真实感", "低饱和电影摄影", "海洋尺度", "非赛博朋克"]
      },
      createdAt: now,
      updatedAt: now
    };
    assets.push(record);
    fs.writeFileSync(path.join(dir, `${fileName}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(dir, `${fileName}_PROMPT.md`), `# ${assetId} ${name} ${variant}\n\n${prompt}\n\nNegative Prompt:\n${negative}\n`, "utf8");
    fs.writeFileSync(path.join(dir, `${fileName}_REFERENCE.json`), `${JSON.stringify({
      assetId,
      referenceStatus: "等待真实图片生成后锁定",
      cannotChange: record.consistencyLock.cannotChange,
      reuseRule: "后续关键帧、Storyboard、GPT Image2图片、可灵视频、海报、宣传片必须引用此Reference。"
    }, null, 2)}\n`, "utf8");
  });
}

writeProject("WORLD_ASSET_MANIFEST.json", {
  project: "潮汐钢魂",
  phase: "PHASE21C World Asset Library",
  generatedAt: now,
  rule: "建立2042杭州湾世界母资产。所有后续世界、场景、道具、天气、灯光镜头必须优先引用这里。",
  total: assets.length,
  landedImages: 0,
  generatedImages: 0,
  status: "等待真实图片逐项生成并落盘",
  assets
});

writeProject("WORLD_REFERENCE_RULES.json", {
  generatedAt: now,
  rules: [
    "禁止placeholder、mock和假PNG。",
    "杭州湾必须是2042海洋防线世界，不是赛博朋克城市。",
    "深蓝基地必须保留湿冷、金属、玻璃、水汽、盐雾腐蚀。",
    "潮门裂口不是传送门，不使用紫色能量门或魔法闪电。",
    "天气和灯光必须服务电影气氛与真实光源逻辑。",
    "未落盘、未审核图片不能成为长期Reference。"
  ]
});

console.log(`World asset library generated: ${assets.length} asset records.`);

function writeProject(name, data) {
  fs.writeFileSync(path.join(projectDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
