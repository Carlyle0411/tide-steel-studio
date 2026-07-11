# CHANGELOG PHASE19 INDUSTRIAL WORKFLOW

## 阶段目标

将《潮汐钢魂》导演工作台升级为本地工业级电影制作系统。

本阶段不新增 API、联网、账号、支付、第三方服务、AI聊天或 Agent。

## 新增数据层

新增工业工作流生成脚本：

- `scripts/generate-industrial-workflow.mjs`

新增生成命令：

- `npm run generate:industrial-workflow`

新增本地工业索引：

- `projects/tide-steel-soul/industrial-workflow/Asset.json`
- `projects/tide-steel-soul/industrial-workflow/Shot.json`
- `projects/tide-steel-soul/industrial-workflow/Character.json`
- `projects/tide-steel-soul/industrial-workflow/Scene.json`
- `projects/tide-steel-soul/industrial-workflow/Timeline.json`
- `projects/tide-steel-soul/industrial-workflow/Tag.json`
- `projects/tide-steel-soul/industrial-workflow/Prompt.json`
- `projects/tide-steel-soul/industrial-workflow/Relationship.json`
- `projects/tide-steel-soul/industrial-workflow/ProductionLog.json`

当前索引结果：

- 资产：13
- Shot：18
- Prompt：60
- 引用关系：138

## 新增前端数据接口

新增：

- `src/mcp/industrialWorkflow/IndustrialWorkflowData.ts`

支持：

- 全局搜索
- 资产读取
- Shot读取
- 角色读取
- 场景读取
- 标签读取
- Prompt读取
- 引用关系读取
- Timeline读取
- 制作日志读取
- 本地图片路径解析

## 新增工业工作台界面

新增：

- `src/pages/production/components/Phase19ProductionShell.tsx`
- `src/pages/production/components/Phase19IndustrialViews.tsx`

完成：

- 中文导演工作台 Shell
- 左侧电影制作流程导航
- Command+K 快捷中心
- 全局搜索面板
- 资产库增强
- 标签系统
- Version历史面板
- 批量操作工具
- 右键快捷菜单
- 收藏状态
- 快速预览
- Storyboard拖拽排序
- Timeline缩放、轨道锁定、轨道隐藏
- Prompt中心编辑、复制、收藏入口
- 素材复用中心
- 素材关联图谱
- 镜头库
- 成片输出索引
- 制作日志

## 页面路由升级

`MovieControlCenter` 已切换至 PHASE 19 工业工作台：

- 导演工作台
- 项目总览
- 世界观
- 剧本管理
- 角色设定
- 机甲设定
- 怪兽设定
- 场景设定
- 道具设定
- 资产库
- 关键帧
- Storyboard
- Prompt库
- 可灵提示词
- 视频制作
- Timeline
- 成片输出
- 制作日志
- 素材复用中心
- 镜头库

## 验证

已执行：

- `npm run generate:industrial-workflow`
- `npm run build`

结果：

- JSON 工业索引生成成功
- Vite production build 通过
- 未新增 API、联网、账号、第三方服务或视频调用
