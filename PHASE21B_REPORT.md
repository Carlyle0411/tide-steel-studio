# PHASE21B REPORT

## 阶段

Hero Mecha & Creature Asset Library

## 目标

锁定《潮汐钢魂》整个世界观的核心视觉：

- 赤霆01
- 玄鲸03
- 白鸢07
- 白潮
- 刺潮
- 黑潮母体

这些资产是全系列长期使用的母资产。后续关键帧、Storyboard、GPT Image2图片、可灵视频、海报和宣传片必须引用这里。

## 已完成

新增本地资产清单：

- `projects/tide-steel-soul/hero-mecha-creature-library/MECHA_CREATURE_ASSET_MANIFEST.json`
- `projects/tide-steel-soul/hero-mecha-creature-library/MECHA_CREATURE_REFERENCE_RULES.json`

新增生成脚本：

- `scripts/generate-hero-mecha-creature-library.mjs`

新增命令：

- `npm run generate:hero-mecha-creature-library`

新增页面：

- `src/pages/production/components/Phase21BMechaCreatureBibleView.tsx`

新增数据层：

- `src/mcp/heroMechaCreatureLibrary/HeroMechaCreatureLibraryData.ts`

机甲设定、怪兽设定导航已切换到 PHASE21B 母资产库页面。

## 资产数量

总计：71

机甲：

- 赤霆01：20
- 玄鲸03：10
- 白鸢07：10

怪兽：

- 白潮：15
- 刺潮：8
- 黑潮母体：8

## 已生成真实PNG

已实际生成并复制入项目：

- `assets/mecha/chiting01/CHITING01_V001.png`

对应资产：

- `MECHA-CRT001-V001`
- 赤霆01 / 正面设计

状态：

- 待人工审核

原始生成文件保留在 Codex 默认生成目录，没有删除。

## 已生成metadata、Prompt、Reference

全部 71 个资产均已生成：

- `*.json`
- `*_PROMPT.md`
- `*_REFERENCE.json`

目录：

- `assets/mecha/chiting01/`
- `assets/mecha/xuanjing03/`
- `assets/mecha/baiyuan07/`
- `assets/creature/white_tide/`
- `assets/creature/thorn_tide/`
- `assets/creature/black_tide_mother/`

## 当前状态

- 总资产：71
- 已落盘PNG：1
- 待生成PNG：70
- 已完成metadata：71
- 已完成Prompt：71
- 已完成Reference规则：71

## 规则

禁止：

- placeholder
- mock
- 假PNG
- 动漫机器人
- 游戏CG
- 普通鲸鱼式白潮
- 随机改设计

赤霆01必须保持：

- 红黑工业机甲
- 20米级
- 蓝色能源核心
- 真实军事机械感

白潮必须保持：

- 远古深海生命
- 白色甲壳
- 裂纹发光
- 非普通鲸鱼
- 非Boss怪兽

## 验证

已执行：

- `npm run generate:hero-mecha-creature-library`
- 实际生成赤霆01正面设计图
- 复制PNG到项目资产目录
- 更新metadata和manifest
- `npm run build`

未完成：

- 其余70张图片仍需逐张通过GPT Image2生成后落盘并人工审核。
