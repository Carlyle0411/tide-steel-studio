import type { MasterAsset } from "../masterAssetLibrary/MasterAssetLibraryData";

export type ManualImageStatus = "EMPTY" | "DRAFT" | "REVIEW" | "APPROVED" | "MASTER_REFERENCE" | "REJECTED";
export type ManualPromptStatus = "READY" | "MISSING";
export type PromptCategory = "Character Prompt" | "Mecha Prompt" | "Creature Prompt" | "Asset Prompt";

export type AssetPromptDetails = {
  assetType: string;
  promptCategory: PromptCategory;
  backgroundRule: string;
  composition: string;
  usage: string;
  identityLock: string;
  assetRequirement: string;
  cameraRule: string;
  materialRule: string;
  consistencyLock: string;
  negativePrompt: string;
  fullPrompt: string;
};

export type ConsistencyChecklist = {
  face: boolean;
  hair: boolean;
  age: boolean;
  costume: boolean;
  world: boolean;
};

export type AssetRating = {
  consistency: number;
  quality: number;
  cinematic: number;
  reusable: number;
};

export type PromptVersion = {
  versionId: string;
  prompt: string;
  reason: string;
  createdAt: string;
};

export type ManualAssetMetadata = {
  asset_id: string;
  category: string;
  character: string;
  scene: string;
  prompt: string;
  version: string;
  reference: string;
  usage: string[];
  file_name: string;
  uploaded_at: string;
  cloud_path?: string;
};

export type ManualAssetVersion = {
  versionId: string;
  fileName: string;
  dataUrl: string;
  mediaType: "image" | "video";
  uploadedAt: string;
  status: ManualImageStatus;
  checklist: ConsistencyChecklist;
  rating: AssetRating;
  promptVersions: PromptVersion[];
  metadata: ManualAssetMetadata;
};

export type ManualAssetStore = Record<string, ManualAssetVersion[]>;

type PromptableAsset = Pick<MasterAsset, "id" | "name" | "baseName" | "category" | "variant" | "description" | "tags" | "referenceStatus">;
type VariantTemplate = {
  aliases: string[];
  backgroundRule: string;
  composition: string;
  usage: string;
  prompt: string;
};

const DB_NAME = "tide-steel-soul-asset-workbench";
const DB_VERSION = 1;
const STORE_NAME = "manual-assets";
const STORE_KEY = "asset-store";
const STORE_EVENT = "tide-steel-soul-manual-asset-library-change";
const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm", "video/quicktime"]);

const worldCore = "《潮汐钢魂 Tide Steel Soul》，2042年杭州湾未来工业海防文明，电影级真实摄影感，低饱和，深海蓝、冷灰、赤霆红、能源蓝，湿金属、海盐腐蚀、工业磨损、玻璃反射、水汽、雨痕。";
const negativePrompt = "Negative Prompt: 动漫、二次元、游戏CG、塑料玩具、廉价科幻、过度霓虹赛博朋克、超级英雄夸张姿势、换脸、错误年龄、结构不可信、文字、水印、logo、字幕。";
const cameraRule = "真实电影摄影，主体清晰，镜头克制；参考资产优先保持可读性，不追求剧情截图效果。";
const materialRule = "材质必须真实：皮肤保留自然纹理，服装有功能性磨损，机甲保留湿金属和海盐腐蚀，怪兽保留潮湿甲壳与冷光反射。";

const characterTemplates: VariantTemplate[] = [
  t(["角色卡"], "白底或浅灰无影棚，允许少量浅灰辅助线，不要剧情环境。", "角色卡式清晰展示，头肩、半身与关键服装细节可组合排布。", "母资产 / 身份参考", "生成角色标准识别卡，突出面部识别、年龄感、发型、伤痕、服装领口与整体气质。姿态克制，眼神有经历战争后的疲惫和压住的恐惧，不要文字标注。"),
  t(["标准头像", "头像"], "白底或浅灰无影棚，干净背景。", "头肩构图，85mm电影人像感，面部占核心。", "母资产 / 面部Reference", "标准头像，用于锁定角色脸。强调面部结构、眼形、鼻梁、嘴部、发型边缘、真实皮肤纹理和海防驾驶员服装领口。"),
  t(["45度脸", "45度侧脸", "侧脸"], "白底或浅灰底，柔和棚拍光。", "头部向一侧旋转约45度，脸部结构完整可读。", "母资产 / 角度Reference", "45度侧脸参考，不要正脸替代。展示颧骨、下颌线、耳廓、发际线与眼神方向，保持同一张脸和同一年龄。"),
  t(["全身正面", "全身", "站姿"], "白底或浅灰底，仅保留淡接触阴影。", "完整全身正面，双脚入画，站姿自然，服装轮廓完整。", "母资产 / 全身比例Reference", "完整全身正面参考。强调身高比例、肩宽、腿部比例、驾驶服结构、靴子、手套、装备挂点，身体放松但有训练感。"),
  t(["全身侧面"], "白底或浅灰技术参考背景。", "完整全身侧面，身体轮廓、头部侧向与装备厚度清楚。", "结构参考 / 侧面比例", "全身侧面参考，突出服装厚度、背部装备、靴子外形与头部侧面轮廓，不要动作化。"),
  t(["全身背面", "背影"], "白底或浅灰技术展示背景。", "完整背面站姿，后背、腰部、腿部和装备结构完整。", "结构参考 / 背面比例", "全身背面参考，展示后背服装结构、肩胛区域、腰部装备、后腿线条与靴底比例，人物不要回头。"),
  t(["三视图", "360参考"], "纯白底优先，技术设定图背景。", "正面、侧面、背面三视图并列，比例一致。", "母资产 / 三视图Reference", "角色三视图，同一人物正面、侧面、背面并列，姿态高度一致，服装结构对齐，方便后续建模和图片一致性引用。"),
  t(["表情板", "不同表情"], "纯白底优先，四宫格或多表情组合。", "同一张脸多个表情，构图整齐，表情差异明确。", "母资产 / 表情Reference", "表情板，包含克制、紧张、愤怒、悲伤或疲惫等变化。必须保持同一张脸、同一发型、同一年龄。"),
  t(["坐姿"], "浅灰无影棚或极简中性背景，有轻微地面接触阴影。", "完整坐姿，身体重心、膝盖、手部位置自然可读。", "姿态参考", "坐姿参考。人物坐在简洁工业椅或无影棚方凳上，脊背微紧，手部自然放在膝盖或扶手附近。"),
  t(["驾驶姿态", "驾驶姿势", "驾驶"], "浅灰工业简背景，可出现简化座椅和控制杆，不要复杂驾驶舱。", "坐姿驾驶构图，双手位置、肩颈紧张、上半身动作清楚。", "姿态参考 / 驾驶动作", "驾驶姿态参考。穿驾驶服坐入同步座，双手接近控制装置，身体微向前，眼神专注但有压力。"),
  t(["行走"], "浅灰棚拍或轻环境背景，地面简洁。", "全身行走姿态，身体重心正在前移。", "动作参考", "行走动作参考。人物从画面左侧向右侧缓慢行走，肩部压低，步幅真实，衣料和装备有轻微运动趋势。"),
  t(["奔跑", "跑步"], "浅灰棚拍或轻工业环境背景，避免复杂追逐场景。", "全身奔跑，身体前倾，重心明确，动作方向清晰。", "动作参考", "奔跑动作参考。人物向画面右前方奔跑，身体重心压低，一只脚离地，手臂自然摆动，紧张但不是热血英雄姿态。"),
  t(["凝视", "沉默"], "中性背景，不要纯白硬切，不要复杂场景。", "中近景或半身，眼神方向明确，留少量负空间。", "情绪参考", "凝视情绪参考。人物安静看向画面外，像听见无法解释的低频信号，嘴部克制，肩颈微僵。"),
  t(["愤怒"], "中性背景，弱冷光或低饱和红蓝反差，不要战斗场景。", "中近景，情绪集中在眼神、下颌和肩部紧张。", "情绪参考", "愤怒情绪参考。不是咆哮英雄，而是压住恐惧后的愤怒；眉眼收紧、下颌绷住、呼吸被迫控制。"),
  t(["悲伤"], "中性背景，柔和冷光，不要戏剧化哭喊。", "近景或中近景，眼神下落，表情克制。", "情绪参考", "悲伤情绪参考。不夸张落泪，只表现失去后的沉默，眼眶微红，脸部肌肉放松但眼神失焦。"),
  t(["海报姿态", "电影海报"], "弱环境背景，可有海雾、基地冷光或远处海防轮廓，主体必须清晰。", "电影海报式半身或全身，主体居中或三分法，保留负空间。", "海报参考", "电影海报姿态。人物站在弱工业海防氛围中，姿态克制，背景只服务气质，不抢主体。")
];

const mechaTemplates: VariantTemplate[] = [
  t(["正面设计", "正面"], "白底或浅灰技术背景，可有极淡工程网格。", "完整机体正面，双脚入画，比例标准，结构对称清楚。", "母资产 / 正面设计Reference", "机甲正面设计参考。突出头部、胸腔、肩甲、手臂、腿部和脚部结构，装甲层次清楚，比例可统一引用。"),
  t(["侧面设计", "侧面"], "白底或浅灰技术背景，保持干净。", "完整机体侧面，机体厚度、背部结构、腿部关节清楚。", "结构参考 / 侧面设计", "机甲侧面设计参考。突出背部厚度、肩甲外扩、腿部液压结构、脚掌重心和装甲连接方式。"),
  t(["背面设计", "背面", "背部"], "白底或浅灰技术背景。", "完整机体背面，推进器、背部装甲、维护接口清楚。", "结构参考 / 背面设计", "机甲背面设计参考。突出背部驾驶舱区域、推进器、脊柱式机械骨架、维修痕迹和装甲分层。"),
  t(["三视图"], "纯白底优先，技术设定图背景。", "正面、侧面、背面三视图并列，同一比例。", "母资产 / 技术三视图", "机甲三视图，正面、侧面、背面并列展示。每个角度必须是同一台机体，装甲颜色和结构不能变化。"),
  t(["全身比例", "全身"], "白底或浅灰底，允许地面比例线。", "完整全身比例，旁边可有极简比例参照但不要文字。", "母资产 / 比例Reference", "机甲全身比例参考。强调20米级重型工业机甲体量、腿部承重结构和整体重心。"),
  t(["驾驶舱"], "浅灰技术展示背景或简化机库背景。", "驾驶舱内部或局部剖面，座椅、同步接口、控制结构清楚。", "结构参考 / 驾驶舱", "机甲驾驶舱参考。展示同步座、背部舱门内侧、机械锁扣、冷蓝系统光和可操作工程细节。"),
  t(["驾驶舱开启"], "浅灰技术展示背景，局部机体结构展示。", "背部或胸背区域打开，舱门结构、入口尺度、内部座舱可读。", "结构参考 / 舱门状态", "驾驶舱开启状态。背部舱门打开，液压杆、装甲厚度、入口缝隙、蓝色同步光清楚，不展示英雄姿势。"),
  t(["武器展开", "武器系统"], "浅灰技术展示背景，可有轻微工业地面。", "武器展开状态，机体保持稳定，武器结构清楚。", "结构参考 / 武器状态", "武器展开参考。右臂等离子链刃或主武器从机械结构中展开，锁扣、导轨、能量接口和安全限制清楚。"),
  t(["右臂武器细节", "武器细节", "等离子链刃"], "白底或浅灰技术背景，局部特写。", "右臂与武器局部占主体，结构边缘清晰。", "结构细节参考", "右臂武器细节。突出机械腕部、能量导槽、链刃折叠结构、磨损金属和蓝色能源接口。"),
  t(["胸口核心细节", "核心反应炉", "胸口反应炉"], "白底或浅灰技术背景，局部微距。", "胸口核心局部特写，装甲开口和能源核心居中。", "结构细节参考", "胸口核心细节。蓝色能源反应炉被暗红装甲包围，可见玻璃保护层、热痕、螺栓和维护划痕。"),
  t(["腿部结构", "脚部"], "白底或浅灰底，局部技术展示。", "腿部或脚部结构清楚，承重关节和液压系统可读。", "结构细节参考", "腿部结构参考。强调膝关节、踝部液压、脚掌接地面积和工业承重逻辑。"),
  t(["背部推进器", "推进器"], "白底或浅灰技术背景，背部局部展示。", "背部推进器和散热结构占主体。", "结构细节参考", "背部推进器参考。表现推进口、散热鳍片、海盐腐蚀、维护编号和冷蓝能源余光。"),
  t(["战斗姿态", "战斗"], "中性工业背景或机库弱背景，不要复杂大战场。", "全身战斗姿态，重心低，动作张力明确，机体仍清楚。", "姿态参考", "战斗姿态。机甲重心下压，肩甲前倾，右臂准备出击，脚部压住地面；背景保持弱机库环境。"),
  t(["冲刺姿态", "冲锋", "奔跑"], "浅灰地面加中性背景，可有轻微水汽。", "全身冲刺，机体前倾，动势清楚但不要运动模糊过度。", "动作参考", "冲刺姿态。机甲向画面前方低重心冲刺，脚部与地面接触产生重量感，装甲和武器保持一致。"),
  t(["海报姿态", "电影海报", "海报"], "弱环境背景，可有海雾、海防墙远影、冷蓝基地光，不要纯白。", "电影海报式低机位全身或半身，主体清晰，尺度感强。", "海报参考", "机甲海报姿态。机体站在杭州湾海防弱环境中，暗红装甲、黑色骨架、蓝色能源清晰。")
];

const creatureTemplates: VariantTemplate[] = [
  t(["三视图"], "纯白或浅灰技术展示背景，允许极淡水雾，不要复杂海面。", "正面、侧面、背面三视图并列，身体比例一致，轮廓完整可读。", "母资产 / 生物三视图核心Reference", "怪兽三视图参考。正面、侧面、背面并列展示同一只生物，甲壳结构、身体比例、尾部或主要运动结构必须一致。"),
  t(["完整身体", "身体", "全身", "正面"], "白底或浅灰底，允许极淡水雾，不要复杂海面。", "完整身体展示，头部、躯干、尾部或主要运动结构完整入画。", "母资产 / 生物全身Reference", "白潮完整身体参考。突出白色生物甲壳、半透明海洋组织、巨大但脆弱的身体比例，像深海生态生命而不是Boss怪兽。"),
  t(["头部", "近景"], "白底或浅灰底，柔和冷光。", "头部近景，形体结构、呼吸孔、甲壳边缘清楚。", "结构参考 / 头部", "头部参考。展示白潮头部轮廓、甲壳裂纹、湿润组织和非人类感知器官，不要张嘴咆哮式恐怖片。"),
  t(["眼睛"], "白底或浅灰技术背景，局部微距。", "眼部或感知器官特写，材质和湿润反射清晰。", "结构细节参考", "眼睛或感知器官特写。表现冷光反射、半透明膜层、盐水附着和古老生命感。"),
  t(["甲壳", "皮肤细节"], "白底或浅灰技术背景，局部特写。", "甲壳纹理占主体，裂纹、湿润反光和组织边缘清楚。", "结构细节参考", "甲壳细节。突出白色生物甲壳、细微裂纹、潮湿反光、半透明组织连接处和深海压力纹理。"),
  t(["游泳", "海底"], "中性海雾背景，水体简洁，不要复杂叙事。", "横向运动姿态，身体在水中推进，轮廓完整可读。", "动作参考", "游泳姿态。白潮在暗蓝水体中缓慢推进，身体适应深海压力，水流和海雾服务轮廓，不要普通鲸鱼。"),
  t(["海面出现", "登陆"], "弱环境背景，海面、浪花、低云可出现，但不要灾难大片堆砌。", "身体局部破开海面，尺度清楚，主体仍可识别。", "氛围参考 / 首次出现", "海面出现参考。白潮从杭州湾灰蓝海面下缓慢破浪出现，白色甲壳带水，动作像寻找方向而不是攻击城市。"),
  t(["攻击姿态", "攻击", "怒吼"], "中性环境背景，控制海浪和雾气，不要复杂城市破坏。", "身体前压或张力动作，攻击趋势明确但结构清楚。", "动作参考", "攻击姿态。白潮身体前压，甲壳裂纹和湿润组织可见，动作具有压迫但不恶魔化。"),
  t(["远景轮廓", "远景"], "雾感背景，低饱和海雾和尺度参照，不要复杂叙事。", "远景剪影或轮廓，主体巨大但边缘可读。", "尺度参考", "远景轮廓参考。白潮在海雾中形成巨大白色轮廓，远处海防设施只做尺度参照，不要爆炸和战斗。"),
  t(["海报姿态", "电影海报", "夜晚", "暴雨"], "弱环境背景，可有海雾、暴雨、冷蓝反光，不要纯白。", "电影海报式构图，主体清晰，背景压低。", "海报参考", "怪兽海报姿态。白潮在海雾和冷蓝反光中显露巨大轮廓，古老、脆弱、未知，不要怪兽王式胜利姿态。")
];

export function buildAssetPromptDetails(asset: PromptableAsset): AssetPromptDetails {
  const template = resolveTemplate(asset);
  const promptCategory = getPromptCategory(asset.category);
  const assetType = `${asset.baseName} / ${asset.variant}`;
  const identityLock = buildIdentityLock(asset);
  const consistencyLock = buildConsistencyLock(asset);
  const fullPrompt = buildReferenceFirstPrompt(asset, template);

  return {
    assetType,
    promptCategory,
    backgroundRule: template.backgroundRule,
    composition: template.composition,
    usage: template.usage,
    identityLock,
    assetRequirement: template.prompt,
    cameraRule,
    materialRule,
    consistencyLock,
    negativePrompt,
    fullPrompt
  };
}

export function buildAssetImagePrompt(asset: PromptableAsset) {
  return buildAssetPromptDetails(asset).fullPrompt;
}

export function getPromptStatus(asset: MasterAsset): ManualPromptStatus {
  return buildAssetImagePrompt(asset).trim() ? "READY" : "MISSING";
}

function buildReferenceFirstPrompt(asset: PromptableAsset, template: VariantTemplate) {
  const variantInstruction = buildShortVariantInstruction(asset);
  const background = simplifyBackground(template.backgroundRule);
  const lock = buildShortReferenceLock(asset);
  const frame = asset.category === "人物" || asset.category === "机甲" || asset.category === "怪兽" ? "16:9，主体完整清晰，方便后续作为母资产继续引用。" : "16:9，电影级真实质感，主体清晰。";
  return `根据我上传的${asset.baseName}参考图，${variantInstruction}${lock}${background}${frame}保持真实电影摄影、低饱和与自然材质，只完成当前指定变体，不增加剧情元素。禁止换脸、重新设计、结构漂移、动漫、游戏CG、塑料感、文字、水印、logo和字幕。`;
}

function buildShortVariantInstruction(asset: PromptableAsset) {
  const variant = asset.variant;
  const name = asset.baseName;
  if (asset.category === "人物") return buildCharacterShortInstruction(name, variant);
  if (asset.category === "机甲") return buildMechaShortInstruction(name, variant);
  if (asset.category === "怪兽") return buildCreatureShortInstruction(name, variant);
  return `生成${name}的${variant}参考图，保持与参考图同一设计语言，只改变本次要求的角度、状态或用途。`;
}

function buildCharacterShortInstruction(name: string, variant: string) {
  if (variant.includes("三视图") || variant.includes("360")) return `生成${name}角色三视图，同一人物正面、侧面、背面并列，姿态高度一致，服装结构对齐。`;
  if (variant.includes("角色卡")) return `生成${name}角色识别卡，保留同一张脸，可组合头像、半身和服装细节，方便后续一致性引用。`;
  if (variant.includes("头像")) return `生成${name}标准头像，头肩构图，面部识别清晰，保留发型、年龄感和服装领口。`;
  if (variant.includes("45") || variant.includes("侧脸")) return `生成${name}45度侧脸参考图，五官结构清楚，仍然是参考图里的同一人物。`;
  if (variant.includes("正面")) return `生成${name}全身正面参考图，站姿自然，完整显示服装、鞋、手套和身体比例。`;
  if (variant.includes("侧面")) return `生成${name}全身侧面参考图，身体轮廓、服装厚度和头部侧面清楚。`;
  if (variant.includes("背")) return `生成${name}全身背面参考图，完整显示背部服装结构和装备位置。`;
  if (variant.includes("坐姿")) return `生成${name}坐姿参考图，肢体自然，身体重心和手部位置清楚。`;
  if (variant.includes("驾驶")) return `生成${name}驾驶姿态，穿驾驶服坐在简化座椅中，双手接近操控位置。`;
  if (variant.includes("行走")) return `生成${name}行走动作参考，身体重心前移，动作自然，脸和服装不变。`;
  if (variant.includes("奔跑")) return `生成${name}奔跑动作参考，身体前倾、重心明确，保持同一人物和同一服装。`;
  if (variant.includes("愤怒")) return `生成${name}克制愤怒表情，中近景，眼神和下颌紧张，不要夸张咆哮。`;
  if (variant.includes("悲伤")) return `生成${name}悲伤表情，中近景，情绪压住，不要戏剧化哭喊。`;
  if (variant.includes("海报")) return `生成${name}电影海报姿态，主体清晰，弱工业海防氛围背景。`;
  return `生成${name}的${variant}参考图，保持同一人物身份，只改变本次指定状态。`;
}

function buildMechaShortInstruction(name: string, variant: string) {
  if (variant.includes("三视图")) return `生成${name}机甲三视图，同一机体正面、侧面、背面并列，比例和装甲结构完全一致。`;
  if (variant.includes("正面")) return `生成${name}正面设计图，完整机体，结构清晰，左右对称，方便作为标准母资产。`;
  if (variant.includes("侧面")) return `生成${name}侧面设计图，显示机体厚度、背部结构、腿部关节和脚部重心。`;
  if (variant.includes("背")) return `生成${name}背面设计图，显示背部装甲、推进器、维修接口和驾驶舱区域。`;
  if (variant.includes("驾驶舱开启")) return `生成${name}驾驶舱开启状态，展示舱门结构、入口缝隙、内部座舱和蓝色同步光。`;
  if (variant.includes("驾驶舱")) return `生成${name}驾驶舱结构参考，简洁展示座舱、控制接口和冷蓝系统光。`;
  if (variant.includes("武器展开")) return `生成${name}武器展开状态，右臂武器结构清楚，机体设计不改变。`;
  if (variant.includes("武器")) return `生成${name}武器细节参考，机械连接、能量接口和磨损金属清楚。`;
  if (variant.includes("核心")) return `生成${name}胸口核心细节，蓝色能源反应炉、装甲开口和维护痕迹清楚。`;
  if (variant.includes("腿") || variant.includes("脚")) return `生成${name}腿部结构参考，膝关节、液压件、脚掌承重逻辑清楚。`;
  if (variant.includes("战斗")) return `生成${name}战斗姿态，重心压低，有动作张力，但机体结构必须和参考图一致。`;
  if (variant.includes("冲刺")) return `生成${name}冲刺姿态，低重心向前，脚部重量感明确，避免游戏海报感。`;
  if (variant.includes("海报")) return `生成${name}电影海报姿态，弱环境背景，机体清晰，突出真实工业重量。`;
  return `生成${name}的${variant}参考图，保持同一机体设计，只改变角度、状态或局部展示。`;
}

function buildCreatureShortInstruction(name: string, variant: string) {
  if (variant.includes("三视图")) return `生成${name}怪兽三视图，同一只生物正面、侧面、背面并列，身体比例、甲壳结构和尾部轮廓保持一致。`;
  if (variant.includes("完整") || variant.includes("身体") || variant.includes("全身")) return `生成${name}完整身体参考图，轮廓完整，白色甲壳和半透明组织清楚。`;
  if (variant.includes("头")) return `生成${name}头部参考图，结构清晰，古老深海生命感，不要怪兽咆哮。`;
  if (variant.includes("眼")) return `生成${name}眼睛或感知器官特写，湿润反光和半透明膜层清楚。`;
  if (variant.includes("甲壳") || variant.includes("皮肤")) return `生成${name}甲壳细节，裂纹、湿润反光、盐水附着和生物组织边缘清楚。`;
  if (variant.includes("游泳")) return `生成${name}游泳姿态，暗蓝水体中横向推进，轮廓清楚，不要普通鲸鱼。`;
  if (variant.includes("海面") || variant.includes("登陆")) return `生成${name}海面出现画面，身体局部破浪，像寻找方向，不是攻击城市。`;
  if (variant.includes("攻击")) return `生成${name}攻击姿态，身体前压有压迫感，但不要恶魔化或Boss登场。`;
  if (variant.includes("远景")) return `生成${name}远景轮廓，海雾中巨大但边缘可读，远处设施只做尺度参考。`;
  if (variant.includes("海报")) return `生成${name}电影海报姿态，弱海雾背景，古老、脆弱、未知。`;
  return `生成${name}的${variant}参考图，保持同一生物结构，只改变动作、角度或尺度。`;
}

function buildShortReferenceLock(asset: PromptableAsset) {
  if (asset.category === "人物") return "一致性：必须参考上传图片里的同一张脸、发型、年龄、身材和服装，不要换演员。";
  if (asset.category === "机甲") return "一致性：必须参考上传图片里的同一台机甲，颜色、比例、装甲分块和机械结构不要重设计。";
  if (asset.category === "怪兽") return "一致性：必须参考上传图片里的同一只生物，身体比例、甲壳纹理和生命结构不要重设计。";
  return "一致性：必须参考上传图片里的同一资产，只生成指定变体，不要重新设计。";
}

function simplifyBackground(backgroundRule: string) {
  if (backgroundRule.includes("纯白")) return "纯白底，干净技术参考图。";
  if (backgroundRule.includes("白底") || backgroundRule.includes("浅灰")) return "白底或浅灰无影棚，干净，不要复杂环境。";
  if (backgroundRule.includes("海雾")) return "简洁海雾背景，主体清楚。";
  if (backgroundRule.includes("工业") || backgroundRule.includes("机库")) return "浅灰工业简背景，主体清楚。";
  if (backgroundRule.includes("弱环境")) return "弱环境背景，只服务气氛，不抢主体。";
  return "简洁中性背景，主体清楚。";
}

export async function loadAssetStore(): Promise<ManualAssetStore> {
  return readStore();
}

export function getAssetImageStatusFromVersions(versions: ManualAssetVersion[]): ManualImageStatus {
  if (versions.some((version) => version.status === "MASTER_REFERENCE" || String(version.status) === "MASTER")) return "MASTER_REFERENCE";
  if (versions.some((version) => version.status === "APPROVED")) return "APPROVED";
  if (versions.some((version) => version.status === "REVIEW" || String(version.status) === "UPLOADED")) return "REVIEW";
  if (versions.some((version) => version.status === "DRAFT")) return "DRAFT";
  if (versions.some((version) => version.status === "REJECTED")) return "REJECTED";
  if (versions.length > 0) return "REVIEW";
  return "EMPTY";
}

export async function importAssetFiles(asset: MasterAsset, files: FileList | File[]) {
  const validFiles = Array.from(files).filter((file) => SUPPORTED_TYPES.has(file.type));
  if (validFiles.length === 0) return [];

  const store = await readStore();
  const current = store[asset.id] ?? [];
  const prompt = buildAssetImagePrompt(asset);
  const imported: ManualAssetVersion[] = [];

  for (const [index, file] of validFiles.entries()) {
    const versionNumber = current.length + imported.length + index + 1;
    const versionId = `V${String(versionNumber).padStart(3, "0")}`;
    const uploadedAt = new Date().toISOString();
    const dataUrl = await fileToDataUrl(file);
    imported.push({
      versionId,
      fileName: file.name,
      dataUrl,
      mediaType: file.type.startsWith("video/") ? "video" : "image",
      uploadedAt,
      status: "REVIEW",
      checklist: createEmptyChecklist(),
      rating: createEmptyRating(),
      promptVersions: [
        {
          versionId: "Prompt V001",
          prompt,
          reason: "上传素材时自动记录当前 Prompt。",
          createdAt: uploadedAt
        }
      ],
      metadata: {
        asset_id: asset.id,
        category: asset.category,
        character: asset.category === "人物" ? asset.baseName : "",
        scene: asset.category === "场景" ? asset.baseName : "",
        prompt,
        version: versionId,
        reference: asset.referenceStatus,
        usage: [],
        file_name: file.name,
        uploaded_at: uploadedAt
      }
    });
  }

  store[asset.id] = [...current, ...imported];
  await writeStore(store);
  return imported;
}

export async function deleteAssetVersion(assetId: string, versionId: string) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).filter((version) => version.versionId !== versionId);
  if (store[assetId]?.length === 0) delete store[assetId];
  await writeStore(store);
}

export async function deleteAssetVersions(assetId: string) {
  const store = await readStore();
  delete store[assetId];
  await writeStore(store);
}

export async function deleteManyAssetVersions(assetIds: string[]) {
  const store = await readStore();
  assetIds.forEach((assetId) => {
    delete store[assetId];
  });
  await writeStore(store);
}

export async function setMasterVersion(assetId: string, versionId: string) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).map((version) => ({
    ...version,
    status: version.versionId === versionId ? "MASTER_REFERENCE" : version.status === "MASTER_REFERENCE" ? "APPROVED" : version.status
  }));
  await writeStore(store);
}

export async function approveVersion(assetId: string, versionId: string) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).map((version) => ({
    ...version,
    status: version.versionId === versionId ? "APPROVED" : version.status
  }));
  await writeStore(store);
}

export async function rejectVersion(assetId: string, versionId: string) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).map((version) => ({
    ...version,
    status: version.versionId === versionId ? "REJECTED" : version.status
  }));
  await writeStore(store);
}

export async function markRegenerate(assetId: string, versionId: string) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).map((version) => ({
    ...version,
    status: version.versionId === versionId ? "DRAFT" : version.status
  }));
  await writeStore(store);
}

export async function updateChecklist(assetId: string, versionId: string, checklist: ConsistencyChecklist) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).map((version) => (version.versionId === versionId ? { ...version, checklist } : version));
  await writeStore(store);
}

export async function updateRating(assetId: string, versionId: string, rating: AssetRating) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).map((version) => (version.versionId === versionId ? { ...version, rating } : version));
  await writeStore(store);
}

export async function addPromptVersion(assetId: string, versionId: string, prompt: string, reason: string) {
  const store = await readStore();
  store[assetId] = (store[assetId] ?? []).map((version) => {
    if (version.versionId !== versionId) return version;
    const promptVersions = normalizePromptVersions(version);
    return {
      ...version,
      promptVersions: [
        ...promptVersions,
        {
          versionId: `Prompt V${String(promptVersions.length + 1).padStart(3, "0")}`,
          prompt,
          reason: reason.trim() || "手动保存 Prompt 新版本。",
          createdAt: new Date().toISOString()
        }
      ]
    };
  });
  await writeStore(store);
}

export function subscribeManualAssetStore(callback: () => void) {
  window.addEventListener(STORE_EVENT, callback);
  return () => window.removeEventListener(STORE_EVENT, callback);
}

function resolveTemplate(asset: PromptableAsset) {
  const templates = asset.category === "人物" ? characterTemplates : asset.category === "机甲" ? mechaTemplates : asset.category === "怪兽" ? creatureTemplates : [];
  const text = `${asset.variant} ${asset.name} ${asset.tags.join(" ")}`;
  return templates.find((template) => template.aliases.some((alias) => text.includes(alias))) ?? fallbackTemplate(asset);
}

function fallbackTemplate(asset: PromptableAsset): VariantTemplate {
  if (asset.category === "人物") return characterTemplates[0];
  if (asset.category === "机甲") return mechaTemplates[0];
  if (asset.category === "怪兽") return creatureTemplates[0];
  return t([asset.variant], "中性浅灰背景，保持主体清晰，不做复杂剧情环境。", "主体完整，结构清楚，适合后续资产引用。", "母资产参考", "生成标准资产参考图，突出主体形体、材质、比例和世界观一致性。");
}

function getPromptCategory(category: string): PromptCategory {
  if (category === "人物") return "Character Prompt";
  if (category === "机甲") return "Mecha Prompt";
  if (category === "怪兽") return "Creature Prompt";
  return "Asset Prompt";
}

function buildConsistencyLock(asset: PromptableAsset) {
  if (asset.category === "人物") return `${asset.baseName}，同一演员身份、脸型、发型、年龄感、身体比例和服装逻辑；如有 MASTER_REFERENCE，以其为唯一身份来源。`;
  if (asset.category === "机甲") return `${asset.baseName}，同一机体结构、装甲颜色、机械骨架、能源颜色、比例与武器逻辑；赤霆01固定暗红装甲、黑色骨架、蓝色能源。`;
  if (asset.category === "怪兽") return `${asset.baseName}，同一生物结构、甲壳纹理、身体比例、深海生命逻辑和潮湿材质；白潮固定白色生物甲壳与半透明海洋组织。`;
  return "保持当前资产名称、类型、材质和世界观设定不变。";
}

function buildIdentityLock(asset: PromptableAsset) {
  if (asset.baseName === "林舟") return "林舟，23岁男性驾驶员，东方年轻男性窄脸，短黑发，深色眼睛，左眉附近轻微伤痕，深灰驾驶服，克制、疲惫、带恐惧但不软弱。";
  if (asset.baseName === "许燃") return "许燃，24岁女性驾驶员，冷静克制，东方科幻电影人物气质，干净利落发型，深色驾驶服，理性、专注、不偶像化。";
  if (asset.baseName.includes("赤霆")) return "CRT-001 赤霆01，20米级重型工业机甲，暗红装甲，黑色机械骨架，蓝色能源同步光，非动漫、非超级机器人。";
  if (asset.baseName === "白潮") return "白潮，来自潮门另一侧生态的深海生命，白色生物甲壳，半透明海洋组织，巨大、古老、脆弱、未知，不是Boss怪兽。";
  return `${asset.baseName}，保持当前资产身份、比例、材质、颜色和世界观逻辑不变。`;
}

function createEmptyChecklist(): ConsistencyChecklist {
  return { face: false, hair: false, age: false, costume: false, world: false };
}

function createEmptyRating(): AssetRating {
  return { consistency: 0, quality: 0, cinematic: 0, reusable: 0 };
}

export function normalizeChecklist(version: ManualAssetVersion): ConsistencyChecklist {
  return version.checklist ?? createEmptyChecklist();
}

export function normalizeRating(version: ManualAssetVersion): AssetRating {
  return version.rating ?? createEmptyRating();
}

export function normalizePromptVersions(version: ManualAssetVersion): PromptVersion[] {
  return version.promptVersions?.length
    ? version.promptVersions
    : [
        {
          versionId: "Prompt V001",
          prompt: version.metadata?.prompt ?? "",
          reason: "兼容旧版本记录。",
          createdAt: version.uploadedAt
        }
      ];
}

function t(aliases: string[], backgroundRule: string, composition: string, usage: string, prompt: string): VariantTemplate {
  return { aliases, backgroundRule, composition, usage, prompt };
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readStore(): Promise<ManualAssetStore> {
  if (typeof indexedDB === "undefined") return {};
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(STORE_KEY);
    request.onsuccess = () => resolve((request.result as ManualAssetStore | undefined) ?? {});
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function writeStore(store: ManualAssetStore) {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(store, STORE_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
  window.dispatchEvent(new Event(STORE_EVENT));
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
