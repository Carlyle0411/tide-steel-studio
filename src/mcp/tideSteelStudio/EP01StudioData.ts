import assetManifest from "../../../projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json";
import { listLocalAssets } from "../localAssetGenerator/LocalAssetManifest";
import { buildEP01SegmentedKlingPrompt } from "../videoWorkspace/EP01SegmentedPrompt";

export type EP01AssetManifest = typeof assetManifest;

export type EP01Keyframe = {
  id: string;
  shot: string;
  title: string;
  purpose: string;
  required_assets: string[];
  status: "planning" | "review" | "approved";
  approved_image?: string;
  draft_image?: string;
  project_image?: string;
  review_gate?: string;
  updatedAt?: string;
  duration?: number;
  shotSize?: string;
  lens?: string;
  movement?: string;
  character?: string;
  environment?: string;
  lighting?: string;
  emotion?: string;
  sound?: string;
  notes?: string;
};

const ep01Keyframes: EP01Keyframe[] = [
  {
    id: "KF01",
    shot: "EP01_SHOT_001",
    title: "外海过分平静",
    purpose: "2047年9月18日清晨，杭州湾外海观测站和远处海防线仍在正常运行，但海面安静得不合常理。",
    required_assets: ["杭州湾海防线", "外海观测站", "浮标阵列"],
    duration: 15,
    shotSize: "远景",
    lens: "24mm",
    movement: "固定机位，极慢推进",
    character: "无",
    environment: "杭州湾外海观测站",
    lighting: "台风前冷灰天光",
    emotion: "不安",
    sound: "小雨、远海、金属轻响",
    notes: "开场建立正常世界，不展示怪兽，不制造灾难片式奇观。"
  },
  {
    id: "KF02",
    shot: "EP01_SHOT_002",
    title: "雨打观测站金属",
    purpose: "雨滴打在观测站外壳上，雨声比海浪更清楚，暗示海面异常安静。",
    required_assets: ["外海观测站", "湿金属材质", "雨天"],
    duration: 15,
    shotSize: "特写",
    lens: "50mm",
    movement: "固定机位",
    character: "无",
    environment: "外海观测站外壳",
    lighting: "冷灰自然光",
    emotion: "压低",
    sound: "雨滴、金属轻响"
  },
  {
    id: "KF03",
    shot: "EP01_SHOT_003",
    title: "杯中水纹反向收缩",
    purpose: "用最小的物理证据告诉观众：世界规则正在改变。",
    required_assets: ["外海观测站", "旧金属杯", "值班桌"],
    duration: 15,
    shotSize: "微距特写",
    lens: "85mm微距",
    movement: "固定焦点",
    character: "值守员",
    environment: "外海观测站值班桌",
    lighting: "冷蓝值班灯",
    emotion: "疑问",
    sound: "杯壁细响、环境声降低",
    notes: "水纹向中心聚拢，不能发光，不能像魔法。"
  },
  {
    id: "KF04",
    shot: "EP01_SHOT_004",
    title: "值守员停下手指",
    purpose: "屏幕没有报警，但人先察觉异常。",
    required_assets: ["外海观测站", "值守员", "监测屏"],
    duration: 15,
    shotSize: "中景",
    lens: "35mm",
    movement: "固定机位",
    character: "值守员",
    environment: "外海观测站内部",
    lighting: "冷蓝屏幕光",
    emotion: "迟疑",
    sound: "手指停顿、低频间隙"
  },
  {
    id: "KF05",
    shot: "EP01_SHOT_005",
    title: "浮标周围反向水纹",
    purpose: "外海出现同样的反向水纹，异常从室内证据变成外部事实。",
    required_assets: ["杭州湾外海", "浮标阵列", "海防线"],
    duration: 15,
    shotSize: "远景转特写",
    lens: "35mm",
    movement: "缓慢推进",
    character: "无",
    environment: "杭州湾外海浮标区",
    lighting: "雨中冷灰天光",
    emotion: "确认",
    sound: "低频脉冲、雨声"
  },
  {
    id: "KF06",
    shot: "EP01_SHOT_006",
    title: "深蓝基地冷蓝指挥中心",
    purpose: "异常进入人类决策空间，陈牧被巨大系统包围。",
    required_assets: ["深蓝基地", "指挥中心", "陈牧"],
    duration: 15,
    shotSize: "远景",
    lens: "24mm",
    movement: "固定机位",
    character: "陈牧",
    environment: "深蓝基地值班指挥区",
    lighting: "冷蓝屏幕光",
    emotion: "克制",
    sound: "通风、电流、远处测试音"
  },
  {
    id: "KF07",
    shot: "EP01_SHOT_007",
    title: "陈牧茶杯水纹",
    purpose: "外海异常进入基地内部，证明这不是单点设备误差。",
    required_assets: ["陈牧", "深蓝基地", "旧茶杯"],
    duration: 15,
    shotSize: "特写",
    lens: "85mm",
    movement: "固定机位",
    character: "陈牧",
    environment: "深蓝基地指挥台",
    lighting: "冷蓝侧光",
    emotion: "警觉",
    sound: "茶杯细响、环境声抽空"
  },
  {
    id: "KF08",
    shot: "EP01_SHOT_008",
    title: "AI澜系统层首次出现",
    purpose: "AI澜第一次出现必须像基地系统，不是助手，也不是人形。",
    required_assets: ["AI澜系统界面", "深蓝基地"],
    duration: 15,
    shotSize: "屏幕特写",
    lens: "50mm",
    movement: "固定机位",
    character: "AI澜系统",
    environment: "深蓝基地指挥屏",
    lighting: "冷蓝系统光",
    emotion: "理性异常",
    sound: "系统声、0.2秒停顿"
  },
  {
    id: "KF09",
    shot: "EP01_SHOT_009",
    title: "旧事故编号 DB-44-0918-A",
    purpose: "埋下三年前事故和林舟伤口，不解释，只让编号留下阴影。",
    required_assets: ["AI澜系统界面", "深蓝基地", "旧事故档案"],
    duration: 15,
    shotSize: "屏幕特写",
    lens: "50mm",
    movement: "短暂停留",
    character: "AI澜系统",
    environment: "深蓝基地档案界面",
    lighting: "冷蓝屏幕光",
    emotion: "旧伤",
    sound: "屏幕电流、短静默"
  },
  {
    id: "KF10",
    shot: "EP01_SHOT_010",
    title: "陈牧听见低频",
    purpose: "陈牧不是迷信经验，而是真的听见了系统忽略的差异。",
    required_assets: ["陈牧", "深蓝基地", "声呐监听设备"],
    duration: 15,
    shotSize: "近景",
    lens: "50mm",
    movement: "缓慢推进",
    character: "陈牧",
    environment: "深蓝基地监听位",
    lighting: "冷蓝侧光",
    emotion: "沉重判断",
    sound: "极低脉冲、耳机细响"
  },
  {
    id: "KF11",
    shot: "EP01_SHOT_011",
    title: "控制台双重确认",
    purpose: "关闭观测闸不是按按钮，而是一次会唤醒基地的选择。",
    required_assets: ["陈牧", "控制台", "深蓝基地"],
    duration: 15,
    shotSize: "手部特写",
    lens: "85mm",
    movement: "固定机位",
    character: "陈牧",
    environment: "外海观测闸远程控制台",
    lighting: "冷蓝屏幕光",
    emotion: "无法撤回",
    sound: "控制台确认音、短暂停顿"
  },
  {
    id: "KF12",
    shot: "EP01_SHOT_012",
    title: "外海观测闸关闭",
    purpose: "EP01视觉高潮。陈牧关闭的不只是一扇闸门，也像在面对一个过去的错误。",
    required_assets: ["观测闸", "杭州湾外海", "海防线"],
    duration: 15,
    shotSize: "中远景",
    lens: "24mm",
    movement: "固定机位",
    character: "无",
    environment: "外海观测闸",
    lighting: "雨中工程灯",
    emotion: "沉重",
    sound: "金属咬合、海水流下、短静默"
  },
  {
    id: "KF13",
    shot: "EP01_SHOT_013",
    title: "基地蓝色预警灯亮起",
    purpose: "关闭完成后，基地不是混乱，而是被逐步叫醒。",
    required_assets: ["深蓝基地", "蓝色预警灯", "走廊"],
    duration: 15,
    shotSize: "中景",
    lens: "35mm",
    movement: "固定机位",
    character: "工作人员",
    environment: "深蓝基地走廊",
    lighting: "蓝色预警灯",
    emotion: "醒来",
    sound: "短促提示音、走廊电流声"
  },
  {
    id: "KF14",
    shot: "EP01_SHOT_014",
    title: "赤霆背部舱门关闭",
    purpose: "伏笔EP02，只展示背部舱门和湿冷装甲，不展示完整机甲。",
    required_assets: ["赤霆01背部", "深蓝基地", "机库"],
    duration: 15,
    shotSize: "中远景",
    lens: "50mm",
    movement: "固定机位",
    character: "赤霆01局部",
    environment: "赤霆机库深处",
    lighting: "蓝色预警光",
    emotion: "危险被唤醒",
    sound: "舱门闭合、液压锁"
  },
  {
    id: "KF15",
    shot: "EP01_SHOT_015",
    title: "海面水纹继续扩大",
    purpose: "最后的问题：不是怪兽来了，而是某个生命已经听见人类回应。",
    required_assets: ["杭州湾外海", "浮标阵列", "观测闸"],
    duration: 15,
    shotSize: "远景转特写",
    lens: "35mm",
    movement: "缓慢推进",
    character: "无",
    environment: "观测闸关闭后的外海",
    lighting: "低云雨光",
    emotion: "未知靠近",
    sound: "远海低频、雨声、无音乐"
  }
].map((item) => ({
  ...item,
  status: "planning" as const,
  review_gate: "ep01_official_script_locked",
  updatedAt: "2026-07-14T00:00:00.000Z"
}));

export function getEP01AssetManifest(): EP01AssetManifest {
  return assetManifest;
}

export function getEP01Keyframes(): EP01Keyframe[] {
  return ep01Keyframes;
}

export function getTideSteelStudioStats() {
  const localAssets = listLocalAssets();
  const keyframes = getEP01Keyframes();
  const assetProgress = {
    characters: countGenerated(assetManifest.characters),
    mechas: countGenerated(assetManifest.mechas),
    creatures: countGenerated(assetManifest.creatures),
    environment: countGenerated(assetManifest.environment),
    keyframes: {
      done: keyframes.filter((item) => item.approved_image || item.draft_image).length,
      total: keyframes.length
    },
    klingPrompts: {
      done: keyframes.length,
      total: keyframes.length
    }
  };

  return {
    localAssets: localAssets.length,
    assetProgress,
    reviewAssets: localAssets.filter((asset) => asset.status === "review").length,
    approvedAssets: localAssets.filter((asset) => asset.status === "approved").length
  };
}

export function buildEP01KlingPrompt(keyframe: EP01Keyframe) {
  return buildEP01SegmentedKlingPrompt(keyframe, keyframe.required_assets);
}

export function buildAllEP01KlingPrompts() {
  return getEP01Keyframes().map((keyframe) => ({
    shot: keyframe.shot,
    title: keyframe.title,
    prompt: buildEP01KlingPrompt(keyframe)
  }));
}

function countGenerated(items: Array<{ assets: string[]; generated: string[] }>) {
  const total = items.reduce((sum, item) => sum + item.assets.length, 0);
  const done = items.reduce((sum, item) => sum + item.generated.length, 0);
  return { done, total };
}
