import type { StoryboardShot } from "../storyboardWorkspace/StoryboardWorkspaceStore";
import { loadMasterVideoShotLinks, loadMasterVideoTemplates } from "../masterVideoLibrary/MasterVideoLibraryStore";

const STORAGE_KEY = "tide-steel-soul-kling-prompts-v2";
const EVENT_NAME = "tide-steel-soul-kling-prompts-change";

export type KlingPromptOverrides = Record<string, string>;

const performanceDirections: Record<string, { expression: string; action: string; voice: string }> = {
  KF01: { expression: "画面无人。", action: "浮标缓慢起伏，远处海纹轻微向中心收束，防线设备正常运行。", voice: "无对白，只保留海风、浪声和远处机械底噪。" },
  KF02: { expression: "画面无人。", action: "水下白影逆浪移动，一片白色甲壳短暂穿过海面后沉下。", voice: "无对白，暴雨声中加入极低的水下压力声。" },
  KF03: { expression: "值班员眼睛仍盯着工作屏幕，眉头没有明显变化，尚未意识到危险。", action: "一名值班员继续输入数据，另一人停下半秒看向突然归零的波形。", voice: "不喊叫；如有交流，只用压低、简短的工作语气说‘再核一次’。" },
  KF04: { expression: "陈牧眉间轻收，眼神从屏幕移向画外监听设备，下颌保持放松，不表现震惊。", action: "他先停笔，右手离开记录板，呼吸放慢，再缓慢侧头倾听。", voice: "不开口；若保留一句指令，用低沉、平稳、没有情绪起伏的语气说‘把原始声道给我’。" },
  KF05: { expression: "林舟惊醒后眼神先失焦半秒，随后迅速看向门外，左眉伤痕附近肌肉轻微绷紧。", action: "他短促吸气，坐起，抓住床边驾驶服外套但没有立刻冲出去。", voice: "不喊叫；收到通讯时只用略沙哑、压住慌乱的短句回答‘收到’。" },
  KF06: { expression: "林舟嘴唇闭合，眉眼紧张，视线始终锁定机库方向。", action: "他沿潮湿通道快步前行，转弯时一手扶过栏杆，步幅真实，衣料和装备有惯性。", voice: "不开口，只保留急促但受控的呼吸与脚步。" },
  KF07: { expression: "画面不强调人物表情，维护人员保持谨慎工作状态。", action: "维护人员从赤霆脚边撤开，巨大腿部液压系统缓慢承重，冷凝水沿装甲落下。", voice: "无对白，以液压、金属受力和维护广播为主。" },
  KF08: { expression: "林舟仰头看舱门时眼睛略微睁大，随后压低视线，肩部紧绷。", action: "背部舱门依次解锁并缓慢开启，林舟站在入口前停顿一拍，没有英雄式跃入。", voice: "林舟不开口；机械提示音保持冷静、短促。" },
  KF09: { expression: "林舟眼神克制，嘴角紧闭，进入前短暂回看身后又立刻收回。", action: "他一手扶住舱门边缘，先迈入一只脚，再把身体重量移入狭窄驾驶舱。", voice: "如有一句话，用很轻、像说给自己听的语气说‘这次别关门’。" },
  KF10: { expression: "许燃眉头轻皱，目光先看断裂波形再看林舟，脸部保持冷静，不翻白眼或夸张焦虑。", action: "她一手按住同步控制器，另一手稳定敲出四拍，身体微微前倾。", voice: "用清晰、短句、均匀节拍说‘跟着我，吸气，停，呼气’，不喊口号。" },
  KF11: { expression: "撤离人员只表现具体紧张：回头确认家人、压低身体、扶住墙面。", action: "冲击通过墙体传入，灯具摇晃，积水形成长波，人群沿标线有序撤离。", voice: "广播以冷静重复的标准语气指示分区撤离，现场不尖叫。" },
  KF12: { expression: "林舟在舱内咬紧后槽牙，眼睛保持睁开；许燃专注看同步数据。", action: "赤霆胸口核心先亮，随后头部传感器点亮，机体因承重轻微下沉。", voice: "林舟用压低声音说‘启动’，许燃以平稳确认语气回答‘同步保持’。" },
  KF13: { expression: "驾驶舱内人物不做胜利表情，林舟视线稳定，许燃持续观察数据。", action: "赤霆低重心走出闸口，每一步经历抬脚、前移、落地承重，海水向外推开。", voice: "对白极少，只保留许燃用平稳语气报告承载数值。" },
  KF14: { expression: "林舟受到冲击时眼睛短暂闭紧，随即重新看向前方；许燃下颌绷紧但不喊叫。", action: "赤霆抬臂防御，白潮局部甲壳与前臂接触，机体后退半步并重新承重。", voice: "林舟短促吐气；许燃用快速但清晰的语气说‘左侧承重下降’。" },
  KF15: { expression: "林舟由攻击专注转为疑惑，眉间放松一点；许燃目光从武器状态移向白潮头部。", action: "赤霆保持防御却停止出拳，白潮靠近后缓慢偏转，双方停留一秒。", voice: "林舟以困惑、低声的语气问‘它为什么停了’，许燃停半拍后回答‘不知道’。" },
  KF16: { expression: "白潮不拟人化，不做愤怒表情；壳片振动表现疼痛和寻找方向。", action: "头颈保持稳定，多层甲壳从前向后发生细微同步振动，周围水纹随低频扩散。", voice: "无人类对白，只保留低频、雨声和金属共振。" },
  KF17: { expression: "画面无人。", action: "悬浮物先停止，再逆向移动；裂缝边缘受压收缩，旧文明几何短暂浮现。", voice: "无对白，只保留深海压力声和极低频脉冲。" },
  KF18: { expression: "黑潮母体不出现人类式眼神，只由感知结构亮度变化表示回应。", action: "黑暗中的环状压力腔缓慢收缩，一处暗红感知结构从暗到亮，周围组织产生微弱连锁反应。", voice: "无对白，最后只留一次低沉脉冲后切断声音。" }
};

export function buildChineseKlingPrompt(shot: StoryboardShot) {
  const direction = performanceDirections[shot.keyframeId] ?? { expression: shot.character === "无" ? "画面无人。" : "人物不做概念化表情；只通过视线停顿、呼吸、肩颈受力和手部动作呈现反应。", action: shot.notes || shot.description, voice: shot.dialogue === "无" ? "不开口，嘴部保持自然闭合。" : `按文本说出：${shot.dialogue}。语速稳定，不喊口号，不做夸张口型。` };
  return buildConciseParagraph(shot, direction);
}

export function loadKlingPromptOverrides(): KlingPromptOverrides {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as KlingPromptOverrides; } catch { return {}; }
}

export function getKlingPrompt(shot: StoryboardShot) {
  const manual = loadKlingPromptOverrides()[shot.id];
  if (manual && !isLegacyVerbosePrompt(manual)) return manual;
  const base = buildChineseKlingPrompt(shot);
  const templateId = loadMasterVideoShotLinks()[shot.id];
  const template = templateId ? loadMasterVideoTemplates().find((item) => item.id === templateId) : null;
  if (!template) return base;
  return `${base} 可参考母资产视频模板${template.id}《${template.name}》的运动节奏，保持${template.camera || "当前镜头"}的拍摄方式和约${template.duration}秒的动作长度，但不要改变本镜头的人物、机甲、场景和情绪。`;
}

export function saveKlingPrompt(shotId: string, prompt: string) {
  const store = loadKlingPromptOverrides();
  store[shotId] = prompt;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function resetKlingPrompt(shotId: string) {
  const store = loadKlingPromptOverrides(); delete store[shotId]; localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeKlingPrompts(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback); window.addEventListener("storage", callback);
  return () => { window.removeEventListener(EVENT_NAME, callback); window.removeEventListener("storage", callback); };
}

function buildConciseParagraph(
  shot: StoryboardShot,
  direction: { expression: string; action: string; voice: string }
) {
  const subject = shot.character && shot.character !== "无"
    ? `画面主体是${shot.character}，${compactSentence(direction.expression)}${compactSentence(direction.action)}`
    : `画面以${shot.environment || "当前场景"}和${shot.title}为主体，${compactSentence(direction.action)}`;
  const camera = `使用${shot.lens || "35mm"}镜头，${shot.shotSize || "中景"}，${shot.camera || "固定机位"}拍摄，摄影机${shot.movement || "缓慢稳定运动"}，起步和停止都要平缓。`;
  const motion = `画面中的人物、机甲、海浪、雨水、灯光和机械结构按真实重量与惯性运动，先有准备，再发生位移和承重反馈，避免所有元素同时匀速运动。`;
  const mood = `整体情绪保持${concreteMood(shot)}，表演克制自然，不要短视频式夸张动作、换脸、乱张嘴、肢体穿模、游戏CG、文字、字幕、logo或水印。`;
  return `${camera}${subject}${environmentMotion(shot)}${motion}${mood}`;
}

function compactSentence(value: string) {
  const clean = value.replace(/\s+/g, "").replace(/。+$/g, "");
  return clean ? `${clean}。` : "";
}

function concreteMood(shot: StoryboardShot) {
  const raw = `${shot.emotion || ""}${shot.description || ""}${shot.title || ""}`;
  if (/紧张|恐惧|危险|警戒|异常|低频|白潮|潮门/.test(raw)) return "压低、紧张、像危险刚被察觉";
  if (/悲伤|伤|疲惫|回忆|召回/.test(raw)) return "疲惫、压住情绪、动作比语言更重";
  if (/启动|赤霆|机甲|战斗|防御|冲击/.test(raw)) return "沉重、有力量但不英雄化";
  if (/未知|规则|海面|杭州湾|正常/.test(raw)) return "安静、克制、让观众感觉规则正在偏移";
  return "克制、真实、有电影压迫感";
}

function environmentMotion(shot: StoryboardShot) {
  if (shot.environment.includes("海") || shot.title.includes("白潮") || shot.title.includes("潮门")) return "海浪、海雾和雨水按风向分层运动，远近速度不同，水体只在受到主体影响后产生反馈。";
  if (shot.environment.includes("基地") || shot.environment.includes("控制") || shot.environment.includes("驾驶")) return "背景只保留冷凝水下落、设备灯节奏变化和少量工作人员自然移动，不让环境抢走主体。";
  return "背景只保留轻微空气、水汽和实景光变化，不抢主体。";
}

function isLegacyVerbosePrompt(prompt: string) {
  const markers = ["画面动作：", "人物表情：", "对白与语气：", "环境运动：", "声音参考：", "运动物理：", "禁止：", "Scene:", "Subject:", "Action:", "Camera:"];
  return markers.filter((marker) => prompt.includes(marker)).length >= 2;
}
