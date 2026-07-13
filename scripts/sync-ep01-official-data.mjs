import { writeFileSync } from "node:fs";

const now = "2026-07-14T00:00:00.000Z";

const keyframes = [
  ["KF02", "雨打观测站金属", "雨滴打在观测站外壳上，雨声比海浪更清楚，暗示海面异常安静。", ["外海观测站", "湿金属材质", "雨天"], "特写", "50mm", "固定机位"],
  ["KF03", "杯中水纹反向收缩", "用最小的物理证据告诉观众：世界规则正在改变。", ["外海观测站", "旧金属杯", "值班桌"], "微距特写", "85mm微距", "固定焦点"],
  ["KF04", "值守员停下手指", "屏幕没有报警，但人先察觉异常。", ["外海观测站", "值守员", "监测屏"], "中景", "35mm", "固定机位"],
  ["KF05", "浮标周围反向水纹", "外海出现同样的反向水纹，异常从室内证据变成外部事实。", ["杭州湾外海", "浮标阵列", "海防线"], "远景转特写", "35mm", "缓慢推进"],
  ["KF06", "深蓝基地冷蓝指挥中心", "异常进入人类决策空间，陈牧被巨大的系统包围。", ["深蓝基地", "指挥中心", "陈牧"], "远景", "24mm", "固定机位"],
  ["KF07", "陈牧茶杯水纹", "外海异常进入基地内部，证明这不是单点设备误差。", ["陈牧", "深蓝基地", "旧茶杯"], "特写", "85mm", "固定机位"],
  ["KF08", "AI澜系统层首次出现", "AI澜第一次出现必须像基地系统，不是助手，也不是人形。", ["AI澜系统界面", "深蓝基地"], "屏幕特写", "50mm", "固定机位"],
  ["KF09", "旧事故编号 DB-44-0918-A", "埋下三年前事故和林舟伤口，不解释，只让编号留下阴影。", ["AI澜系统界面", "深蓝基地", "旧事故档案"], "屏幕特写", "50mm", "短暂停留"],
  ["KF10", "陈牧听见低频", "陈牧不是迷信经验，而是真的听见了系统忽略的差异。", ["陈牧", "深蓝基地", "声呐监听设备"], "近景", "50mm", "缓慢推进"],
  ["KF11", "控制台双重确认", "关闭观测闸不是按按钮，而是一次会唤醒基地的选择。", ["陈牧", "控制台", "深蓝基地"], "手部特写", "85mm", "固定机位"],
  ["KF12", "外海观测闸关闭", "EP01视觉高潮。陈牧关闭的不只是一扇闸门，也像在面对一个过去的错误。", ["观测闸", "杭州湾外海", "海防线"], "中远景", "24mm", "固定机位"],
  ["KF13", "基地蓝色预警灯亮起", "关闭完成后，基地不是混乱，而是被逐步叫醒。", ["深蓝基地", "蓝色预警灯", "走廊"], "中景", "35mm", "固定机位"],
  ["KF14", "赤霆背部舱门关闭", "伏笔EP02，只展示背部舱门和湿冷装甲，不展示完整机甲。", ["赤霆01背部", "深蓝基地", "机库"], "中远景", "50mm", "固定机位"],
  ["KF15", "海面水纹继续扩大", "最后的问题：不是怪兽来了，而是某个生命已经听见人类回应。", ["杭州湾外海", "浮标阵列", "观测闸"], "远景转特写", "35mm", "缓慢推进"]
].map(([id, title, purpose, required_assets, shotSize, lens, movement]) => ({
  constIndex: Number(String(id).replace("KF", "")),
  id,
  shot: `EP01_SHOT_${String(Number(String(id).replace("KF", ""))).padStart(3, "0")}`,
  title,
  purpose,
  required_assets,
  status: "planning",
  duration: 15,
  shotSize,
  lens,
  movement,
  approved_image: "",
  draft_image: "",
  project_image: "",
  review_gate: "ep01_official_script_locked",
  updatedAt: now
}));

function imagePrompt(item) {
  return [
    `关键帧：${item.id}《${item.title}》`,
    `剧情目的：${item.purpose}`,
    `必须参考母资产：${item.required_assets.join(" / ")}`,
    `画面内容：生成一张16:9电影关键帧，景别为${item.shotSize}，镜头为${item.lens}，运动感为${item.movement}。画面必须服务于“海面低频”的异常发现，不要提前展示怪兽大战或机甲战斗。`,
    "摄影与材质：真实电影摄影，低饱和冷灰海防世界，湿金属、雨痕、水汽和玻璃反射真实可见。",
    "禁止：动漫、游戏CG、夸张赛博朋克、能量特效、文字、字幕、logo、水印。"
  ].join("\n");
}

function klingPrompt(item, index) {
  return [
    `镜头组：${item.shot}《${item.title}》`,
    "时长：15秒，包含2-4个分镜头。",
    `动机：${item.purpose}`,
    `拍摄：以${item.shotSize}为主，${item.lens}镜头，${item.movement}，保持真实摄影机重量和空间连续。`,
    "分镜：先交代环境或物件状态，再让异常或人物反应出现，最后停在一个不可逆的结果上。",
    "运动规律：人物动作必须有原因，设备、雨水、海面和灯光按真实物理变化，不要所有元素同时乱动。",
    "情绪：克制、压低、未知靠近，不要英雄化，不要灾难奇观化。",
    `参考：使用对应关键帧 ${item.id} 作为首帧Reference，并参考母资产 ${item.required_assets.join(" / ")}。`
  ].join("\n");
}

writeFileSync("projects/tide-steel-soul/EP01/EP01_KEYFRAME_MANIFEST.json", JSON.stringify({
  episode: "EP01",
  title: "海面低频",
  format: "16:9电影级关键帧",
  status: "official_ep01_keyframe_manifest",
  source: "SCRIPT_EP01_海面低频_剧本开发版.md",
  keyframes
}, null, 2), "utf8");

writeFileSync("projects/tide-steel-soul/EP01/EP01_KEYFRAME_TASKS.json", JSON.stringify({
  episode: "EP01",
  title: "海面低频",
  status: "official_ep01_keyframe_tasks",
  tasks: keyframes.map((item) => ({
    task_id: `TASK_EP01_${item.id}`,
    keyframe_id: item.id,
    shot: item.shot,
    task_type: "manual_gpt_image_keyframe_generation",
    status: "prompt_ready",
    output_path: `projects/tide-steel-soul/assets/keyframes/ep01/EP01_${item.id}.png`,
    prompt: imagePrompt(item),
    generated_image: "",
    review_gate: "manual_review_required",
    updatedAt: now
  }))
}, null, 2), "utf8");

writeFileSync("projects/tide-steel-soul/EP01/EP01_KLING_PROMPTS.json", JSON.stringify({
  episode: "EP01",
  title: "海面低频",
  status: "official_ep01_kling_prompts",
  prompts: keyframes.map((item, index) => ({
    id: `KLING_EP01_${String(item.constIndex).padStart(3, "0")}`,
    shot: item.shot,
    keyframe_id: item.id,
    title: item.title,
    duration: 15,
    prompt: klingPrompt(item, index),
    reference_keyframe: `EP01_${item.id}`,
    required_assets: item.required_assets,
    updatedAt: now
  }))
}, null, 2), "utf8");

const shots = keyframes.map((item, index) => ({
  id: `SHOT-EP01-${String(item.constIndex).padStart(3, "0")}`,
  shotId: item.shot,
  keyframeId: item.id,
  episode: "EP01",
  order: index + 1,
  name: item.title,
  description: item.purpose,
  type: item.shotSize,
  camera: item.movement,
  lens: item.lens,
  duration: 15,
  status: "草稿 Draft",
  tags: ["EP01", "海面低频", "正式剧情"],
  characters: item.required_assets.filter((asset) => ["陈牧", "值守员", "AI澜系统界面"].includes(asset)),
  mechas: item.required_assets.filter((asset) => asset.includes("赤霆")),
  creatures: [],
  scenes: item.required_assets.filter((asset) => !["陈牧", "值守员", "AI澜系统界面"].includes(asset) && !asset.includes("赤霆")),
  requiredAssets: item.required_assets,
  linkedAssets: [],
  promptId: `PROMPT-EP01-${String(item.constIndex).padStart(3, "0")}`,
  videoPromptId: `KLING-EP01-${String(item.constIndex).padStart(3, "0")}`,
  review: "草稿 Draft",
  createdAt: now,
  updatedAt: now
}));

writeFileSync("projects/tide-steel-soul/industrial-workflow/Shot.json", JSON.stringify({
  schema: "Tide Steel Soul Industrial Shot",
  generatedAt: now,
  source: "SCRIPT_EP01_海面低频_剧本开发版.md",
  shots
}, null, 2), "utf8");

let cursor = 0;
writeFileSync("projects/tide-steel-soul/industrial-workflow/Timeline.json", JSON.stringify({
  id: "TIMELINE-EP01-001",
  episode: "EP01",
  title: "EP01 海面低频 Timeline",
  zoom: 1,
  duration: shots.reduce((sum, shot) => sum + shot.duration, 0),
  tracks: [
    {
      id: "TRACK-VIDEO",
      name: "视频",
      type: "video",
      locked: false,
      hidden: false,
      items: shots.map((shot) => {
        const item = {
          id: `VIDEO-${shot.shotId}`,
          shot: shot.shotId,
          start: cursor,
          duration: shot.duration,
          label: shot.name,
          status: shot.status
        };
        cursor += shot.duration;
        return item;
      })
    }
  ],
  updatedAt: now
}, null, 2), "utf8");

writeFileSync("projects/tide-steel-soul/industrial-workflow/Relationship.json", JSON.stringify({
  schema: "Tide Steel Soul Industrial Relationship",
  generatedAt: now,
  source: "SCRIPT_EP01_海面低频_剧本开发版.md",
  relationships: shots.flatMap((shot) => shot.requiredAssets.map((asset) => ({
    fromType: "Shot",
    fromId: shot.shotId,
    fromName: shot.name,
    toType: "AssetRequirement",
    toId: asset,
    toName: asset,
    episode: "EP01"
  })))
}, null, 2), "utf8");
