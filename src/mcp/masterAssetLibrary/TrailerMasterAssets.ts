type TrailerAssetSeed = {
  id: string;
  slug: string;
  name: string;
  baseName: string;
  category: string;
  variant: string;
  description: string;
  priority: "P0" | "P1" | "P2";
};

const seeds: TrailerAssetSeed[] = [
  // P0: identity and structure locks.
  s("TRAILER-CHAR-LINZHOU-001", "linzhou", "林舟", "人物", "标准头像", "锁定林舟面部、年龄、左眉伤痕与克制气质。", "P0"),
  s("TRAILER-CHAR-LINZHOU-002", "linzhou", "林舟", "人物", "核心三视图", "同一人物正面、侧面、背面并列，作为预告片唯一身份Reference。", "P0"),
  s("TRAILER-CHAR-LINZHOU-003", "linzhou", "林舟", "人物", "驾驶服全身", "完整展示深灰驾驶服、身体比例、靴子与同步接口。", "P0"),
  s("TRAILER-CHAR-LINZHOU-004", "linzhou", "林舟", "人物", "驾驶舱坐姿", "锁定林舟在赤霆驾驶舱中的坐姿、双手位置与肩颈受力。", "P0"),
  s("TRAILER-CHAR-LINZHOU-005", "linzhou", "林舟", "人物", "工业通道奔跑", "林舟带着恐惧冲向机库，不是英雄式奔跑。", "P2"),
  s("TRAILER-CHAR-LINZHOU-006", "linzhou", "林舟", "人物", "同步疼痛近景", "左肩神经反馈失控时的克制疼痛，用于驾驶舱特写。", "P2"),

  s("TRAILER-CHAR-XURAN-001", "xuran", "许燃", "人物", "标准头像", "锁定许燃面部、发型、年龄与冷静克制气质。", "P0"),
  s("TRAILER-CHAR-XURAN-002", "xuran", "许燃", "人物", "核心三视图", "同一人物正面、侧面、背面并列，服装结构完全一致。", "P0"),
  s("TRAILER-CHAR-XURAN-003", "xuran", "许燃", "人物", "驾驶服全身", "完整展示许燃驾驶服、同步设备与身体比例。", "P0"),
  s("TRAILER-CHAR-XURAN-004", "xuran", "许燃", "人物", "副同步位工作姿态", "锁定许燃在副同步位的坐姿、手部位置和设备关系。", "P0"),
  s("TRAILER-CHAR-XURAN-005", "xuran", "许燃", "人物", "数拍同步", "许燃用手指稳定数拍并把林舟从失控边缘拉回。", "P2"),

  s("TRAILER-CHAR-CHENMU-001", "chenmu", "陈牧", "人物", "标准头像", "锁定陈牧疲惫眼神、短灰黑发与长期值守形成的沉稳。", "P0"),
  s("TRAILER-CHAR-CHENMU-002", "chenmu", "陈牧", "人物", "指挥制服半身", "展示深蓝灰海防制服、盐雾痕迹与自然工作状态。", "P0"),
  s("TRAILER-CHAR-CHENMU-003", "chenmu", "陈牧", "人物", "侧听异常", "系统显示正常时，陈牧停下动作侧听低频。", "P2"),

  s("TRAILER-MECHA-CHITING01-001", "chiting01", "赤霆01", "机甲", "核心三视图", "正面、侧面、背面并列，锁定暗红装甲、黑色骨架与蓝色能源。", "P0"),
  s("TRAILER-MECHA-CHITING01-002", "chiting01", "赤霆01", "机甲", "完整正面", "标准比例完整正面，用于所有预告镜头结构校验。", "P0"),
  s("TRAILER-MECHA-CHITING01-003", "chiting01", "赤霆01", "机甲", "完整背面", "锁定背部装甲、驾驶舱舱门、推进器和维修接口。", "P0"),
  s("TRAILER-MECHA-CHITING01-004", "chiting01", "赤霆01", "机甲", "驾驶舱开启", "背部舱门液压开启，结构可信，不做英雄出场。", "P0"),
  s("TRAILER-MECHA-CHITING01-005", "chiting01", "赤霆01", "机甲", "驾驶舱内部", "同步座椅、控制接口、冷蓝系统光和狭窄工程空间。", "P0"),
  s("TRAILER-MECHA-CHITING01-006", "chiting01", "赤霆01", "机甲", "右臂链刃细节", "锁定链刃折叠结构、机械锁扣和蓝白等离子接口。", "P0"),
  s("TRAILER-MECHA-CHITING01-007", "chiting01", "赤霆01", "机甲", "左臂战损", "左臂液压失压、装甲破损与白烟状态，结构不能改变。", "P0"),
  s("TRAILER-MECHA-CHITING01-008", "chiting01", "赤霆01", "机甲", "首次站立", "赤霆脚掌压入机库积水，强调承重与工程代价。", "P2"),
  s("TRAILER-MECHA-CHITING01-009", "chiting01", "赤霆01", "机甲", "拳头撑墙", "巨大拳头支撑海防墙，撤离车辆从指缝下通过。", "P2"),
  s("TRAILER-MECHA-CHITING01-010", "chiting01", "赤霆01", "机甲", "链刃点亮", "链刃逐节锁定后出现克制的蓝白等离子边缘。", "P2"),
  s("TRAILER-MECHA-CHITING01-011", "chiting01", "赤霆01", "机甲", "链刃熄灭与拳头松开", "同一右臂结构，武器熄灭后拳头主动松开。", "P2"),
  s("TRAILER-MECHA-CHITING01-012", "chiting01", "赤霆01", "机甲", "暴雨低重心冲锋", "重型机甲穿过海防闸口，每一步都保留重量和水体反馈。", "P2"),

  s("TRAILER-CREATURE-WHITETIDE-001", "white_tide", "白潮", "怪兽", "核心三视图", "同一深海生命正面、侧面、背面并列，锁定身体与甲壳结构。", "P0"),
  s("TRAILER-CREATURE-WHITETIDE-002", "white_tide", "白潮", "怪兽", "完整身体", "完整轮廓、白色生物甲壳与半透明组织，不像鲸鱼或恐龙。", "P0"),
  s("TRAILER-CREATURE-WHITETIDE-003", "white_tide", "白潮", "怪兽", "头部结构", "头部与感知器官设计，古老、脆弱、未知，不做咆哮。", "P0"),
  s("TRAILER-CREATURE-WHITETIDE-004", "white_tide", "白潮", "怪兽", "甲壳细节", "湿润甲壳、裂纹、盐水附着和半透明组织边缘。", "P0"),
  s("TRAILER-CREATURE-WHITETIDE-005", "white_tide", "白潮", "怪兽", "游泳姿态", "深海压力环境中的横向推进，不使用鱼类摆尾逻辑。", "P0"),
  s("TRAILER-CREATURE-WHITETIDE-006", "white_tide", "白潮", "怪兽", "海雾局部显现", "只露出水下白影与一片破浪甲壳，不出现完整身体。", "P2"),
  s("TRAILER-CREATURE-WHITETIDE-007", "white_tide", "白潮", "怪兽", "暴雨完整尺度", "完整轮廓只被闪电短暂勾出，赤霆作为比例参照。", "P2"),
  s("TRAILER-CREATURE-WHITETIDE-008", "white_tide", "白潮", "怪兽", "停在赤霆前", "拥有致命距离却偏转，不攻击、不示好。", "P2"),
  s("TRAILER-CREATURE-WHITETIDE-009", "white_tide", "白潮", "怪兽", "低鸣壳片振动", "低频回应时壳片细微震动，表现疼痛与方向寻找。", "P2"),

  // P1: world locks.
  s("TRAILER-ENV-OCEANWALL-001", "ocean_wall", "杭州湾海防线", "场景", "阴天正常世界", "秩序仍在，海洋大于防线，远处海纹只有轻微异常。", "P1"),
  s("TRAILER-ENV-OCEANWALL-002", "ocean_wall", "杭州湾海防线", "场景", "暴雨警戒", "同一海防结构进入暴雨警戒，禁止重新设计建筑。", "P1"),
  s("TRAILER-ENV-OCEANWALL-003", "ocean_wall", "杭州湾海防线", "场景", "夜间防线", "夜间灯光、海雾和浮标阵列，避免霓虹城市感。", "P1"),
  s("TRAILER-ENV-DEEPBLUE-001", "deep_blue_base", "深蓝基地", "场景", "赤霆机库", "运行三十年的湿冷工业机库，包含维护平台和重型升降结构。", "P1"),
  s("TRAILER-ENV-DEEPBLUE-002", "deep_blue_base", "深蓝基地", "场景", "指挥中心", "冷蓝系统光、观察窗、监听位和真实工作密度。", "P1"),
  s("TRAILER-ENV-DEEPBLUE-003", "deep_blue_base", "深蓝基地", "场景", "驾驶员工业通道", "狭窄潮湿通道，用于林舟奔向机库的跟拍镜头。", "P1"),
  s("TRAILER-ENV-DEEPBLUE-004", "deep_blue_base", "深蓝基地", "场景", "赤霆维修平台", "赤霆背部维修平台、液压设备、盐雾和积水。", "P1"),
  s("TRAILER-ENV-TIDEGATE-001", "tide_gate", "潮门", "场景", "海底压力边界远景", "潮门不是传送门，像冰川裂缝与生物组织共同受压。", "P1"),
  s("TRAILER-ENV-TIDEGATE-002", "tide_gate", "潮门", "场景", "边界逆流近景", "悬浮物停止后逆向移动，低饱和、真实深海压力。", "P1"),
  s("TRAILER-ENV-TIDEGATE-003", "tide_gate", "潮门", "场景", "旧文明几何浮现", "旧文明几何沿边界短暂浮现，不出现紫色能量或虫洞。", "P1"),
  s("TRAILER-ENV-EVACUATION-001", "evacuation_route", "海防撤离通道", "场景", "墙内道路", "海防墙内侧道路、积水、维护灯与撤离标识。", "P1"),
  s("TRAILER-ENV-EVACUATION-002", "evacuation_route", "海防撤离通道", "场景", "撤离车辆", "低矮工程撤离车辆，车灯可从赤霆指缝下通过。", "P1"),
  s("TRAILER-ENV-EVACUATION-003", "observation_gate", "巨型观测闸", "场景", "关闭状态", "巨大闸门缓慢关闭，最后一条海光消失，人物很小。", "P1"),

  s("TRAILER-PROP-LAN-001", "lan_interface", "AI澜系统", "道具", "冷蓝标准界面", "非人形冷蓝系统界面、低频波形与判断路径。", "P1"),
  s("TRAILER-PROP-LAN-002", "lan_interface", "AI澜系统", "道具", "0.7秒排序异常", "攻击建议延迟0.7秒出现，禁止AI少女与人脸。", "P2")
];

export const trailerMasterAssets = seeds.map((seed) => ({
  id: seed.id,
  slug: seed.slug,
  name: `${seed.baseName} / ${seed.variant}`,
  baseName: seed.baseName,
  category: seed.category,
  variant: seed.variant,
  description: seed.description,
  status: "待上传",
  version: "V001",
  referenceStatus: seed.priority === "P0" ? "待建立核心Reference" : "引用P0母资产",
  imagePath: "",
  metadataPath: `projects/tide-steel-soul/master-asset-library/generated/${seed.id}.json`,
  tags: [seed.priority, "90秒预告片", seed.category, seed.baseName, seed.variant, "预告优先", "母资产"],
  promptId: `PROMPT-${seed.id}`,
  klingPromptId: `KLING-${seed.id}`,
  videoTemplateIds: [],
  usageCount: 0,
  firstUse: "90秒概念预告片",
  updatedAt: "2026-07-11T00:00:00.000+08:00"
}));

function s(
  id: string,
  slug: string,
  baseName: string,
  category: string,
  variant: string,
  description: string,
  priority: TrailerAssetSeed["priority"]
): TrailerAssetSeed {
  return { id, slug, name: `${baseName} / ${variant}`, baseName, category, variant, description, priority };
}
