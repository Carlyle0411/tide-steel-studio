# CHANGELOG MCP PHASE 04

项目：《潮汐钢魂》Movie Control Center  
阶段：MCP Phase 04 - Director Intelligence System

---

## 新增 Director Engine

- `src/mcp/director/DirectorEngine.ts`
- `src/mcp/director/ShotPlanner.ts`
- `src/mcp/director/SceneAnalyzer.ts`
- `src/mcp/director/ShotAnalyzer.ts`
- `src/mcp/director/CharacterContinuity.ts`
- `src/mcp/director/MechaContinuity.ts`
- `src/mcp/director/SceneContinuity.ts`
- `src/mcp/director/VisualContinuity.ts`

能力：

- 理解镜头剧情目的。
- 解析角色目标与情绪变化。
- 生成摄影语言判断。
- 锁定角色连续性。
- 锁定机甲连续性。
- 锁定场景连续性。
- 锁定整体视觉风格。

---

## Shot Understanding

已连接测试镜头：

- `EP01_KF01`

输出：

- 剧情目的：暴风雨前杭州湾防线仍在正常运行，但海洋出现第一丝异常规律。
- 镜头类型：Wide Establishing Shot。
- 摄影：24mm lens，slow cinematic。
- 情绪：未知、压迫、安静的危险。

---

## Continuity Locks

新增 Character Lock：

- 林舟
- 许燃
- 陈牧

新增 Mecha Lock：

- 赤霆01
- 玄鲸03
- 白鸢07

新增 Scene Lock：

- 深蓝基地
- 杭州湾防线
- 潮门

---

## Prompt Builder升级

Prompt Builder 现在执行：

Storyboard  
↓  
Director Engine  
↓  
Character Lock  
↓  
Mecha Lock  
↓  
Scene Lock  
↓  
Camera Language  
↓  
Final Prompt

输出：

- GPT Image2 Prompt
- Kling Prompt
- Veo Prompt
- Negative Prompt

---

## Prompt Version

新增：

- `src/mcp/schemas/promptVersion.schema.ts`

字段：

- `promptId`
- `shotId`
- `version`
- `model`
- `prompt`
- `negativePrompt`
- `createdAt`

版本格式：

- `V001`
- `V002`
- `V003`

---

## UI升级

新增 Director Review 页面：

- Shot
- Story Intent
- Character Lock
- Mecha Lock
- Scene Lock
- Visual Style
- Director Prompt
- Kling Prompt
- Veo Prompt
- Approve Direction

Command+K 新增：

- Generate Director Prompt

该命令会创建真实 `prompt_generation` task，并打开 Director Review。

---

## 约束

- 本阶段不生成图片。
- 不调用图像API。
- 不返回假生成结果。
- 不修改任何 Bible。
- 不删除已有文件。

---

## 验证

- `npm.cmd run build` 通过。
