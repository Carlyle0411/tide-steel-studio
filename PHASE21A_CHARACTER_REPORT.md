# PHASE21A CHARACTER REPORT

## 阶段

Hero Character Asset Library / 英雄角色母资产库

## 目标

建立《潮汐钢魂》长期12集使用的人物核心资产标准库。

这些资产不是剧情截图，不是随机人物，而是后续关键帧、Storyboard、GPT Image2图片、可灵视频、海报和宣传片必须引用的角色标准模型库。

## 已完成

已建立本地角色资产结构：

- `projects/tide-steel-soul/hero-character-library/CHARACTER_BIBLE.json`
- `projects/tide-steel-soul/hero-character-library/CHARACTER_ASSET_MANIFEST.json`
- `projects/tide-steel-soul/hero-character-library/CHARACTER_REFERENCE_RULES.json`

已为以下角色生成母资产记录、Prompt、Metadata、Reference规则：

- 林舟 Lin Zhou：12张
- 许燃 Xu Ran：12张
- 陈牧：8张
- 唐小满：8张
- AI澜：8张

总计：

- 角色：5
- 应生成角色标准图：48
- 已生成本地metadata：48
- 已生成Prompt文件：48
- 已生成Reference规则文件：48
- 已落盘PNG：0

## 图片生成状态

已调用一次图片生成能力，生成了：

- 林舟 / 标准头像

但当前图片工具没有在本轮返回可直接复制到工作区的PNG文件路径。因此该图片没有被登记为已落盘资产，也没有写入 `assets/characters/linzhou/LINZHOU_V001.png`。

遵守原则：

- 不创建假PNG
- 不创建placeholder图片
- 不把聊天内未落盘图片标记为完成
- 不把未审核图片作为长期Reference

## 本地文件结构

角色metadata和Prompt已写入：

- `assets/characters/linzhou/`
- `assets/characters/xuran/`
- `assets/characters/chenmu/`
- `assets/characters/tangxiaoman/`
- `assets/characters/lan/`

每个资产包含：

- `*_PROMPT.md`
- `*_REFERENCE.json`
- `*.json`

PNG将在真实图片文件可落盘后补齐。

## 页面

新增：

- `src/pages/production/components/Phase21ACharacterBibleView.tsx`

角色设定导航已切换到 Character Bible 页面。

页面包含：

- 角色简介
- 视觉设定
- 年龄
- 身高
- 性格
- 服装
- 颜色
- 标志特征
- 参考图片状态
- Prompt
- Version记录
- Reference规则

## 一致性锁定

所有角色资产均写入：

- 年龄
- 身高
- 服装
- 颜色
- 标志特征
- Negative Prompt
- Reference规则

禁止：

- placeholder
- mock image
- random face
- different age
- different costume
- anime
- cartoon
- game render
- superhero pose

## 下一步

需要逐张生成真实PNG并复制到对应路径：

- `assets/characters/linzhou/LINZHOU_V001.png`
- `assets/characters/xuran/XURAN_V001.png`
- `assets/characters/chenmu/CHENMU_V001.png`
- `assets/characters/tangxiaoman/TANGXIAOMAN_V001.png`
- `assets/characters/lan/LAN_V001.png`

生成后必须更新对应JSON：

- `status`
- `imagePath`
- `referenceStatus`
- `updatedAt`

并经人工审核后才能成为长期12集Reference。
