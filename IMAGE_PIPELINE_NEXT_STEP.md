# IMAGE PIPELINE NEXT STEP

项目：《潮汐钢魂：赤霆纪元》  
当前阶段：EP01第一批关键帧已通过视觉审核  
下一阶段：Kling / Veo 视频生成准备

---

## 当前生产流程

剧本  
↓  
Story Room  
↓  
Episode Bible  
↓  
Script  
↓  
Shotlist  
↓  
GPT Image2关键帧  
↓  
视觉审核  
↓  
Kling视频生成

---

## 当前已完成资产

EP01第一批关键帧：

- KF01：正常世界中的第一丝不对劲
- KF02：杯中反向水纹
- KF04：陈牧相信异常
- KF09：观测闸关闭

资产位置：

- Draft：`assets/episodes/EP01/keyframes/draft/`
- Approved：`assets/episodes/EP01/keyframes/approved/`
- Rejected：`assets/episodes/EP01/keyframes/rejected/`

索引文件：

- `EP01_ASSET_INDEX.md`
- `EP01_KEYFRAME_AUDIT_BATCH01.md`

---

## 当前限制

GPT Image2当前无法自动读取本地Reference作为image input。

本轮生成采用的方法是：

- 先人工读取并查看Reference图。
- 再通过文本prompt强制绑定角色、环境、材质、摄影与色彩规则。
- 最后通过人工视觉审核确认一致性。

这可以用于概念验证和第一轮叙事关键帧生产，但不能替代严格资产锁定流程。

---

## 下一阶段需要支持

### Reference image输入

生成关键帧前，必须允许将下列Reference作为真实图像输入：

- 陈牧角色Reference
- 深蓝基地Reference
- 杭州湾防线Reference
- 赤霆01局部Reference

### Character consistency

陈牧必须保持：

- 同一张脸。
- 同一年龄感。
- 同一制服系统。
- 同一疲惫、克制、可信的气质。

### Scene consistency

深蓝基地和杭州湾防线必须保持：

- 同一建筑语言。
- 同一湿冷空气。
- 同一工业材料。
- 同一冷蓝灰色彩系统。

### IP Adapter

用于锁定：

- 陈牧脸部一致性。
- 基地建筑结构一致性。
- 赤霆局部装甲语言一致性。

### ControlNet

用于锁定：

- 镜头构图。
- 人物站位。
- 闸门、杯子、观测窗等关键物件位置。
- KF到视频运动时的空间连续性。

### LoRA

用于长期统一：

- 《潮汐钢魂》工业科幻视觉风格。
- 赤霆01机甲材质。
- 杭州湾海洋防线建筑系统。
- 潮兽生物甲壳与深海组织语言。

---

## Kling / Veo准备原则

进入视频生成前，每个镜头必须具备：

- Approved关键帧。
- 镜头运动说明。
- 声音设计方向。
- 不可改变元素。
- 允许变化元素。

视频生成不是重新设计画面。

视频生成只负责让已经通过审核的画面发生时间。
