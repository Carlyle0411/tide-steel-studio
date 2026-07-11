export type MCPToolStatus = "available" | "planned" | "disabled" | "needs_key";
export type MCPToolType = "image" | "video" | "voice" | "render" | "database" | "version_control" | "dcc" | "workflow";
export type MCPAuthType = "none" | "api_key" | "oauth" | "local_endpoint" | "script_path";

export type MCPToolDefinition = {
  id: string;
  name: string;
  type: MCPToolType;
  status: MCPToolStatus;
  capabilities: string[];
  requiredInputs: string[];
  outputs: string[];
  rateLimit: string;
  authType: MCPAuthType;
  enabled: boolean;
  description: string;
};

export const toolRegistry: MCPToolDefinition[] = [
  {
    id: "gpt_image2",
    name: "GPT Image2",
    type: "image",
    status: "needs_key",
    capabilities: ["keyframe_generation", "reference_guided_image", "visual_iteration"],
    requiredInputs: ["prompt", "referenceAssets", "assetSafetyContext"],
    outputs: ["image", "metadata", "generationLog"],
    rateLimit: "provider_defined",
    authType: "api_key",
    enabled: true,
    description: "Primary still-image and keyframe generation tool."
  },
  {
    id: "kling",
    name: "Kling",
    type: "video",
    status: "needs_key",
    capabilities: ["image_to_video", "text_to_video", "shot_motion"],
    requiredInputs: ["approvedKeyframe", "motionPrompt", "duration", "assetSafetyContext"],
    outputs: ["video", "metadata", "generationLog"],
    rateLimit: "provider_defined",
    authType: "api_key",
    enabled: true,
    description: "Video generation target for approved keyframes."
  },
  {
    id: "veo",
    name: "Veo",
    type: "video",
    status: "needs_key",
    capabilities: ["image_to_video", "cinematic_motion", "shot_variation"],
    requiredInputs: ["approvedKeyframe", "motionPrompt", "duration", "assetSafetyContext"],
    outputs: ["video", "metadata", "generationLog"],
    rateLimit: "provider_defined",
    authType: "api_key",
    enabled: true,
    description: "Video generation target for cinematic shot production."
  },
  {
    id: "runway",
    name: "Runway",
    type: "video",
    status: "needs_key",
    capabilities: ["image_to_video", "video_iteration"],
    requiredInputs: ["approvedKeyframe", "motionPrompt"],
    outputs: ["video", "metadata"],
    rateLimit: "provider_defined",
    authType: "api_key",
    enabled: true,
    description: "Video generation and iteration provider."
  },
  {
    id: "flux",
    name: "Flux",
    type: "image",
    status: "planned",
    capabilities: ["image_generation", "style_variation"],
    requiredInputs: ["prompt", "referenceAssets"],
    outputs: ["image", "metadata"],
    rateLimit: "deployment_defined",
    authType: "api_key",
    enabled: false,
    description: "Planned image generation backend."
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    type: "image",
    status: "needs_key",
    capabilities: ["node_graph_generation", "controlnet", "ip_adapter", "lora"],
    requiredInputs: ["workflowGraph", "referenceAssets", "prompt"],
    outputs: ["image", "workflowMetadata"],
    rateLimit: "local_endpoint",
    authType: "local_endpoint",
    enabled: true,
    description: "Local or remote node graph image generation pipeline."
  },
  {
    id: "blender",
    name: "Blender",
    type: "dcc",
    status: "planned",
    capabilities: ["scene_layout", "camera_blocking", "asset_render"],
    requiredInputs: ["sceneFile", "scriptPath"],
    outputs: ["render", "sceneMetadata"],
    rateLimit: "local_machine",
    authType: "script_path",
    enabled: false,
    description: "Future DCC bridge for layout, previs and render automation."
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    type: "voice",
    status: "needs_key",
    capabilities: ["voice_generation", "voice_iteration"],
    requiredInputs: ["voiceId", "scriptText", "voiceDirection"],
    outputs: ["audio", "metadata"],
    rateLimit: "provider_defined",
    authType: "api_key",
    enabled: true,
    description: "Voice and narration generation provider."
  },
  {
    id: "davinci_resolve",
    name: "DaVinci Resolve",
    type: "render",
    status: "planned",
    capabilities: ["timeline_export", "render_queue", "color_pipeline"],
    requiredInputs: ["timeline", "mediaManifest"],
    outputs: ["renderedEpisode", "timelineMetadata"],
    rateLimit: "local_machine",
    authType: "script_path",
    enabled: false,
    description: "Future editing, conform, color and render integration."
  },
  {
    id: "supabase",
    name: "Supabase",
    type: "database",
    status: "needs_key",
    capabilities: ["task_persistence", "asset_metadata", "review_state"],
    requiredInputs: ["url", "anonKey"],
    outputs: ["databaseRecord"],
    rateLimit: "project_defined",
    authType: "api_key",
    enabled: true,
    description: "Future persistent backend for production state."
  },
  {
    id: "github",
    name: "GitHub",
    type: "version_control",
    status: "planned",
    capabilities: ["versioning", "review_history", "release_tracking"],
    requiredInputs: ["repository", "commitPayload"],
    outputs: ["commit", "pullRequest"],
    rateLimit: "provider_defined",
    authType: "oauth",
    enabled: false,
    description: "Future source control and production version history."
  }
];

export function getToolDefinition(toolId: string) {
  return toolRegistry.find((tool) => tool.id === toolId);
}
