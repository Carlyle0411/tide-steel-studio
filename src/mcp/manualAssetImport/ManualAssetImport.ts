import type { MasterAsset } from "../masterAssetLibrary/MasterAssetLibraryData";
import { applyAssetContentOverride, getAssetContentOverride } from "../masterAssetLibrary/AssetContentOverrideStore";

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
  const override = getAssetContentOverride(asset.id);
  const effectiveAsset = applyAssetContentOverride(asset as MasterAsset) as PromptableAsset;
  const template = resolveTemplate(effectiveAsset);
  const promptCategory = getPromptCategory(effectiveAsset.category);
  const assetType = `${effectiveAsset.baseName} / ${effectiveAsset.variant}`;
  const identityLock = override.identityLock?.trim() || buildIdentityLock(effectiveAsset);
  const consistencyLock = buildConsistencyLock(effectiveAsset);
  const details = {
    backgroundRule: override.backgroundRule?.trim() || template.backgroundRule,
    composition: override.composition?.trim() || template.composition,
    usage: override.usage?.trim() || template.usage,
    assetRequirement: override.assetRequirement?.trim() || template.prompt,
    cameraRule: override.cameraRule?.trim() || cameraRule,
    materialRule: override.materialRule?.trim() || materialRule,
    negativePrompt: override.negativePrompt?.trim() || negativePrompt
  };
  const fullPrompt = buildReferenceFirstPrompt(effectiveAsset, details, identityLock);

  return {
    assetType,
    promptCategory,
    backgroundRule: details.backgroundRule,
    composition: details.composition,
    usage: details.usage,
    identityLock,
    assetRequirement: details.assetRequirement,
    cameraRule: details.cameraRule,
    materialRule: details.materialRule,
    consistencyLock,
    negativePrompt: details.negativePrompt,
    fullPrompt
  };
}

export function buildAssetImagePrompt(asset: PromptableAsset) {
  return buildAssetPromptDetails(asset).fullPrompt;
}

export function getPromptStatus(asset: MasterAsset): ManualPromptStatus {
  return buildAssetImagePrompt(asset).trim() ? "READY" : "MISSING";
}

function buildReferenceFirstPrompt(
  asset: PromptableAsset,
  details: Pick<AssetPromptDetails, "backgroundRule" | "composition" | "cameraRule" | "materialRule" | "negativePrompt" | "assetRequirement">,
  identityLock: string
) {
  const template = t([asset.variant], details.backgroundRule, details.composition, "", details.assetRequirement);
  const variantInstruction = buildShortVariantInstruction(asset, template);
  return [
    `固定身份锁定：${identityLock}以我上传的${asset.baseName}图片作为唯一Reference，${buildShortReferenceLock(asset)}`,
    `画面内容：生成“${asset.variant}”。${variantInstruction}补充要求：${details.assetRequirement}`,
    `构图要求：${details.composition}`,
    `摄影要求：${details.cameraRule}`,
    `材质要求：${details.materialRule}`,
    `背景要求：${details.backgroundRule}`,
    `${details.negativePrompt.startsWith("Negative Prompt") ? details.negativePrompt : `Negative Prompt：${details.negativePrompt}`}`
  ].join("\n");
}

function buildShortVariantInstruction(asset: PromptableAsset, template: VariantTemplate) {
  const variant = asset.variant;
  const name = asset.baseName;
  if (asset.category === "人物") return buildCharacterShortInstruction(name, variant);
  if (asset.category === "机甲") return buildMechaShortInstruction(name, variant);
  if (asset.category === "怪兽") return buildCreatureShortInstruction(name, variant);
  if (asset.category === "场景") return buildEnvironmentShortInstruction(name, variant, asset.description);
  if (asset.category === "道具") return buildPropShortInstruction(name, variant, asset.description);
  return `${template.prompt}`;
}

function buildCharacterShortInstruction(name: string, variant: string) {
  if (variant.includes("三视图") || variant.includes("360")) return `${name}同一人物的正面、左侧面、背面全身并列，三个人像等高，站姿、脸、发型和服装完全一致。`;
  if (variant.includes("角色卡")) return `${name}头肩正面、半身正面和服装局部组合在一张图中，面部无遮挡，清楚显示年龄、发型、伤痕与服装领口。`;
  if (variant.includes("驾驶服全身")) return `${name}穿固定驾驶服正面站立，完整显示头部、手套、同步接口、裤装和靴子，双脚入画。`;
  if (variant.includes("驾驶舱坐姿") || variant.includes("副同步位工作姿态")) return `${name}坐入同步座椅，背部贴靠，双手分别放在左右控制器，完整显示头部、上身、手和膝部。`;
  if (variant.includes("头像")) return `${name}头肩正面肖像，双眼与五官清晰，完整保留发型、年龄感、伤痕和服装领口。`;
  if (variant.includes("45") || variant.includes("侧脸")) return `${name}头部向右转约45度，清楚显示眼形、鼻梁、颧骨、下颌线和耳廓。`;
  if (variant.includes("全身正面") || variant === "全身") return `${name}正面自然站立，完整显示身体比例、服装、手套、装备挂点和双脚。`;
  if (variant.includes("全身侧面")) return `${name}完整左侧面站立，清楚显示身体轮廓、服装厚度、背部装备和鞋靴。`;
  if (variant.includes("全身背面") || variant.includes("背影")) return `${name}背对镜头完整站立，不回头，清楚显示后脑、肩背、腰部装备、裤装和靴底。`;
  if (variant.includes("半身") || variant.includes("制服半身")) return `${name}腰部以上正面工作肖像，双手自然入画，清楚显示脸、肩部和制服结构。`;
  if (variant.includes("坐姿")) return `${name}坐在简洁工业椅上，背部微紧，双脚落地，双手自然放在膝部，完整显示坐姿受力。`;
  if (variant.includes("驾驶姿态") || variant.includes("驾驶姿势")) return `${name}穿驾驶服坐入同步座，身体微向前，双手握住控制器，视线看向前方仪表。`;
  if (variant.includes("工业通道奔跑") || variant.includes("奔跑") || variant.includes("跑步")) return `${name}向画面右前方奔跑，身体前倾，一脚离地，手臂自然摆动，脸和服装保持不变。`;
  if (variant.includes("行走")) return `${name}从左向右迈步，前脚即将落地，身体重心前移，手臂与衣料呈自然运动状态。`;
  if (variant.includes("站姿")) return `${name}双脚自然分开站立，双臂放松垂下，完整显示正面身体比例和服装结构。`;
  if (variant.includes("同步疼痛") || variant.includes("受伤") || variant.includes("流血")) return `${name}中近景，左肩因同步反馈绷紧，面部克制疼痛，可见少量真实伤痕，不喊叫、不摆英雄姿势。`;
  if (variant.includes("数拍同步")) return `${name}坐在副同步位，一手按住控制器，另一手清楚敲出节拍，目光看向搭档。`;
  if (variant.includes("侧听异常")) return `${name}停下手中动作，头部轻转向画外监听设备，表情沉稳，只表现察觉异常的瞬间。`;
  if (variant.includes("愤怒")) return `${name}中近景克制愤怒，眉眼收紧、下颌绷住、嘴唇闭合，不咆哮。`;
  if (variant.includes("悲伤")) return `${name}中近景沉默悲伤，眼神下落、眼眶微红，面部不夸张扭曲。`;
  if (variant.includes("沉默") || variant.includes("凝视")) return `${name}中近景看向画外，嘴部闭合，肩颈微僵，留出视线方向的负空间。`;
  if (variant.includes("微笑")) return `${name}中近景轻微自然微笑，只改变嘴角与眼神，不做商业偶像表情。`;
  if (variant.includes("不同光线")) return `${name}同一头肩肖像四格并列，分别使用自然日光、基地冷蓝光、警报红光和雨夜反射光。`;
  if (variant.includes("不同天气")) return `${name}同一半身姿态四格并列，分别呈现晴天、海雾、小雨和暴雨，人物身份与服装不变。`;
  if (variant.includes("不同镜头")) return `${name}同一服装与状态的广角全身、中景半身、长焦近景三格并列，人物身份完全一致。`;
  if (variant.includes("海报")) return `${name}全身站立于弱工业海防背景，主体轮廓清晰，画面一侧保留片名负空间。`;
  return `${name}${variant}：${name}作为唯一主体，清楚呈现该状态，脸、年龄、发型和服装不变。`;
}

function buildMechaShortInstruction(name: string, variant: string) {
  if (variant.includes("三视图")) return `${name}同一机体的正面、左侧面、背面全身并列，三台机体等高，装甲分块、关节位置和颜色完全对应。`;
  if (variant.includes("正面")) return `${name}完整正面站立，双脚入画，清楚显示头部、胸甲、双臂、腿部关节和脚掌承重结构。`;
  if (variant.includes("侧面")) return `${name}完整左侧面站立，清楚显示机体厚度、背部装置、膝踝关节和脚掌重心。`;
  if (variant.includes("背")) return `${name}完整背面站立，清楚显示背部装甲、驾驶舱舱门、推进器、脊柱骨架和维修接口。`;
  if (variant.includes("俯视")) return `从高处45度俯视${name}完整机体，清楚显示肩甲、背部、头顶、手臂和脚部相对比例。`;
  if (variant.includes("驾驶舱开启")) return `${name}背部驾驶舱液压开启，清楚显示舱门厚度、锁扣、入口、同步座椅和冷蓝舱内光。`;
  if (variant.includes("驾驶舱内部") || variant.includes("驾驶舱")) return `${name}驾驶舱内部正视图，清楚显示同步座椅、左右控制器、约束装置、舱壁和冷蓝界面。`;
  if (variant.includes("链刃熄灭")) return `${name}右臂链刃刚刚熄灭，机械拳头松开，雨水沿冷却金属指节流下。`;
  if (variant.includes("链刃点亮")) return `${name}右臂链刃逐节锁定，边缘出现克制的蓝白等离子光，锁扣与机械连接清楚。`;
  if (variant.includes("拳头撑墙")) return `${name}巨大左拳支撑正在变形的海防墙，一辆撤离车从指缝下通过，机体承重姿态清楚。`;
  if (variant.includes("左臂战损")) return `${name}左臂装甲破裂、液压管受损并冒少量白汽，其他机体结构完整不变。`;
  if (variant.includes("首次站立")) return `${name}脚掌压入机库浅水，机体刚完成承重站立，水被重量向四周推开。`;
  if (variant.includes("武器展开") || variant.includes("武器")) return `${name}右臂武器完整展开，清楚显示折叠机构、导轨、锁扣、能源接口和与手臂的连接。`;
  if (variant.includes("核心")) return `${name}胸口核心近距离结构图，蓝色反应炉位于暗红装甲开口内，可见玻璃保护层和维护痕迹。`;
  if (variant.includes("腿") || variant.includes("脚")) return `${name}单侧腿部与脚掌结构特写，清楚显示膝关节、液压杆、踝部连接和接地面积。`;
  if (variant.includes("推进器")) return `${name}背部推进器结构特写，清楚显示推进口、散热鳍片、连接件和海盐腐蚀。`;
  if (variant.includes("开机")) return `${name}保持待机站姿，胸口核心与头部传感器依次亮起蓝光，装甲结构不变化。`;
  if (variant.includes("待机")) return `${name}双脚承重站立、双臂自然下垂，武器收纳，能源仅保留微弱蓝光。`;
  if (variant.includes("冲刺") || variant.includes("冲锋")) return `${name}低重心向右前方冲刺，一脚落地承重、另一脚后蹬，重型机体不飞行。`;
  if (variant.includes("跳跃")) return `${name}刚离开地面的起跳瞬间，双腿仍保持重型机械受力，推进器只提供短时辅助。`;
  if (variant.includes("攻击") || variant.includes("战斗")) return `${name}降低重心进入攻击准备，右臂武器朝画面外，双脚稳定承重，完整机体清晰可读。`;
  if (variant.includes("受伤") || variant.includes("战损")) return `${name}保持完整站姿，局部装甲破裂、擦伤、液压泄漏和少量白汽，核心结构仍可辨认。`;
  if (variant.includes("夜景")) return `${name}完整站在夜间海防平台，暗红装甲由冷蓝工作灯勾边，机体结构仍清晰。`;
  if (variant.includes("暴雨")) return `${name}完整站在暴雨中，雨水沿装甲和骨架流下，脚部积水反射蓝色能源光。`;
  if (variant.includes("海面")) return `${name}站在浅海防御平台，海水到脚踝附近，远处防线只作尺度参照。`;
  if (variant.includes("海报")) return `${name}完整低机位站立于弱海防背景，机体清晰，画面一侧保留片名负空间。`;
  return `${name}${variant}：完整清楚呈现该结构或状态，装甲分块、颜色、比例和武器位置不变。`;
}

function buildCreatureShortInstruction(name: string, variant: string) {
  if (variant.includes("三视图")) return `${name}同一生物的正面、左侧面、背面完整并列，三幅等高，头部、甲壳、躯干和尾部结构完全对应。`;
  if (variant.includes("完整") || variant.includes("身体") || variant.includes("全身") || variant === "正面") return `${name}完整身体入画，清楚显示头部、躯干、白色甲壳、半透明组织和主要运动结构。`;
  if (variant.includes("头") || variant.includes("近景")) return `${name}头部占画面主体，清楚显示甲壳边缘、呼吸结构、感知器官和湿润组织，不张嘴咆哮。`;
  if (variant.includes("嘴")) return `${name}口部结构特写，清楚显示闭合状态、甲壳边缘与内部柔软组织，不做獠牙怪物。`;
  if (variant.includes("眼")) return `${name}眼睛或感知器官微距，清楚显示半透明膜层、冷光反射和附着盐水。`;
  if (variant.includes("甲壳") || variant.includes("皮肤")) return `${name}甲壳局部微距，清楚显示白色硬壳、细小裂纹、湿润反光和半透明组织连接处。`;
  if (variant.includes("游泳")) return `${name}完整侧身在暗蓝水中横向推进，身体保持深海受压形态，不使用普通鱼类或鲸类摆尾姿势。`;
  if (variant.includes("海雾局部")) return `海雾和暴雨中只出现${name}的水下白影与一片破浪甲壳，不显示完整身体。`;
  if (variant.includes("海面") || variant.includes("登陆")) return `${name}从灰蓝海面缓慢破浪抬升，甲壳带水，身体朝向海防线但不攻击。`;
  if (variant.includes("停在赤霆前")) return `${name}头部停在赤霆驾驶舱前方，随后略向侧面偏转，双方保持危险距离，不示好。`;
  if (variant.includes("低鸣")) return `${name}头颈与甲壳近景，低鸣时多层壳片发生细微同步振动，身体不攻击。`;
  if (variant.includes("攻击")) return `${name}身体向前压低，主要运动结构发力，形成明确攻击趋势，但完整生物结构保持清楚。`;
  if (variant.includes("怒吼")) return `${name}头部抬起发出低频鸣叫，甲壳片振动，不使用张开巨口的怪兽咆哮姿势。`;
  if (variant.includes("远景")) return `${name}完整巨大轮廓位于海雾深处，远处海防设施只作为尺度参照，主体边缘可辨。`;
  if (variant.includes("死亡")) return `${name}身体失去支撑漂浮于海面，甲壳暗淡、组织停止运动，不使用血腥肢解。`;
  if (variant.includes("受伤") || variant.includes("战损")) return `${name}局部甲壳破裂并露出半透明组织，动作迟缓，身体总体结构保持完整。`;
  if (variant.includes("海底")) return `${name}完整身体位于深海压力环境，贴近海底缓慢移动，悬浮物表现水流方向。`;
  if (variant.includes("暴雨")) return `${name}巨大身体在暴雨海面部分显露，闪电只勾出甲壳轮廓，海防设施作为尺度参照。`;
  if (variant.includes("夜晚")) return `${name}在夜间海雾中显露完整轮廓，探照灯只照亮局部湿润甲壳。`;
  if (variant.includes("海报")) return `${name}完整轮廓置于弱海雾背景，主体清楚，画面一侧保留片名负空间。`;
  return `${name}${variant}：清楚呈现该动作或局部结构，身体比例、甲壳纹理和感知器官不变。`;
}

function buildEnvironmentShortInstruction(name: string, variant: string, description: string) {
  const view = variant.includes("远景") ? "24mm远景，完整显示地平线、主体建筑和周边尺度。" : variant.includes("近景") ? "35mm近景，显示入口、结构接缝、设备和人物尺度。" : "35mm平视广角，完整显示空间结构与前中后景。";
  if (variant.includes("标准平面")) return `${name}标准空间参考图，正视呈现主要建筑、道路、平台和海岸位置关系，结构清楚，不加入剧情事件。`;
  if (variant.includes("灯光参考")) return `${name}同一固定机位的灯光参考，清楚显示主光、工作灯、反射面和暗部层次，不改变建筑结构。`;
  if (variant.includes("白天")) return `${name}白天状态，阴天自然光，建筑、道路、海面与工业设备清晰可读。${view}`;
  if (variant.includes("黄昏")) return `${name}黄昏状态，低角度冷暖交界光照亮建筑边缘，工作灯刚刚开启。${view}`;
  if (variant.includes("夜") || variant.includes("警戒")) return `${name}夜间状态，冷蓝工作灯照明主要通道和结构，远处仅少量警戒红光。${view}`;
  if (variant.includes("暴雨")) return `${name}暴雨状态，低云、斜向雨线、积水反射和湿金属清楚，建筑结构保持可辨。${view}`;
  if (variant.includes("雾")) return `${name}浓海雾状态，前景结构清楚，中景逐渐消失，远景仅保留轮廓和尺度灯。${view}`;
  return `${name}的${variant}状态：${description}${view}`;
}

function buildPropShortInstruction(name: string, variant: string, description: string) {
  if (variant.includes("标准")) return `${name}单体完整展示，正面略转30度，清楚显示外形、接口、尺寸比例和功能部件。`;
  if (variant.includes("手持")) return `${name}被戴机械手套的手自然握持，清楚显示手与道具的尺寸、握持位置和操作方向。`;
  if (variant.includes("使用中")) return `${name}处于实际工作状态，指示灯或机械部件按功能开启，操作者手部位置清楚。`;
  if (variant.includes("磨损")) return `${name}保持完整可用，表面出现边缘掉漆、细划痕、盐雾残留和经常握持形成的磨耗。`;
  if (variant.includes("特写")) return `${name}关键功能区域微距特写，清楚显示按钮、接口、材质接缝和使用痕迹。`;
  return `${name}${variant}：${description}清楚显示主体、功能结构和真实使用尺度。`;
}

function buildShortReferenceLock(asset: PromptableAsset) {
  if (asset.category === "人物") return "同一张脸、年龄、发型、身材和服装，不换演员。";
  if (asset.category === "机甲") return "同一台机甲，颜色、比例、装甲分块、关节和武器不变。";
  if (asset.category === "怪兽") return "同一只生物，身体比例、甲壳纹理和器官位置不变。";
  if (asset.category === "场景") return "同一地点，建筑结构、道路、设备位置和尺度不变。";
  if (asset.category === "道具") return "同一件道具，外形、颜色、接口和功能结构不变。";
  return "主体设计不变。";
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
  if (asset.category === "场景") return t([asset.variant], "真实杭州湾工业环境，不增加无关建筑或霓虹。", "空间层次清楚，地平线稳定，主要结构不被裁切。", "场景母资产", asset.description);
  if (asset.category === "道具") return t([asset.variant], "浅灰无影棚或弱工业工作台背景。", "单体居中，完整显示外形和功能结构。", "道具母资产", asset.description);
  return t([asset.variant], "简洁中性背景。", "主体完整清晰。", "母资产参考", asset.description);
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
  const locks: Record<string, string> = {
    林舟: "林舟，23岁中国男性驾驶员，窄长脸，清晰下颌线，深色眼睛，短而略乱的黑发，左眉外侧有一道浅伤痕；身形精瘦结实，肩部略紧。固定穿深灰黑海防驾驶服，哑光织物、黑色护颈、胸前同步接口与少量使用磨损。气质克制、疲惫、警觉，不是偶像或热血英雄。",
    许燃: "许燃，24岁中国女性王牌驾驶员，鹅蛋形窄脸，深色眼睛，眉形利落，黑发低束并收紧碎发；身形匀称有训练感，站姿稳定。固定穿深蓝灰驾驶服，冷灰护颈、细窄同步线路和简洁功能腰带。气质理性、专注、克制，不做时尚妆容或偶像化造型。",
    陈牧: "陈牧，约50岁中国男性海防指挥官，方中带长的脸型，短灰黑发，额头与眼角有自然皱纹，眼下轻度疲惫，深色沉稳眼神；中等结实体型。固定穿使用多年的深蓝灰海防指挥制服，肩部低调识别条、磨旧领口与轻微盐雾痕迹。不是将军、反派或超级英雄。",
    唐小满: "唐小满，22岁中国女性机械维修师，圆中带窄的年轻脸型，深色眼睛，短黑发或低束工作发，面部带少量机油与汗水；身形灵活结实。固定穿深灰维修连体服，卷起袖口、橙红工具标记、护膝、机械手套与工具腰包。气质敏捷、真诚、有压力下的幽默感，不做可爱动漫化处理。",
    AI澜: "AI澜没有人类肉身和固定人脸。唯一形态是冷蓝半透明系统界面：细密低频波形、分层判断路径、克制的几何网格和0.7秒排序延迟标记；界面使用窄线、低亮度蓝白光，不出现少女头像、五官、身体、发丝或拟人表情。她的人性只通过信息顺序变化表现。",
    赤霆01: "CRT-001赤霆01，20米级重型工业人形机甲，宽肩、短颈、厚胸腔、长前臂与粗壮承重腿，整体重心偏低；固定暗红分块装甲、黑色外露机械骨架、冷蓝能源同步光。背部设隐藏驾驶舱与双侧液压舱门，右臂固定折叠式等离子链刃。装甲有海盐腐蚀、维修焊痕和旧战损，不得改成纤细超级机器人。",
    玄鲸03: "玄鲸03，24米级黑蓝重型远程支援机甲，躯干宽厚、肩部低平、双腿像海上平台支柱，背部搭载长条雷达与远程火控阵列；固定黑蓝装甲、深灰骨架、低亮青蓝能源。武器集中于肩背和前臂远程系统，不持英雄式大剑，不改变海上部署型稳定轮廓。",
    白鸢07: "白鸢07，约12米级白灰轻型侦察机甲，窄躯干、长腿、折叠式肩背翼面与小型矢量推进器；固定白灰陶瓷装甲、深灰关节、淡蓝传感器光。轮廓轻但仍是可信军事机械，主要承担侦察与高速机动，不增加华丽翅膀、羽毛或动漫飞行器造型。",
    白潮: "白潮，来自潮门另一侧生态的巨型深海生命，身体不是鲸鱼、恐龙或昆虫；整体呈流线但非对称的压力适应结构，头部低而宽，背部覆盖层叠白色生物甲壳，甲壳带细小冷蓝裂纹，关节处连接半透明海洋组织。表面始终潮湿并附着盐水，巨大、古老、脆弱、迷失，不是Boss或人类宠物。",
    刺潮: "刺潮，中大型群居深海生命，身体扁长，前端为楔形感知结构，背部排列向后倾斜的灰白压力骨刺，腹侧为半透明游动膜；固定冷灰甲壳、暗蓝组织和微弱蓝绿感知光。运动依靠身体与膜层协同，不使用昆虫腿、恐龙四肢或恶魔尖角。",
    黑潮母体: "黑潮母体是上一轮文明控制潮汐失败后遗留的巨大生物系统，不是单一怪兽女王；主体由深黑矿化甲壳、受污染的半透明组织、多层环状压力腔和失控管线状神经束构成，内部偶见暗红冷光。规模接近海底建筑，形态沉重、病变、缓慢，不出现王冠、五官化表情或邪恶Boss姿态。",
    杭州湾2042: "2042杭州湾未来城市边缘由低矮工业城区、未来港口、巨型海防墙、观测塔、浮标阵列和维护平台组成；建筑使用冷灰混凝土、深蓝金属、厚玻璃与耐盐结构，长期受潮并有锈蚀水痕。天际线克制，海洋始终占更大尺度，不出现霓虹商业高楼或赛博朋克街区。",
    杭州湾海防线: "杭州湾海防线由连续巨型防波墙、分段观测闸、低矮观测塔、浮标阵列和海上工业平台构成；固定冷灰混凝土主体、深蓝耐盐金属、橙白安全标记与长期海盐腐蚀。所有视图必须保持墙体分段、塔位和平台关系一致，海洋尺度大于人造防线。",
    未来港口: "未来港口是杭州湾海防体系的工业运输节点，固定包含重型吊机、低矮仓储体、维护栈桥、船坞、轨道运输线与厚重防浪结构；材料为冷灰钢材、混凝土和耐盐玻璃，表面潮湿磨损。不是商业游艇码头，不增加霓虹招牌或洁净科幻大厅。",
    深蓝基地: "深蓝基地是运行约30年的半地下海洋防御工程，固定使用深蓝灰金属墙、粗大承重梁、厚玻璃观察窗、外露管线、维护平台和积水排沟；空间低矮厚重、湿冷、有盐雾与维修痕迹。建筑尺度和通道逻辑必须连续，不出现光洁白色太空站或豪华科幻大厅。",
    驾驶舱: "赤霆驾驶舱位于机体背部，空间狭窄，固定包含中央同步座椅、左右机械控制器、肩背约束装置、神经同步接口、厚重舱壁和冷蓝低亮系统界面；金属表面磨损并有冷凝水。没有透明全景座舱、方向盘、彩色游戏HUD或宽敞豪华内饰。",
    控制室: "深蓝基地控制室固定由阶梯式工作位、低亮冷蓝监控界面、监听设备、厚玻璃海面观察窗、顶部管线和中央指挥通道构成；设备密集但可操作，空间使用深蓝金属、黑色面板与磨旧地面。保持真实值守状态，不做空旷指挥大厅或炫技全息空间。",
    维修区: "深蓝基地维修区固定包含重型升降架、液压机械臂、检修栈桥、工具台、吊装轨道、排水沟和局部赤红安全标记；主体材料为磨损钢材、油污混凝土与潮湿防滑板。设备位置服务真实维修流程，不变成汽车车库或洁净实验室。",
    地下通道: "深蓝基地地下通道狭窄而纵深，固定使用拱形承重结构、深蓝灰金属墙、外露管线、防水门、地面排水槽和间隔冷白维护灯；墙面有凝露、盐痕和编号磨损。通道只容纳人员与小型维修车，不出现霓虹商业装饰。",
    海底裂缝: "海底裂缝不是发光传送门，而是高压海床上的巨大生态边界：黑色岩层与冰川般断面交错，边缘连接半透明生物组织，周围悬浮物和水流出现逆向运动；颜色固定为低饱和深蓝、冷灰和微弱生物冷光，不出现紫色能量环、闪电或虫洞。",
    潮门: "潮门是未知海洋生态系统与地球发生连接的高压边界，不是空间门；固定呈现冰川裂缝般的断面、受压生物组织边缘、逆向水流、停滞悬浮物和偶尔浮现的旧文明几何。整体低饱和深蓝冷灰，规模巨大但光线微弱，禁止紫色能量、圆形传送门和闪电。",
    能源塔: "能源塔是杭州湾防线的海洋工程供能设施，固定为粗壮分段塔身、外露维护环、冷却管、耐盐护板和低亮蓝色状态灯；底部与防浪平台相连，材料为冷灰金属与混凝土，表面有雨痕和腐蚀。不是摩天楼、魔法水晶或霓虹地标。",
    废墟: "海底旧文明废墟由巨大几何石质构件、矿化金属、被海洋生物覆盖的通道和局部失效机械结构组成；比例远大于人类，形态克制、磨损、半埋于沉积物。颜色为深蓝、冷灰、黑色矿化层，不出现完整宫殿、古典雕像或发光宝藏。",
    避难所: "杭州湾避难所位于海防墙内侧，固定包含厚重防水门、低矮混凝土大厅、分区床位、医疗点、物资架、应急灯和清晰疏散通道；材料耐用、磨损、潮湿但保持秩序。不是末日脏乱营地，也不是洁净未来酒店。",
    海防撤离通道: "海防撤离通道位于巨型防线内侧，固定由双车道防滑路面、冷灰墙体、顶部维护管线、排水槽、间隔应急灯和厚重分区门组成；只允许低矮工程撤离车辆通行。结构潮湿、有积水反射和盐雾磨损，不出现城市商业街。",
    巨型观测闸: "巨型观测闸是海防墙中的重型可关闭结构，固定包含多层冷灰金属闸板、巨型液压导轨、机械锁、厚玻璃观测带和两侧维护平台；关闭时最后一条海光从中央缝隙消失。人物在其前方必须显得很小，不增加飞船舱门或华丽能量屏障。",
    驾驶头盔: "2042海防驾驶头盔采用深灰哑光复合壳体、黑色软质护颈、透明窄幅面罩、两侧同步接口和低亮蓝色状态灯；轮廓贴合头部，边缘有轻微掉漆和盐雾痕迹。不是摩托车头盔、宇航员圆盔或彩色游戏装备。",
    控制器: "深蓝基地标准控制器为双手可操作的深灰工业设备，固定包含防滑握把、实体压力键、蓝色窄屏、机械保险拨片、腕带接口和耐水接缝；尺寸约等于成人前臂宽度，表面有使用磨损。不是游戏手柄、手机或纯触控玻璃板。",
    机械手套: "海防机械手套由黑灰耐磨织物、分节金属指骨、掌心压力传感片、腕部锁扣和细窄蓝色同步线路组成；五指比例接近真实人手，可完成精细操作，关节有油污和磨损。不是钢铁侠手套、拳套或夸张机械爪。",
    身份卡: "深蓝基地身份卡为窄长耐水复合卡片，固定使用深蓝灰底、嵌入式金属芯片、低亮状态条、磨损边缘和挂绳孔；不在生成图片中出现可读姓名或大段文字，只保留抽象识别区。不是银行卡、手机屏幕或发光透明玻璃片。",
    终端: "海防便携终端为厚边框深灰工业平板，固定包含防水实体按键、低亮冷蓝屏幕、侧边接口、橡胶护角和可拆腕带；屏幕只显示简洁波形与几何状态，不出现密集乱码。表面有雨痕和磨损，不是消费级平板。",
    AI核心: "AI澜核心是封闭在防压玻璃与黑色金属框架中的非人形计算单元，固定包含多层冷蓝数据环、中央低亮晶格、液冷管线和机械隔离锁；没有人脸、身体或少女全息影像。体量约为大型服务器柜核心模块，材质真实且有维护痕迹。",
    AI澜系统: "AI澜系统只以冷蓝透明界面出现，固定包含低频波形、分层判断路径、细线几何网格、少量白色节点和可见的0.7秒排序延迟；界面低亮、克制、可操作，不出现人物头像、少女形态、五官、霓虹粒子或复杂游戏HUD。",
    能源电池: "海防能源电池为可更换的重型长方体模块，固定包含深灰耐压外壳、蓝色低亮能量观察窗、双侧机械提手、底部锁定轨和黄色安全接点；边角有撞击磨损与盐雾腐蚀。不是发光水晶、普通汽车电池或玩具能量罐。"
  };
  return locks[asset.baseName] ?? `${asset.baseName}的名称、整体轮廓、尺寸比例、颜色、材质、功能结构和标志细节必须与上传Reference完全一致，不增加新部件，不改变设计来源。`;
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
