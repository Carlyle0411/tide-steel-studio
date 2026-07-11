import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "projects", "tide-steel-soul", "master-asset-library");
const now = "2026-07-10T00:00:00.000+08:00";

const categories = [
  ["CHAR", "人物", "Characters", ["角色卡", "三视图", "360参考", "全身", "半身", "头像", "侧脸", "背影", "站姿", "坐姿", "驾驶姿势", "跑步", "行走", "愤怒", "沉默", "微笑", "流血", "受伤", "不同光线", "不同天气", "不同镜头"]],
  ["MECHA", "机甲", "Mechas", ["正面", "背面", "侧面", "俯视", "驾驶舱", "腿部", "武器", "推进器", "开机", "待机", "冲刺", "跳跃", "攻击", "受伤", "战损", "夜景", "暴雨", "海面"]],
  ["CREATURE", "怪兽", "Creatures", ["远景", "近景", "正面", "嘴部", "眼睛", "身体", "攻击", "游泳", "登陆", "怒吼", "死亡", "战损", "海底", "暴雨", "夜晚"]],
  ["ENV", "场景", "Environment", ["白天", "黄昏", "夜晚", "暴雨", "浓雾", "远景", "近景", "标准平面", "灯光参考"]],
  ["PROP", "道具", "Props", ["标准图", "手持", "使用中", "磨损", "特写"]],
  ["ACTION", "动作", "Actions", ["人物动作", "机甲动作", "怪兽动作"]],
  ["CAM", "运镜", "Camera", ["推镜", "拉镜", "横移", "环绕", "升降", "无人机", "第一人称", "长焦", "广角", "手持", "跟拍", "肩扛"]],
  ["LIGHT", "灯光", "Lighting", ["电影冷光", "基地蓝光", "应急红光", "暴雨反光", "机甲灯", "火焰光", "月光", "逆光"]],
  ["WEATHER", "天气", "Weather", ["暴雨", "小雨", "乌云", "晴天", "黄昏", "黎明", "雷暴", "海雾", "雪"]],
  ["VFX", "特效", "VFX", ["海浪", "火花", "电流", "爆炸", "烟尘", "雨滴", "粒子", "能量场", "火焰"]],
  ["COMP", "构图", "Composition", ["中心构图", "三分法", "对角线", "对称", "负空间", "框架构图", "低机位", "高机位"]],
  ["COLOR", "色彩", "Color", ["深蓝", "冷灰", "黑色金属", "暗红", "蓝色能源", "白色生物甲壳"]],
  ["MAT", "材质", "Materials", ["湿金属", "盐雾腐蚀", "玻璃", "海水", "生物甲壳", "磨损涂层"]],
  ["VIDEO", "视频模板", "Video Templates", ["人物走路模板", "人物驾驶模板", "机甲冲刺模板", "怪兽登陆模板", "城市远景模板", "海浪模板", "暴雨模板"]],
  ["PROMPT", "Prompt模板", "Prompt Templates", ["GPT Image2 Prompt", "Kling Prompt", "Negative Prompt", "Camera Prompt", "Lighting Prompt"]]
].map(([prefix, name, englishName, variants], index) => ({
  id: `MASTER-CAT-${String(index + 1).padStart(2, "0")}`,
  prefix,
  name,
  englishName,
  variants,
  status: "母库标准",
  rule: "所有剧集、关键帧、视频片段与可灵Prompt必须优先引用本分类资产。"
}));

const people = [
  ["linzhou", "林舟", "年轻驾驶员，勇敢里带着恐惧，所有剧情图必须保持同一脸型、发型、年龄与驾驶服逻辑。"],
  ["xuran", "许燃", "理性搭档，冷静但并非冷漠，驾驶舱蓝光和流程感是她的核心视觉环境。"],
  ["chenmu", "陈牧", "长期值守海洋防线的指挥官，疲惫、沉稳、经验先于系统。"],
  ["tangxiaoman", "唐小满", "工程与维护线角色，必须保留真实工业现场质感。"],
  ["lan", "AI澜", "非人形系统智能，只能以冷蓝透明系统界面和选择顺序变化体现。"]
];

const mechas = [
  ["chiting01", "赤霆01", "暗红装甲、黑色机械骨架、蓝色能源、20米级重型工业人形机甲。"],
  ["xuanjing03", "玄鲸03", "黑蓝远程支援结构，必须区别于赤霆的近战重量感。"],
  ["baiyuan07", "白鸢07", "白灰侦察结构，轻量、高机动、非英雄化展示。"]
];

const creatures = [
  ["white_tide", "白潮", "白色生物甲壳、半透明海洋组织、巨大但脆弱，不是Boss。"],
  ["black_tide", "黑潮母体", "上一轮错误遗留系统的生命化阴影，不作为简单反派展示。"],
  ["thorn_tide", "刺潮", "潮门生态中的高压深海攻击性生命，仍需保留生态逻辑。"]
];

const environments = [
  ["hangzhou_bay", "杭州湾2042", "海洋防线、未来港口、低云、海雾、工业尺度。"],
  ["future_port", "未来港口", "民用与军用边界，被海洋防线改造过的城市边缘。"],
  ["deep_blue_base", "深蓝基地", "运行三十年的湿冷军事工程设施。"],
  ["cockpit", "驾驶舱", "同步装置、冷蓝HUD、狭窄高压空间。"],
  ["control_room", "控制室", "人类规则、流程和低频异常第一次冲突的空间。"],
  ["maintenance_area", "维修区", "湿金属、盐雾、工具、维修痕迹。"],
  ["underground_tunnel", "地下通道", "撤离与防线后方动线。"],
  ["tide_gate_rift", "海底裂缝", "潮门生态入口，不是传送门。"],
  ["energy_tower", "能源塔", "人类试图维持秩序的工程设施。"],
  ["ruins", "废墟", "旧文明痕迹，第二部可继续复用。"],
  ["shelter", "避难所", "城市撤离与普通人的存在感。"]
];

const props = [
  ["pilot_helmet", "驾驶头盔", "同步驾驶与人物压力的道具核心。"],
  ["controller", "控制器", "深蓝基地标准操作终端。"],
  ["mechanical_glove", "机械手套", "维修与驾驶动作的手部资产。"],
  ["id_card", "身份卡", "基地权限与人物关系的细节道具。"],
  ["terminal", "终端", "冷蓝界面，不出现商业科幻UI。"],
  ["ai_core", "AI核心", "AI澜的非人形物理指代。"],
  ["energy_cell", "能源电池", "赤霆与基地系统的工程资产。"]
];

const allAssets = [
  ...entityAssets("CHAR", "人物", people, categories[0].variants),
  ...entityAssets("MECHA", "机甲", mechas, categories[1].variants),
  ...entityAssets("CREATURE", "怪兽", creatures, categories[2].variants),
  ...entityAssets("ENV", "场景", environments, categories[3].variants),
  ...entityAssets("PROP", "道具", props, categories[4].variants)
];

const actionTemplates = [
  ...templateSet("ACTION-HUMAN", "人物动作", ["站立", "走路", "跑步", "回头", "转身", "举枪", "驾驶", "跳跃", "倒地"]),
  ...templateSet("ACTION-MECHA", "机甲动作", ["待机", "启动", "冲刺", "挥拳", "拔刀", "起跳", "落地", "防御"]),
  ...templateSet("ACTION-CREATURE", "怪兽动作", ["游动", "怒吼", "扑击", "摆尾", "潜水", "登陆"])
];

const cameraTemplates = templateSet("CAMERA", "运镜", categories[6].variants).map((item) => ({
  ...item,
  diagramStatus: "待生成示意图",
  chineseExplanation: `${item.name}用于明确镜头意图，必须服务角色选择和空间关系。`,
  klingPromptTemplate: `Camera Movement: ${item.name}; keep cinematic physical motion, no short-video shake.`
}));

const weatherTemplates = templateSet("WEATHER", "天气", categories[8].variants);
const lightingTemplates = templateSet("LIGHT", "灯光", categories[7].variants);
const vfxTemplates = templateSet("VFX", "特效", categories[9].variants);
const compositionTemplates = templateSet("COMP", "构图", categories[10].variants);

const promptTemplates = [
  ...allAssets.slice(0, 80).map((asset) => promptTemplateForAsset(asset)),
  ...cameraTemplates.map((item) => ({
    id: `PROMPT-${item.id}`,
    name: `${item.name} Camera Prompt`,
    category: "运镜",
    gptImage2Prompt: `Create a clear cinematic reference image that demonstrates ${item.name} in Tide Steel Soul industrial ocean sci-fi language.`,
    klingPrompt: item.klingPromptTemplate,
    negativePrompt: negativePrompt(),
    cameraPrompt: `${item.name}, grounded physical camera movement`,
    lightingPrompt: "low saturation cinematic lighting, real source logic"
  }))
];

const videoTemplates = [
  videoTemplate("VIDEO-HUMAN-WALK-001", "人物走路模板", "人物", "从冷蓝基地通道尽头走向镜头", "慢推镜", 5),
  videoTemplate("VIDEO-HUMAN-PILOT-001", "人物驾驶模板", "人物", "驾驶舱内完成同步操作", "85mm轻微推进", 5),
  videoTemplate("VIDEO-MECHA-DASH-001", "机甲冲刺模板", "机甲", "赤霆01在暴雨海防线上向前冲刺", "低机位跟拍", 6),
  videoTemplate("VIDEO-CREATURE-LAND-001", "怪兽登陆模板", "怪兽", "白潮从海雾中靠近防线", "24mm稳定远景", 6),
  videoTemplate("VIDEO-CITY-WIDE-001", "城市远景模板", "场景", "杭州湾防线在压低云层下维持秩序", "无人机缓慢横移", 5),
  videoTemplate("VIDEO-OCEAN-WAVE-001", "海浪模板", "特效", "海浪反向起纹，异常极轻微", "固定镜头", 5),
  videoTemplate("VIDEO-RAIN-001", "暴雨模板", "天气", "暴雨落在湿金属和玻璃上", "微距转中景", 5)
];

const metadataSchema = {
  assetId: "MASTER-XXX-000",
  name: "中文资产名",
  category: "人物/机甲/怪兽/场景/道具/动作/运镜/灯光/天气/特效/构图/色彩/材质/视频模板/Prompt模板",
  version: "V001",
  status: "草稿 / 生成中 / 待审核 / 已通过 / 废弃",
  prompt: "GPT Image2 Prompt",
  negativePrompt: "Negative Prompt",
  reference: "Reference资产路径",
  imagePath: "PNG本地路径",
  tags: ["中文标签"],
  description: "中文描述",
  linkedKlingPrompt: "可灵Prompt模板ID",
  linkedVideoTemplate: "视频模板ID",
  createdAt: now,
  updatedAt: now
};

const importRules = {
  workflow: ["Codex生成图片", "保存PNG", "保存JSON", "保存Prompt", "保存Reference", "加入母资产库", "加入搜索", "加入Tag", "加入Version"],
  requiredFiles: ["image.png", "metadata.json", "reference.json", "prompt.md"],
  outputRoot: "projects/tide-steel-soul/master-asset-library/generated",
  rule: "没有进入母资产库的图片，不能作为12集共用Reference。EP01临时素材必须升级为母资产后才能长期复用。"
};

write("MASTER_ASSET_LIBRARY_MANIFEST.json", {
  project: "潮汐钢魂",
  englishName: "Tide Steel Soul",
  phase: "PHASE 20 MASTER ASSET LIBRARY",
  generatedAt: now,
  purpose: "建立未来12集共用的电影母资产库。所有图片、关键帧、视频片段、可灵Prompt必须优先引用这里。",
  categories,
  stats: {
    categories: categories.length,
    masterAssets: allAssets.length,
    actionTemplates: actionTemplates.length,
    cameraTemplates: cameraTemplates.length,
    weatherTemplates: weatherTemplates.length,
    lightingTemplates: lightingTemplates.length,
    vfxTemplates: vfxTemplates.length,
    compositionTemplates: compositionTemplates.length,
    promptTemplates: promptTemplates.length,
    videoTemplates: videoTemplates.length
  }
});
write("MASTER_ASSETS.json", { generatedAt: now, assets: allAssets });
write("ACTION_LIBRARY.json", { generatedAt: now, templates: actionTemplates });
write("CAMERA_LIBRARY.json", { generatedAt: now, templates: cameraTemplates });
write("WEATHER_LIBRARY.json", { generatedAt: now, templates: weatherTemplates });
write("LIGHTING_LIBRARY.json", { generatedAt: now, templates: lightingTemplates });
write("VFX_LIBRARY.json", { generatedAt: now, templates: vfxTemplates });
write("COMPOSITION_LIBRARY.json", { generatedAt: now, templates: compositionTemplates });
write("PROMPT_TEMPLATE_LIBRARY.json", { generatedAt: now, templates: promptTemplates });
write("VIDEO_TEMPLATE_LIBRARY.json", { generatedAt: now, templates: videoTemplates });
write("METADATA_SCHEMA.json", metadataSchema);
write("AUTO_IMPORT_RULES.json", importRules);

for (const category of categories) {
  fs.mkdirSync(path.join(outDir, category.englishName.toLowerCase().replace(/\s+/g, "-")), { recursive: true });
}
fs.mkdirSync(path.join(outDir, "generated"), { recursive: true });

console.log(`Master asset library generated: ${allAssets.length} master assets, ${promptTemplates.length} prompt templates, ${videoTemplates.length} video templates.`);

function entityAssets(prefix, category, entities, variants) {
  return entities.flatMap(([slug, name, description]) => variants.map((variant, index) => {
    const id = `${prefix}-${slug.replace(/_/g, "").toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
    return {
      id,
      slug,
      name: `${name} / ${variant}`,
      baseName: name,
      category,
      variant,
      description,
      status: "待生成",
      version: "V001",
      referenceStatus: "待建立Reference",
      imagePath: "",
      metadataPath: `projects/tide-steel-soul/master-asset-library/generated/${id}.json`,
      tags: [category, name, variant, "母资产"],
      promptId: `PROMPT-${id}`,
      klingPromptId: `KLING-${id}`,
      videoTemplateIds: [],
      usageCount: 0,
      firstUse: "未引用",
      updatedAt: now
    };
  }));
}

function templateSet(prefix, category, names) {
  return names.map((name, index) => ({
    id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    name,
    category,
    status: "母库模板",
    tags: [category, name, "可复用"],
    description: `${name}的标准制作模板，供12集重复引用。`,
    updatedAt: now
  }));
}

function promptTemplateForAsset(asset) {
  return {
    id: `PROMPT-${asset.id}`,
    assetId: asset.id,
    name: `${asset.name} GPT Image2 Prompt`,
    category: asset.category,
    gptImage2Prompt: [
      `《潮汐钢魂》母资产标准图：${asset.name}`,
      `用途：未来12集共用Reference，不是剧情画面。`,
      `视觉描述：${asset.description}`,
      "cinematic realistic sci-fi, industrial ocean defense future, 16:9, production design reference, consistent identity, low saturation, real material, no text"
    ].join("\n"),
    klingPrompt: [
      `Subject: ${asset.name}`,
      `Action: use as stable reference for ${asset.variant}`,
      "Camera Movement: restrained cinematic motion",
      "Duration: 5s",
      "Motion Physics: heavy, grounded, real world scale"
    ].join("\n"),
    negativePrompt: negativePrompt(),
    cameraPrompt: "film production reference, neutral readable angle unless variant asks otherwise",
    lightingPrompt: "low saturation cinematic lighting, source-light logic, ocean humidity"
  };
}

function videoTemplate(id, name, category, action, camera, duration) {
  return {
    id,
    name,
    category,
    firstFrame: "由母资产Reference生成首帧",
    lastFrame: "根据动作终点生成尾帧建议",
    klingPrompt: [
      `Scene: Tide Steel Soul master video template`,
      `Subject: ${name}`,
      `Action: ${action}`,
      `Camera Movement: ${camera}`,
      `Duration: ${duration}s`,
      "Lighting: cinematic low saturation industrial ocean light",
      `Negative Prompt: ${negativePrompt()}`
    ].join("\n"),
    cameraMovement: camera,
    duration,
    status: "模板可用",
    tags: [category, name, "可灵模板"]
  };
}

function negativePrompt() {
  return "cartoon, anime, game render, plastic sci-fi, neon cyberpunk, over-saturated, logo, watermark, subtitles, wrong character, inconsistent mech design";
}

function write(name, value) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
