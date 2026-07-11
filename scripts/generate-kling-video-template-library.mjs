import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "projects", "tide-steel-soul", "kling-video-template-library");
const now = "2026-07-10T00:00:00.000+08:00";

const negative = "anime, cartoon, game render, fake physics, plastic materials, over-saturated neon, random character face, changed mech design, wrong creature anatomy, jittery short-video camera, text, logo, watermark, subtitle";

const cameraMoves = [
  "slow push in",
  "slow pull back",
  "low angle tracking",
  "handheld restrained follow",
  "wide locked-off frame",
  "crane rise",
  "horizontal dolly",
  "subtle orbit",
  "telephoto compression",
  "first-person controlled movement"
];

const atmosphere = [
  "rain and steam",
  "cold blue base light",
  "red emergency light",
  "sea fog",
  "deep ocean low frequency pressure",
  "night wet metal reflection",
  "dawn haze",
  "storm wind",
  "quiet interior tension",
  "salt mist and industrial noise"
];

const templateGroups = [
  {
    category: "人物动作",
    prefix: "KL-HUMAN",
    count: 30,
    subjects: ["林舟", "许燃", "陈牧", "唐小满", "AI澜界面"],
    actions: [
      "站在驾驶舱入口前停住",
      "穿过深蓝基地走廊",
      "回头看向警报灯",
      "低头调整驾驶手套",
      "坐入驾驶舱",
      "抬头听见低频信号",
      "在雨中奔跑",
      "伸手触碰冷蓝界面",
      "压住情绪保持沉默",
      "在指挥中心做出决定"
    ]
  },
  {
    category: "机甲动作",
    prefix: "KL-MECHA",
    count: 40,
    subjects: ["赤霆01", "玄鲸03", "白鸢07"],
    actions: [
      "反应炉逐级点亮",
      "背部驾驶舱闭合",
      "肩甲液压锁扣咬合",
      "在机库中待机",
      "从维修平台缓慢起身",
      "右臂等离子链刃启动",
      "在暴雨中迈出第一步",
      "低机位冲刺",
      "落地激起水雾",
      "受损后维持平衡",
      "海面站立",
      "城市尺度对比中缓慢转身",
      "远程系统展开",
      "侦察模式悬停"
    ]
  },
  {
    category: "怪兽动作",
    prefix: "KL-CREATURE",
    count: 20,
    subjects: ["白潮", "刺潮", "黑潮母体"],
    actions: [
      "从海雾中显露轮廓",
      "白色甲壳被海水冲刷",
      "低鸣引发水面反向纹路",
      "在海面下缓慢游动",
      "靠近防线但没有攻击",
      "受伤后沉入海水",
      "潮门内部组织轻微脉动",
      "巨大尺度与城市对比",
      "摆尾制造压力波",
      "眼部微光睁开"
    ]
  },
  {
    category: "环境运动",
    prefix: "KL-ENV",
    count: 30,
    subjects: ["杭州湾防线", "深蓝基地", "潮门裂口", "海底废墟", "未来港口"],
    actions: [
      "海浪反向起纹",
      "暴雨打在金属墙体",
      "观测塔灯光逐级亮起",
      "基地大厅冷蓝光闪烁",
      "巨大闸门缓慢关闭",
      "海雾吞没港口",
      "潮门边缘像生物组织一样收缩",
      "海底废墟尘埃漂浮",
      "红色警报光扫过通道",
      "远处浮标阵列同步闪烁"
    ]
  },
  {
    category: "镜头运动",
    prefix: "KL-CAMERA",
    count: 30,
    subjects: ["世界建立镜头", "人物情绪镜头", "机甲尺度镜头", "怪兽未知镜头", "转场镜头"],
    actions: [
      "从海面缓慢推向防线",
      "从人物背后跟进到驾驶舱",
      "低机位沿机甲脚部推进",
      "长焦压缩城市与海洋",
      "固定镜头等待异常进入画面",
      "轻微手持跟随人物呼吸",
      "无人机缓慢升高展示尺度",
      "横移穿过维修平台",
      "从冷蓝HUD反射转到人物眼睛",
      "负空间中保留海洋压力"
    ]
  }
];

fs.mkdirSync(outDir, { recursive: true });

const templates = templateGroups.flatMap((group) =>
  Array.from({ length: group.count }, (_, index) => {
    const subject = group.subjects[index % group.subjects.length];
    const action = group.actions[index % group.actions.length];
    const camera = cameraMoves[index % cameraMoves.length];
    const mood = atmosphere[index % atmosphere.length];
    const duration = index % 5 === 0 ? 6 : 5;
    const id = `${group.prefix}-${String(index + 1).padStart(3, "0")}`;
    const name = `${subject}${action}`;
    return {
      id,
      name,
      category: group.category,
      referenceImage: "引用对应母资产Reference，未指定时使用已审核母资产首帧",
      firstFrameSuggestion: `${subject}处于动作开始前一秒，构图清楚，主体设计必须来自母资产库。`,
      lastFrameSuggestion: `${subject}完成动作后的自然停顿，保留物理后果和环境反应。`,
      duration,
      cameraMovement: camera,
      motion: action,
      atmosphere: mood,
      actionDescription: `${subject}${action}。动作必须有重量、惯性和真实空间关系，禁止短视频式乱晃。`,
      klingPrompt: [
        `Scene: Tide Steel Soul reusable video template`,
        `Subject: ${subject}`,
        `Action: ${action}`,
        `Camera: ${camera}`,
        `Atmosphere: ${mood}`,
        `Duration: ${duration} seconds`,
        `Motion Physics: grounded, cinematic, real weight, clear spatial continuity`,
        `Reference Rule: use approved Master Asset Library image as first frame and identity/design lock`,
        `Negative Prompt: ${negative}`
      ].join("\n"),
      negativePrompt: negative,
      status: "模板可用 / 待绑定首帧",
      tags: [group.category, subject, action, camera, "可灵模板"],
      createdAt: now,
      updatedAt: now
    };
  })
);

const library = {
  project: "潮汐钢魂",
  phase: "PHASE21D Kling Video Template Library",
  generatedAt: now,
  rule: "不调用视频API。这里只生成可重复使用的图片模板和可灵视频Prompt模板。",
  total: templates.length,
  categories: templateGroups.map((group) => ({
    name: group.category,
    count: group.count,
    prefix: group.prefix
  })),
  templates
};

fs.writeFileSync(path.join(outDir, "VIDEO_TEMPLATE_LIBRARY.json"), `${JSON.stringify(library, null, 2)}\n`, "utf8");
console.log(`Kling video template library generated: ${templates.length} templates.`);
