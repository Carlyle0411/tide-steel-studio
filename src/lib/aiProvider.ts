import { generateStoryboard } from "./generator";
import { loadLocal, saveLocal } from "./storage";
import { AISettings, AssetAnalysis, CharacterProfile, FormState, MediaAsset, StoryboardShot, VideoProject } from "../types";

const aiSettingsKey = "video-workbench-ai-settings";

export type AiProviderPayload = {
  project?: VideoProject;
  form: FormState;
  characters: CharacterProfile[];
  assets: MediaAsset[];
  assetGroups?: { id: string; name: string }[];
};

export function getAISettings(): AISettings {
  return loadLocal<AISettings>(aiSettingsKey, {
    provider: "local",
    apiKey: "",
    model: "gpt-4o-mini"
  });
}

export function saveAISettings(settings: AISettings) {
  saveLocal(aiSettingsKey, settings);
}

export async function testAIConnection(settings = getAISettings()) {
  if (settings.provider === "local") return { ok: true, message: "当前使用本地模板，不需要 API Key。" };
  if (!settings.apiKey.trim()) return { ok: false, message: "缺少 API Key，已回退本地模板。" };
  try {
    await callChatCompletion(settings, [{ role: "user", content: "只回复 OK" }], false);
    const next = { ...settings, lastTestAt: new Date().toISOString(), lastError: "" };
    saveAISettings(next);
    return { ok: true, message: "AI 连接测试通过。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    saveAISettings({ ...settings, lastError: message });
    return { ok: false, message };
  }
}

export async function generateStoryboardWithAI(payload: AiProviderPayload): Promise<StoryboardShot[]> {
  const settings = getAISettings();
  if (settings.provider === "local" || !settings.apiKey.trim()) {
    return generateStoryboard(payload.form, payload.characters, payload.assets);
  }
  try {
    const messages = [
      {
        role: "system",
        content:
          "你是专业AI视频导演和分镜提示词工程师。必须输出严格JSON，不要Markdown。JSON结构为 {\"shots\":[...]}。"
      },
      {
        role: "user",
        content: buildStoryboardRequest(payload)
      }
    ];
    const content = await callChatCompletion(settings, messages, true);
    const parsed = parseJson(content);
    const rawShots = Array.isArray(parsed?.shots) ? parsed.shots : [];
    if (!rawShots.length) throw new Error("AI 没有返回 shots 数组。");
    return rawShots.slice(0, payload.form.shotCount).map((shot: any, idx: number) => normalizeAIShot(shot, idx));
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 生成失败";
    saveAISettings({ ...settings, lastError: `${message}，已回退本地模板。` });
    return generateStoryboard(payload.form, payload.characters, payload.assets);
  }
}

export async function generatePromptWithAI(shot: StoryboardShot, assets: MediaAsset[] = []) {
  const settings = getAISettings();
  if (settings.provider === "local" || !settings.apiKey.trim()) {
    const assetText = assets.length ? `\n绑定素材：${assets.map((asset) => asset.name).join("、")}` : "";
    return `${shot.promptPack.detailedCn}${assetText}`;
  }
  const content = await callChatCompletion(settings, [
    { role: "system", content: "你是AI视频提示词优化助手，输出中文详细提示词和英文通用提示词。" },
    { role: "user", content: JSON.stringify({ shot, assets: assets.map(lightAsset) }, null, 2) }
  ]);
  return content;
}

export async function analyzeAssetWithAI(asset: MediaAsset): Promise<AssetAnalysis> {
  const settings = getAISettings();
  if (settings.provider === "local" || !settings.apiKey.trim()) return localAnalyzeAsset(asset);
  try {
    const content = await callChatCompletion(settings, [
      { role: "system", content: "你是视频素材管理助手。只能根据文件名、类型、标签、备注分析，不要假装看到了图片内容。输出严格JSON。" },
      { role: "user", content: JSON.stringify(lightAsset(asset), null, 2) }
    ], true);
    return { ...localAnalyzeAsset(asset), ...parseJson(content) };
  } catch {
    return localAnalyzeAsset(asset);
  }
}

export async function generateCaptionWithAI(shots: StoryboardShot[]) {
  const settings = getAISettings();
  if (settings.provider === "local" || !settings.apiKey.trim()) {
    return shots.map((shot) => `镜头${shot.index}：${shot.subtitle}`).join("\n");
  }
  return callChatCompletion(settings, [
    { role: "system", content: "把分镜字幕整理成剪映可用文案，每行格式：镜头N：字幕。" },
    { role: "user", content: JSON.stringify(shots.map((shot) => ({ index: shot.index, subtitle: shot.subtitle }))) }
  ]);
}

async function callChatCompletion(settings: AISettings, messages: Array<{ role: string; content: string }>, json = false) {
  const baseUrl = settings.provider === "deepseek" ? "https://api.deepseek.com/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const model = settings.model || (settings.provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      response_format: json ? { type: "json_object" } : undefined
    })
  });
  if (!response.ok) throw new Error(`AI 请求失败：${response.status} ${await response.text()}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function buildStoryboardRequest(payload: AiProviderPayload) {
  return JSON.stringify({
    task: "生成AI视频结构化分镜",
    requiredJsonShape: {
      shots: [{
        id: "string",
        index: "number",
        duration: "string",
        shotSize: "string",
        scene: "string",
        action: "string",
        camera: "string",
        lighting: "string",
        composition: "string",
        subtitle: "string",
        voiceover: "string",
        promptShortCN: "string",
        promptDetailCN: "string",
        promptEN: "string",
        klingTextPrompt: "string",
        klingImagePrompt: "string",
        jimengPrompt: "string",
        hailuoPrompt: "string",
        runwayPrompt: "string",
        firstFramePrompt: "string",
        lastFramePrompt: "string",
        negativePrompt: "string"
      }]
    },
    project: payload.project ? {
      name: payload.project.name,
      type: payload.project.type,
      description: payload.project.description
    } : undefined,
    form: payload.form,
    characters: payload.characters,
    assetGroups: payload.assetGroups,
    selectedAssets: payload.assets.map(lightAsset)
  }, null, 2);
}

function normalizeAIShot(shot: any, idx: number): StoryboardShot {
  const id = shot.id || crypto.randomUUID();
  const visual = shot.scene || shot.visual || shot.promptShortCN || "";
  const action = shot.action || "";
  return {
    id,
    index: Number(shot.index || idx + 1),
    duration: String(shot.duration || "4s"),
    shotSize: shot.shotSize || "中景",
    visual,
    action,
    camera: shot.camera || "缓慢推进",
    lighting: shot.lighting || "自然电影光",
    composition: shot.composition || "主体清晰，空间有层次",
    klingPrompt: shot.klingTextPrompt || shot.promptDetailCN || visual,
    jimengPrompt: shot.jimengPrompt || shot.promptDetailCN || visual,
    imageToVideoPrompt: shot.klingImagePrompt || shot.promptDetailCN || visual,
    hailuoPrompt: shot.hailuoPrompt || shot.promptDetailCN || visual,
    negativePrompt: shot.negativePrompt || "低清晰度, 水印, 变形, 闪烁, 多余肢体, 错乱文字",
    subtitle: shot.subtitle || "",
    voiceover: shot.voiceover || "",
    status: "待生成",
    rating: 0,
    note: "",
    recommendedAssetIds: [],
    assets: [],
    assetBindings: [],
    promptPack: {
      conciseCn: shot.promptShortCN || visual,
      detailedCn: shot.promptDetailCN || visual,
      english: shot.promptEN || shot.runwayPrompt || "",
      klingTextToVideo: shot.klingTextPrompt || "",
      klingImageToVideo: shot.klingImagePrompt || "",
      jimengImage: shot.jimengPrompt || "",
      hailuoVideo: shot.hailuoPrompt || "",
      universalEnglish: shot.runwayPrompt || shot.promptEN || "",
      firstFrame: shot.firstFramePrompt || "",
      tailFrame: shot.lastFramePrompt || ""
    }
  };
}

function parseJson(content: string) {
  const trimmed = content.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  return JSON.parse(trimmed);
}

function lightAsset(asset: MediaAsset) {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    tags: asset.tags,
    note: asset.note,
    usageType: asset.usageType,
    width: asset.width,
    height: asset.height,
    duration: asset.duration,
    size: asset.size
  };
}

function localAnalyzeAsset(asset: MediaAsset): AssetAnalysis {
  const text = `${asset.name} ${asset.tags.join(" ")} ${asset.note}`.toLowerCase();
  const tags = new Set(asset.tags);
  if (/赤霆|机甲|驾驶舱/.test(text)) ["机甲", "驾驶舱", "结构参考"].forEach((tag) => tags.add(tag));
  if (/阿墨|猫|奶牛猫/.test(text)) ["阿墨", "角色标准图", "宠物IP"].forEach((tag) => tags.add(tag));
  if (/桂花糖|女装|门店|试衣/.test(text)) ["女装", "门店", "高级感"].forEach((tag) => tags.add(tag));
  const usage = /音|bgm|music/.test(text) || asset.type === "audio" ? "BGM参考" : /动作|视频/.test(text) || asset.type === "video" ? "动作参考" : /产品/.test(text) ? "产品参考" : "风格参考";
  return {
    suitableUsages: [usage, "首帧参考", "场景参考"],
    recommendedTags: Array.from(tags),
    recommendedGroupNames: Array.from(tags).slice(0, 3),
    klingPrompt: `${asset.name}作为${usage}，保持主体稳定、构图清晰、光影自然。`,
    recommendedShotUsage: usage,
    styleDescription: asset.note || `${asset.name}适合用于${usage}，可根据文件名和标签辅助生成提示词。`,
    summary: "本地规则分析：仅基于文件名、类型、标签和备注，未识别实际画面内容。"
  };
}
