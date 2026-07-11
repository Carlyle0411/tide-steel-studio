import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const projectDir = path.join(root, "projects", "tide-steel-soul", "hero-character-library");
const assetRoot = path.join(root, "assets", "characters");
const now = "2026-07-10T00:00:00.000+08:00";

const characters = [
  {
    key: "LINZHOU",
    slug: "linzhou",
    name: "林舟",
    englishName: "Lin Zhou",
    age: 23,
    height: "178cm",
    personality: "克制、执拗、带着恐惧的勇敢",
    costume: "深蓝黑色驾驶服，轻微磨损，功能性同步节点",
    color: "深蓝、冷灰、微弱蓝色同步光",
    feature: "短黑发、轻微伤痕、年轻但经历战争的眼神",
    brief: "一个相信力量的人，在第一部逐渐学会理解未知。",
    variants: ["标准头像", "45度侧脸", "全身立绘", "正面三视图", "驾驶服版本", "战斗服版本", "驾驶舱内", "愤怒表情", "疲惫表情", "坚定表情", "暴雨环境", "电影海报姿态"],
    basePrompt: "23-year-old Chinese male mech pilot, short black hair, young but shaped by war, determined eyes, subtle scar, restrained, not superhero glamour, realistic film character"
  },
  {
    key: "XURAN",
    slug: "xuran",
    name: "许燃",
    englishName: "Xu Ran",
    age: 24,
    height: "172cm",
    personality: "冷静、克制、相信数据但开始接受不完整选择",
    costume: "王牌驾驶员驾驶服，深蓝灰功能面料，干净但有使用痕迹",
    color: "冷蓝、灰白、低饱和黑色",
    feature: "东方科幻电影人物气质，眼神冷静，动作准确",
    brief: "她不是林舟的工具人，而是在数据失效后仍选择行动的人。",
    variants: ["头像", "侧脸", "全身", "三视图", "驾驶服", "战斗姿态", "驾驶舱", "冷静表情", "愤怒表情", "悲伤表情", "夜晚光影", "电影海报姿态"],
    basePrompt: "24-year-old Chinese female ace pilot, calm and restrained, precise eyes, realistic eastern sci-fi film character, functional pilot suit, not fashion sci-fi"
  },
  {
    key: "CHENMU",
    slug: "chenmu",
    name: "陈牧",
    englishName: "Chen Mu",
    age: 50,
    height: "180cm",
    personality: "沉稳、疲惫、经验强于系统判断",
    costume: "2047海洋防御指挥制服，深蓝灰，盐雾和长期使用痕迹",
    color: "深蓝灰、冷白、指挥中心低光",
    feature: "短灰黑头发、疲惫眼神、不是将军式英雄",
    brief: "上一代战争逻辑的代表，也是在承认不知道后开始改变的人。",
    variants: ["头像", "全身", "制服", "指挥中心", "严肃", "思考", "背影", "电影海报"],
    basePrompt: "50-year-old Chinese male ocean defense commander, short gray-black hair, tired eyes, steady, not villain, not superhero, worn navy-gray command uniform"
  },
  {
    key: "TANGXIAOMAN",
    slug: "tangxiaoman",
    name: "唐小满",
    englishName: "Tang Xiaoman",
    age: 22,
    height: "165cm",
    personality: "敏捷、明亮、工程直觉强，紧张时仍能动手解决问题",
    costume: "维修服，工具带，湿金属工作环境，真实工程质感",
    color: "冷灰、工具黄、小面积蓝光",
    feature: "年轻工程师气质，手部动作熟练，非偶像化",
    brief: "她让赤霆不是神话，而是一台需要被维护的危险机器。",
    variants: ["头像", "维修服", "工具状态", "工作场景", "开心", "紧张", "战斗辅助", "电影海报"],
    basePrompt: "young Chinese female mechanic, practical maintenance suit, tool belt, humid mech hangar, quick intelligent expression, grounded film realism"
  },
  {
    key: "LAN",
    slug: "lan",
    name: "AI澜",
    englishName: "AI Lan",
    age: "非人类",
    height: "界面可变",
    personality: "冷静、排序式判断、从工具转向承担选择后果",
    costume: "无固定服装；允许全息少女形态但必须保持系统感",
    color: "冷蓝、透明白、数据流微光",
    feature: "不应像普通助手；人性体现在选择顺序变化",
    brief: "AI澜不是全知者。她第一次主动选择，不是觉醒，而是承担。",
    variants: ["全息形态", "少女AI形态", "蓝色能量", "驾驶舱界面", "冷静", "觉醒状态", "数据流", "电影海报"],
    basePrompt: "AI Lan, non-human system intelligence, cold blue holographic interface, optional subtle young female hologram form, transparent data light, not cute assistant, cinematic sci-fi"
  }
];

const style = "16:9, Cinematic Sci-Fi, Hollywood realistic, high detail, natural skin when human, film lighting, low saturation, industrial ocean defense future, no anime, no cartoon, no game render, no text, no logo, no watermark";

fs.mkdirSync(projectDir, { recursive: true });

const assets = [];
for (const character of characters) {
  const characterDir = path.join(assetRoot, character.slug);
  fs.mkdirSync(characterDir, { recursive: true });
  character.variants.forEach((variant, index) => {
    const version = `V${String(index + 1).padStart(3, "0")}`;
    const assetId = `CHAR-${character.key}-${version}`;
    const fileName = `${character.key}_${version}`;
    const prompt = buildPrompt(character, variant);
    const record = {
      assetId,
      character: character.name,
      englishName: character.englishName,
      variant,
      version,
      status: "待图片落盘",
      imagePath: `assets/characters/${character.slug}/${fileName}.png`,
      metadataPath: `assets/characters/${character.slug}/${fileName}.json`,
      promptPath: `assets/characters/${character.slug}/${fileName}_PROMPT.md`,
      referencePath: `assets/characters/${character.slug}/${fileName}_REFERENCE.json`,
      prompt,
      negativePrompt: "placeholder, mock image, random face, different age, different costume, anime, cartoon, game render, beauty ad, superhero pose, text, logo, watermark",
      tags: ["人物", "英雄角色", character.name, variant, "母资产", "Reference"],
      consistencyLock: {
        age: character.age,
        height: character.height,
        costume: character.costume,
        color: character.color,
        feature: character.feature
      },
      createdAt: now,
      updatedAt: now
    };
    assets.push(record);
    fs.writeFileSync(path.join(characterDir, `${fileName}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(characterDir, `${fileName}_PROMPT.md`), `# ${assetId} ${character.name} ${variant}\n\n${prompt}\n`, "utf8");
    fs.writeFileSync(path.join(characterDir, `${fileName}_REFERENCE.json`), `${JSON.stringify({
      assetId,
      character: character.name,
      referenceStatus: "等待真实图片生成后锁定",
      cannotChange: ["脸型", "年龄", "发型", "服装逻辑", "标志特征", "电影质感"],
      reuseRule: "后续关键帧、Storyboard、GPT Image2图片、可灵视频、海报、宣传片必须引用此Reference。"
    }, null, 2)}\n`, "utf8");
  });
}

writeProject("CHARACTER_BIBLE.json", {
  project: "潮汐钢魂",
  phase: "PHASE 21A Hero Character Asset Library",
  generatedAt: now,
  rule: "角色母资产不是剧情截图。所有后续关键帧、Storyboard、GPT Image2图片、可灵视频、海报、宣传片必须引用这里。",
  characters,
  totalRequiredImages: assets.length
});

writeProject("CHARACTER_ASSET_MANIFEST.json", {
  generatedAt: now,
  total: assets.length,
  generatedImages: 0,
  landedImages: 0,
  status: "等待真实图片逐项生成并落盘",
  assets
});

writeProject("CHARACTER_REFERENCE_RULES.json", {
  generatedAt: now,
  rules: [
    "禁止使用placeholder或mock图片。",
    "禁止把聊天中未落盘图片登记为已完成资产。",
    "同一角色必须保持同一脸型、年龄、发型和服装逻辑。",
    "每张图片必须有PNG、JSON metadata、Prompt、Reference记录。",
    "未经过人工审核的图片不能作为12集长期Reference。"
  ]
});

console.log(`Hero character library generated: ${assets.length} character asset records.`);

function writeProject(name, data) {
  fs.writeFileSync(path.join(projectDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function buildPrompt(character, variant) {
  return [
    `Create a character master asset reference image for Tide Steel Soul.`,
    `Character: ${character.name} / ${character.englishName}.`,
    `Variant: ${variant}.`,
    `Core identity: ${character.basePrompt}.`,
    `Character Bible: age ${character.age}, height ${character.height}, personality ${character.personality}, costume ${character.costume}, color ${character.color}, signature feature ${character.feature}.`,
    `This is a reusable standard character model asset, not a story screenshot.`,
    style
  ].join("\n");
}
