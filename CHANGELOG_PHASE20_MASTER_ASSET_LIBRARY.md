# CHANGELOG PHASE20 MASTER ASSET LIBRARY

## 阶段目标

建立《潮汐钢魂》未来12集共用的电影母资产库。

本阶段不是制作EP01，不制作视频，不批量生成剧情镜头。

所有未来图片、关键帧、视频片段、可灵Prompt，都必须优先引用母资产库。

## 保持原则

本阶段保持本地工作流：

- 不新增 API
- 不新增账号
- 不新增联网
- 不新增 SaaS
- 不新增 Agent
- 不新增聊天功能

## 新增生成脚本

新增：

- `scripts/generate-master-asset-library.mjs`

新增命令：

- `npm run generate:master-asset-library`

## 新增母资产库目录

新增：

- `projects/tide-steel-soul/master-asset-library/`

目录包含：

- `characters/`
- `mechas/`
- `creatures/`
- `environment/`
- `props/`
- `actions/`
- `camera/`
- `lighting/`
- `weather/`
- `vfx/`
- `composition/`
- `color/`
- `materials/`
- `video-templates/`
- `prompt-templates/`
- `generated/`

## 新增母资产库数据

新增：

- `MASTER_ASSET_LIBRARY_MANIFEST.json`
- `MASTER_ASSETS.json`
- `ACTION_LIBRARY.json`
- `CAMERA_LIBRARY.json`
- `WEATHER_LIBRARY.json`
- `LIGHTING_LIBRARY.json`
- `VFX_LIBRARY.json`
- `COMPOSITION_LIBRARY.json`
- `PROMPT_TEMPLATE_LIBRARY.json`
- `VIDEO_TEMPLATE_LIBRARY.json`
- `METADATA_SCHEMA.json`
- `AUTO_IMPORT_RULES.json`

当前数量：

- 母资产：338
- 动作模板：23
- 运镜模板：12
- 天气模板：9
- 灯光模板：8
- 特效模板：9
- 构图模板：8
- Prompt模板：92
- 视频模板：7

## 新增前端数据层

新增：

- `src/mcp/masterAssetLibrary/MasterAssetLibraryData.ts`
- `src/mcp/masterAssetLibrary/MasterAssetImportPipeline.ts`

支持：

- 母资产读取
- 母资产搜索
- 分类筛选
- Prompt模板读取
- 视频模板读取
- metadata schema读取
- 自动导入规则读取
- Codex生成图片后的本地导入记录结构

## 新增母资产库页面

新增：

- `src/pages/production/components/Phase20MasterAssetLibraryView.tsx`

页面包含：

- 母库总览
- 15类资产结构
- 母资产清单
- 资产详情页
- GPT Image2 Prompt
- Kling Prompt
- 动作模板
- 运镜模板
- 天气模板
- 灯光模板
- 特效模板
- 构图模板
- Prompt模板库
- 视频模板库
- 自动导入流程
- Metadata Schema

## 路由升级

`电影资产圣经`入口已切换为：

- `Phase20MasterAssetLibraryView`

旧 Asset Bible 文件保留，没有删除。

## 全局搜索升级

PHASE19全局搜索已纳入 PHASE20 母资产：

- 可搜索母资产ID
- 可搜索角色、机甲、怪兽、场景、道具
- 可搜索动作、运镜、天气、灯光、VFX、构图模板

## 验证

已执行：

- `npm run generate:master-asset-library`
- `npm run build`

结果：

- 母资产库生成成功
- 前端构建通过
- 未新增 API、联网、账号、SaaS、Agent 或聊天功能

备注：

- 当前母资产均为“待生成/待审核”标准资产记录。
- 真正图片生成应通过后续 Codex GPT Image2 本地生成流程逐项进入 `generated/`，并经过人工审核后成为全系列 Reference。
