import { AssetUsage, CharacterProfile, FormState, MediaAsset, ShotAssetBinding, StoryboardShot } from "../types";
import { generateAssetReferenceText } from "./assetReference";
import { projectPresets, projectTypeLabels } from "../data/presets";

const shotSizes = ["远景", "全景", "中景", "近景", "特写", "过肩镜头", "低机位仰拍", "俯拍"];
const cameras = ["缓慢推进", "横向跟拍", "稳定器环绕", "轻微手持", "垂直升降", "快速推近后定格", "由虚到实拉焦", "低角度跟随"];
const lighting = ["冷暖对比光", "清晨柔光", "雨夜霓虹反射", "高反差侧逆光", "室内柔和散射光", "金色夕照", "低饱和自然光", "干净棚拍光"];
const compositions = ["主体居中，背景留出纵深", "三分法构图，前景制造空间层次", "低机位强化主体压迫感", "对称构图，突出秩序与高级感", "留白构图，强调情绪停顿", "前中后景分明，适合图生视频"];
const negativeBase = "低清晰度, 画面抖动, 主体变形, 多余肢体, 错乱文字, 水印, logo, 过曝, 欠曝, 角色不一致, 面部崩坏, 模糊, 不自然运动";

const beatMap: Record<FormState["projectType"], string[]> = {
  mecha: ["环境压迫", "机体启动", "装甲细节", "隐藏驾驶舱", "战术移动", "能量爆发", "近身动作", "结尾定格"],
  pet: ["冲突出现", "阿墨反应", "笨拙行动", "表情特写", "误会反转", "小聪明解决", "温暖停顿", "结尾梗"],
  fashion: ["门店空间", "面料细节", "试衣动作", "镜中确认", "搭配服务", "生活场景", "情绪表达", "品牌收束"],
  healing: ["孤独开场", "环境空镜", "微动作", "情绪转折", "光影变化", "内心旁白", "重新出发", "安静落点"],
  product: ["痛点建立", "产品亮相", "结构细节", "使用场景", "卖点证明", "前后对比", "生活落地", "购买引导"],
  custom: ["开场设定", "人物建立", "关系推进", "信息释放", "视觉高潮", "转折", "情绪落点", "结尾记忆"]
} as const;

const defaultUsageByType: Record<FormState["projectType"], AssetUsage[]> = {
  mecha: ["角色参考", "动作参考", "场景参考", "首帧参考"],
  pet: ["角色参考", "场景参考", "动作参考", "封面参考"],
  fashion: ["场景参考", "风格参考", "角色参考", "首帧参考"],
  healing: ["场景参考", "风格参考", "首帧参考", "封面参考"],
  product: ["产品参考", "场景参考", "动作参考", "首帧参考"],
  custom: ["风格参考", "场景参考", "角色参考", "首帧参考"]
};

export async function generateStoryboardWithProvider(
  form: FormState,
  characters: CharacterProfile[],
  assets: MediaAsset[]
): Promise<StoryboardShot[]> {
  // API seam: replace this return with a POST to your own model route later.
  // Suggested payload: { form, characters, assets }.
  return generateStoryboard(form, characters, assets);
}

export function generateStoryboard(form: FormState, characters: CharacterProfile[], assets: MediaAsset[]): StoryboardShot[] {
  const activeCharacters = characters.filter((item) => form.activeCharacterIds.includes(item.id));
  const activeAssets = assets.filter((item) => form.activeAssetIds.includes(item.id));
  const characterText = activeCharacters.map(characterToPrompt).join("；");
  const lockTags = activeCharacters.map((item) => [item.promptTemplate, item.lockedTags, item.forbiddenChanges].filter(Boolean).join("，")).join("；");
  const durationPerShot = Math.max(1, Math.round(form.duration / Math.max(1, form.shotCount)));
  const beats = beatMap[form.projectType];
  const presetTags = projectPresets[form.projectType].join("、");
  const style = [presetTags, form.styleKeywords].filter(Boolean).join("、");
  const protagonist = [form.protagonist, characterText].filter(Boolean).join("；") || "清晰统一的主角";
  const scene = form.scene || "具有空间层次的电影场景";

  return Array.from({ length: form.shotCount }, (_, shotIndex) => {
    const index = shotIndex + 1;
    const beat = beats[shotIndex % beats.length];
    const shotSize = shotSizes[(shotIndex + form.projectType.length) % shotSizes.length];
    const camera = cameras[(shotIndex * 2 + form.duration) % cameras.length];
    const light = lighting[(shotIndex + form.shotCount) % lighting.length];
    const composition = compositions[shotIndex % compositions.length];
    const recommendedAssets = pickAssets(activeAssets, shotIndex);
    const assetBindings = recommendedAssets.map((asset, idx) => ({
      assetId: asset.id,
      usage: defaultUsageByType[form.projectType][idx % defaultUsageByType[form.projectType].length],
      note: generateAssetReferenceText(asset, defaultUsageByType[form.projectType][idx % defaultUsageByType[form.projectType].length])
    }));
    const shotAssets = assetBindings.map((binding) => ({
      assetId: binding.assetId,
      usageType: binding.usage,
      referenceText: binding.note,
      createdAt: new Date().toISOString()
    }));
    const assetHint = buildAssetHint(recommendedAssets, assetBindings);
    const last = index === form.shotCount;
    const visual = buildVisual(form, beat, protagonist, scene, style, index, last);
    const action = buildAction(form.projectType, beat, protagonist, index, last);
    const subtitle = buildSubtitle(form.projectType, beat, last);
    const voiceover = buildVoiceover(form.projectType, form.theme, beat, last);
    const consistency = form.needCharacterConsistency && lockTags ? `角色一致性锁定：${lockTags}。` : "";
    const basePrompt = `${visual}。${action}。${shotSize}，${camera}，${light}，${composition}。${consistency}${assetHint}情绪氛围：${form.mood || "清晰、有感染力"}。画面比例${form.aspectRatio}，${style}，高质量电影画面。`;
    const english = toEnglishPrompt(form, beat, shotSize, camera, light, composition, lockTags, recommendedAssets);
    const firstFrame = `${visual}，主体姿态清楚，构图稳定，首帧可直接作为图生视频参考，${composition}，${style}，${form.aspectRatio}`;
    const tailFrame = form.needTailFramePrompt ? `${protagonist}停留在明确结尾姿态，空间关系清楚，品牌/情绪记忆点可见，${composition}，${style}` : undefined;
    const imageToVideo = `${basePrompt} 保持首帧主体身份一致，动作从静止自然启动，镜头运动平滑，避免主体形变。`;

    return {
      id: crypto.randomUUID(),
      index,
      duration: `${durationPerShot}s`,
      shotSize,
      visual,
      action,
      camera,
      lighting: light,
      composition,
      klingPrompt: `${basePrompt}适合可灵文生视频：运动连续，主体稳定，动作幅度明确。`,
      jimengPrompt: `${basePrompt}适合即梦图片/视频：美术风格明确，材质细节清晰，中文语义完整。`,
      imageToVideoPrompt: imageToVideo,
      hailuoPrompt: `${basePrompt}适合海螺视频：动作链路明确，真实物理运动，光影自然。`,
      negativePrompt: negativeBase,
      subtitle,
      voiceover,
      status: "待生成",
      rating: 0,
      note: "",
      recommendedAssetIds: recommendedAssets.map((item) => item.id),
      assets: shotAssets,
      assetBindings,
      recommendedFirstFrameAssetId: recommendedAssets.find((item) => item.type === "image")?.id,
      promptPack: {
        conciseCn: `${beat}：${visual}，${camera}，${light}，${composition}。`,
        detailedCn: basePrompt,
        english,
        klingTextToVideo: `${basePrompt}镜头语言清晰，节奏稳定，避免突然跳变。`,
        klingImageToVideo: imageToVideo,
        jimengImage: `${firstFrame}，适合即梦图片生成，细节完整，不要文字水印。`,
        hailuoVideo: `${basePrompt}动作起点、过程、终点清楚，适合海螺视频生成。`,
        universalEnglish: `${english}, suitable for Runway, Luma and Pika, smooth motion, clean cinematic composition, no text artifacts`,
        firstFrame,
        tailFrame
      }
    };
  });
}

function characterToPrompt(item: CharacterProfile) {
  return `${item.name}: ${item.appearance}，${item.personality}，固定特征：${item.signatureFeatures}，服装道具：${item.outfitsProps}，常用场景：${item.commonScenes}，禁止变化：${item.forbiddenChanges}`;
}

function pickAssets(assets: MediaAsset[], index: number) {
  if (!assets.length) return [];
  return assets.slice(index % assets.length).concat(assets.slice(0, index % assets.length)).slice(0, 2);
}

function buildAssetHint(assets: MediaAsset[], bindings: ShotAssetBinding[]) {
  if (!assets.length) return "";
  const text = assets.map((asset) => {
    const binding = bindings.find((item) => item.assetId === asset.id);
    return `${asset.name}，用于${binding?.usage ?? "视觉参考"}${asset.note ? `，备注：${asset.note}` : ""}`;
  }).join("；");
  return `参考素材：${text}。`;
}

function buildVisual(form: FormState, beat: string, protagonist: string, scene: string, style: string, index: number, last: boolean) {
  const theme = form.theme || projectTypeLabels[form.projectType];
  const ending = last ? "并形成清晰的结尾记忆点" : "推动下一镜头的情绪和信息";
  return `${theme}的第${index}个镜头，围绕“${beat}”展开，${protagonist}出现在${scene}中，画面包含${style}的视觉元素，${ending}`;
}

function buildAction(type: FormState["projectType"], beat: string, protagonist: string, index: number, last: boolean) {
  const actions: Record<FormState["projectType"], string[]> = {
    mecha: ["机体核心亮起，机械结构逐层展开", "背部隐藏式驾驶舱以细节闪过，避免正面暴露", "推进器喷射，修长装甲比例在侧光中掠过", "武器系统展开，能量沿关节和装甲缝隙流动"],
    pet: ["歪头观察，眼神无辜，做出拟人化小动作", "轻快奔跑后突然停住，表情从自信变成慌张", "用爪子或随身道具笨拙解决问题", "回头看向镜头，形成一个轻喜剧停顿"],
    fashion: ["自然行走，衣料随步伐轻微摆动", "手部整理衣领和袖口，突出剪裁与面料触感", "进入预约空间，与搭配师交换克制眼神", "在试衣镜前定格，状态松弛但精致"],
    healing: ["缓慢呼吸，手指触碰光线或旧物件", "风吹动发丝和窗帘，情绪逐渐松开", "停下脚步，抬头看向远处的一束光", "微笑很轻，动作克制而真实"],
    product: ["产品从真实痛点场景中自然出现，核心结构被看清", "用户完成一次明确使用动作，效果立刻可见", "功能卖点以干净可视化方式呈现", "产品与生活场景融合，完成购买理由"],
    custom: ["主体完成一个明确动作", "空间中的关键物件被强调", "人物与环境产生互动", "动作收束在稳定构图里"]
  };
  const pick = actions[type][index % actions[type].length];
  return `${protagonist}${pick}，对应叙事节拍“${beat}”${last ? "，动作结束后停留半秒" : ""}`;
}

function buildSubtitle(type: FormState["projectType"], beat: string, last: boolean) {
  if (last) return "这一次，画面替你说完。";
  const map: Record<FormState["projectType"], string> = {
    mecha: `钢铁醒来，${beat}。`,
    pet: "阿墨有自己的办法。",
    fashion: "温柔不是退让，是选择。",
    healing: "慢一点，也是在往前。",
    product: "把复杂留给技术，把轻松留给你。",
    custom: "此刻，故事进入新的层次。"
  };
  return map[type];
}

function buildVoiceover(type: FormState["projectType"], theme: string, beat: string, last: boolean) {
  const name = theme || "这支影片";
  if (last) return `${name}在最后一个画面收束，让观众记住情绪、主体和行动理由。`;
  const map: Record<FormState["projectType"], string> = {
    mecha: `当危机逼近，真正可靠的力量开始苏醒：${beat}。`,
    pet: "它不是普通的小猫，它把每个麻烦都变成可爱的答案。",
    fashion: "好的衣服不急着表达，它让穿着的人先被看见。",
    healing: "情绪没有被消灭，只是被温柔地安放。",
    product: "一个清晰的产品价值，需要在真实使用中被看见。",
    custom: "用这个镜头把信息推近一点，让观众自然进入故事。"
  };
  return map[type];
}

function toEnglishPrompt(form: FormState, beat: string, shotSize: string, camera: string, light: string, composition: string, lockTags: string, assets: MediaAsset[]) {
  const consistency = form.needCharacterConsistency && lockTags ? ` consistent identity: ${lockTags},` : "";
  const references = assets.length ? ` visual references: ${assets.map((asset) => asset.name).join(", ")},` : "";
  return `${form.theme || "cinematic short video"}, ${beat}, protagonist: ${form.protagonist || "clear main subject"}, scene: ${form.scene || "layered cinematic environment"}, ${shotSize}, ${camera}, ${light}, ${composition},${consistency}${references} mood: ${form.mood || "clear emotional tone"}, aspect ratio ${form.aspectRatio}, style: ${form.styleKeywords || projectPresets[form.projectType].join(", ")}, premium cinematic detail, stable motion, high clarity`;
}
