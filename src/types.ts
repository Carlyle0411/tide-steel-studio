export type ProjectType =
  | "mecha"
  | "pet"
  | "fashion"
  | "healing"
  | "product"
  | "custom";

export type AspectRatio = "9:16" | "16:9" | "1:1";
export type AssetType = "image" | "video" | "audio";
export type WorkspaceView = "projects" | "storyboard" | "characters" | "assets" | "exports" | "settings";
export type AssetUsage =
  | "角色参考"
  | "主体一致性参考"
  | "外观设定参考"
  | "首帧参考"
  | "尾帧参考"
  | "场景参考"
  | "光影氛围参考"
  | "背景参考"
  | "风格参考"
  | "动作参考"
  | "镜头参考"
  | "已生成结果参考"
  | "产品参考"
  | "封面参考"
  | "音效参考"
  | "BGM参考";

export type ShotStatus = "待生成" | "已生成首帧" | "已生成视频" | "待剪辑" | "已完成" | "需重做";
export type AiProviderName = "local" | "openai" | "deepseek";

export type FormState = {
  projectType: ProjectType;
  theme: string;
  protagonist: string;
  scene: string;
  duration: number;
  shotCount: number;
  aspectRatio: AspectRatio;
  styleKeywords: string;
  mood: string;
  needCharacterConsistency: boolean;
  needFirstFramePrompt: boolean;
  needTailFramePrompt: boolean;
  activeCharacterIds: string[];
  activeAssetIds: string[];
};

export type CharacterProfile = {
  id: string;
  name: string;
  type: string;
  appearance: string;
  personality: string;
  signatureFeatures: string;
  outfitsProps: string;
  commonScenes: string;
  forbiddenChanges: string;
  promptTemplate: string;
  referenceAssetId?: string;
  tags: string[];
  note: string;
  lockedTags: string;
  createdAt: string;
  updatedAt: string;
};

export type AssetGroup = {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  projectId: string;
  name: string;
  type: AssetType;
  dataUrl?: string;
  fileBlob?: Blob;
  objectUrl?: string;
  thumbUrl: string;
  duration?: number;
  width?: number;
  height?: number;
  size: number;
  groupIds: string[];
  tags: string[];
  note: string;
  usageType: AssetUsage;
  linkedCharacterIds: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  uploadedAt: string;
  lastUsedAt?: string;
};

export type AssetAnalysis = {
  suitableUsages: AssetUsage[];
  recommendedTags: string[];
  recommendedGroupNames: string[];
  klingPrompt: string;
  recommendedShotUsage: AssetUsage;
  styleDescription: string;
  summary: string;
};

export type ShotBoundAsset = {
  assetId: string;
  usageType: AssetUsage;
  referenceText: string;
  createdAt: string;
};

export type ShotAssetBinding = {
  assetId: string;
  usage: AssetUsage;
  note: string;
};

export type PromptPack = {
  conciseCn: string;
  detailedCn: string;
  english: string;
  klingTextToVideo: string;
  klingImageToVideo: string;
  jimengImage: string;
  hailuoVideo: string;
  universalEnglish: string;
  firstFrame: string;
  tailFrame?: string;
};

export type StoryboardShot = {
  id: string;
  index: number;
  duration: string;
  shotSize: string;
  visual: string;
  action: string;
  camera: string;
  lighting: string;
  composition: string;
  klingPrompt: string;
  jimengPrompt: string;
  imageToVideoPrompt: string;
  hailuoPrompt: string;
  negativePrompt: string;
  subtitle: string;
  voiceover: string;
  status: ShotStatus;
  rating: number;
  note: string;
  recommendedAssetIds: string[];
  assets: ShotBoundAsset[];
  assetBindings: ShotAssetBinding[];
  recommendedFirstFrameAssetId?: string;
  promptPack: PromptPack;
};

export type VideoProject = {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  aspectRatio: AspectRatio;
  duration: number;
  shotCount: number;
  characterIds: string[];
  assetIds: string[];
  assetGroupIds: string[];
  shots: StoryboardShot[];
  promptRecords: string[];
  exportHistory: string[];
  form: FormState;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AISettings = {
  provider: AiProviderName;
  apiKey: string;
  model: string;
  lastTestAt?: string;
  lastError?: string;
};
