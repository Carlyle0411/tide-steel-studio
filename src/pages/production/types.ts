export type ProductionSection =
  | "dashboard"
  | "assetBible"
  | "masterVideoLibrary"
  | "generationQueue"
  | "tideSteelStudio"
  | "reuseCenter"
  | "shotLibrary"
  | "gptPromptLibrary"
  | "klingPromptLibrary"
  | "videoMaterials"
  | "trailerEditor"
  | "subtitleStudio"
  | "voiceStudio"
  | "audioLibrary"
  | "transitionLibrary"
  | "filmIntro"
  | "postExport"
  | "production"
  | "producerDashboard"
  | "ep01Production"
  | "ep01FinalReview"
  | "visualReview"
  | "aiAssetLibrary"
  | "mcp"
  | "directorReview"
  | "editorReview"
  | "story"
  | "episode"
  | "assets"
  | "characters"
  | "creatures"
  | "mechas"
  | "environment"
  | "props"
  | "storyboard"
  | "timeline"
  | "prompt"
  | "image"
  | "video"
  | "review"
  | "export"
  | "settings";

export type AssetStatus = "Approved" | "Draft" | "Review" | "Deprecated" | "No" | "Yes";

export type ProductionAsset = {
  id: string;
  category: string;
  name: string;
  version: string;
  reference: string;
  firstEpisode: string;
  approved: boolean;
  gptImage2: boolean;
  kling: boolean;
  veo: boolean;
  status: "approved" | "draft" | "review" | "deprecated";
};

export type EpisodeRecord = {
  id: string;
  part: "赤霆纪元" | "深蓝遗迹" | "终潮";
  index: number;
  title: string;
  status: "ready" | "in-progress" | "locked" | "not-started";
  script: string;
  storyboard: number;
  assets: number;
  images: number;
  videos: number;
};

export type StoryboardShotRecord = {
  id: string;
  number: string;
  time: string;
  storyFunction: string;
  frame: string;
  camera: string;
  keyframe: string;
  video: string;
  sound: string;
  review: "approved" | "review" | "missing";
};

export type ProductionMetric = {
  label: string;
  value: string;
  helper: string;
  tone?: "jade" | "gold" | "blue" | "red";
};

export type ProductionImageAsset = {
  id: string;
  name: string;
  src: string;
  status: "draft" | "review" | "approved" | "deprecated";
  version: string;
  reference: string;
  prompt: string;
  firstUse: string;
  lastUse: string;
  usageCount: number;
};

export type AssetCenterKind = "characters" | "creatures" | "mechas" | "environment" | "props";

export type ProductionCenterItem = {
  id: string;
  name: string;
  kind: AssetCenterKind;
  status: "approved" | "draft" | "review" | "deprecated";
  reference: string;
  version: string;
  firstAppearance: string;
  lastAppearance: string;
  shotCount: number;
  episodes: string[];
  tags: string[];
  promptCount: number;
  approvedImages: number;
  notes: string;
};
