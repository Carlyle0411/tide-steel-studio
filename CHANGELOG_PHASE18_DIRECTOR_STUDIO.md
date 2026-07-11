# Phase 18 - Director Studio 全导航完善

## 目标

完善《潮汐钢魂》个人电影制作工作台。未新增 API、账号、联网、支付、云同步、Agent、聊天或插件能力。

## 完成内容

- 新增 Director Studio V2 页面集：
  - 项目总览
  - World Bible
  - 剧本管理
  - 角色设定
  - 机甲设定
  - 怪兽设定
  - 场景设定
  - 道具设定
  - 工业资产库
  - 关键帧 Storyboard
  - 分镜设计
  - 可灵提示词管理器
  - 视频制作规划
  - 电影时间线
  - 成片输出
  - 制作日志
  - 素材复用中心
- 首页导演工作台增强：
  - 今天待完成
  - 当前剧集
  - 资产统计
  - 镜头统计
  - 视频统计
  - Prompt统计
  - Review统计
  - 最近修改
  - 最近生成
  - 制作时间轴
  - 项目健康度
  - 磁盘占用
- 本地资产 manifest 增加真实文件大小字段 `file_size`。
- 资产库支持：
  - 图片模式
  - 列表模式
  - 瀑布流
  - 搜索
  - 版本显示
  - 引用次数
  - 复用跳转
- 关键帧页显示：
  - 镜头编号
  - Prompt
  - 角色
  - 机甲
  - 场景
  - 镜头类型
  - 构图
  - 镜头运动
  - Version
  - Review
  - 生成时间
- 视频制作页仅做本地规划：
  - 首帧
  - 尾帧
  - 时长
  - 镜头
  - 动作
  - 可灵Prompt
  - 备注
  - 状态

## 数据来源

所有页面读取当前项目本地数据：

- `projects/tide-steel-soul/assets/asset-library.json`
- `projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json`
- `projects/tide-steel-soul/EP01/EP01_KEYFRAME_MANIFEST.json`
- `projects/tide-steel-soul/asset-bible/*.json`

## 验证

- `npm run import:assets` 已重新导入 13 个真实图片资产，并写入文件大小。
- `npm run build` 通过。
