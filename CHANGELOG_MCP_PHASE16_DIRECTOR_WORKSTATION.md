# MCP Phase 16 - 中文导演工作台

## 项目定位

《潮汐钢魂》AI电影制作工作台从本阶段开始统一切换为中文导演工作台。

保留少量必要英文：

- Tide Steel Studio
- Asset Library
- Keyframe
- Review
- Version
- Prompt

## 完成内容

- 左侧导航改为电影制作流程：
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
  - 分镜设计
  - 可灵提示词
  - 视频制作
  - 时间线
  - 成片输出
  - 制作日志
- 新增导演工作台首页。
- 新增电影制作流程图。
- 新增素材复用中心。
- 新增镜头库。
- 新增 GPT Image2 Prompt库。
- 新增可灵Prompt库。
- 新增可灵制作中心：
  - 首帧
  - 尾帧
  - 视频Prompt
  - 时长
  - 镜头运动
  - 我手动制作的视频
  - 状态
- 关键帧页面升级：
  - 编号
  - 名称
  - 剧情作用
  - 对应角色/资产
  - 对应视频Prompt
  - 是否完成
- 状态标签中文化：
  - Approved -> 已通过
  - Review -> 审核中
  - Rejected -> 已驳回
  - Planning -> 规划中
  - Generating -> 生成中
  - Completed -> 已完成

## 规则保持

- 不新增 API Key 系统。
- 不接入 Kling API / Veo API。
- 不生成假图片。
- 不生成假视频。
- 视频阶段只生成可灵文本提示词。

## 验证

- `npm run export:kling-prompts` 已重新导出中文可灵提示词。
- `npm run build` 通过。
