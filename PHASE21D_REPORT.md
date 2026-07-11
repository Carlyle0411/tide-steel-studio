# PHASE21D REPORT

## 阶段

Kling Video Template Library / 可灵视频模板库

## 目标

建立《潮汐钢魂》可重复使用的视频生成模板。

本阶段不调用视频API，不生成视频文件。

只生成：

- 图片模板
- 首帧建议
- 尾帧建议
- 可灵Prompt模板
- Negative Prompt

## 已完成

新增生成脚本：

- `scripts/generate-kling-video-template-library.mjs`

新增命令：

- `npm run generate:kling-video-template-library`

新增数据：

- `projects/tide-steel-soul/kling-video-template-library/VIDEO_TEMPLATE_LIBRARY.json`

新增数据层：

- `src/mcp/klingVideoTemplateLibrary/KlingVideoTemplateLibraryData.ts`

新增页面：

- `src/pages/production/components/Phase21DKlingVideoTemplateView.tsx`

视频制作、可灵提示词入口已切换到 PHASE21D 可灵视频模板库。

## 模板数量

总计：150

- 人物动作：30
- 机甲动作：40
- 怪兽动作：20
- 环境运动：30
- 镜头运动：30

## 每个模板包含

- 名称
- 参考图片规则
- 首帧建议
- 尾帧建议
- 时长
- 镜头运动
- 动作描述
- 可灵Prompt
- Negative Prompt
- 标签
- 状态

## 模板规则

所有模板必须引用已审核母资产作为首帧或设计锁定：

- 人物模板引用 Character Bible
- 机甲模板引用 Hero Mecha Library
- 怪兽模板引用 Creature Library
- 环境模板引用 World Asset Library
- 镜头模板引用已确认镜头语言

禁止：

- 调用视频API
- 伪造视频完成状态
- 生成假视频URL
- 短视频式乱晃
- 改变角色脸型
- 改变机甲设计
- 改变怪兽结构

## 示例模板

赤霆01反应炉逐级点亮：

- Camera: slow push in
- Motion: reactor lights up
- Atmosphere: rain and steam
- Duration: 6 seconds

## 验证

已执行：

- `npm run generate:kling-video-template-library`
- JSON解析校验
- `npm run build`

结果：

- 150条模板生成成功
- 前端构建通过
- 未调用任何视频API
