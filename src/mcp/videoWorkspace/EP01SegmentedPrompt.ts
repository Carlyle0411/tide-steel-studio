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
  const id = [shot.id, shot.shot, shot.keyframeId].filter(Boolean).join(" ").toUpperCase();
  if (/TRAILER|TRILOGY|SHOT-TRAILER|SHOT-TRILOGY|^TR\d{2}/.test(id)) return false;
  return /EP01|KF\d{2}/.test(id);
}

export function buildEP01SegmentedKlingPrompt(shot: EP01PromptShot, referenceAssets: string[] = []) {
  const beats = buildBeats(shot);
  const shotId = shot.shot ?? shot.id ?? shot.keyframeId ?? "EP01_SHOT";
  const assets = referenceAssets.length ? referenceAssets : shot.required_assets ?? [];
  const assetLine = assets.length
    ? `参考资产：${assets.join(" / ")}。`
    : "参考资产：使用当前镜头已绑定的母资产和关键帧图。";

  return [
    `镜头：${shotId}《${shot.title}》`,
    "时长：15秒，交给可灵智能分成2到4个小分镜。",
    assetLine,
    `行为动机：${buildMotivation(shot)}`,
    `拍摄方式：${shot.shotSize || inferShotSize(textOf(shot))}，${shot.lens || inferLens(textOf(shot))}，${shot.movement || inferMovement(textOf(shot))}。`,
    ...beats.map((beat, index) => `分镜${index + 1}（${beat.time}）：${beat.camera}。${beat.action}。原因：${beat.reason}。`),
    "画面情绪：克制、真实、压迫感逐步上升；动作必须有起因和后果，不做无意义炫技。",
    "连续性：人物身份、服装、机甲结构、场景天气和光源必须延续关键帧，不跳轴，不突然换景。",
    "禁止：换脸、夸张表演、随机口型、肢体穿模、机甲结构改变、怪兽漂移、短视频抖动、游戏CG、文字、字幕、logo、水印。"
  ].join("\n");
}

export function buildEP01KeyframeMotionNote(shot: EP01PromptShot) {
  return `这张图服务于15秒可灵智能分镜《${shot.title}》。画面中的动作必须能解释下一步运动：${buildMotivation(shot)}`;
}

function buildMotivation(shot: EP01PromptShot) {
  const text = textOf(shot);
  if (has(text, ["外海", "海防", "杭州湾", "过分平静"])) {
    return "先证明世界仍按旧秩序运行，观众才会相信后面的微小异常不是特效，而是规则正在改变。";
  }
  if (has(text, ["雨打", "金属"])) {
    return "用雨声和金属回响衬托海面异常安静，让观众先听见不对劲。";
  }
  if (has(text, ["杯", "水纹", "反向"])) {
    return "人类需要一个最小、最可靠的物理证据来确认异常，所以镜头必须从微小变化开始。";
  }
  if (has(text, ["值守员", "停下"])) {
    return "系统还没报警，但人的身体反应先发现了不对劲，这个停顿推动异常进入人工判断。";
  }
  if (has(text, ["浮标"])) {
    return "外海浮标把室内杯水异常放大成真实海况，逼迫基地承认这不是设备误差。";
  }
  if (has(text, ["深蓝基地", "指挥中心", "陈牧"])) {
    return "异常从自然现象进入人类决策系统，陈牧必须在系统正常和经验异常之间做判断。";
  }
  if (has(text, ["ai澜", "系统层"])) {
    return "AI澜第一次出现必须像一套系统，它的0.2秒停顿暗示排序逻辑出现偏差。";
  }
  if (has(text, ["事故", "db-44", "0918"])) {
    return "旧事故编号连接林舟三年前的伤口，但本集只埋伏笔，不解释创伤。";
  }
  if (has(text, ["低频"])) {
    return "陈牧不是迷信经验，而是真的听见了系统忽略的差异，他的选择因此成立。";
  }
  if (has(text, ["双重确认", "控制台"])) {
    return "关闭观测闸不是按按钮，而是一次无法撤回的责任选择。";
  }
  if (has(text, ["闸", "关闭"])) {
    return "闸门关闭让外海光线消失，视觉上完成本集的代价，而不是制造动作高潮。";
  }
  if (has(text, ["预警灯"])) {
    return "基地不是混乱，而是被逐步叫醒，蓝色预警灯把异常传递到更深层系统。";
  }
  if (has(text, ["赤霆"])) {
    return "赤霆只能作为危险选择的伏笔出现，不完整展示，让EP02的进入驾驶舱有重量。";
  }
  if (has(text, ["继续扩大", "海面"])) {
    return "最后不是怪兽来了，而是某个未知生命已经听见人类回应。";
  }
  return shot.purpose || shot.description || shot.title;
}

function buildBeats(shot: EP01PromptShot): Beat[] {
  const text = textOf(shot);
  if (has(text, ["外海", "过分平静"])) {
    return [
      { time: "0-5秒", camera: "24mm远景固定机位", action: "海防线、浮标和观测站按正常秩序运行，海面却异常平滑，远处低云压住天光", reason: "建立正常世界，同时埋下第一丝不对劲" },
      { time: "5-10秒", camera: "镜头几乎不动，只让雨雾和远处灯点轻微变化", action: "浮标轻微摇晃，但海浪节奏与风向不匹配", reason: "让异常小到像真实观测误差" },
      { time: "10-15秒", camera: "缓慢压近海面边缘", action: "水面出现很轻的反向纹路，一闪而过，不制造灾难感", reason: "把问题留给下一镜头确认" }
    ];
  }
  if (has(text, ["雨打", "金属"])) {
    return [
      { time: "0-5秒", camera: "50mm特写固定", action: "雨滴打在潮湿金属外壳，水珠沿盐雾腐蚀纹理下滑", reason: "用真实材质建立观测站的存在感" },
      { time: "5-10秒", camera: "保持固定，浅景深", action: "雨声清晰，远海声音却被压低，外壳轻微震动", reason: "声音缺失比灾难画面更早制造不安" },
      { time: "10-15秒", camera: "轻微转焦到观察窗内的值班区", action: "窗内冷蓝灯闪烁，值守员的影子停顿半拍", reason: "把异常从环境引向人的反应" }
    ];
  }
  if (has(text, ["杯", "水纹"])) {
    return [
      { time: "0-4秒", camera: "85mm微距固定焦点", action: "旧金属杯静止在潮湿桌面，杯中水面完全平，背景观测站虚化", reason: "先确认没有外力震动" },
      { time: "4-10秒", camera: "镜头不动，焦点锁在水面", action: "水纹不是向外散开，而是缓慢向中心收拢，幅度极小", reason: "让观众产生我是不是看错了的感觉" },
      { time: "10-15秒", camera: "继续停留，不切走", action: "水纹收成一个短暂中心点后散开，杯子仍没移动", reason: "停留让异常成为证据" }
    ];
  }
  if (has(text, ["值守员"])) {
    return [
      { time: "0-5秒", camera: "35mm中景固定", action: "值守员在观测站内记录数据，屏幕显示正常，手指敲击节奏稳定", reason: "建立系统没有报警" },
      { time: "5-10秒", camera: "轻微推近到手部和侧脸", action: "他听见低频后手指停住，眼睛没有看屏幕，而是看向杯子和海面方向", reason: "人的直觉先于机器判断" },
      { time: "10-15秒", camera: "保持中景，背景屏幕继续正常运行", action: "他慢慢摘下一侧耳机，呼吸变浅，但没有大喊", reason: "把恐惧控制在真实工作状态里" }
    ];
  }
  if (has(text, ["浮标"])) {
    return [
      { time: "0-5秒", camera: "35mm远景缓慢推进", action: "外海浮标阵列在雨中轻微摆动，防线灯光远远闪烁", reason: "把室内异常扩展到真实海况" },
      { time: "5-10秒", camera: "推近到单个浮标", action: "浮标周围水纹向内回收，周围海面却仍按正常浪向移动", reason: "制造局部规则失效" },
      { time: "10-15秒", camera: "固定停在水纹中心", action: "浮标警示灯短闪一次，声呐没有目标回传", reason: "逼出基地的下一步确认" }
    ];
  }
  if (has(text, ["指挥中心"])) {
    return [
      { time: "0-5秒", camera: "24mm远景固定", action: "深蓝基地指挥中心冷蓝屏幕铺开，工作人员低声执行夜班任务", reason: "展示人类工程系统的秩序" },
      { time: "5-10秒", camera: "缓慢横移到陈牧所在区域", action: "异常数据只在角落跳动，其他系统仍显示正常", reason: "让观众看见系统滞后" },
      { time: "10-15秒", camera: "停在陈牧身后偏侧位置", action: "陈牧没有抬高声音，只停下手中记录，看向监听设备", reason: "人物选择开始形成" }
    ];
  }
  if (has(text, ["陈牧", "茶杯"])) {
    return [
      { time: "0-5秒", camera: "85mm特写固定", action: "陈牧桌边茶杯里的水纹反向收缩，杯身映出冷蓝屏幕光", reason: "证明异常已进入基地内部" },
      { time: "5-10秒", camera: "缓慢拉出到陈牧手部", action: "陈牧的手停在记录本上，笔尖没有落下", reason: "经验正在压过流程" },
      { time: "10-15秒", camera: "50mm近景停留", action: "他抬眼看向监听设备，表情沉下去但不震惊", reason: "让他值得被相信" }
    ];
  }
  if (has(text, ["ai澜", "系统层"])) {
    return [
      { time: "0-5秒", camera: "屏幕特写固定", action: "冷蓝透明系统界面浮现，不出现人脸和头像，只显示数据层级", reason: "AI澜首先是系统，不是角色助手" },
      { time: "5-10秒", camera: "界面固定，光标停顿", action: "异常数据排序时出现0.2秒停顿，然后被标记为低优先级", reason: "埋下AI判断偏差" },
      { time: "10-15秒", camera: "轻微转焦到屏幕反光中的陈牧轮廓", action: "系统语音平静播报正常，陈牧却没有立刻相信", reason: "建立人和系统的第一次分歧" }
    ];
  }
  if (has(text, ["事故", "db-44", "0918"])) {
    return [
      { time: "0-5秒", camera: "50mm屏幕特写固定", action: "档案编号DB-44-0918-A短暂闪过，界面没有解释内容", reason: "只埋伏笔，不提前说明三年前事件" },
      { time: "5-10秒", camera: "镜头保持在编号和访问限制上", action: "旧事故红色封存标记一闪而灭，被系统自动折叠", reason: "让观众未来回看时理解林舟伤口" },
      { time: "10-15秒", camera: "冷蓝屏幕反光里保留基地走廊", action: "环境声短暂消失半拍后恢复", reason: "用声音缺口标记过去错误" }
    ];
  }
  if (has(text, ["低频"])) {
    return [
      { time: "0-4秒", camera: "50mm近景缓慢推进", action: "陈牧戴着单侧监听耳机，周围人员仍按流程工作", reason: "建立他不是被恐慌驱动" },
      { time: "4-8秒", camera: "推进到侧脸和耳机", action: "他听见极低脉冲后眼神停住，呼吸变慢", reason: "低频成为他判断的证据" },
      { time: "8-12秒", camera: "过肩看向正常系统屏幕", action: "屏幕仍显示正常，他却把手移向手动控制区", reason: "经验开始挑战自动系统" },
      { time: "12-15秒", camera: "固定停留", action: "陈牧没有下令，只低声要求人工复核", reason: "选择不是英雄姿态，而是责任" }
    ];
  }
  if (has(text, ["双重确认", "控制台"])) {
    return [
      { time: "0-4秒", camera: "85mm手部特写固定", action: "陈牧的手悬在双重确认控制器上，指节有水汽反光", reason: "把选择变成可见动作" },
      { time: "4-8秒", camera: "切到控制台屏幕近景", action: "系统提示观测闸关闭不可撤回，倒计时开始", reason: "明确行动后果" },
      { time: "8-12秒", camera: "回到手部，仍不晃动", action: "第一道确认按下后他停半拍，再按第二道确认", reason: "停顿表现代价" },
      { time: "12-15秒", camera: "保持在已松开的手和控制灯", action: "他的手离开按钮，控制灯变蓝", reason: "动作已完成，不能撤回" }
    ];
  }
  if (has(text, ["闸", "关闭"])) {
    return [
      { time: "0-5秒", camera: "24mm中远景固定", action: "巨大观测闸在雨中缓慢下降，陈牧只通过远程系统完成操作", reason: "建筑结构压过个人" },
      { time: "5-10秒", camera: "保持固定，让闸门运动占据画面", action: "外海最后一条灰白天光被闸门吞掉，水流从缝隙下泻", reason: "视觉上表现代价消失" },
      { time: "10-15秒", camera: "停在完全关闭后的闸门", action: "闸门咬合声结束后短暂静音，只剩雨声", reason: "让观众感到他关上的不只是一扇门" }
    ];
  }
  if (has(text, ["预警灯"])) {
    return [
      { time: "0-5秒", camera: "35mm中景固定", action: "深蓝基地走廊第一盏蓝色预警灯亮起，地面积水反光", reason: "基地开始被叫醒" },
      { time: "5-10秒", camera: "缓慢横移", action: "预警灯一盏接一盏亮起，工作人员从远处进入画面但不奔跑", reason: "保持工业秩序，不拍成灾难逃亡" },
      { time: "10-15秒", camera: "停在走廊尽头的机库门方向", action: "蓝光照到重型门缝，门后传来液压低鸣", reason: "把注意力引向赤霆" }
    ];
  }
  if (has(text, ["赤霆"])) {
    return [
      { time: "0-5秒", camera: "50mm中远景固定", action: "只看见赤霆背部暗红装甲和驾驶舱缝隙，蓝色预警光缓慢扫过湿金属", reason: "禁止提前完整展示机甲" },
      { time: "5-10秒", camera: "轻微推近驾驶舱边缘", action: "背部舱门缓慢闭合，液压锁扣依次咬合", reason: "赤霆启动像危险选择，不是英雄登场" },
      { time: "10-15秒", camera: "固定在关闭后的装甲缝", action: "蓝色警报光在缝隙里熄灭半拍又亮起，机库深处低频回应", reason: "把EP02的问题留住" }
    ];
  }
  if (has(text, ["继续扩大", "海面"])) {
    return [
      { time: "0-5秒", camera: "35mm远景缓慢推进", action: "观测闸关闭后的外海恢复空旷，雨仍在下，浮标灯微弱闪烁", reason: "让观众以为行动结束" },
      { time: "5-10秒", camera: "推近水面，不切怪兽", action: "水纹从远处向中心反向回收，幅度比开场更明显", reason: "证明异常没有被关闭阻止" },
      { time: "10-15秒", camera: "停在水纹中心和黑色海面", action: "海面下有极轻微的白色轮廓经过，但不露出完整形体", reason: "不是怪兽来了，而是生命正在靠近" }
    ];
  }
  return [
    { time: "0-5秒", camera: "稳定镜头先建立空间", action: shot.description || shot.purpose || "主体进入画面并完成准备动作", reason: "让观众先看懂位置关系" },
    { time: "5-10秒", camera: "按镜头目的缓慢推进或跟拍", action: "主体执行本镜头核心动作", reason: "动作必须来自人物目标或外部压力" },
    { time: "10-15秒", camera: "停留在动作后果上", action: "保留环境、关系或情绪变化", reason: "让镜头推动下一镜头" }
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
  if (has(text, ["杯", "水纹", "手部", "屏幕", "茶杯"])) return "85mm";
  if (has(text, ["陈牧", "赤霆", "ai澜", "低频"])) return "50mm";
  if (has(text, ["浮标", "走廊", "基地", "海面"])) return "35mm";
  return "24mm";
}

function inferShotSize(text: string) {
  if (has(text, ["杯", "水纹", "手部", "屏幕", "茶杯"])) return "特写";
  if (has(text, ["陈牧", "值守员", "走廊"])) return "中景";
  if (has(text, ["外海", "海防", "闸门"])) return "远景";
  return "中景";
}

function inferMovement(text: string) {
  if (has(text, ["杯", "水纹", "系统", "手部", "屏幕"])) return "固定镜头";
  if (has(text, ["浮标", "低频", "海面"])) return "缓慢推进";
  if (has(text, ["走廊"])) return "缓慢横移";
  return "克制稳定镜头";
}
