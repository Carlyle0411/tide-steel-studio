import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "projects", "tide-steel-soul", "asset-bible");
mkdirSync(root, { recursive: true });

const assetManifest = {
  project: "潮汐钢魂",
  bible: "电影资产圣经",
  naming_rule: {
    character: "CHAR_LINZHOU_001",
    mecha: "MECHA_CHITING01_012",
    environment: "ENV_HANGZHOU_003",
    shot: "SHOT_021",
    video: "VIDEO_084"
  },
  categories: [
    category("角色资产", "CHAR", ["林舟", "许燃", "陈牧", "唐小满", "AI澜"], characterVariants()),
    category("机甲资产", "MECHA", ["赤霆01", "玄鲸03", "白鸢07"], mechaVariants()),
    category("怪兽资产", "CREATURE", ["白潮", "刺潮", "黑潮母体"], creatureVariants()),
    category("场景资产", "ENV", ["杭州湾2042", "深蓝基地", "潮门", "海底废墟", "避难城市"], environmentVariants()),
    category("建筑资产", "BUILD", ["海上平台", "未来城市", "避难所", "雷达站", "灯塔", "巨型闸门", "海底建筑"], ["远景", "近景", "俯视", "夜景", "暴雨状态", "警报状态"]),
    category("道具资产", "PROP", ["驾驶头盔", "控制器", "机械手套", "身份卡", "武器", "终端", "AI核心", "能源电池"], ["静物", "手持", "使用中", "战损", "特写"]),
    category("特效资产", "FX", ["火花", "烟雾", "爆炸", "雨", "浪花", "闪电", "粒子", "火焰", "蓝色能量", "红色警报", "镜头光晕"], ["近景", "中景", "远景", "叠加层", "慢动作"]),
    category("天空天气", "SKY", ["晴天", "黄昏", "夜晚", "暴雨", "海雾", "低云", "闪电"], ["远景", "俯视", "海面反光", "城市边缘"]),
    category("灯光参考", "LIGHT", ["白天", "黄昏", "夜晚", "暴雨", "警报红光", "驾驶舱蓝光", "深海冷光"], ["人物", "机甲", "场景", "怪兽"]),
    category("构图素材", "COMP", ["中心构图", "人物小比例", "机甲局部", "海洋压迫", "门框构图", "背影"], ["横版", "低机位", "高机位", "固定镜头"]),
    category("海报素材", "POSTER", ["角色海报", "机甲海报", "怪兽海报", "群像海报", "概念海报"], ["竖版", "横版", "留白版", "标题版"]),
    category("视频片段素材", "VIDEO", ["暴风雨海面", "驾驶舱启动", "赤霆拔刀", "白潮浮上海面"], ["首帧", "尾帧", "可灵Prompt", "手动视频"])
  ],
  reuse_rule: "制作后续集数时，先搜索电影资产圣经；已有同类素材时优先复用，不重复生成。"
};

const shotLibrary = Array.from({ length: 100 }, (_, index) => {
  const names = [
    "海浪拍岸", "乌云移动", "基地灯光闪烁", "警报灯旋转", "驾驶舱启动", "HUD亮起", "巨大脚步", "机甲眼睛亮起", "雨滴落地", "人物回头",
    "闸门关闭", "海面反向水纹", "低频震动", "金属墙渗水", "远处雷光", "指挥屏闪烁", "手握控制器", "头盔落地", "蓝光扫过脸", "白潮剪影"
  ];
  const camera = ["固定镜头", "缓慢推镜", "拉镜", "升镜", "俯拍", "仰拍", "跟拍", "横移", "环绕", "微距"][index % 10];
  const lens = ["24mm", "35mm", "50mm", "85mm"][index % 4];
  return {
    id: `SHOT_${String(index + 1).padStart(3, "0")}`,
    name: names[index % names.length],
    type: camera,
    lens,
    use: "可复用于剧集、预告片、PV、短视频与海报动态设计。",
    rule: "镜头必须推动叙事，不为炫技而存在。"
  };
});

const videoLibrary = Array.from({ length: 150 }, (_, index) => {
  const subjects = ["暴风雨海面", "驾驶舱启动", "赤霆01拔刀", "白潮浮上海面", "基地警报", "人物回头", "机甲脚步", "潮门裂缝", "HUD亮起", "城市撤离"];
  const motions = ["慢推镜", "推近", "环绕", "跟拍", "固定停留", "横移", "低机位推进", "俯视下降", "手持轻微震动", "长焦压缩"];
  const subject = subjects[index % subjects.length];
  const motion = motions[index % motions.length];
  const id = `VIDEO_${String(index + 1).padStart(3, "0")}`;
  return {
    id,
    name: subject,
    first_frame: `${id}_FIRST.png`,
    last_frame: `${id}_LAST.png`,
    duration: index % 5 === 0 ? "8秒" : "5秒",
    camera_movement: motion,
    shot_language: index % 3 === 0 ? "电影广角" : index % 3 === 1 ? "情绪中景" : "细节特写",
    prompt: buildKlingPrompt(id, subject, motion),
    status: "规划中"
  };
});

writeJson("ASSET_BIBLE_MANIFEST.json", assetManifest);
writeJson("SHOT_LIBRARY.json", { count: shotLibrary.length, shots: shotLibrary });
writeJson("VIDEO_CLIP_LIBRARY.json", { count: videoLibrary.length, clips: videoLibrary });
writeJson("KlingPrompt.json", { count: videoLibrary.length, prompts: videoLibrary.map(({ id, name, prompt }) => ({ id, name, prompt })) });

console.log(`Asset Bible generated: ${assetManifest.categories.length} categories, ${shotLibrary.length} shots, ${videoLibrary.length} video clips.`);

function category(name, prefix, subjects, variants) {
  return {
    name,
    prefix,
    subjects,
    variants,
    status: "规划中",
    rule: "16:9，高质量电影概念图，统一世界观、颜色、角色、机甲和怪兽设计。"
  };
}

function characterVariants() {
  return ["正面", "45°", "侧面", "背面", "全身", "半身", "头像", "驾驶服", "便装", "战损", "受伤", "奔跑", "站立", "回头", "抬头", "低头", "拿武器", "驾驶动作", "怒吼", "微笑", "沉思", "哭泣", "剪影", "电影海报姿势", "白天", "黄昏", "夜晚", "暴雨", "警报红光", "驾驶舱蓝光"];
}

function mechaVariants() {
  return ["正面", "背面", "侧面", "45°", "俯视", "仰视", "驾驶舱", "驾驶舱开启", "驾驶舱关闭", "等离子链刃", "手部", "脚部", "推进器", "核心反应炉", "武器系统", "待机", "奔跑", "冲锋", "拔刀", "挥刀", "跳跃", "落地", "战损1", "战损2", "战损3", "巨大剪影", "海报姿势"];
}

function creatureVariants() {
  return ["完整身体", "头部", "眼睛", "嘴部", "皮肤细节", "背部", "尾巴", "冲上海面", "咆哮", "攻击", "受伤", "死亡", "海报姿势", "海中剪影"];
}

function environmentVariants() {
  return ["远景", "近景", "码头", "防线", "海面", "暴风雨", "黄昏", "夜景", "大雾", "无人机视角", "俯视", "大厅", "指挥中心", "驾驶舱", "维修区", "机库", "升降平台", "武器库", "实验室", "通道", "警报状态", "裂缝", "开启", "关闭", "内部空间"];
}

function buildKlingPrompt(id, subject, motion) {
  return [
    `片段: ${id} ${subject}`,
    "人物: 按镜头需要调用已审核角色资产",
    `动作: ${subject}发生细微但明确的电影动作`,
    "镜头: 真实电影摄影机，有物理重量",
    `运镜: ${motion}`,
    "速度: 克制，避免短视频式加速",
    "灯光: 深蓝、冷灰、低饱和，必要时加入警报红光",
    "情绪: 海洋压迫，人类尺度渺小",
    "Negative Prompt: anime, cartoon, game render, fake physics, random design, text, logo, watermark"
  ].join("\n");
}

function writeJson(name, value) {
  writeFileSync(join(root, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
