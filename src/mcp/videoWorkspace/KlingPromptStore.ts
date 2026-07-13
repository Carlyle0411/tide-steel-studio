import type { StoryboardShot } from "../storyboardWorkspace/StoryboardWorkspaceStore";
import { loadMasterVideoShotLinks, loadMasterVideoTemplates } from "../masterVideoLibrary/MasterVideoLibraryStore";
import { buildEP01SegmentedKlingPrompt, isEP01PromptShot } from "./EP01SegmentedPrompt";

const STORAGE_KEY = "tide-steel-soul-kling-prompts-v3-ep01-official";
const EVENT_NAME = "tide-steel-soul-kling-prompts-change";

export type KlingPromptOverrides = Record<string, string>;

type AngleProfile = {
  name: string;
  shotSize: string;
  lens: string;
  camera: string;
  movement: string;
  use180Rule?: boolean;
  use30Rule?: boolean;
};

const ANGLE_PROFILES: Record<string, AngleProfile> = {
  worldWide: {
    name: "广角世界建立镜头",
    shotSize: "远景",
    lens: "24mm",
    camera: "稳定地面机位，不站在上帝视角，海洋占据画面主要面积",
    movement: "极慢推进或完全固定，只让环境细节自己发生变化"
  },
  anomalyMacro: {
    name: "物理异常微距镜头",
    shotSize: "微距特写",
    lens: "85mm微距",
    camera: "贴近物体的固定机位，焦点锁在异常细节上",
    movement: "不移动镜头，只让水纹、仪表或金属震动产生变化"
  },
  spielbergReveal: {
    name: "斯皮尔伯格式发现镜头",
    shotSize: "中近景到远景",
    lens: "35mm或50mm",
    camera: "先停在人或环境反应上，再让未知物进入画面",
    movement: "缓慢推进或轻微横移，先给反应，再给发现"
  },
  lowHero: {
    name: "低机位仰视出场",
    shotSize: "全景或局部全景",
    lens: "35mm",
    camera: "低机位仰视，靠近地面，强调重量和尺度",
    movement: "跟随承重方向缓慢移动，落脚、开舱或抬臂要有惯性"
  },
  wormScale: {
    name: "虫眼尺度镜头",
    shotSize: "局部全景",
    lens: "24mm",
    camera: "极低机位贴近地面向上看，让普通结构产生巨大压迫感",
    movement: "轻微后退或固定等待主体压入画面"
  },
  rearMystery: {
    name: "背面神秘视角",
    shotSize: "中景或中远景",
    lens: "35mm",
    camera: "从角色背后或侧后方拍摄，让观众和角色一起面对未知",
    movement: "稳定跟随，不抢在角色前面揭示答案"
  },
  environmentFollow: {
    name: "环境跟拍出场",
    shotSize: "中景",
    lens: "35mm",
    camera: "人物侧后方或肩部高度，边跟拍边交代空间",
    movement: "稳定跟拍，脚步、衣料、水滴和背景灯光按真实节奏变化"
  },
  dialogueTwoShot: {
    name: "双人中景对话",
    shotSize: "双人中景",
    lens: "35mm或50mm",
    camera: "保持人物之间的空间关系清晰",
    movement: "轻微横移或固定，表演靠视线、呼吸和手部动作推进",
    use180Rule: true
  },
  overShoulder: {
    name: "过肩反打",
    shotSize: "中近景",
    lens: "50mm",
    camera: "从一名角色肩后看向另一名角色，保留肩部前景",
    movement: "固定或极慢推进，强化两人关系和压力",
    use180Rule: true,
    use30Rule: true
  },
  highPressure: {
    name: "俯拍压迫镜头",
    shotSize: "中远景",
    lens: "35mm",
    camera: "从略高位置向下拍摄，让结构、命令或环境压过人物",
    movement: "缓慢下压或固定停留，制造控制感"
  },
  dutchUnease: {
    name: "斜角不安镜头",
    shotSize: "中景或特写",
    lens: "35mm或50mm",
    camera: "水平线轻微倾斜，幅度克制，只用于规则失衡的瞬间",
    movement: "短促但平稳的偏移，不做眩晕式晃动"
  },
  povImmersion: {
    name: "POV沉浸镜头",
    shotSize: "主观视角",
    lens: "35mm",
    camera: "从人物视线或驾驶舱视角观看外部，不暴露无来源机位",
    movement: "跟随呼吸、转头或设备震动产生轻微运动"
  },
  groundTrack: {
    name: "地面跟拍动作镜头",
    shotSize: "低角度中景",
    lens: "35mm",
    camera: "贴近地面跟随移动主体，保留脚步、水花和障碍物",
    movement: "快速但可读的跟拍，速度变化有起步和刹停"
  },
  waistOrbit: {
    name: "腰高环绕对峙镜头",
    shotSize: "中景",
    lens: "50mm",
    camera: "腰部高度围绕主体半圈，先读清武器或手部，再读清对峙关系",
    movement: "克制环绕，避免炫技式旋转"
  },
  lockedSystem: {
    name: "系统固定镜头",
    shotSize: "特写或中近景",
    lens: "50mm",
    camera: "固定正视或轻微侧视，像监控、界面或工作台真实存在的机位",
    movement: "镜头不动，变化来自界面延迟、灯光节奏和人物停顿"
  }
};

export function buildChineseKlingPrompt(shot: StoryboardShot) {
  const profile = chooseAngleProfile(shot);
  if (isEP01PromptShot(shot)) return buildEP01SegmentedKlingPrompt(shot);
  return buildConciseKlingParagraph(shot, profile);
}

export function loadKlingPromptOverrides(): KlingPromptOverrides {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as KlingPromptOverrides;
  } catch {
    return {};
  }
}

export function getKlingPrompt(shot: StoryboardShot) {
  const manual = loadKlingPromptOverrides()[shot.id];
  if (manual && !isLegacyVerbosePrompt(manual)) return manual;

  const base = buildChineseKlingPrompt(shot);
  const templateId = loadMasterVideoShotLinks()[shot.id];
  const template = templateId ? loadMasterVideoTemplates().find((item) => item.id === templateId) : null;
  if (!template) return base;

  return `${base} 可参考母资产视频模板 ${template.id}《${template.name}》的运动节奏，只借用它的镜头速度和动作长度，不改变本镜头的人物身份、机甲结构、场景布局和情绪方向。`;
}

export function saveKlingPrompt(shotId: string, prompt: string) {
  const store = loadKlingPromptOverrides();
  store[shotId] = prompt;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function resetKlingPrompt(shotId: string) {
  const store = loadKlingPromptOverrides();
  delete store[shotId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeKlingPrompts(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

function buildConciseKlingParagraph(shot: StoryboardShot, profile: AngleProfile) {
  const identity = buildIdentityLine(shot);
  const action = buildActionLine(shot);
  const environment = buildEnvironmentLine(shot);
  const performance = buildPerformanceLine(shot);
  const rule180 = profile.use180Rule ? " 如果涉及对话或反打，保持180度轴线，人物左右关系不能跳变。" : "";
  const rule30 = profile.use30Rule ? " 后续剪辑切换角度时，机位变化保持大于30度，避免跳切感。" : "";

  return [
    `采用${profile.name}：${profile.shotSize}，${shot.lens || profile.lens}，${profile.camera}。`,
    `摄影机${shot.movement || profile.movement}，运动要有起步、停顿和重量反馈。`,
    identity,
    action,
    environment,
    performance,
    `${rule180}${rule30} 禁止换脸、乱改机甲结构、怪兽漂移、夸张表演、短视频抖动、游戏CG、文字、字幕、logo、水印。`
  ].filter(Boolean).join("");
}

function chooseAngleProfile(shot: StoryboardShot): AngleProfile {
  const text = searchableText(shot);

  if (has(text, ["杯", "水纹", "低频", "波形", "仪表", "声音先消失", "规则改变"])) return ANGLE_PROFILES.anomalyMacro;
  if (has(text, ["ai澜", "hud", "界面", "系统", "0.7", "延迟", "数据"])) return ANGLE_PROFILES.lockedSystem;
  if (has(text, ["驾驶舱", "舱门", "进入", "启动", "视角"])) return ANGLE_PROFILES.povImmersion;
  if (has(text, ["赤霆", "机甲", "落脚", "站立", "开舱", "核心", "启动"])) return ANGLE_PROFILES.lowHero;
  if (has(text, ["脚", "巨人", "尺度", "压入", "承重"])) return ANGLE_PROFILES.wormScale;
  if (has(text, ["链刃", "武器", "对峙", "拔刀", "拳头", "防御"])) return ANGLE_PROFILES.waistOrbit;
  if (has(text, ["奔跑", "追逐", "撤离", "通道", "冲刺", "穿过"])) return ANGLE_PROFILES.groundTrack;
  if (has(text, ["背影", "门", "等待", "未知", "回头", "召回"])) return ANGLE_PROFILES.rearMystery;
  if (has(text, ["陈牧", "许燃", "林舟", "发现", "察觉", "看见", "听见", "意识到", "第一次"])) return ANGLE_PROFILES.spielbergReveal;
  if (has(text, ["对白", "争执", "搭档", "同步", "关系", "拉回"])) return ANGLE_PROFILES.overShoulder;
  if (has(text, ["命令", "压迫", "关闭", "闸门", "防线", "控制", "代价"])) return ANGLE_PROFILES.highPressure;
  if (has(text, ["失衡", "异常", "警报", "危险", "不安"])) return ANGLE_PROFILES.dutchUnease;
  if (has(text, ["海洋", "杭州湾", "海防线", "城市", "远景", "防线"])) return ANGLE_PROFILES.worldWide;
  if (has(text, ["白潮", "潮兽", "潮门", "裂口", "海面出现", "完整形体"])) return ANGLE_PROFILES.spielbergReveal;
  return ANGLE_PROFILES.environmentFollow;
}

function buildIdentityLine(shot: StoryboardShot) {
  const character = cleanValue(shot.character);
  if (!character || character === "无" || character.toLowerCase() === "none") {
    return "画面无人时，不要突然加入角色，只让环境、设备、海水或机甲按镜头逻辑运动。";
  }
  if (character.includes("林舟")) return "林舟必须保持同一张脸、短黑发、左眉附近轻微伤痕和深灰驾驶服，动作带克制的紧张感。";
  if (character.includes("许燃")) return "许燃必须保持冷静、克制的王牌驾驶员状态，眼神先读数据再看人，动作准确但不机械。";
  if (character.includes("陈牧")) return "陈牧保持50岁左右海防指挥官形象，灰黑短发、疲惫眼神、深蓝灰制服，反应先是停顿和倾听，不是震惊。";
  if (character.toLowerCase().includes("ai") || character.includes("澜")) return "AI澜不出现人形表情，只用冷蓝界面、排序延迟和光标停顿表现判断变化。";
  return `${character}保持已审核母资产中的同一身份、脸型、服装和年龄感，不要换演员。`;
}

function buildActionLine(shot: StoryboardShot) {
  const text = searchableText(shot);
  if (has(text, ["杯", "水纹"])) return "画面动作集中在杯中水面：水纹从边缘缓慢向中心聚拢，杯子、桌面和背景保持不动，让异常显得真实而微小。";
  if (has(text, ["白潮", "潮兽"])) return "白潮只通过海浪、白色甲壳局部、低频震动和水体位移出现，不做怪兽式咆哮，不完整摆拍。";
  if (has(text, ["赤霆", "机甲"])) return "赤霆的运动必须先有机械准备，再有承重位移，装甲、液压、雨水和蒸汽按真实重量反馈变化。";
  if (has(text, ["潮门", "裂口"])) return "潮门表现为深海压力边界和生物组织般的入口，水体逆流、悬浮物停顿，不能像传送门或紫色能量裂缝。";
  if (has(text, ["陈牧"])) return "陈牧先停下手中动作，再转头倾听或看向设备，反应要慢半拍，让观众相信他比系统更早察觉异常。";
  if (has(text, ["林舟"])) return "林舟的动作先犹豫再执行，呼吸压住，手部和肩颈先紧起来，不能拍成热血冲锋。";
  if (has(text, ["许燃"])) return "许燃用具体操作表达判断：看数据、停半拍、按下控制器或转向林舟，表情克制。";
  return `画面动作围绕“${shot.description || shot.title}”展开，主体运动清楚、节奏克制，先让观众看懂空间，再看懂变化。`;
}

function buildEnvironmentLine(shot: StoryboardShot) {
  const environment = cleanValue(shot.environment) || "当前场景";
  const text = searchableText(shot);
  if (has(text, ["海", "杭州湾", "防线", "白潮", "潮门"])) {
    return `${environment}中的海浪、海雾、雨水和远处机械灯光分层运动，远近速度不同，海洋始终比人造防线更大。`;
  }
  if (has(text, ["基地", "指挥", "机库", "驾驶舱", "通道"])) {
    return `${environment}只保留冷蓝工作灯、湿金属反光、少量设备闪烁和背景人员的自然动作，不让环境抢走主体。`;
  }
  return `${environment}保持真实空间关系，背景只做轻微空气、水汽和光线变化。`;
}

function buildPerformanceLine(shot: StoryboardShot) {
  const dialogue = cleanValue(shot.dialogue);
  const emotion = cleanValue(shot.emotion);
  if (dialogue && dialogue !== "无") {
    return `如果出现说话，语气要低、短、稳，嘴型自然，停顿比音量更重要；情绪通过眼神停顿、呼吸、肩颈受力和手部动作表现。`;
  }
  if (emotion) {
    return `画面情绪是${emotion}，但不要抽象表演，只用视线、姿态、动作迟疑、环境声缺失和运动速度表达。`;
  }
  return "画面情绪保持克制、真实、有压迫感，不用夸张表情制造戏剧效果。";
}

function searchableText(shot: StoryboardShot) {
  return [
    shot.id,
    shot.keyframeId,
    shot.title,
    shot.description,
    shot.character,
    shot.environment,
    shot.camera,
    shot.movement,
    shot.emotion,
    shot.notes,
    shot.sound
  ].join(" ").toLowerCase();
}

function has(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function cleanValue(value?: string) {
  return (value ?? "").trim();
}

function isLegacyVerbosePrompt(prompt: string) {
  if (prompt.includes("15秒可灵智能分镜")) return false;
  const markers = ["画面动作：", "人物表情：", "对白与语气：", "环境运动：", "声音参考：", "运动物理：", "禁止：", "Scene:", "Subject:", "Action:", "Camera:", "Motion Physics:", "Reference Rule:"];
  return prompt.includes("时长：5秒") || markers.filter((marker) => prompt.includes(marker)).length >= 2;
}
