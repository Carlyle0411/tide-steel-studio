# PHASE25 母资产 Prompt 系统重构

## 目标

本轮只重构本地网页内的母资产 Prompt 系统。

不接 API。
不新增联网逻辑。
不自动生成图片。
不做 Batch 生成。

## 已完成

- 重构 `ManualAssetImport.ts` 中的 Prompt 生成逻辑。
- 新增四层 Prompt 结构：
  - 世界观固定层
  - 类别锁定层
  - 资产类型层
  - 背景规则层
- 新增角色、机甲、怪兽三类专属 Prompt 模板。
- 新增 `backgroundPolicy` 逻辑。
- 角色标准母资产优先使用白底 / 浅灰无影棚。
- 机甲结构资产优先使用白底 / 浅灰技术展示背景。
- 怪兽结构资产优先使用白底 / 浅灰底，动作和氛围资产使用中性海雾或弱环境背景。
- Copy Image Prompt 现在复制当前资产卡片的完整定制 Prompt。
- 母资产库右侧 Prompt 区新增：
  - 资产类型
  - 背景规则
  - 构图要求
  - 主提示词
  - Negative Prompt
  - 一致性锁定
  - 用途说明

## 新增模板

角色类：

- 角色卡
- 标准头像
- 45度脸
- 全身正面
- 全身侧面
- 全身背面
- 三视图
- 表情板
- 坐姿
- 驾驶姿态
- 行走
- 奔跑
- 凝视
- 愤怒
- 悲伤
- 海报姿态

机甲类：

- 正面设计
- 侧面设计
- 背面设计
- 三视图
- 全身比例
- 驾驶舱
- 驾驶舱开启
- 武器展开
- 右臂武器细节
- 胸口核心细节
- 腿部结构
- 背部推进器
- 战斗姿态
- 冲刺姿态
- 海报姿态

怪兽类：

- 完整身体
- 头部
- 眼睛
- 甲壳
- 游泳
- 海面出现
- 攻击姿态
- 远景轮廓
- 海报姿态

## 修改文件

- `src/mcp/manualAssetImport/ManualAssetImport.ts`
- `src/pages/production/components/Phase20MasterAssetLibraryView.tsx`

## 验证

- `npm.cmd run build` 通过。
- 未调用图片生成。
- 未新增 API。
- 未修改 Bible。
