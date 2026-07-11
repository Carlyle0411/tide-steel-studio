# CHANGELOG MCP PHASE 01

项目：《潮汐钢魂》Movie Control Center  
阶段：MCP架构阶段  

---

## 新增

- 建立 `src/mcp/` 目录结构：
  - `servers/`
  - `clients/`
  - `tools/`
  - `schemas/`
  - `workflows/`
  - `adapters/`
  - `queue/`
  - `logs/`
  - `registry/`

- 新增 MCP 架构文档：
  - `src/mcp/MCP_ARCHITECTURE.md`

- 新增 Tool Registry：
  - `src/mcp/registry/toolRegistry.ts`
  - 覆盖 GPT Image2、Kling、Veo、Runway、Flux、ComfyUI、Blender、ElevenLabs、DaVinci Resolve、Supabase、GitHub。

- 新增统一任务模型：
  - `src/mcp/schemas/task.schema.ts`

- 新增资产安全规则：
  - `src/mcp/workflows/assetSafetyRules.ts`
  - 规则来源绑定 ASSET_DATABASE、VISUAL_PIPELINE_BIBLE、IMAGE_GENERATION_RULES、WHITE_TIDE_IMAGE_RULES、TIDE_GATE_IMAGE_RULES。

- 新增 Adapter skeleton：
  - `gptImage2.adapter.ts`
  - `kling.adapter.ts`
  - `veo.adapter.ts`
  - `runway.adapter.ts`
  - `flux.adapter.ts`
  - `comfyui.adapter.ts`
  - `blender.adapter.ts`
  - `elevenlabs.adapter.ts`
  - `davinci.adapter.ts`

- 新增 Workflow skeleton：
  - `generateKeyframe.workflow.ts`
  - `generateVideoShot.workflow.ts`
  - `reviewAsset.workflow.ts`
  - `exportEpisode.workflow.ts`
  - `consistencyCheck.workflow.ts`

- 新增本地内存任务队列：
  - `src/mcp/queue/taskQueue.ts`

- 新增日志系统：
  - `src/mcp/logs/mcpLogger.ts`

- 新增配置：
  - `mcp.config.ts`
  - `.env.example`

- Movie Control Center 新增：
  - MCP Control 页面
  - Tool Registry 面板
  - Task Queue 面板
  - Workflow Runner 面板
  - Logs 面板
  - API Keys Status 面板
  - Asset Safety Check 面板
  - Model Routing 面板

- Command+K 新增真实任务命令：
  - Generate Keyframe
  - Generate Video Shot
  - Run Consistency Check
  - Review Asset
  - Export Episode
  - Open MCP Logs
  - Open Tool Registry

---

## 约束

- 未配置API Key时，adapter返回 `needs_key` 或明确失败，不返回假成功。
- draft资产不能进入Kling。
- review资产不能进入Veo。
- deprecated资产不能用于新镜头。
- 未登记资产不能进入Storyboard。
- 未通过Consistency Check不能Approve。
- 白潮未到展示阶段不能完整出现。
- 赤霆EP01不能完整出现。
- AI澜EP01不能人形化。

---

## 未做

- 未接入真实付费API。
- 未生成图片。
- 未生成视频。
- 未修改任何 Bible。
- 未删除已有文件。
