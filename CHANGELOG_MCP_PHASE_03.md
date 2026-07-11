# CHANGELOG MCP PHASE 03

项目：《潮汐钢魂》Movie Control Center  
阶段：MCP Phase 03 - Real AI Generation Layer

---

## 新增 AI Provider Layer

- `src/mcp/providers/AIProvider.ts`
- `src/mcp/providers/ProviderRegistry.ts`

支持统一管理：

- GPT Image2
- Kling
- Veo
- Runway
- Flux

Provider 接口：

- `name`
- `type`
- `generate()`
- `status()`

未来从 GPT Image2 切换到 Flux 或 ComfyUI，不需要重写 workflow。

---

## 升级 GPT Image2 Adapter

升级文件：

- `src/mcp/adapters/gptImage2.adapter.ts`

新增真实方法：

- `generateImage()`

输入：

- `taskId`
- `prompt`
- `size`
- `quality`
- `referenceImages`

输出：

- `completed`：只有 OpenAI Image API 返回真实图片 URL 或 b64 后才会出现。
- `needs_key`：未配置 OpenAI API Key。
- `failed`：API错误、网络错误或无图片输出。

禁止：

- fake url
- fake image
- fake completed

说明：

浏览器 Vite 环境无法安全读取未暴露的服务器环境变量。当前 adapter 支持 `OPENAI_API_KEY` 语义，并在浏览器构建中读取 `VITE_OPENAI_API_KEY`。生产环境应迁移到后端 secret proxy。

---

## 新增 Asset Storage

- `src/mcp/storage/AssetStorage.ts`

能力：

- 保存生成资产元数据。
- 生成规范资产路径。
- 记录 `asset.json` 等价结构。
- 本阶段在浏览器中使用本地持久化存储。

目标路径规范：

`assets/production/EP01/KF01/EP01_KF01_V001.png`

当前已建立目录：

`assets/production/EP01/KF01/`

---

## 新增 Generation History

- `src/mcp/logs/generationHistory.ts`

记录：

- 任务ID
- 模型
- Prompt
- 输入Reference
- 输出Asset
- 时间
- 状态
- 错误原因

用于未来：

- 成本统计
- 模型比较
- 失败分析

---

## 新增 Consistency Check Workflow

- `src/mcp/workflows/runConsistencyCheck.workflow.ts`

输出：

- `PASS`
- `WARNING`
- `FAIL`

检查范围：

- 角色：脸、服装、年龄
- 机甲：颜色、结构
- 场景：天气、时间
- Pipeline安全规则

---

## UI升级

MCP Control：

- 新增 API Settings。
- 显示 OpenAI / Kling / Veo / Runway 状态。
- 状态只显示 CONNECTED 或 MISSING KEY，不显示 Key 内容。

Image Center：

- 新增 Production Timeline。
- 新增 Generation History。
- 显示任务、Prompt、Model、Status、Output、Time。

---

## EP01_KF01真实链路

点击 `Generate Keyframe` 后：

1. 读取 Storyboard。
2. 解析 EP01_KF01 上下文。
3. 生成 GPT Image2 Prompt。
4. 创建真实 MCP Task。
5. 调用 GPT Image2 adapter。
6. 若无 Key：返回 needs_key / failed，写入日志与Generation History。
7. 若成功：保存资产元数据，创建版本，进入 Review Queue。

---

## 验证

- `npm.cmd run build` 通过。

---

## 未做

- 未生成图片。
- 未模拟成功。
- 未写入假 URL。
- 未接入 Kling / Veo / Runway 真实视频API。
- 未绕过 Approved Gate。
- 未修改任何 Bible。
