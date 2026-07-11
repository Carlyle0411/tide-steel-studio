# PHASE25 手动资产导入工作台

## 项目定位

《潮汐钢魂 Tide Steel Soul》从本阶段开始明确为：

AI电影资产管理 + Prompt生成工作台。

系统不再承担后台自动图片生成、批量生成或外部图片 API 调度。图片由创作者在 ChatGPT / GPT Image2 等工具中生成后，手动导入本地资产库。

## 已完成

- 移除母资产库页面中的自动生成包、批量生成状态、待生成路径展示。
- 新增手动图片导入模块：`src/mcp/manualAssetImport/ManualAssetImport.ts`。
- 支持 PNG / JPG / WEBP 上传。
- 支持拖拽上传、点击上传、批量上传。
- 上传后自动生成浏览器端 metadata 记录。
- 每个资产显示：
  - Prompt 状态：`READY`
  - 图片状态：`EMPTY` / `UPLOADED` / `APPROVED` / `MASTER`
- 每个资产自动生成 GPT Image2 Prompt。
- 新增 `Copy Image Prompt`。
- 新增 Version 管理。
- 新增 `Set Master`。
- 新增通过审核按钮。
- 旧的 generationQueue 路由改为进入手动导入工作台。
- Command+K 中的旧“生成工作区”改名为“导入工作区”。

## 当前流程

资产设定

↓

自动生成 Prompt

↓

Copy Image Prompt

↓

用户在 ChatGPT / GPT Image2 生成图片

↓

手动上传 PNG / JPG / WEBP

↓

自动建立 Version + metadata

↓

人工审核

↓

Set Master

↓

进入后续关键帧 / Storyboard / 可灵视频制作

## 保留内容

- 保留所有角色、机甲、怪兽、场景、道具、关键帧数据。
- 保留母资产库分类。
- 保留 Prompt 模板和可灵视频模板。
- 保留资产引用、Version、Review 的工作方式。

## 禁止项

- 不再自动调用图片生成 API。
- 不再自动批量生成图片。
- 不再伪造 completed 状态。
- 不再使用 placeholder 作为真实资产。
- 未上传真实图片的资产保持 `EMPTY`。
