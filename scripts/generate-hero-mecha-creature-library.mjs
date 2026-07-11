import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const projectDir = path.join(root, "projects", "tide-steel-soul", "hero-mecha-creature-library");
const mechaRoot = path.join(root, "assets", "mecha");
const creatureRoot = path.join(root, "assets", "creature");
const now = "2026-07-10T00:00:00.000+08:00";

const style = "16:9, cinematic realistic sci-fi, Hollywood production design, high detail, real materials, low saturation, industrial ocean defense future, no anime, no cartoon, no game render, no text, no logo, no watermark";
const negative = "anime, cartoon, game render, toy robot, plastic surface, superhero pose, fantasy demon, normal whale, random redesign, over-saturated neon, text, logo, watermark, fake scale";

const mechas = [
  {
    key: "CRT001",
    slug: "chiting01",
    name: "赤霆01",
    countPrefix: "CHITING01",
    description: "20米级红黑工业机甲，暗红装甲，黑色机械骨架，蓝色能源核心，真实军事机械感，不是动漫机器人。",
    variants: ["正面设计", "背面设计", "侧面设计", "45度展示", "全身比例", "驾驶舱", "胸口反应炉", "右臂等离子链刃", "武器细节", "头部细节", "待机状态", "启动状态", "战斗姿态", "冲刺姿态", "海面站立", "暴雨环境", "夜景", "战损状态", "电影海报", "巨大城市尺度展示"]
  },
  {
    key: "XJ003",
    slug: "xuanjing03",
    name: "玄鲸03",
    countPrefix: "XUANJING03",
    description: "黑蓝远程系统机甲，海上部署结构，重型传感与远程武器平台，和赤霆01形成明确功能差异。",
    variants: ["整体", "正面", "侧面", "武器", "远程系统", "海上部署", "战斗", "夜景", "损伤", "海报"]
  },
  {
    key: "BY007",
    slug: "baiyuan07",
    name: "白鸢07",
    countPrefix: "BAIYUAN07",
    description: "白灰侦察型机甲，轻量、高机动、飞行侦察结构，非英雄化展示。",
    variants: ["侦察模式", "飞行模式", "正面", "侧面", "夜景", "城市", "海洋", "战斗", "损伤", "海报"]
  }
];

const creatures = [
  {
    key: "WHITE_TIDE",
    slug: "white_tide",
    name: "白潮",
    description: "远古深海生命，不是普通鲸鱼，白色生物甲壳，裂纹微光，巨大但脆弱，不是Boss怪兽。",
    variants: ["完整身体", "头部", "眼睛", "甲壳", "海面出现", "游泳", "攻击", "受伤", "暴雨", "夜晚", "巨大尺度", "城市对比", "电影海报", "海底", "低鸣"]
  },
  {
    key: "THORN_TIDE",
    slug: "thorn_tide",
    name: "刺潮",
    description: "潮门生态中的高压深海生命，尖刺结构来自压力环境，不是恶魔，不是普通怪兽。",
    variants: ["完整身体", "头部", "刺状甲壳", "海中游动", "扑击", "摆尾", "受伤", "暴雨夜景", "城市尺度", "电影海报"]
  },
  {
    key: "BLACK_TIDE_MOTHER",
    slug: "black_tide_mother",
    name: "黑潮母体",
    description: "上一轮文明错误遗留系统的生命化阴影，黑色深海组织，母体尺度，未知而克制，不是最终Boss式登场。",
    variants: ["完整轮廓", "眼部", "组织细节", "潮门内部", "深海尺度", "能量脉动", "受损状态", "低频黑潮", "巨大阴影", "电影海报"]
  }
];

fs.mkdirSync(projectDir, { recursive: true });

const assets = [];
for (const mecha of mechas) {
  const dir = path.join(mechaRoot, mecha.slug);
  fs.mkdirSync(dir, { recursive: true });
  mecha.variants.forEach((variant, index) => {
    const version = `V${String(index + 1).padStart(3, "0")}`;
    const asset = buildAsset({
      domain: "机甲",
      rootName: "mecha",
      rootDir: "assets/mecha",
      key: mecha.key,
      slug: mecha.slug,
      filePrefix: mecha.countPrefix,
      name: mecha.name,
      description: mecha.description,
      variant,
      version,
      prompt: [
        `Create a master mecha asset reference image for Tide Steel Soul.`,
        `Mecha: ${mecha.name}. Variant: ${variant}.`,
        mecha.description,
        `This is a reusable standard design asset for 12 episodes, not a story screenshot.`,
        style
      ].join("\n")
    });
    writeAssetFiles(dir, asset);
    assets.push(asset);
  });
}

for (const creature of creatures) {
  const dir = path.join(creatureRoot, creature.slug);
  fs.mkdirSync(dir, { recursive: true });
  creature.variants.forEach((variant, index) => {
    const version = `V${String(index + 1).padStart(3, "0")}`;
    const asset = buildAsset({
      domain: "怪兽",
      rootName: "creature",
      rootDir: "assets/creature",
      key: creature.key,
      slug: creature.slug,
      filePrefix: creature.key,
      name: creature.name,
      description: creature.description,
      variant,
      version,
      prompt: [
        `Create a master creature asset reference image for Tide Steel Soul.`,
        `Creature: ${creature.name}. Variant: ${variant}.`,
        creature.description,
        `This is a reusable biological design asset for 12 episodes, not a story screenshot.`,
        style
      ].join("\n")
    });
    writeAssetFiles(dir, asset);
    assets.push(asset);
  });
}

const manifest = {
  project: "潮汐钢魂",
  phase: "PHASE 21B Hero Mecha & Creature Asset Library",
  generatedAt: now,
  rule: "赤霆01、玄鲸03、白鸢07、白潮、刺潮、黑潮母体为世界观核心视觉。后续所有镜头、关键帧、视频和海报必须优先引用这里。",
  total: assets.length,
  landedImages: 0,
  generatedImages: 0,
  status: "等待真实图片逐项生成并落盘",
  assets
};

writeProject("MECHA_CREATURE_ASSET_MANIFEST.json", manifest);
writeProject("MECHA_CREATURE_REFERENCE_RULES.json", {
  generatedAt: now,
  rules: [
    "禁止placeholder、mock和假PNG。",
    "赤霆01必须保持红黑工业机甲、20米级、蓝色能源核心。",
    "玄鲸03必须保持黑蓝远程系统机甲定位。",
    "白鸢07必须保持白灰侦察/飞行结构。",
    "白潮不是普通鲸鱼，不是Boss，必须保持远古深海生命逻辑。",
    "刺潮和黑潮母体必须遵守潮门生态规则。",
    "未落盘、未审核图片不能成为长期Reference。"
  ]
});

console.log(`Hero mecha and creature library generated: ${assets.length} asset records.`);

function buildAsset(input) {
  const fileName = `${input.filePrefix}_${input.version}`;
  const assetId = `${input.domain === "机甲" ? "MECHA" : "CREATURE"}-${input.key}-${input.version}`;
  return {
    assetId,
    domain: input.domain,
    name: input.name,
    variant: input.variant,
    version: input.version,
    status: "待图片落盘",
    imagePath: `${input.rootDir}/${input.slug}/${fileName}.png`,
    metadataPath: `${input.rootDir}/${input.slug}/${fileName}.json`,
    promptPath: `${input.rootDir}/${input.slug}/${fileName}_PROMPT.md`,
    referencePath: `${input.rootDir}/${input.slug}/${fileName}_REFERENCE.json`,
    prompt: input.prompt,
    negativePrompt: negative,
    tags: [input.domain, input.name, input.variant, "母资产", "Reference"],
    consistencyLock: {
      description: input.description,
      cannotChange: input.domain === "机甲" ? ["比例", "装甲颜色", "机械骨架", "能源颜色", "工业真实感"] : ["身体结构", "生态逻辑", "材质", "尺度", "非普通怪兽化"]
    },
    createdAt: now,
    updatedAt: now
  };
}

function writeAssetFiles(dir, asset) {
  const base = path.basename(asset.metadataPath, ".json");
  fs.writeFileSync(path.join(dir, `${base}.json`), `${JSON.stringify(asset, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(dir, `${base}_PROMPT.md`), `# ${asset.assetId} ${asset.name} ${asset.variant}\n\n${asset.prompt}\n\nNegative Prompt:\n${asset.negativePrompt}\n`, "utf8");
  fs.writeFileSync(path.join(dir, `${base}_REFERENCE.json`), `${JSON.stringify({
    assetId: asset.assetId,
    referenceStatus: "等待真实图片生成后锁定",
    cannotChange: asset.consistencyLock.cannotChange,
    reuseRule: "后续关键帧、Storyboard、GPT Image2图片、可灵视频、海报、宣传片必须引用此Reference。"
  }, null, 2)}\n`, "utf8");
}

function writeProject(name, data) {
  fs.writeFileSync(path.join(projectDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
