export type UUID = string;

export type ServiceErrorCode =
  | "UNCONFIGURED"
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "PROVIDER_NOT_CONFIGURED"
  | "DATABASE_ERROR";

export type ProjectStatus = "active" | "archived" | "deleted";
export type AssetStatus = "draft" | "pending_review" | "approved" | "deprecated" | "archived";
export type TaskStatus =
  | "draft"
  | "queued"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "pending_review"
  | "approved"
  | "rejected";

export type TaskType =
  | "image_generation"
  | "video_generation"
  | "prompt_generation"
  | "storyboard_generation"
  | "consistency_check"
  | "export_package"
  | "asset_import";

export type AssetType =
  | "character"
  | "scene"
  | "mecha"
  | "creature"
  | "prop"
  | "keyframe"
  | "video"
  | "audio"
  | "prompt"
  | "other";

export interface ServiceResult<T> {
  data: T | null;
  error: {
    code: ServiceErrorCode;
    message: string;
    details?: unknown;
  } | null;
}

export interface IPStudioProject {
  id: UUID;
  organization_id: UUID;
  owner_id: UUID;
  name: string;
  slug: string | null;
  cover_url: string | null;
  project_type: string;
  target_platform: string | null;
  aspect_ratio: string;
  content_style: string | null;
  description: string | null;
  visual_standard: Record<string, unknown>;
  status: ProjectStatus;
  favorite: boolean;
  archived_at: string | null;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateProjectInput {
  name: string;
  slug?: string;
  coverUrl?: string;
  projectType?: string;
  targetPlatform?: string;
  aspectRatio?: string;
  contentStyle?: string;
  description?: string;
  visualStandard?: Record<string, unknown>;
}

export interface IPBible {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  world_rules: Record<string, unknown>;
  visual_rules: Record<string, unknown>;
  character_rules: Record<string, unknown>;
  scene_rules: Record<string, unknown>;
  forbidden_rules: Record<string, unknown>;
  raw_markdown: string;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AssetGroup {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  name: string;
  group_type: string;
  description: string | null;
  cover_asset_id: UUID | null;
  required_slots: unknown[];
  sort_order: number;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IPAsset {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  asset_group_id: UUID | null;
  asset_code: string;
  name: string;
  asset_type: AssetType | string;
  status: AssetStatus;
  is_master_reference: boolean;
  master_version_id: UUID | null;
  tags: string[];
  consistency_fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PromptTemplate {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  asset_id: UUID | null;
  shot_id: UUID | null;
  name: string;
  prompt_type: string;
  model: string | null;
  body: string;
  negative_prompt: string;
  variables: Record<string, unknown>;
  usage_count: number;
  success_count: number;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Episode {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  episode_code: string;
  title: string;
  logline: string | null;
  synopsis: string | null;
  status: string;
  sort_order: number;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Scene {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  episode_id: UUID;
  scene_code: string;
  title: string;
  description: string | null;
  location: string | null;
  time_of_day: string | null;
  sort_order: number;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Shot {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  episode_id: UUID | null;
  scene_id: UUID | null;
  storyboard_id: UUID | null;
  shot_code: string;
  title: string;
  description: string | null;
  dialogue: string | null;
  voice_over: string | null;
  duration_seconds: number | null;
  lens: string | null;
  camera_angle: string | null;
  camera_movement: string | null;
  composition: string | null;
  lighting: string | null;
  emotion: string | null;
  image_prompt: string | null;
  video_prompt: string | null;
  status: string;
  sort_order: number;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GenerationTask {
  id: UUID;
  organization_id: UUID;
  project_id: UUID;
  parent_task_id: UUID | null;
  asset_id: UUID | null;
  shot_id: UUID | null;
  task_name: string;
  task_type: TaskType;
  status: TaskStatus;
  progress: number;
  input_prompt: string | null;
  negative_prompt: string | null;
  reference_asset_ids: UUID[];
  model_provider: string | null;
  model_name: string | null;
  model_params: Record<string, unknown>;
  estimated_cost: number;
  actual_cost: number;
  error_message: string | null;
  attempt: number;
  idempotency_key: string | null;
  created_by: UUID;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  deleted_at: string | null;
}

export interface DeliveryManifest {
  projectId: UUID;
  generatedAt: string;
  approvedAssets: Array<{
    id: UUID;
    code: string;
    name: string;
    type: string;
    masterVersionId: UUID | null;
  }>;
  shots: Array<{
    id: UUID;
    code: string;
    title: string;
    durationSeconds: number | null;
  }>;
}
