export type MCPConfig = {
  enabledTools: string[];
  apiKeysFromEnv: Record<string, string>;
  defaultImageTool: string;
  defaultVideoTool: string;
  defaultVoiceTool: string;
  storageRoot: string;
  reviewRequired: boolean;
  assetSafetyEnabled: boolean;
};

export const mcpConfig: MCPConfig = {
  enabledTools: [
    "gpt_image2",
    "kling",
    "veo",
    "runway",
    "flux",
    "comfyui",
    "blender",
    "elevenlabs",
    "davinci_resolve",
    "supabase",
    "github"
  ],
  apiKeysFromEnv: {
    openai: "OPENAI_API_KEY",
    kling: "KLING_API_KEY",
    veo: "VEO_API_KEY",
    runway: "RUNWAY_API_KEY",
    elevenlabs: "ELEVENLABS_API_KEY",
    supabaseUrl: "SUPABASE_URL",
    supabaseAnonKey: "SUPABASE_ANON_KEY",
    comfyuiEndpoint: "COMFYUI_ENDPOINT",
    blenderScriptPath: "BLENDER_SCRIPT_PATH"
  },
  defaultImageTool: "gpt_image2",
  defaultVideoTool: "kling",
  defaultVoiceTool: "elevenlabs",
  storageRoot: "assets",
  reviewRequired: true,
  assetSafetyEnabled: true
};
