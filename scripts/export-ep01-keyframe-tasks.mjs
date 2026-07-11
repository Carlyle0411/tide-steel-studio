import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ep01Root = join(process.cwd(), "projects", "tide-steel-soul", "EP01");
const manifest = JSON.parse(readFileSync(join(ep01Root, "EP01_KEYFRAME_MANIFEST.json"), "utf8"));

const tasks = manifest.keyframes.map((keyframe) => ({
  task_id: `TASK_${keyframe.shot}`,
  episode: "EP01",
  shot: keyframe.shot,
  title: keyframe.title,
  task_type: "local_codex_keyframe_generation",
  status: "draft",
  output_path: `projects/tide-steel-soul/assets/keyframes/ep01/${keyframe.shot}.png`,
  required_assets: keyframe.required_assets,
  prompt_seed: keyframe.purpose,
  review_gate: "generated_image_must_enter_review_before_approved"
}));

writeFileSync(join(ep01Root, "EP01_KEYFRAME_TASKS.json"), `${JSON.stringify({ episode: "EP01", tasks }, null, 2)}\n`, "utf8");
console.log(`Exported ${tasks.length} EP01 keyframe task(s).`);
