# CHANGELOG MCP PHASE 02

项目：《潮汐钢魂》Movie Control Center  
阶段：MCP Phase 02 - Production Pipeline Engine

---

## 新增 Production Engine

- `src/mcp/engine/ProductionEngine.ts`
- `src/mcp/engine/PipelineRunner.ts`
- `src/mcp/engine/ContextResolver.ts`
- `src/mcp/engine/PromptBuilder.ts`
- `src/mcp/engine/AssetResolver.ts`

能力：

- 输入 `episodeId`、`shotId`、`taskType`。
- 自动读取 Storyboard / Asset Database / Prompt Context。
- 解析镜头上下文、Reference和资产状态。
- 自动生成 GPT Image2 Prompt。
- 创建真实 MCP Task。

---

## 新增真实 Keyframe Workflow

- `src/mcp/workflows/createKeyframeProduction.workflow.ts`

流程：

1. 读取 Storyboard。
2. 通过 Context Resolver 解析镜头。
3. 检查 Reference。
4. 生成 Prompt。
5. 创建 pending Task。
6. 调用 GPT Image2 Adapter。
7. 无 API Key 时返回 needs_key / failed，不进入 completed。
8. 有真实输出后才进入 Review Queue。

---

## 新增 Review Queue

- `src/mcp/review/ReviewQueue.ts`

状态：

- `waiting_review`
- `approved`
- `rejected`

---

## 新增 Asset Version Schema

- `src/mcp/schemas/assetVersion.schema.ts`

字段：

- `assetId`
- `version`
- `source`
- `prompt`
- `tool`
- `createdAt`
- `approvedBy`
- `parentAsset`

版本格式：

- `V001`
- `V002`
- `V003`

---

## UI升级

MCP Control 新增：

- Production Runner
- Context计数
- Reference计数
- Prompt Preview
- Tool状态
- Generate Keyframe按钮
- Shot Inspector
- Review Queue

Storyboard 页面新增：

- 点击镜头查看 Shot Inspector。
- 显示 Shot ID、Description、Required Assets、Character、Environment、Camera、Prompt、Production Status。

---

## EP01连接

当前测试镜头：

- `EP01_KF01`

点击 `Generate Keyframe` 会：

1. 解析 EP01_KF01 上下文。
2. 生成专业 GPT Image2 Prompt。
3. 创建真实 MCP Task。
4. 调用 GPT Image2 adapter。
5. 如果没有 OpenAI API Key，任务失败并在日志显示 needs_key原因。

---

## 约束保持

- 不生成假图片。
- 不模拟成功。
- 不绕过 Approved Gate。
- draft 禁止进入视频工具。
- 未配置 API Key 不返回假结果。
- 不修改 Bible。
- 不删除已有文件。
