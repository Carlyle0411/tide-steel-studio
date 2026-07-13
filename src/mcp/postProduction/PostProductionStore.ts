import { trailer90Shots } from "../trailer/Trailer90StudioData";

export type PostCategory = "角色动作" | "机甲动作" | "怪兽动作" | "场景运动" | "战斗镜头" | "情绪镜头" | "转场素材";
export type TrailerCutType = "15秒预告" | "30秒预告" | "90秒预告" | "4分钟短片";
export type SubtitleKind = "旁白字幕" | "角色对白字幕" | "信息字幕" | "预告片大字标题";
export type VoiceRole = "旁白" | "林舟" | "许燃" | "陈牧" | "AI澜";
export type AudioCategory = "海洋环境" | "风暴" | "巨兽低吼" | "机甲启动" | "能源声" | "金属碰撞" | "战斗爆炸" | "情绪音乐";

export type VideoMaterialMetadata = {
  key: string;
  videoId: string;
  category: PostCategory;
  tags: string[];
  linkedAssets: string[];
  shotType: string;
  tool: "可灵" | "Veo" | "Runway" | "手动导入";
  notes: string;
};

export type TrailerEditShot = {
  id: string;
  cutType: TrailerCutType;
  order: number;
  sourceShotId: string;
  name: string;
  duration: number;
  linkedAssets: string[];
  emotion: string;
  function: string;
  rhythm: "慢" | "中" | "快";
  notes: string;
};

export type SubtitleItem = {
  id: string;
  type: SubtitleKind;
  start: string;
  end: string;
  text: string;
  speaker: string;
  font: string;
  size: number;
  position: string;
  animation: string;
};

export type VoiceItem = {
  id: string;
  role: VoiceRole;
  text: string;
  voiceType: string;
  speed: string;
  emotion: string;
  version: string;
  notes: string;
};

export type AudioItem = {
  id: string;
  name: string;
  category: AudioCategory;
  shotId: string;
  tags: string[];
  fileName?: string;
  dataUrl?: string;
  duration?: number;
  notes: string;
};

export type TransitionItem = {
  id: string;
  name: string;
  type: "黑场" | "闪白" | "能量波纹" | "海水遮挡" | "镜头推进" | "故障效果";
  usage: string;
  duration: number;
  preview?: string;
  notes: string;
};

export type FilmIntroItem = {
  id: string;
  kind: "人物介绍" | "场景介绍" | "机甲介绍";
  target: string;
  line1: string;
  line2: string;
  start: string;
  end: string;
  animation: string;
  linkedAsset: string;
};

export type PostProductionState = {
  videoMetadata: Record<string, VideoMaterialMetadata>;
  trailerShots: TrailerEditShot[];
  subtitles: SubtitleItem[];
  voices: VoiceItem[];
  audio: AudioItem[];
  transitions: TransitionItem[];
  intros: FilmIntroItem[];
};

const KEY = "tide-steel-post-production-v1";
const EVENT = "tide-steel-post-production-change";

export function loadPostProductionState(): PostProductionState {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null") as PostProductionState | null;
    return value ? mergeSeeds(value) : createSeedState();
  } catch {
    return createSeedState();
  }
}

export function savePostProductionState(value: PostProductionState) {
  localStorage.setItem(KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

export function subscribePostProduction(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function upsertVideoMetadata(key: string, patch: Partial<VideoMaterialMetadata>) {
  const state = loadPostProductionState();
  const current = state.videoMetadata[key] ?? defaultVideoMetadata(key);
  state.videoMetadata[key] = { ...current, ...patch, key };
  savePostProductionState(state);
}

export function updateTrailerShot(id: string, patch: Partial<TrailerEditShot>) {
  const state = loadPostProductionState();
  state.trailerShots = state.trailerShots.map((item) => item.id === id ? { ...item, ...patch } : item);
  savePostProductionState(state);
}

export function moveTrailerShot(id: string, direction: -1 | 1) {
  const state = loadPostProductionState();
  const shot = state.trailerShots.find((item) => item.id === id);
  if (!shot) return;
  const siblings = state.trailerShots.filter((item) => item.cutType === shot.cutType).sort((a, b) => a.order - b.order);
  const index = siblings.findIndex((item) => item.id === id);
  const target = siblings[index + direction];
  if (!target) return;
  state.trailerShots = state.trailerShots.map((item) => {
    if (item.id === shot.id) return { ...item, order: target.order };
    if (item.id === target.id) return { ...item, order: shot.order };
    return item;
  });
  savePostProductionState(state);
}

export function addSubtitle() {
  const state = loadPostProductionState();
  const item: SubtitleItem = { id: nextId("SUB", state.subtitles.length + 1), type: "旁白字幕", start: "00:00:00", end: "00:00:03", text: "新的字幕文本", speaker: "旁白", font: "思源黑体 / 粗体", size: 46, position: "下三分之一", animation: "淡入淡出" };
  state.subtitles.push(item);
  savePostProductionState(state);
  return item;
}

export function updateSubtitle(id: string, patch: Partial<SubtitleItem>) {
  const state = loadPostProductionState();
  state.subtitles = state.subtitles.map((item) => item.id === id ? { ...item, ...patch } : item);
  savePostProductionState(state);
}

export function deleteSubtitle(id: string) {
  const state = loadPostProductionState();
  state.subtitles = state.subtitles.filter((item) => item.id !== id);
  savePostProductionState(state);
}

export function addVoice() {
  const state = loadPostProductionState();
  const item: VoiceItem = { id: nextId("VOICE", state.voices.length + 1), role: "旁白", text: "新的配音文本", voiceType: "低沉电影旁白", speed: "中慢", emotion: "压低音量，句尾留白", version: "V001", notes: "等待录制或导入" };
  state.voices.push(item);
  savePostProductionState(state);
  return item;
}

export function updateVoice(id: string, patch: Partial<VoiceItem>) {
  const state = loadPostProductionState();
  state.voices = state.voices.map((item) => item.id === id ? { ...item, ...patch } : item);
  savePostProductionState(state);
}

export function deleteVoice(id: string) {
  const state = loadPostProductionState();
  state.voices = state.voices.filter((item) => item.id !== id);
  savePostProductionState(state);
}

export async function addAudio(file?: File) {
  const state = loadPostProductionState();
  const item: AudioItem = {
    id: nextId("AUD", state.audio.length + 1),
    name: file?.name.replace(/\.[^.]+$/, "") || "新音频素材",
    category: "海洋环境",
    shotId: "TR01",
    tags: ["待整理"],
    fileName: file?.name,
    dataUrl: file ? await fileToDataUrl(file) : undefined,
    notes: "可关联到预告片或 EP01 的具体镜头"
  };
  state.audio.push(item);
  savePostProductionState(state);
  return item;
}

export function updateAudio(id: string, patch: Partial<AudioItem>) {
  const state = loadPostProductionState();
  state.audio = state.audio.map((item) => item.id === id ? { ...item, ...patch } : item);
  savePostProductionState(state);
}

export function deleteAudio(id: string) {
  const state = loadPostProductionState();
  state.audio = state.audio.filter((item) => item.id !== id);
  savePostProductionState(state);
}

export function updateTransition(id: string, patch: Partial<TransitionItem>) {
  const state = loadPostProductionState();
  state.transitions = state.transitions.map((item) => item.id === id ? { ...item, ...patch } : item);
  savePostProductionState(state);
}

export async function setTransitionPreview(id: string, file: File) {
  const dataUrl = await fileToDataUrl(file);
  updateTransition(id, { preview: dataUrl });
}

export function updateIntro(id: string, patch: Partial<FilmIntroItem>) {
  const state = loadPostProductionState();
  state.intros = state.intros.map((item) => item.id === id ? { ...item, ...patch } : item);
  savePostProductionState(state);
}

export function buildSrt(subtitles: SubtitleItem[]) {
  return subtitles.map((item, index) => `${index + 1}\n${item.start},000 --> ${item.end},000\n${item.speaker ? `${item.speaker}：` : ""}${item.text}\n`).join("\n");
}

export function createFinalPackageManifest(state: PostProductionState, videoCount: number) {
  return {
    project: "潮汐钢魂 Tide Steel Soul",
    packageType: "AI电影后期制作包",
    generatedAt: new Date().toISOString(),
    videoMaterials: videoCount,
    trailerTimeline: state.trailerShots,
    subtitles: state.subtitles,
    voices: state.voices,
    audio: state.audio.map((item) => ({ ...item, dataUrl: item.dataUrl ? "[local-browser-file]" : undefined })),
    transitions: state.transitions.map((item) => ({ ...item, preview: item.preview ? "[local-browser-file]" : undefined })),
    filmIntros: state.intros,
    exportTargets: ["剪映工程素材包", "字幕文件", "配音文本", "BGM与音效索引", "镜头清单", "Prompt记录"]
  };
}

function createSeedState(): PostProductionState {
  return {
    videoMetadata: {},
    trailerShots: seedTrailerShots(),
    subtitles: [
      { id: "SUB-001", type: "旁白字幕", start: "00:00:00", end: "00:00:05", text: "2042年，杭州湾深处，出现未知低频。", speaker: "旁白", font: "思源黑体 / 粗体", size: 46, position: "下三分之一", animation: "缓慢淡入" },
      { id: "SUB-002", type: "预告片大字标题", start: "00:00:52", end: "00:00:56", text: "它不是来毁灭我们的。", speaker: "", font: "思源黑体 / Heavy", size: 68, position: "画面中央", animation: "黑场淡入" },
      { id: "SUB-003", type: "信息字幕", start: "00:01:26", end: "00:01:30", text: "潮汐钢魂：赤霆纪元", speaker: "", font: "思源黑体 / Heavy", size: 76, position: "画面中央", animation: "低频震动入场" }
    ],
    voices: [
      { id: "VOICE-001", role: "旁白", text: "我们一直以为，潮汐是战争。", voiceType: "低沉电影旁白", speed: "中慢", emotion: "压低音量，第一句像回忆，不要播音腔", version: "V001", notes: "预告片开头使用" },
      { id: "VOICE-002", role: "林舟", text: "如果它不是敌人呢？", voiceType: "年轻男性驾驶员", speed: "短促", emotion: "呼吸不稳，声音压住恐惧，最后一个字放轻", version: "V001", notes: "高潮前留白" },
      { id: "VOICE-003", role: "AI澜", text: "最高攻击建议，延迟零点七秒。", voiceType: "冷静系统声", speed: "稳定", emotion: "无情绪，但第二个短句出现极轻停顿", version: "V001", notes: "AI澜异常点" }
    ],
    audio: [
      { id: "AUD-001", name: "深海低频底噪", category: "海洋环境", shotId: "TR01", tags: ["低频", "开场"], notes: "从海风下面进入，不要明显音乐化" },
      { id: "AUD-002", name: "赤霆液压承重", category: "机甲启动", shotId: "TR07", tags: ["机甲", "重量"], notes: "第一记重拍，压过音乐" },
      { id: "AUD-003", name: "白潮甲壳低鸣", category: "巨兽低吼", shotId: "TR16", tags: ["白潮", "未知"], notes: "不是咆哮，更像深海压力变化" }
    ],
    transitions: [
      { id: "TRANS-001", name: "黑场呼吸", type: "黑场", usage: "从人物疼痛切到低频空白", duration: 0.6, notes: "黑场不完全静音，保留一层潮声" },
      { id: "TRANS-002", name: "海水遮挡", type: "海水遮挡", usage: "从白潮局部切入潮门", duration: 0.8, notes: "画面被浪花吞没，再露出另一处海底空间" },
      { id: "TRANS-003", name: "冷蓝故障跳切", type: "故障效果", usage: "AI澜延迟0.7秒处", duration: 0.4, notes: "只让系统界面轻微断帧，禁止花哨数字雨" }
    ],
    intros: [
      { id: "INTRO-001", kind: "人物介绍", target: "林舟", line1: "LIN ZHOU", line2: "赤霆01驾驶员 / 23岁", start: "00:00:18", end: "00:00:22", animation: "左侧细线展开", linkedAsset: "角色母资产：林舟 / 标准头像" },
      { id: "INTRO-002", kind: "机甲介绍", target: "赤霆01", line1: "CRT-001 CHITING", line2: "20米级海防工程机甲", start: "00:00:28", end: "00:00:33", animation: "冷蓝扫描线", linkedAsset: "机甲母资产：赤霆01 / 核心三视图" },
      { id: "INTRO-003", kind: "场景介绍", target: "杭州湾海防线", line1: "HANGZHOU BAY DEFENSE LINE", line2: "2042年人类海洋防线", start: "00:00:00", end: "00:00:06", animation: "极细字幕淡入", linkedAsset: "场景母资产：杭州湾海防线 / 阴天正常世界" }
    ]
  };
}

function mergeSeeds(value: PostProductionState) {
  const seed = createSeedState();
  return {
    videoMetadata: value.videoMetadata ?? {},
    trailerShots: mergeTrailerShots(value.trailerShots, seed.trailerShots),
    subtitles: value.subtitles?.length ? value.subtitles : seed.subtitles,
    voices: value.voices?.length ? value.voices : seed.voices,
    audio: value.audio?.length ? value.audio : seed.audio,
    transitions: value.transitions?.length ? value.transitions : seed.transitions,
    intros: value.intros?.length ? value.intros : seed.intros
  };
}

function mergeTrailerShots(current: TrailerEditShot[] | undefined, seed: TrailerEditShot[]) {
  if (!current?.length) return seed;
  const byId = new Map(current.map((item) => [item.id, item]));
  return seed.map((item) => {
    const existing = byId.get(item.id);
    if (!existing) return item;
    return {
      ...existing,
      cutType: item.cutType,
      order: existing.order || item.order,
      sourceShotId: item.sourceShotId,
      duration: item.duration,
      linkedAssets: item.linkedAssets,
      function: item.function,
      notes: item.notes
    };
  });
}

function seedTrailerShots(): TrailerEditShot[] {
  const ninety = trailer90Shots.map((shot, index) => ({
    id: `EDIT-90-${shot.id}`,
    cutType: "90秒预告" as const,
    order: index + 1,
    sourceShotId: `SHOT-TRAILER-${String(index + 1).padStart(3, "0")}`,
    name: shot.title,
    duration: durationOf(shot.time),
    linkedAssets: shot.assets,
    emotion: index < 4 ? "未知压迫" : index < 10 ? "紧张升级" : index < 16 ? "动作冲击" : "认知反转",
    function: shot.purpose,
    rhythm: index < 4 ? "慢" as const : index < 14 ? "中" as const : "快" as const,
    notes: shot.imagePrompt
  }));
  const thirty = trailer90Shots.slice(0, 8).map((shot, index) => ({
    id: `EDIT-30-${shot.id}`,
    cutType: "30秒预告" as const,
    order: index + 1,
    sourceShotId: `SHOT-TRAILER-${String(index + 1).padStart(3, "0")}`,
    name: shot.title,
    duration: index === 0 ? 4 : 3,
    linkedAssets: shot.assets,
    emotion: index < 2 ? "异常建立" : index < 5 ? "危险接近" : "爆点推进",
    function: shot.purpose,
    rhythm: index < 2 ? "慢" as const : "快" as const,
    notes: "30秒版本只保留最强叙事信息。"
  }));
  const fifteen = trailer90Shots.slice(0, 5).map((shot, index) => ({
    id: `EDIT-15-${shot.id}`,
    cutType: "15秒预告" as const,
    order: index + 1,
    sourceShotId: `SHOT-TRAILER-${String(index + 1).padStart(3, "0")}`,
    name: shot.title,
    duration: 3,
    linkedAssets: shot.assets,
    emotion: index < 2 ? "异常" : "冲击",
    function: shot.purpose,
    rhythm: "快" as const,
    notes: "15秒版本只做钩子，不解释世界观。"
  }));
  return [...fifteen, ...thirty, ...ninety];
}

function durationOf(value: string) {
  const [start, end] = value.split("-").map(toSeconds);
  return Math.max(1, end - start);
}

function toSeconds(value: string) {
  const [minutes, seconds] = value.split(":").map(Number);
  return minutes * 60 + seconds;
}

function defaultVideoMetadata(key: string): VideoMaterialMetadata {
  return { key, videoId: `VID-${key}`, category: "场景运动", tags: ["待整理"], linkedAssets: [], shotType: "电影镜头", tool: "可灵", notes: "" };
}

function nextId(prefix: string, index: number) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
