import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(process.cwd(), "DIRECTORS_BIBLE_潮汐钢魂_三部曲_V2.md");
const text = fs.readFileSync(file, "utf8");

const lines = text.split(/\r?\n/);
const paragraphs = text
  .split(/\n\s*\n/)
  .map((p) => p.trim())
  .filter((p) => p && !p.startsWith("|---"));

const sentences = text
  .replace(/\r/g, "")
  .split(/(?<=[。！？])|\n+/)
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith("|") && !s.startsWith("#") && !s.startsWith("- "));

const watchTerms = [
  "不是", "而是", "必须", "不能", "不要", "真正", "核心", "文明", "潮汐",
  "答案", "问题", "第一部", "第二部", "第三部", "最优", "规则", "误判",
  "不可逆", "选择", "系统", "人类", "赤霆", "潮兽", "AI澜"
];

function countTerm(term) {
  return (text.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

const termCounts = watchTerms
  .map((term) => ({ term, count: countTerm(term) }))
  .sort((a, b) => b.count - a.count);

const sentenceLengths = sentences.map((s) => s.length);
const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(1, sentenceLengths.length);

const patternCounts = [
  { name: "不是……而是", count: (text.match(/不是[^。\n]{0,40}而是/g) || []).length },
  { name: "第一部/第二部/第三部连续结构", count: (text.match(/第一部[\s\S]{0,120}第二部[\s\S]{0,120}第三部/g) || []).length },
  { name: "必须连续句", count: (text.match(/必须[^。\n]*[。\n]\s*[^。\n]*必须/g) || []).length },
  { name: "不能连续句", count: (text.match(/不能[^。\n]*[。\n]\s*[^。\n]*不能/g) || []).length },
  { name: "不要连续句", count: (text.match(/不要[^。\n]*[。\n]\s*[^。\n]*不要/g) || []).length },
];

const repeatedStarts = {};
for (const sentence of sentences) {
  const start = sentence.slice(0, 6);
  if (start.length >= 4) repeatedStarts[start] = (repeatedStarts[start] || 0) + 1;
}
const topStarts = Object.entries(repeatedStarts)
  .filter(([, count]) => count >= 3)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

const nearEqualRuns = [];
for (let i = 0; i <= sentenceLengths.length - 5; i++) {
  const run = sentenceLengths.slice(i, i + 5);
  const max = Math.max(...run);
  const min = Math.min(...run);
  if (max - min <= 6) {
    nearEqualRuns.push({ startSentence: i + 1, lengths: run });
  }
}

const consecutiveParagraphPatterns = [];
for (let i = 0; i <= paragraphs.length - 3; i++) {
  const starts = paragraphs.slice(i, i + 3).map((p) => p.slice(0, 8));
  if (starts[0] === starts[1] && starts[1] === starts[2]) {
    consecutiveParagraphPatterns.push({ paragraph: i + 1, starts });
  }
}

const headings = lines.filter((l) => /^#{1,6}\s/.test(l));
const headingJumps = [];
let prevLevel = 0;
for (const h of headings) {
  const level = h.match(/^#+/)[0].length;
  if (prevLevel && level > prevLevel + 1) headingJumps.push(h);
  prevLevel = level;
}

const tableRows = lines
  .filter((l) => /^\| (赤霆纪元|深蓝遗迹|终潮) \| EP/.test(l))
  .map((row) => row.split("|").slice(1, -1).map((c) => c.trim()));

const conceptTitleHints = ["文明", "考试", "失败", "值得", "海仍在", "终潮", "答案", "问题", "理由"];
const conceptEpisodes = tableRows.filter((cols) => conceptTitleHints.some((hint) => cols[2].includes(hint) || cols[3].includes(hint)));

const weakActionVerbs = ["确认", "判断", "追踪", "验证", "协调", "计算", "发现", "理解", "面对"];
const weakActionEpisodes = tableRows.filter((cols) => weakActionVerbs.some((v) => cols[4].startsWith(v) || cols[5].startsWith(v)));

const multiPerspectiveEpisodes = tableRows.filter((cols) => /全员|人类|城市|团队|所有人|民众/.test(cols[4] + cols[6] + cols[9]));

const counts = {
  lines: lines.length,
  paragraphs: paragraphs.length,
  sentences: sentences.length,
  headings: headings.length,
  tableRows: tableRows.length,
  avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
};

function table(items, headers) {
  const out = [];
  out.push(`| ${headers.join(" | ")} |`);
  out.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const item of items) out.push(`| ${headers.map((h) => String(item[h] ?? "")).join(" | ")} |`);
  return out.join("\n");
}

let style = `# STYLE_AUDIT_REPORT\n\n`;
style += `## 工具说明\n\n`;
style += `本报告由本地 Node.js 自定义脚本生成。当前环境未检测到可直接调用的 Vale 或 markdownlint-cli2；npm PowerShell shim 被执行策略拦截。因此本轮以项目定制统计为主，不使用英文商业写作模板套中文。\n\n`;
style += `## 基础统计\n\n`;
style += `- 行数：${counts.lines}\n- 段落数：${counts.paragraphs}\n- 句子数：${counts.sentences}\n- 标题数：${counts.headings}\n- 36集表格行数：${counts.tableRows}\n- 平均句长：${counts.avgSentenceLength} 字\n\n`;
style += `## 高频词与概念\n\n`;
style += table(termCounts.map((x) => ({ "词/句式": x.term, "次数": x.count })), ["词/句式", "次数"]);
style += `\n\n## 高频句式\n\n`;
style += table(patternCounts.map((x) => ({ "句式": x.name, "次数": x.count })), ["句式", "次数"]);
style += `\n\n## 重复开头\n\n`;
style += topStarts.length
  ? table(topStarts.map(([start, count]) => ({ "开头": start, "次数": count })), ["开头", "次数"])
  : `未发现 3 次以上重复开头。`;
style += `\n\n## 连续相近句长\n\n`;
style += nearEqualRuns.slice(0, 20).length
  ? table(nearEqualRuns.slice(0, 20).map((x) => ({ "起始句": x.startSentence, "句长序列": x.lengths.join(", ") })), ["起始句", "句长序列"])
  : `未发现明显连续五句句长接近。`;
style += `\n\n## Markdown 结构检查\n\n`;
style += `- 标题跳级：${headingJumps.length ? headingJumps.join("；") : "未发现"}\n`;
style += `- 36集表格：${tableRows.length === 36 ? "完整 36 行" : `异常，检测到 ${tableRows.length} 行`}\n`;
style += `\n## 初步判断\n\n`;
style += `- “文明”“潮汐”“必须”“不是”等词频偏高，说明概念解释压力过重。\n`;
style += `- “第一部/第二部/第三部”结构必要但过整齐，FINAL 版需要减少课程大纲感。\n`;
style += `- 多个集数以概念标题和宏大命题成立，戏剧动作需要下沉到具体人物和具体阻力。\n`;
style += `- 规则句偏多，FINAL 版需要加入导演旁注、容易拍错、允许例外、未决问题，形成现场工作痕迹。\n`;

fs.writeFileSync(path.join(process.cwd(), "STYLE_AUDIT_REPORT.md"), style, "utf8");

let audit = `# DIRECTORS_BIBLE_AUDIT\n\n`;
audit += `目标文件：DIRECTORS_BIBLE_潮汐钢魂_三部曲_V2.md\n\n`;
audit += `## 总导演终审结论\n\n`;
audit += `V2 已完成项目形态纠偏，但仍像“正确的大纲”，还不是最终导演工作手册。主要问题不是长度，而是结构过整齐、概念解释过频、36 集中后段有若干集依靠主题成立，缺少第一主视角、具体阻力和最后一帧。\n\n`;
audit += `## A. 过度整齐\n\n`;
audit += `- 三部曲说明中多次使用“第一部/第二部/第三部”平行结构。保留总弧线处的结构，其他地方改成工作语言。\n`;
audit += `- “不是……而是……”句式承担了太多判断。保留项目定义和世界观误判处，删除重复强调。\n`;
audit += `- “必须/不能/不要”规则密度高。FINAL 版保留纪律，但加入“什么时候可以破例”。\n\n`;
audit += `## B. 过度正确\n\n`;
audit += `以下句子方向正确，但需要具体化或删除：\n\n`;
audit += `- “每个章节都要像电影，而不是像内容。”需要改成章节检查动作。\n`;
audit += `- “每一次牺牲都必须改变人物关系、世界认知或文明选择。”可保留，但应配一个拍错案例。\n`;
audit += `- “剪辑控制观众的理解速度。”可压缩，后面直接给剪辑规则。\n`;
audit += `- “主线永远优先。”重复出现，保留一次。\n\n`;
audit += `## C. 过度解释主题\n\n`;
audit += `“文明评估机制/文明考试/潮汐系统”解释过早且过直。FINAL 版应建立三层：作者知道、角色逐渐知道、观众自己发现。前半部减少直接解释，改用动作、镜头、声音和失败案例表达。\n\n`;
audit += `## D. 过度金句化\n\n`;
audit += `建议只保留核心句：\n\n`;
audit += `- “海洋永远比城市更大。”\n`;
audit += `- “当海洋开始提问，人类必须回答。”\n\n`;
audit += `其他类似“人类不能战胜潮汐……”在 FINAL 中转为工作判断，避免全章像金句合集。\n\n`;
audit += `## 36集戏剧审计\n\n`;
audit += `### 主要靠概念成立的集数\n\n`;
audit += table(conceptEpisodes.map((cols) => ({ "部": cols[0], "集": cols[1], "集名": cols[2], "风险": "标题/问题偏概念，需要落到人物动作" })), ["部", "集", "集名", "风险"]);
audit += `\n\n### 动作偏弱或偏认知的集数\n\n`;
audit += table(weakActionEpisodes.map((cols) => ({ "部": cols[0], "集": cols[1], "集名": cols[2], "人物目标": cols[4], "可见动作": cols[5] })), ["部", "集", "集名", "人物目标", "可见动作"]);
audit += `\n\n### 第一主视角不清的集数\n\n`;
audit += table(multiPerspectiveEpisodes.map((cols) => ({ "部": cols[0], "集": cols[1], "集名": cols[2], "问题": "主语过大，需要具体到一个人" })), ["部", "集", "集名", "问题"]);
audit += `\n\n## 建议重写/合并集数\n\n`;
audit += `- 赤霆纪元 EP10《文明潮汐》：概念过早，需要落到陈牧具体保留/销毁数据的选择。\n`;
audit += `- 赤霆纪元 EP11《考试开始》：容易变成 AI 解释世界观，需要用赤霆放下链刃和低频响应表达。\n`;
audit += `- 赤霆纪元 EP12《不是战争》：主语“全员”过大，需要指定第一主视角。\n`;
audit += `- 深蓝遗迹 EP10《变成恐惧》与 EP12《失败之因》：都是大揭示，需区分一个是林舟目击，一个是陈牧/AI澜选择封存。\n`;
audit += `- 终潮 EP10《值得留下》：当前“城市自发”太群像，必须找到第一个打开闸门的人。\n`;
audit += `- 终潮 EP11《终潮之眼》：概念最危险，需要避免终局演讲。\n`;
audit += `- 终潮 EP12《海仍在》：需要确定最后一帧和角色代价，不能只靠诗意收束。\n\n`;
audit += `## 世界观未决\n\n`;
audit += `- 潮汐是否具有意识：不建议明确回答。角色可误以为它有意识，电影不证实。\n`;
audit += `- 黑潮母体的本体：倾向上一文明控制潮汐失败后的遗留系统，但暂不彻底定义。\n`;
audit += `- 赤霆最终是否毁灭：暂不决定。等第三部人物代价明确后判断。\n`;
audit += `- AI澜是否可被视为生命：不提前回答，只通过行为变化让观众判断。\n`;
audit += `- 人类是否“通过考试”：不建议说通过，只呈现潮汐退去但不消失。\n`;

fs.writeFileSync(path.join(process.cwd(), "DIRECTORS_BIBLE_AUDIT.md"), audit, "utf8");

const characterEpisodes = {
  "林舟": tableRows.filter((c) => /(林舟|赤霆)/.test(c.join(""))),
  "许燃": tableRows.filter((c) => /许燃/.test(c.join(""))),
  "陈牧": tableRows.filter((c) => /陈牧|指挥|命令/.test(c.join(""))),
  "AI澜": tableRows.filter((c) => /AI澜|AI/.test(c.join(""))),
};

let continuity = `# CHARACTER_CONTINUITY\n\n`;
continuity += `## 审计原则\n\n上一集造成的人物变化，下一集必须继续存在。禁止人物重置。\n\n`;
for (const [name, rows] of Object.entries(characterEpisodes)) {
  continuity += `## ${name}\n\n`;
  continuity += table(rows.map((cols) => ({
    "部": cols[0],
    "集": cols[1],
    "集名": cols[2],
    "本集变化": cols[6],
    "连续性风险": continuityRisk(name, cols)
  })), ["部", "集", "集名", "本集变化", "连续性风险"]);
  continuity += `\n\n`;
}

continuity += `## 重点警告\n\n`;
continuity += `- 林舟：避免反复“冲动、失败、怀疑、再冲动”。第二部以后他的动作要更迟疑、更观察，不能只是更勇敢。\n`;
continuity += `- 许燃：不能只做理性搭档。她的错误应是过度相信规则，以及隐瞒自己发现规则来源可疑。\n`;
continuity += `- 陈牧：不能只下命令和反对主角。他的弧线应从守防线，转向质疑防线，最终拒绝不该下的命令。\n`;
continuity += `- AI澜：不能太早像人。变化先表现为延迟、遗漏、拒绝排序、改变措辞、不立即回答。\n`;

fs.writeFileSync(path.join(process.cwd(), "CHARACTER_CONTINUITY.md"), continuity, "utf8");

function continuityRisk(name, cols) {
  const episode = `${cols[0]} ${cols[1]}`;
  if (name === "林舟" && /证明|怀疑|拒绝/.test(cols[6])) return "保留变化，下一集不要重置为单纯冲动";
  if (name === "许燃" && /规则|隐瞒|质疑/.test(cols[6])) return "需要让她承担隐瞒或规则错误的后果";
  if (name === "陈牧" && /系统|防线|命令|守/.test(cols[6] + cols[5])) return "避免只做指挥功能，给他具体损失";
  if (name === "AI澜" && /最优|拒绝|模型|延迟/.test(cols[6] + cols[5])) return "变化应先体现在接口行为，不要演讲";
  return episode.includes("终潮") ? "终局集需检查是否过快完成弧线" : "低风险，但需接续上一集变化";
}

console.log(JSON.stringify({ counts, termCounts, patternCounts, conceptEpisodes: conceptEpisodes.length, weakActionEpisodes: weakActionEpisodes.length, multiPerspectiveEpisodes: multiPerspectiveEpisodes.length }, null, 2));
