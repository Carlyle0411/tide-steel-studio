# CHANGELOG MCP PHASE 06

项目：《潮汐钢魂》Movie Control Center  
阶段：MCP Phase 06 - Episode Factory System

---

## 新增 Episode Factory

- `src/mcp/episodeFactory/EpisodeFactory.ts`
- `src/mcp/episodeFactory/EpisodePlanner.ts`
- `src/mcp/episodeFactory/EpisodeTaskGenerator.ts`
- `src/mcp/episodeFactory/EpisodeProgress.ts`
- `src/mcp/episodeFactory/EpisodeValidator.ts`

能力：

- 输入 `episodeId`。
- 读取 Episode Bible。
- 读取 Storyboard / Shot List。
- 调用 Director Engine。
- 为整集镜头生成 Production Tasks。

---

## Episode Production Pipeline

Episode Selected  
↓  
Load Episode Story  
↓  
Parse Shots  
↓  
Director Analysis  
↓  
Generate Prompt  
↓  
Create Image Task  
↓  
Queue  
↓  
Generate  
↓  
Review  
↓  
Approved Asset  
↓  
Video Ready

---

## 新增 Shot Batch System

- `src/mcp/production/BatchProduction.ts`

支持：

- 单镜头生产：`EP01_KF01`
- 批量生产：`EP01_ALL_SHOTS`

字段：

- `batchId`
- `episode`
- `totalShots`
- `completedShots`
- `failedShots`
- `progress`
- `status`

---

## 新增 Production Cost Tracker

- `src/mcp/cost/CostTracker.ts`

记录：

- 模型
- 图片数量
- 视频秒数
- 预计成本

当前 EP01 估算：

- Image：18张
- Video：180秒

---

## 新增 AI Producer Agent

- `src/mcp/producer/ProducerAgent.ts`

职责：

- 判断镜头优先级。
- 标记角色一致性风险。
- 标记生物揭示风险。
- 标记机甲结构风险。
- 给出 Production Recommendation。

---

## 新增 Episode Package Exporter

- `src/mcp/export/EpisodePackageExporter.ts`

导出结构：

- Story Bible
- Episode Bible
- Shot List
- Approved Images
- Prompts
- Video Tasks
- Production Report

---

## UI升级

Episode Production Dashboard 显示：

- EP01
- Storyboard 18/18
- Director Completed
- Prompt Generated
- Image Generated
- Review Passed
- Video Ready
- Estimated Cost
- AI Producer Recommendations

Command+K 新增：

- Create Episode Production
- Resume Episode Production
- Retry Failed Shots

---

## 测试路径

EP01 创建整集生产时：

- 解析 18 个 shots。
- 创建 18 个真实 `image_generation` tasks。
- 状态为 pending。
- 不生成 fake completed。
- 不跳过审核状态机。

---

## 验证

- `npm.cmd run build` 通过。

---

## 未做

- 未生成图片。
- 未生成视频。
- 未修改任何 Bible。
- 未删除已有文件。
- 未绕过审核。
