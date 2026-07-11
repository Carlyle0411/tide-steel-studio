import { AssetGroup, AssetUsage, CharacterProfile, MediaAsset, ShotAssetBinding, ShotBoundAsset, StoryboardShot, VideoProject } from "../types";
import { bindingsToReferences, generateShotReferenceBlock } from "./assetReference";

const columns: Array<[keyof StoryboardShot, string]> = [
  ["index", "镜头编号"],
  ["duration", "时长"],
  ["status", "状态"],
  ["rating", "评分"],
  ["shotSize", "景别"],
  ["visual", "画面内容"],
  ["action", "主体动作"],
  ["camera", "镜头运动"],
  ["lighting", "光线氛围"],
  ["composition", "构图建议"],
  ["klingPrompt", "可灵提示词"],
  ["jimengPrompt", "即梦提示词"],
  ["imageToVideoPrompt", "图生视频提示词"],
  ["hailuoPrompt", "海螺提示词"],
  ["negativePrompt", "负面提示词"],
  ["subtitle", "字幕文案"],
  ["voiceover", "旁白文案"],
  ["note", "备注"]
];

export function storyboardToMarkdown(shots: StoryboardShot[]) {
  const header = `| ${columns.map(([, label]) => label).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const rows = shots.map((shot) => `| ${columns.map(([key]) => cleanCell(String(shot[key] ?? ""))).join(" | ")} |`);
  return ["# AI视频分镜表", "", header, divider, ...rows].join("\n");
}

export function storyboardToCsv(shots: StoryboardShot[]) {
  const header = columns.map(([, label]) => csvCell(label)).join(",");
  const rows = shots.map((shot) => columns.map(([key]) => csvCell(String(shot[key] ?? ""))).join(","));
  return [header, ...rows].join("\n");
}

export function storyboardToPrompts(shots: StoryboardShot[]) {
  return shots
    .map((shot) =>
      [
        `镜头${shot.index}｜${shot.duration}`,
        `可灵：${shot.klingPrompt}`,
        `即梦：${shot.jimengPrompt}`,
        `图生视频：${shot.imageToVideoPrompt}`,
        `海螺：${shot.hailuoPrompt}`,
        `Runway/Luma/Pika：${shot.promptPack.universalEnglish}`,
        `首帧：${shot.promptPack.firstFrame}`,
        `尾帧：${shot.promptPack.tailFrame ?? ""}`,
        `英文：${shot.promptPack.english}`,
        `负面：${shot.negativePrompt}`
      ].join("\n")
    )
    .join("\n\n");
}

export function storyboardToJianyingSrt(shots: StoryboardShot[]) {
  return storyboardToJianyingText(shots);
}

export function storyboardToJianyingText(shots: StoryboardShot[]) {
  return shots.map((shot) => `镜头${shot.index}：${shot.subtitle}`).join("\n");
}

export function storyboardToSrt(shots: StoryboardShot[]) {
  let cursor = 0;
  return shots
    .map((shot, idx) => {
      const seconds = Number.parseInt(shot.duration, 10) || 3;
      const start = formatSrtTime(cursor);
      cursor += seconds;
      const end = formatSrtTime(cursor);
      return `${idx + 1}\n${start} --> ${end}\n${shot.subtitle}`;
    })
    .join("\n\n");
}

export function shotToGenerationPack(shot: StoryboardShot, assets: MediaAsset[] = []) {
  const bound = generateShotReferenceBlock(bindingsToReferences(shotAssetsToLegacyBindings(getShotAssets(shot)), assets));
  return [
    `镜头${shot.index}｜${shot.duration}`,
    `状态：${shot.status}`,
    `评分：${shot.rating || 0}星`,
    `画面描述：${shot.visual}`,
    `动作描述：${shot.action}`,
    `镜头运动：${shot.camera}`,
    `光线氛围：${shot.lighting}`,
    `构图建议：${shot.composition}`,
    `绑定素材说明：${bound || "无"}`,
    `可灵提示词：${shot.klingPrompt}`,
    `即梦提示词：${shot.jimengPrompt}`,
    `图生视频提示词：${shot.imageToVideoPrompt}`,
    `负面提示词：${shot.negativePrompt}`,
    `字幕：${shot.subtitle}`,
    `旁白：${shot.voiceover}`,
    `备注：${shot.note || "无"}`
  ].join("\n");
}

export function klingSequencePromptPack(shots: StoryboardShot[], assets: MediaAsset[] = []) {
  return shots.map((shot) => [
    `镜头${shot.index}首帧提示词：`,
    shot.promptPack.firstFrame,
    "",
    `镜头${shot.index}图生视频提示词：`,
    shot.promptPack.klingImageToVideo || shot.imageToVideoPrompt,
    "",
    "素材参考：",
    generateShotReferenceBlock(bindingsToReferences(shotAssetsToLegacyBindings(getShotAssets(shot)), assets)) || "无"
  ].join("\n")).join("\n\n---\n\n");
}

export function projectToFullMarkdown(project: VideoProject, characters: CharacterProfile[], assets: MediaAsset[], groups: AssetGroup[] = []) {
  const linkedCharacters = characters.filter((item) => project.characterIds.includes(item.id));
  const linkedAssets = assets.filter((item) => project.assetIds.includes(item.id));
  const characterSection = linkedCharacters.map((item) => [
    `### ${item.name}`,
    `- 类型：${item.type}`,
    `- 外观：${item.appearance}`,
    `- 性格：${item.personality}`,
    `- 固定特征：${item.signatureFeatures}`,
    `- 常用服装/道具：${item.outfitsProps}`,
    `- 常用场景：${item.commonScenes}`,
    `- 禁止变化：${item.forbiddenChanges}`,
    `- 提示词模板：${item.promptTemplate}`,
    `- 备注：${item.note || "无"}`
  ].join("\n")).join("\n\n") || "暂无关联角色";
  const assetSection = linkedAssets.map((item) => `- ${item.name}｜${item.type}｜标签：${item.tags.join("、") || "无"}｜备注：${item.note || "无"}`).join("\n") || "暂无关联素材";
  const groupSection = groups.filter((group) => group.projectId === project.id).map((group) => `- ${group.name}`).join("\n") || "暂无素材分组";
  return [
    `# ${project.name} 完整制作文档`,
    "",
    "## 项目信息",
    `- 项目类型：${project.type}`,
    `- 视频比例：${project.aspectRatio}`,
    `- 视频时长：${project.duration}s`,
    `- 镜头数量：${project.shotCount}`,
    `- 创建时间：${project.createdAt}`,
    `- 最近编辑：${project.updatedAt}`,
    "",
    "## 项目描述",
    project.description || "暂无",
    "",
    "## 角色设定",
    characterSection,
    "",
    "## 项目素材分组",
    groupSection,
    "",
    "## 关联素材",
    assetSection,
    "",
    "## 分镜表",
    storyboardToMarkdown(project.shots),
    "",
    "## 每镜头完整生成包",
    project.shots.map((shot) => `### 镜头${shot.index}\n\n\`\`\`text\n${shotToGenerationPack(shot, assets)}\n\`\`\``).join("\n\n"),
    "",
    "## 剪映字幕",
    storyboardToJianyingText(project.shots),
    "",
    "## 旁白",
    project.shots.map((shot) => `镜头${shot.index}：${shot.voiceover}`).join("\n")
  ].join("\n");
}

export function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob(["\uFEFF", content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(filename: string, shots: StoryboardShot[]) {
  const colGroup = columns.map(() => `<col style="width:180px">`).join("");
  const htmlRows = [
    `<tr>${columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr>`,
    ...shots.map((shot) => `<tr>${columns.map(([key]) => `<td>${escapeHtml(String(shot[key] ?? ""))}</td>`).join("")}</tr>`)
  ].join("");
  const html = `<html><head><meta charset="UTF-8"><style>th{background:#111827;color:#fff;}td,th{border:1px solid #999;padding:8px;vertical-align:top;white-space:pre-wrap;}</style></head><body><table>${colGroup}${htmlRows}</table></body></html>`;
  downloadText(filename, html, "application/vnd.ms-excel;charset=utf-8");
}

function getShotAssets(shot: StoryboardShot): ShotBoundAsset[] {
  if (Array.isArray(shot.assets) && shot.assets.length) return shot.assets;
  return (shot.assetBindings ?? []).map((binding) => ({
    assetId: binding.assetId,
    usageType: binding.usage as AssetUsage,
    referenceText: binding.note,
    createdAt: new Date().toISOString()
  }));
}

function shotAssetsToLegacyBindings(items: ShotBoundAsset[]): ShotAssetBinding[] {
  return items.map((item) => ({
    assetId: item.assetId,
    usage: item.usageType,
    note: item.referenceText
  }));
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function cleanCell(value: string) {
  return value.replace(/\|/g, "｜").replace(/\n/g, "<br />");
}

function formatSrtTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)},000`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
