# AI IP Studio V2.0 Phase 1-2 执行报告

## 01 项目检查结论

当前项目是 Vite + React + TypeScript 前端应用，入口为 `src/App.tsx`，生产工作台主体在 `src/pages/production/` 下。

现有云端能力基于 Supabase：

- `src/lib/supabaseClient.ts`：Supabase 客户端与云端资产桶配置。
- `src/mcp/cloudAssetSync/CloudAssetRepository.ts`：已有个人资产上传、删除、审核、版本与 Prompt 版本逻辑。
- `supabase/SETUP_TIDE_STEEL_CLOUD.sql` 与 `supabase/SETUP_CLOUD_ASSET_STORAGE.sql`：已有 `asset_versions` 与 `tide-assets` 存储桶。

本阶段没有重建项目，没有删除《潮汐钢魂》既有功能，也没有伪造 API 生成结果。

## 02 新增数据库结构

新增文件：

- `supabase/AI_IP_STUDIO_V2_CORE_SCHEMA.sql`

该 SQL 建立 AI IP Studio V2.0 的核心生产数据结构：

- 用户与组织：`profiles`、`organizations`、`organization_members`
- 项目权限：`projects`、`project_members`
- IP 圣经：`ip_bibles`
- 资产体系：`asset_groups`、`assets`、`asset_versions` 扩展字段、`asset_relations`、`asset_tags`
- Prompt 体系：`prompts`、`prompt_versions`
- 剧集与分镜：`episodes`、`scenes`、`storyboards`、`shots`、`shot_assets`
- 参考视频与分析：`reference_videos`、`video_analyses`
- 任务系统：`tasks`、`task_items`、`generation_outputs`
- 一致性检查：`consistency_checks`
- 工作流：`workflow_templates`、`workflow_runs`、`workflow_steps`
- 交付包：`delivery_packages`、`delivery_items`
- 模型与用量：`model_providers`、`provider_credentials`、`usage_records`
- 审计：`audit_logs`

所有新增核心表均启用 RLS。权限模型按组织成员、项目成员、项目角色控制访问，没有关闭 RLS。

## 03 新增前端服务层

新增目录：

- `src/ipStudioV2/`

新增类型文件：

- `src/ipStudioV2/types.ts`

新增服务：

- `ProjectService`：创建项目、个人工作区、项目成员、默认 IP Bible。
- `IpBibleService`：读取/保存 IP Bible，生成 Prompt 上下文。
- `AssetGroupService`：资产组创建、编辑、软删除、完整度统计。
- `AssetService`：资产壳创建、编辑、软删除、Master Reference 设置、资产关系绑定。
- `PromptService`：Prompt 创建、版本化更新、变量渲染。
- `StoryboardService`：剧集、Scene、Shot、Shot 资产绑定。
- `TaskService`：真实任务创建、状态推进、重试、取消。
- `ConsistencyService`：Shot 级一致性检查，输出 PASS / WARNING / FAIL。
- `DeliveryService`：生成交付包 Manifest 并写入交付记录。
- `ProviderService`：模型服务配置读取与保存。

统一服务入口：

- `src/ipStudioV2/index.ts`
- `src/ipStudioV2/services/index.ts`

## 04 已实现真实能力

当前 V2.0 Phase 1-2 已具备这些真实能力：

- 创建组织、项目、项目成员和默认 IP Bible。
- 建立资产组、资产、资产版本、Master Reference 关系。
- 建立剧集、场景、Storyboard、Shot 与镜头资产引用。
- 建立 Prompt 与 Prompt Version，并可渲染变量。
- 创建生产任务，但不伪造完成。
- 未配置模型服务时，任务创建返回 `PROVIDER_NOT_CONFIGURED`。
- 一致性检查会写入数据库，不是假展示。
- 交付包会根据项目数据生成 Manifest。

## 05 仍需 API 或下一阶段接入的能力

这些能力已经预留结构，但本阶段不伪造执行：

- GPT Image / 视频模型真实调用。
- 第三方模型 Provider 凭据加密与后端代理。
- 任务队列后台 Worker。
- UI 页面直接接入 V2 服务层。
- 自动成本结算。

如果模型 Provider 没有配置，系统应显示“未配置”，并阻止生成任务进入假成功状态。

## 06 数据库执行顺序

在 Supabase SQL Editor 中按顺序执行：

1. 如果云端资产表还没有建立，先执行：
   - `supabase/SETUP_TIDE_STEEL_CLOUD.sql`
   - 或 `supabase/SETUP_CLOUD_ASSET_STORAGE.sql`
2. 再执行：
   - `supabase/AI_IP_STUDIO_V2_CORE_SCHEMA.sql`

该 V2 脚本会扩展现有 `asset_versions`，并新增项目级权限结构。

## 07 验证结果

已执行：

```bash
npm run build
```

结果：通过。

已执行 V2 模块独立类型检查：

```bash
tsc --noEmit --skipLibCheck --target ES2020 --module ESNext --moduleResolution Node --strict src/vite-env.d.ts src/ipStudioV2/index.ts
```

结果：通过。

全项目 `tsc --noEmit` 仍会暴露旧项目已有类型债务，例如缺少 `@types/react`、旧模块 `.at()` 与若干旧类型不匹配问题。这不是本阶段新增 V2 服务层造成的，且当前 Vite 生产构建已通过。

## 08 风险与下一阶段

主要风险：

- 现有项目早期模块存在 TypeScript 类型债务，后续建议单独清理。
- V2 服务层已完成，但 UI 尚未全部接入新服务层。
- 模型调用必须放到后端或受控服务中，不能在前端暴露私密 API Key。

建议 Phase 3：

- 建立 V2 工作台页面路由。
- 把现有《潮汐钢魂》资产库逐步映射到 `projects`、`asset_groups`、`assets`、`shots`。
- 做“项目创建 → IP Bible → 资产组 → Shot → Prompt → Review → Delivery”的第一条端到端 UI 链路。
