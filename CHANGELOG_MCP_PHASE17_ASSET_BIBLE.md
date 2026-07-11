# MCP Phase 17 - 电影资产圣经

## 目标

建立《潮汐钢魂》长期复用的电影素材资产库。以后所有剧集、预告片、PV、宣传海报和短视频都优先从资产库调用，避免重复生成同类图片。

## 新增

- 左侧导航新增：`电影资产圣经`
- 新增 Asset Bible 数据目录：
  - `projects/tide-steel-soul/asset-bible/ASSET_BIBLE_MANIFEST.json`
  - `projects/tide-steel-soul/asset-bible/SHOT_LIBRARY.json`
  - `projects/tide-steel-soul/asset-bible/VIDEO_CLIP_LIBRARY.json`
  - `projects/tide-steel-soul/asset-bible/KlingPrompt.json`
- 新增生成脚本：
  - `scripts/generate-asset-bible.mjs`
  - `npm run generate:asset-bible`
- 新增页面：
  - `src/pages/production/components/AssetBibleView.tsx`
- 新增数据读取层：
  - `src/mcp/assetBible/AssetBibleData.ts`

## 资产分类

电影资产圣经包含：

- 角色资产
- 机甲资产
- 怪兽资产
- 场景资产
- 建筑资产
- 道具资产
- 特效资产
- 天空天气
- 灯光参考
- 构图素材
- 海报素材
- 视频片段素材

## 镜头与视频模板

- 建立 `100` 个电影镜头模板。
- 建立 `150` 个视频片段模板。
- 每个视频片段包含：
  - 首帧
  - 尾帧
  - 可灵Prompt
  - 推荐时长
  - 推荐运镜
  - 推荐镜头语言

## 复用规则

后续制作第二集或其他物料时，先搜索电影资产圣经。已有相同或近似素材时优先复用，不重新生成。

## 视频规则

视频阶段仍然不调用任何 API。系统只生成首帧、尾帧规划与可灵Prompt，由用户手动进入可灵制作。

## 验证

- `npm run generate:asset-bible` 已生成：
  - `12` 个资产分类
  - `100` 个镜头模板
  - `150` 个视频片段模板
  - `150` 条可灵Prompt
- `npm run build` 通过。
