import { AssetUsage, MediaAsset, ShotAssetBinding } from "../types";

export type ShotAssetReference = {
  asset: MediaAsset;
  usageType: AssetUsage;
  note?: string;
};

export function generateAssetReferenceText(asset: MediaAsset, usageType: AssetUsage, groupName = "") {
  const text = `${asset.name} ${asset.tags.join(" ")} ${asset.note}`.toLowerCase();
  const cleanName = asset.name.replace(/\.[a-z0-9]+$/i, "");
  const traits = asset.tags.length ? `标签包含${asset.tags.join("、")}` : asset.note || "作为画面参考";
  const detail = `素材名称：${cleanName}${asset.tags.length ? `；标签：${asset.tags.join("、")}` : ""}${asset.note ? `；备注：${asset.note}` : ""}`;

  if (groupName === "角色图") {
    return `参考角色图：用于保持主体外观、比例、标志特征和角色一致性。${detail}。`;
  }
  if (groupName === "场景图") {
    return `参考场景图：用于保持环境、空间、光线、氛围和背景一致性。${detail}。`;
  }
  if (groupName === "故事版") {
    return `参考故事版：用于保持镜头构图、动作节奏、首尾帧衔接和画面连续性。${detail}。`;
  }

  if (/赤霆|机甲|驾驶舱|背部|隐藏式/.test(text)) {
    return `参考素材：${cleanName}，用于保持机甲背部隐藏式驾驶舱、修长比例和工业机械结构一致，避免驾驶舱出现在头部、胸部或正中间。`;
  }
  if (/阿墨|奶牛猫|猫|爱心|学士帽/.test(text)) {
    return `参考素材：${cleanName}，用于保持阿墨的黑白奶牛猫外观、左耳缺口、嘴角爱心印记、琥珀金色眼睛和歪斜学士帽一致。`;
  }
  if (/桂花糖|女装|试衣镜|门店|高级|克制/.test(text)) {
    return `参考素材：${cleanName}，用于保持预约制女装店的高级、克制、温柔氛围，以及门店空间、试衣镜和服装细节质感。`;
  }

  const usageMap: Record<AssetUsage, string> = {
    角色参考: "用于保持角色外观、比例、服装道具和标志特征一致",
    主体一致性参考: "用于保持主体身份、比例、轮廓和关键标志一致",
    外观设定参考: "用于保持外观设定、服装道具和造型细节一致",
    首帧参考: "用于控制首帧构图、主体姿态和画面信息",
    尾帧参考: "用于控制尾帧停顿姿态、结尾记忆点和画面收束",
    场景参考: "用于保持场景空间、环境层次和氛围一致",
    光影氛围参考: "用于保持光线方向、色彩氛围和情绪质感一致",
    背景参考: "用于保持背景空间、环境元素和画面纵深一致",
    风格参考: "用于保持色彩、材质、光影和整体视觉风格一致",
    动作参考: "用于保持动作节奏、运动幅度和身体/镜头运动方式",
    镜头参考: "用于保持镜头构图、运动节奏和画面连续性",
    已生成结果参考: "用于保持已生成结果的画面质感、构图和可用版本方向",
    产品参考: "用于保持产品结构、比例、细节和卖点清晰",
    封面参考: "用于保持封面构图、主体识别度和视觉记忆点",
    音效参考: "用于提示音效氛围、节奏和声音质感",
    BGM参考: "用于提示背景音乐情绪、节奏和段落推进"
  };

  return `参考素材：${cleanName}，${usageMap[usageType]}，${traits}。`;
}

export function generateShotReferenceBlock(shotAssets: ShotAssetReference[]) {
  if (!shotAssets.length) return "";
  return shotAssets.map(({ asset, usageType, note }) => note || generateAssetReferenceText(asset, usageType)).join("\n");
}

export function injectAssetReferencesIntoPrompt(prompt: string, shotAssets: ShotAssetReference[]) {
  const block = generateShotReferenceBlock(shotAssets);
  if (!block) return prompt;
  return `${prompt}\n\n素材参考要求：\n${block}`;
}

export function bindingsToReferences(bindings: ShotAssetBinding[], assets: MediaAsset[]): ShotAssetReference[] {
  return bindings
    .map((binding) => {
      const asset = assets.find((item) => item.id === binding.assetId);
      return asset ? { asset, usageType: binding.usage, note: binding.note } : undefined;
    })
    .filter(Boolean) as ShotAssetReference[];
}
