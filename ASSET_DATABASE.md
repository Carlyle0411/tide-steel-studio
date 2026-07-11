# ASSET DATABASE

项目：《潮汐钢魂》  
用途：全系列视觉资产总数据库  
版本：V1

---

## 状态定义

Draft：概念草案，不能进入视频。  
Review：等待人工审核，不能进入视频。  
Approved：已锁定，可进入Storyboard、Kling、Veo。  
Deprecated：历史版本或废弃资产，不能进入新生产。

---

## 字段说明

资产编号：全局唯一编号。  
版本：当前资产版本。  
Reference：主要参考资产或Reference文件。  
第一次出现集数：资产首次允许正式出现的集数。  
是否Approved：只有Yes才可进入视频生产。  
是否可以用于GPT Image2：是否可作为图像生成参考。  
是否可以用于Kling：是否可进入视频生成。  
是否可以用于Veo：是否可进入视频生成。

---

## Characters

| 资产编号 | 资产 | 版本 | Reference | 第一次出现集数 | 是否Approved | 是否可以用于GPT Image2 | 是否可以用于Kling | 是否可以用于Veo |
|---|---|---:|---|---|---|---|---|---|
| CHAR-LINZHOU-001 | 林舟 | V0 | 待建立 | EP02 | No | No | No | No |
| CHAR-XURAN-001 | 许燃 | V0 | 待建立 | EP02 | No | No | No | No |
| CHAR-CHENMU-001 | 陈牧 | V1 | `assets/visual_reference/character/REFERENCE_01_CHEN_MU_CHARACTER_FINAL.png` | EP01 | Yes | Yes | Yes | Yes |
| CHAR-TANGXIAOMAN-001 | 唐小满 | V0 | 待建立 | 第三部 | No | No | No | No |
| CHAR-LAN-001 | AI澜 | V0 | 系统界面规则，非人形 | EP01 | No | No | No | No |

---

## Mechas

| 资产编号 | 资产 | 版本 | Reference | 第一次出现集数 | 是否Approved | 是否可以用于GPT Image2 | 是否可以用于Kling | 是否可以用于Veo |
|---|---|---:|---|---|---|---|---|---|
| MECHA-CRT001-001 | 赤霆01 | V1 | `assets/visual_reference/mecha/REFERENCE_03_CRT001_BACK_COCKPIT_DETAIL.png` | EP01局部 / EP02启动 | Yes | Yes | Yes | Yes |
| MECHA-XUANJING03-001 | 玄鲸03 | V0 | 待建立 | 待定 | No | No | No | No |
| MECHA-BAIYUAN07-001 | 白猿07 | V0 | 待建立 | 待定 | No | No | No | No |

---

## Creatures

| 资产编号 | 资产 | 版本 | Reference | 第一次出现集数 | 是否Approved | 是否可以用于GPT Image2 | 是否可以用于Kling | 是否可以用于Veo |
|---|---|---:|---|---|---|---|---|---|
| CRE-WHITETIDE-001 | 白潮 | V0 | `WHITE_TIDE_CREATURE_BIBLE.md` / `WHITE_TIDE_IMAGE_RULES.md` | EP03局部 | No | No | No | No |
| CRE-BLACKTIDE-001 | 黑潮母体 | V0 | `TIDE_GATE_IMAGE_RULES.md` | EP10-EP12阶段性误判 | No | No | No | No |

---

## Environments

| 资产编号 | 资产 | 版本 | Reference | 第一次出现集数 | 是否Approved | 是否可以用于GPT Image2 | 是否可以用于Kling | 是否可以用于Veo |
|---|---|---:|---|---|---|---|---|---|
| ENV-DEEPBLUEBASE-001 | 深蓝基地 | V1 | `assets/visual_reference/environment/REFERENCE_02_DEEP_BLUE_BASE_2047.png` | EP01 | Yes | Yes | Yes | Yes |
| ENV-OCEANWALL-001 | 杭州湾海防墙 | V1 | `assets/visual_reference/environment/REFERENCE_04_HANGZHOU_BAY_OCEAN_DEFENSE_LINE.png` | EP01 | Yes | Yes | Yes | Yes |
| ENV-COMMANDCENTER-001 | 指挥中心 | V0 | 深蓝基地内部延展 | EP01 | No | No | No | No |
| ENV-COCKPIT-001 | 赤霆驾驶舱 | V0 | `assets/visual_reference/mecha/REFERENCE_03_CRT001_BACK_COCKPIT_DETAIL.png` | EP02 | No | No | No | No |
| ENV-TIDEGATE-001 | 潮门 | V0 | `TIDE_GATE_WORLD_RULES_BIBLE.md` / `TIDE_GATE_IMAGE_RULES.md` | EP09局部 | No | No | No | No |

---

## Props

| 资产编号 | 资产 | 版本 | Reference | 第一次出现集数 | 是否Approved | 是否可以用于GPT Image2 | 是否可以用于Kling | 是否可以用于Veo |
|---|---|---:|---|---|---|---|---|---|
| PROP-HELMET-001 | 驾驶头盔 | V0 | 待建立 | EP02 | No | No | No | No |
| PROP-SONAR-001 | 声呐设备 | V0 | 深蓝基地设备体系 | EP01 | No | No | No | No |
| PROP-BUOY-001 | 浮标 | V0 | 杭州湾防线体系 | EP01 | No | No | No | No |
| PROP-SYNCDEVICE-001 | 同步装置 | V0 | 赤霆同步系统 | EP02 | No | No | No | No |

---

## 更新规则

1. 新资产进入数据库时，必须先获得资产编号。
2. 没有Reference的资产不能标记为Approved。
3. 没有Approved的资产禁止进入Kling和Veo。
4. 废弃资产必须移入对应目录的`deprecated/`。
5. 任何替换Reference的操作必须升级版本号。
6. 全系列角色、机甲、生物、场景、道具都必须在本文件登记。
