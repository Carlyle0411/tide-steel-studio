# PHASE22 REPORT

## 阶段

MASTER ASSET GENERATION ENGINE

## 目标

建立真正的电影母资产生成工作流。

本阶段不是只生成Prompt。  
不是placeholder。  
不是mock。  
没有真实PNG返回时，不能标记成功。

## 新增模块

新增目录：

- `src/mcp/masterAssetGenerator/`

包含：

- `MasterAssetGenerator.ts`
- `AssetGenerationQueue.ts`
- `GPTImage2Executor.ts`
- `AssetImporter.ts`
- `AssetMetadataWriter.ts`
- `GenerationValidator.ts`

## 新增队列生成脚本

新增：

- `scripts/build-master-generation-queue.mjs`

新增命令：

- `npm run build:master-generation-queue`

输出：

- `projects/tide-steel-soul/master-generation-queue/GENERATION_QUEUE.json`

## 新增页面

新增：

- `src/pages/production/components/Phase22GenerationQueueView.tsx`

左侧导航新增：

- `生成队列`

页面显示：

- 任务名称
- 类型
- Prompt
- 生成状态
- 图片预览状态
- 失败原因
- 重新生成按钮

## 状态机

允许状态：

```text
PENDING_GENERATION
↓
GENERATING
↓
GENERATED
↓
REVIEW
↓
APPROVED
↓
MASTER_REFERENCE
```

失败状态：

```text
GENERATION_FAILED
```

规则：

- 未生成真实PNG时，不得进入 REVIEW。
- 未人工审核时，不得进入 APPROVED。
- 未 APPROVED 时，不得进入 Kling Video Workflow。

## 任务数量

当前队列：

- 总任务：213
- 待生成：210
- Review：3
- Approved：0
- Master Reference：0

来源：

- Character Library：48
- Mecha Library：40
- Creature Library：35
- Environment Library：90

## 已真实生成并落盘

本阶段实际新增：

- `assets/characters/linzhou/LINZHOU_V001.png`

对应资产：

- `CHAR-LINZHOU-V001`
- 林舟 / 标准头像
- 状态：`待人工审核`
- 模型：`GPT Image2`

此前已存在并进入Review：

- `assets/mecha/chiting01/CHITING01_V001.png`
- `assets/world/hangzhou_bay_future_city/HANGZHOU_BAY_V001.png`

## Metadata

每张真实落盘图片会写入或更新对应JSON：

```json
{
  "id": "asset id",
  "name": "asset name",
  "category": "asset category",
  "version": "V001",
  "prompt": "GPT Image2 prompt",
  "model": "GPT Image2",
  "created_time": "ISO time",
  "reference_tags": ["MASTER_ASSET"],
  "used_episode": "ALL",
  "approved": false
}
```

## 生成失败策略

如果GPT Image2不可用，或没有真实PNG路径：

- 返回 `generation_failed`
- 不写假图片
- 不写fake url
- 不写mock completed
- 不进入APPROVED

## 当前未完成

仍需逐张生成：

- 角色：47
- 机甲/怪兽：74
- 世界资产：89

总计待生成：

- 210

## 验证

已执行：

- `npm run build:master-generation-queue`
- 使用GPT Image2实际生成林舟标准头像
- 复制PNG到项目资产目录
- 更新角色metadata
- 重建生成队列
- `npm run build`

结果：

- 队列总数：213
- Review数量：3
- 构建通过
