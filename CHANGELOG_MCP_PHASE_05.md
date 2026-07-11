# CHANGELOG MCP PHASE 05

项目：《潮汐钢魂》Movie Control Center  
阶段：MCP Phase 05 - Production Execution Layer

---

## 新增 Production Orchestrator

- `src/mcp/production/ProductionOrchestrator.ts`
- `src/mcp/production/ProductionScheduler.ts`
- `src/mcp/production/ProductionExecutor.ts`
- `src/mcp/production/ProductionValidator.ts`

流程：

Director Review Approved  
↓  
Create Production Task  
↓  
Generate Asset  
↓  
Asset Validation  
↓  
Review Queue  
↓  
Approved Asset

---

## 新增生产状态机

- `src/mcp/schemas/productionState.schema.ts`

状态：

- `draft`
- `director_review`
- `approved_direction`
- `generating`
- `generated`
- `asset_review`
- `approved_asset`
- `video_ready`
- `completed`
- `failed`

禁止跳状态，例如 `draft` 不能直接进入 `completed`。

---

## 升级 Task Queue

任务记录支持：

- `taskId`
- `episode`
- `shot`
- `asset`
- `model`
- `status`
- `progress`
- `createdAt`
- `completedAt`
- `error`

新增状态：

- `needs_key`

缺少 API Key 时不会标记为 completed。

---

## 新增 Asset Review System

- `src/mcp/review/AssetReview.ts`
- `src/mcp/review/ReviewRules.ts`

审核内容：

- 人物一致性
- 机甲一致性
- 场景一致性
- 画面质量
- 电影感

输出：

- `PASS`
- `WARNING`
- `FAIL`

---

## 新增 Reference Manager

- `src/mcp/reference/ReferenceManager.ts`

管理：

- 角色Reference
- 机甲Reference
- 场景Reference
- 风格Reference

输出结构：

Main Prompt  
+ Reference Images  
+ Continuity Rules  
+ Negative Prompt

---

## 新增视频生产准备层

- `src/mcp/production/VideoProductionAdapter.ts`

支持：

- Kling
- Veo
- Runway

本阶段不调用视频API，只建立真实任务接口。

---

## UI升级

Image Center 新增：

- Production Timeline
- Production Queue
- Generation History

首页 Dashboard 升级为 Episode Production Dashboard：

- EP01
- Storyboard 18/18
- Director Approved 1/18
- Image Generated 0/18 或真实历史数
- Video Generated 0/18

Command+K 新增：

- Generate Production Shot

该命令会创建真实生产任务，不会自动伪造完成。

---

## EP01_KF01测试路径

如果没有 API Key：

- 返回 `needs_key`
- 不进入 `completed`
- 不生成 fake image
- 不写 fake url

如果有 API：

- 调用真实 GPT Image2
- 保存资产元数据
- 创建版本
- 进入 Review Queue

---

## 验证

- `npm.cmd run build` 通过。

---

## 未做

- 未修改任何 Bible。
- 未删除已有文件。
- 未伪造图片或视频。
- 未绕过审核机制。
