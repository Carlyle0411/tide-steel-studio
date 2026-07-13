export type EP01PromptShot = {
  id?: string;
  shot?: string;
  keyframeId?: string;
  title: string;
  description?: string;
  purpose?: string;
  duration?: number | string;
  shotSize?: string;
  lens?: string;
  camera?: string;
  movement?: string;
  character?: string;
  environment?: string;
  lighting?: string;
  emotion?: string;
  sound?: string;
  dialogue?: string;
  notes?: string;
  required_assets?: string[];
};

type Beat = {
  time: string;
  camera: string;
  action: string;
  reason: string;
};

export function isEP01PromptShot(shot: EP01PromptShot) {
  const id = [shot.id, shot.shot, shot.keyframeId].join(" ");
  return /EP01|KF\d\d/.test(id);
}

export function buildEP01SegmentedKlingPrompt(shot: EP01PromptShot, referenceAssets: string[] = []) {
  const beats = buildBeats(shot);
  const title = shot.title;
  const shotId = shot.id ?? shot.shot ?? shot.keyframeId ?? "EP01_SHOT";
  const motivation = buildMotivation(shot);
  const camera = buildCameraLine(shot);
  const assets = referenceAssets.length ? referenceAssets : shot.required_assets ?? [];
  const assetLine = assets.length ? `参考资产：${assets.join("、")}。` : "参考资产：使用当前镜头已绑定的母资产与关键帧图。";

  return [
    `15秒可灵智能分镜。镜头组：${shotId}《${title}》。`,
    `行为动机：${motivation}`,
    `${camera}`,
    ...beats.map((beat, index) => `分镜${index + 1}（${beat.time}）：${beat.camera}，${beat.action}。原因：${beat.reason}`),
    `${assetLine}`,
    "画面情绪：克制、真实、有压迫感；让人物动作或环境变化都有因果，不做无意义炫技。",
    "连续性：人物身份、服装、机甲结构、怪兽身体、场景天气和光源必须延续关键帧，不跳轴，不突然换景。",
    "禁止：换脸、表情僵硬、随机口型、肢体穿模、机甲结构改变、怪兽漂移、短视频抖动、游戏CG、文字、字幕、logo、水印。"
  ].join("\n");
}

export function buildEP01KeyframeMotionNote(shot: EP01PromptShot) {
  return `这张图服务于15秒可灵智能分镜《${shot.title}》。画面中的动作必须能解释下一步运动：${buildMotivation(shot)}`;
}

function buildCameraLine(shot: EP01PromptShot) {
  const lens = shot.lens || inferLens(textOf(shot));
  const shotSize = shot.shotSize || inferShotSize(lens);
  const movement = shot.movement || inferMovement(textOf(shot));
  return `拍摄方式：${shotSize}，${lens}，${movement}。镜头先交代空间，再交代动作后果。`;
}

function buildMotivation(shot: EP01PromptShot) {
  const text = textOf(shot);
  if (has(text, ["海防", "杭州湾", "海面", "防线", "正常"])) return "先证明世界仍按旧秩序运转，观众才会相信后面的细小异常不是特效，而是规则正在变。";
  if (has(text, ["杯", "水纹", "低频", "声呐", "声音"])) return "人类需要一个最小、最可靠的物理证据来确认异常，所以镜头必须从微小变化开始。";
  if (has(text, ["陈牧", "经验", "系统", "察觉"])) return "自动系统还没有报警，但陈牧的值守经验先捕捉到不对劲，他的停顿是一次判断，不是惊吓。";
  if (has(text, ["林舟", "召回", "进入", "驾驶舱"])) return "召回把林舟推回三年前的创伤，他行动不是为了热血证明，而是害怕再次错过。";
  if (has(text, ["许燃", "同步"])) return "许燃必须保护流程和人员安全，她每一次操作都在数据与人之间重新判断。";
  if (has(text, ["赤霆", "机甲", "启动", "走向"])) return "人类把赤霆当作答案，但每一次机体启动都意味着更大的风险和代价。";
  if (has(text, ["白潮", "潮兽", "对峙", "低频"])) return "白潮不是为了展示怪兽威胁，它在寻找回应或方向，人类误把未知行为理解为攻击。";
  if (has(text, ["潮门", "黑潮", "生态", "边界"])) return "真正的问题从战争转向未知生态，画面要让观众意识到人类面对的不是一个敌人。";
  return `这个镜头的行为来自剧情目的：${shot.description || shot.purpose || shot.title}`;
}

function buildBeats(shot: EP01PromptShot): Beat[] {
  const text = textOf(shot);
  if (has(text, ["杯", "水纹"])) {
    return [
      { time: "0-4秒", camera: "85mm微距固定镜头", action: "旧金属杯和潮湿桌面保持静止，杯中水面先完全平静", reason: "让观众确认没有外力震动" },
      { time: "4-10秒", camera: "镜头不动，焦点锁住水面", action: "细小水纹从杯壁向中心缓慢聚拢，背景观测站只轻微虚化闪烁", reason: "异常必须小到像真实物理错误" },
      { time: "10-15秒", camera: "继续停留，不切走", action: "水纹收成一个短暂中心点后散开，杯子仍没有移动", reason: "停留让观众意识到自己没有看错" }
    ];
  }
  if (has(text, ["陈牧"])) {
    return [
      { time: "0-4秒", camera: "50mm中近景，前景有虚化设备", action: "系统界面显示正常，陈牧正在记录或检查流程", reason: "建立他处在正常工作秩序中" },
      { time: "4-8秒", camera: "轻微推进到侧脸", action: "陈牧停下手中动作，眼神没有夸张，只是转向监听方向", reason: "经验先于系统报警发生作用" },
      { time: "8-12秒", camera: "保持同侧轴线，背景人员继续工作", action: "他抬手制止旁人说话，自己倾听低频", reason: "让选择来自判断而非命令姿态" },
      { time: "12-15秒", camera: "固定停留", action: "陈牧看向手动控制区或海面方向，表情更沉", reason: "把下一步关闭闸门的代价提前压进画面" }
    ];
  }
  if (has(text, ["林舟", "召回", "进入", "驾驶舱"])) {
    return [
      { time: "0-4秒", camera: "35mm侧后方中景", action: "林舟听到召回或低频后先停住，肩颈绷紧，目光看向声音来源", reason: "创伤先被唤起，他不是立刻冲锋" },
      { time: "4-8秒", camera: "稳定跟拍", action: "他拿起装备或推门进入潮湿通道，脚步由慢变快", reason: "他选择面对机器，也是在面对旧错误" },
      { time: "8-12秒", camera: "地面跟拍或侧后方跟拍", action: "水滴、衣料、手部动作按真实节奏变化，林舟压住呼吸奔向机库", reason: "行动来自恐惧和责任，不是英雄展示" },
      { time: "12-15秒", camera: "在机库入口停住", action: "他在巨大结构前停半拍再继续向前", reason: "让赤霆成为危险选择的门槛" }
    ];
  }
  if (has(text, ["赤霆", "机甲"])) {
    return [
      { time: "0-4秒", camera: "低机位局部全景", action: "先看装甲、液压或脚部承重结构处于待机状态，雨水沿金属流下", reason: "先建立重量，不把机甲当英雄海报" },
      { time: "4-8秒", camera: "缓慢推进或腰高环绕", action: "蓝色能源逐级亮起，机械锁扣有顺序地解锁", reason: "启动必须像真实工程流程" },
      { time: "8-12秒", camera: "低角度跟随承重方向", action: "机体开始移动，水面、蒸汽和地面反馈先于大动作出现", reason: "让观众感到20米级机械的惯性" },
      { time: "12-15秒", camera: "停在动作后果上", action: "机体完成一步、开舱或抬臂后停住，周围人员和环境被尺度压小", reason: "结果比速度更重要" }
    ];
  }
  if (has(text, ["白潮", "潮兽"])) {
    return [
      { time: "0-4秒", camera: "24mm远景或35mm反应镜头", action: "先看海面、雨线和防线设备出现不一致运动", reason: "白潮先改变环境，再显现自身" },
      { time: "4-9秒", camera: "斯皮尔伯格式发现镜头，先反应后揭示", action: "白色甲壳局部或巨大阴影穿过浪面，不完整露出", reason: "保留未知，让观众比角色早一步怀疑它不是单纯攻击" },
      { time: "9-12秒", camera: "轻微横移保持尺度", action: "海浪被它的体量推开，探照灯和雨水在甲壳上短暂滑过", reason: "用物理影响表现生命尺度" },
      { time: "12-15秒", camera: "固定停留在余波", action: "白潮重新沉入或停在防线外，水纹仍向内收束", reason: "留下无法用战争解释的停顿" }
    ];
  }
  if (has(text, ["潮门", "黑潮"])) {
    return [
      { time: "0-5秒", camera: "24mm广角固定", action: "水体、悬浮物和光线先出现反常停顿或逆流", reason: "未知生态先通过规则变化进入画面" },
      { time: "5-10秒", camera: "缓慢推进到边界", action: "潮门像深海压力裂缝和生物组织边界，不发紫光，不像传送门", reason: "把概念从空间门改成生态入口" },
      { time: "10-15秒", camera: "停在边界深处", action: "黑潮母体或旧文明纹理只给局部回应，像反向观察人类", reason: "第一集只确认问题变了，不解释答案" }
    ];
  }
  return [
    { time: "0-5秒", camera: "先用稳定镜头建立空间", action: shot.description || shot.purpose || "主体进入画面并完成准备动作", reason: "让观众先看懂位置关系" },
    { time: "5-10秒", camera: "按镜头目的缓慢推进或跟拍", action: "主体开始执行本镜头的核心动作", reason: "动作必须来自人物目标或外部压力" },
    { time: "10-15秒", camera: "停留在结果上", action: "保留动作造成的环境、关系或情绪后果", reason: "让镜头推动下一镜头，而不是只展示画面" }
  ];
}

function textOf(shot: EP01PromptShot) {
  return [
    shot.id,
    shot.shot,
    shot.keyframeId,
    shot.title,
    shot.description,
    shot.purpose,
    shot.character,
    shot.environment,
    shot.movement,
    shot.emotion,
    shot.notes
  ].join(" ").toLowerCase();
}

function has(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function inferLens(text: string) {
  if (has(text, ["杯", "水纹", "声呐", "眼睛", "细节"])) return "85mm";
  if (has(text, ["陈牧", "林舟", "许燃", "驾驶舱", "情绪"])) return "50mm";
  if (has(text, ["通道", "基地", "跟拍", "机甲"])) return "35mm";
  return "24mm";
}

function inferShotSize(lens: string) {
  if (lens.includes("85")) return "微距或特写";
  if (lens.includes("50")) return "中近景";
  if (lens.includes("35")) return "中景";
  return "远景";
}

function inferMovement(text: string) {
  if (has(text, ["杯", "水纹", "声呐", "系统"])) return "固定镜头";
  if (has(text, ["奔跑", "通道", "进入"])) return "稳定跟拍";
  if (has(text, ["赤霆", "机甲", "白潮"])) return "缓慢推进，保留重量反馈";
  return "克制缓慢推进";
}
