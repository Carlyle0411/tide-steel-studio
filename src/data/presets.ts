import { CharacterProfile, ProjectType } from "../types";

export const projectTypeLabels: Record<ProjectType, string> = {
  mecha: "机甲科幻",
  pet: "宠物IP短剧",
  fashion: "女装品牌广告",
  healing: "情绪治愈短片",
  product: "产品宣传片",
  custom: "自定义项目"
};

export const projectPresets: Record<ProjectType, string[]> = {
  mecha: ["未来海岸", "巨型机甲", "工业细节", "电影感", "高对比光影", "真实金属"],
  pet: ["萌宠短剧", "拟人动作", "轻喜剧", "温暖日常", "角色一致", "表情丰富"],
  fashion: ["高级女装", "东方克制", "自然织物", "柔和光线", "品牌质感", "预约制服务"],
  healing: ["情绪流动", "治愈", "诗意空镜", "微风", "低饱和", "内心独白"],
  product: ["商业广告", "产品特写", "卖点演绎", "干净背景", "精致布光", "节奏清晰"],
  custom: ["电影感", "高质感", "统一角色", "清晰叙事", "稳定构图"]
};

export const defaultCharacters: CharacterProfile[] = [
  {
    id: "amo",
    name: "阿墨",
    type: "宠物IP",
    appearance: "黑白奶牛猫，左耳有缺口，左侧嘴角下方有固定黑色爱心印记，琥珀金色眼睛。",
    personality: "刚入社会的猫咪，善良、乐观、略倒霉，有一点无辜感。",
    signatureFeatures: "左耳缺口、嘴角黑色爱心印记、琥珀金色眼睛。",
    outfitsProps: "略旧歪斜学士帽，背书包。",
    commonScenes: "出租屋、咖啡馆、办公室、城市街角、雨天公交站。",
    forbiddenChanges: "不能改变左耳缺口、爱心印记和眼睛颜色。",
    promptTemplate: "黑白奶牛猫阿墨，左耳缺口，嘴角黑色爱心印记，琥珀金色眼睛，歪斜学士帽，背书包，善良乐观略倒霉。",
    tags: ["阿墨", "猫咪", "宠物IP"],
    note: "适合轻喜剧、打工猫、治愈短剧。",
    lockedTags: "black and white tuxedo cat, nicked left ear, black heart mark near mouth, amber golden eyes, tilted graduation cap, small backpack",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "chiting-01",
    name: "赤霆01",
    type: "机甲",
    appearance: "修长高比例机甲，黄金比例，不臃肿，外形有速度感和战斗感。",
    personality: "可靠、克制、强韧，带有近未来工业秩序感。",
    signatureFeatures: "背部隐藏式驾驶舱，工业机械细节强。",
    outfitsProps: "装甲、推进器、机械关节、隐藏式背部驾驶舱。",
    commonScenes: "未来海岸防线、深蓝基地、雨夜战场、海底废墟、机库启动区。",
    forbiddenChanges: "驾驶舱不能在头部、胸部或正中间，机体不能臃肿。",
    promptTemplate: "赤霆01，修长高比例机甲，隐藏式背部驾驶舱，黄金比例，不臃肿，强工业机械细节，速度感和战斗感。",
    tags: ["赤霆01", "机甲", "潮汐钢魂"],
    note: "机体比例要修长，避免玩具感和厚重臃肿外观。",
    lockedTags: "tall elegant mecha, hidden rear cockpit, long golden-ratio silhouette, non-bulky armor, industrial mechanical details",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "guihuatang",
    name: "桂花糖",
    type: "品牌",
    appearance: "高级女装品牌视觉，温柔、克制、东方感、高级感、长期主义。",
    personality: "安静、耐心、有审美判断，强调私人搭配服务和长期陪伴。",
    signatureFeatures: "门店空间、试衣镜、衣服细节、女性松弛感、预约制精品女装店。",
    outfitsProps: "高级女装、自然织物、东方细节、精致衣架、柔和门店灯光。",
    commonScenes: "预约制门店、试衣镜前、服装细节台、安静街区、私人搭配空间。",
    forbiddenChanges: "不要廉价网红风，不要夸张快时尚，不要过度堆叠装饰。",
    promptTemplate: "桂花糖高级女装品牌，温柔克制，东方感，高级感，预约制私人搭配服务，门店空间，衣服细节，女性松弛感。",
    tags: ["桂花糖", "女装", "品牌广告"],
    note: "适合品牌广告、门店宣传、预约制服务叙事。",
    lockedTags: "premium womenswear brand, gentle restraint, modern oriental sensibility, long-termism, appointment-only private styling",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const defaultAssetGroups = [
  "角色图",
  "场景图",
  "故事版"
];

export const projectAssetGroupPresets: Record<ProjectType, string[]> = {
  mecha: defaultAssetGroups,
  pet: defaultAssetGroups,
  fashion: defaultAssetGroups,
  healing: defaultAssetGroups,
  product: defaultAssetGroups,
  custom: defaultAssetGroups
};
