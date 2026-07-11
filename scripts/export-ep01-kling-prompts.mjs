import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ep01Root = join(process.cwd(), "projects", "tide-steel-soul", "EP01");
const manifest = JSON.parse(readFileSync(join(ep01Root, "EP01_KEYFRAME_MANIFEST.json"), "utf8"));

const prompts = manifest.keyframes.map((keyframe) => ({
  shot: keyframe.shot,
  title: keyframe.title,
  prompt: [
    `Shot: ${keyframe.shot} - ${keyframe.title}`,
    "Duration: 5秒",
    "Camera: 电影级真实摄影机，镜头运动克制，有物理重量",
    "Lens: 24mm建立尺度，35mm建立环境，50mm处理人物与机甲关系，85mm用于情绪细节",
    "Movement: 缓慢推进或稳定跟拍，禁止短视频式晃动",
    `Character Action: ${keyframe.purpose}`,
    `Environment: 《潮汐钢魂》EP01，湿冷海防世界，需要绑定资产：${keyframe.required_assets.join(", ")}`,
    "Lighting: 低饱和暴风雨光线，冷蓝工业光，只使用真实光源逻辑",
    "Emotion: 未知压迫，人类尺度面对海洋尺度",
    "Sound: 深海低频、远处金属震动、克制机械细节",
    "Negative Prompt: anime, cartoon, game render, fake physics, plastic surface, over-saturated colors, text, logo, watermark, random character face, changed mech design"
  ].join("\n")
}));

writeFileSync(join(ep01Root, "EP01_KLING_PROMPTS.json"), `${JSON.stringify({ episode: "EP01", video_api: "manual_kling_only", prompts }, null, 2)}\n`, "utf8");
console.log(`Exported ${prompts.length} Kling prompt(s).`);
