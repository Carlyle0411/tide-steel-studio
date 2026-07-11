import assetDatabaseMd from "../../../ASSET_DATABASE.md?raw";
import visualPipelineMd from "../../../VISUAL_PIPELINE_BIBLE.md?raw";
import imageRulesMd from "../../../IMAGE_GENERATION_RULES.md?raw";
import whiteTideRulesMd from "../../../WHITE_TIDE_IMAGE_RULES.md?raw";
import tideGateRulesMd from "../../../TIDE_GATE_IMAGE_RULES.md?raw";
import { parseAssetDatabase } from "../../pages/production/data/markdown";

export type AssetSafetyContext = {
  assetId?: string;
  assetStatus?: "draft" | "review" | "approved" | "deprecated";
  episodeId?: string;
  targetToolId?: string;
  targetStage?: "storyboard" | "image" | "video" | "review" | "export";
  subject?: string;
  prompt?: string;
  consistencyPassed?: boolean;
  registered?: boolean;
};

export type AssetSafetyResult = {
  allowed: boolean;
  reasons: string[];
  sources: string[];
};

const registeredAssets = parseAssetDatabase(assetDatabaseMd);
const safetySources = [
  "ASSET_DATABASE.md",
  "VISUAL_PIPELINE_BIBLE.md",
  "IMAGE_GENERATION_RULES.md",
  "WHITE_TIDE_IMAGE_RULES.md",
  "TIDE_GATE_IMAGE_RULES.md"
];

export function runAssetSafetyCheck(context: AssetSafetyContext): AssetSafetyResult {
  const reasons: string[] = [];
  const status = resolveStatus(context);
  const registered = context.registered ?? (context.assetId ? registeredAssets.some((asset) => asset.id === context.assetId) : true);
  const prompt = `${context.prompt ?? ""} ${context.subject ?? ""}`.toLowerCase();
  const episode = context.episodeId ?? "";

  if (context.targetToolId === "kling" && status === "draft") reasons.push("draft资产不能进入Kling。");
  if (context.targetToolId === "veo" && status === "review") reasons.push("review资产不能进入Veo。");
  if (status === "deprecated" && context.targetStage !== "review") reasons.push("deprecated资产不能用于新镜头。");
  if (context.targetStage === "storyboard" && !registered) reasons.push("未登记资产不能进入Storyboard。");
  if (context.targetStage === "review" && context.consistencyPassed === false) reasons.push("未通过Consistency Check不能Approve。");
  if (/white[_\s-]?tide|白潮/.test(prompt) && /full body|完整|全身|complete reveal|boss/.test(prompt) && /^EP0[1-3]$/.test(episode)) reasons.push("白潮未到展示阶段不能完整出现。");
  if (/crt001|赤霆|red thunder/.test(prompt) && /full body|完整|全身|hero pose/.test(prompt) && episode === "EP01") reasons.push("赤霆EP01不能完整出现。");
  if (/ai澜|ai lan|lan/.test(prompt) && /human|girl|face|avatar|人形|少女|头像/.test(prompt) && episode === "EP01") reasons.push("AI澜EP01不能人形化。");

  return {
    allowed: reasons.length === 0,
    reasons,
    sources: safetySources
  };
}

export function getSafetySourceDigest() {
  return {
    assetDatabase: assetDatabaseMd.length,
    visualPipeline: visualPipelineMd.length,
    imageRules: imageRulesMd.length,
    whiteTideRules: whiteTideRulesMd.length,
    tideGateRules: tideGateRulesMd.length
  };
}

function resolveStatus(context: AssetSafetyContext) {
  if (context.assetStatus) return context.assetStatus;
  const asset = context.assetId ? registeredAssets.find((item) => item.id === context.assetId) : undefined;
  return asset?.status ?? "draft";
}
