import type { FactoryLibraryItem } from "./AssetLibraryManager";

export function generateKlingPromptFromAsset(asset: FactoryLibraryItem) {
  const profile = getAssetVideoProfile(asset);
  return [
    `使用已审核的${asset.name}图片作为首帧，保持同一身份、结构、比例和材质，不重新设计。`,
    `拍摄方式：${profile.camera}，${profile.shotSize}，${profile.lens}，摄影机${profile.movement}。`,
    `画面运动：${profile.motion}`,
    `画面情绪：${profile.mood}`,
    `时长约${profile.duration}秒。禁止换脸、结构漂移、夸张表演、短视频抖动、游戏CG、文字、字幕、logo、水印。`
  ].join("");
}

function getAssetVideoProfile(asset: FactoryLibraryItem) {
  const category = `${asset.category} ${asset.type} ${asset.name} ${asset.description}`.toLowerCase();

  if (category.includes("角色") || category.includes("character") || category.includes("人物")) {
    return {
      shotSize: "中近景或半身景",
      lens: "50mm",
      camera: "人物视线高度的克制镜头",
      movement: "缓慢推进或轻微侧移",
      motion: "人物只做一个清楚动作，例如回头、停步、抬眼或压住呼吸，表情通过眼神停顿、肩颈受力和手部细节表达，不做夸张口型。",
      mood: "真实、克制、带有海防世界的疲惫感和压力。",
      duration: 5
    };
  }

  if (category.includes("机甲") || category.includes("mecha") || category.includes("赤霆")) {
    return {
      shotSize: "低机位全景或局部全景",
      lens: "35mm",
      camera: "低机位仰视，强调重量和工业尺度",
      movement: "跟随机体承重方向缓慢移动",
      motion: "机甲先有液压、锁扣或核心灯的准备动作，再发生落脚、转身、抬臂或武器展开，雨水、蒸汽和金属受力必须跟随真实惯性。",
      mood: "沉重、危险、像大型工程机器启动，不是超级英雄登场。",
      duration: 5
    };
  }

  if (category.includes("怪兽") || category.includes("creature") || category.includes("白潮")) {
    return {
      shotSize: "远景到局部特写",
      lens: "50mm",
      camera: "先拍环境反应，再让生物局部进入画面",
      movement: "缓慢横移或固定停留",
      motion: "怪兽通过水体位移、甲壳局部、低频震动和海雾变化出现，不做完整摆拍和张嘴咆哮。",
      mood: "未知、古老、压迫，但不是廉价怪兽恐怖。",
      duration: 6
    };
  }

  if (category.includes("场景") || category.includes("environment") || category.includes("天气") || category.includes("灯光")) {
    return {
      shotSize: "远景或大远景",
      lens: "24mm",
      camera: "稳定广角环境镜头",
      movement: "极慢推进或固定",
      motion: "海雾、雨水、灯光、浮标和远处机械设备按不同层次运动，主体建筑保持真实尺度，不突然出现无关元素。",
      mood: "冷峻、低饱和、工业海防文明的压迫感。",
      duration: 5
    };
  }

  return {
    shotSize: "中景",
    lens: "35mm",
    camera: "稳定电影镜头",
    movement: "缓慢推进",
    motion: "主体只做一个清楚且可读的动作，保持真实重量、材质和空间关系。",
    mood: "克制、真实、电影感。",
    duration: 5
  };
}
