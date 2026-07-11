import type { ProductionAsset, StoryboardShotRecord } from "../types";

const sectionMap: Record<string, string> = {
  Characters: "Characters",
  Mechas: "Mechas",
  Creatures: "Creatures",
  Environments: "Environments",
  Props: "Props"
};

export function parseAssetDatabase(markdown: string): ProductionAsset[] {
  const lines = markdown.split(/\r?\n/);
  let category = "";
  const assets: ProductionAsset[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    const section = /^##\s+(.+)$/.exec(line)?.[1]?.trim();
    if (section && sectionMap[section]) {
      category = sectionMap[section];
      continue;
    }
    if (!category || !line.startsWith("|") || line.includes("资产编号") || /^(\|\s*-+)/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 9) continue;
    const approved = cells[5].toLowerCase() === "yes";
    assets.push({
      id: cells[0],
      category,
      name: cells[1],
      version: cells[2],
      reference: stripCode(cells[3]),
      firstEpisode: cells[4],
      approved,
      gptImage2: cells[6].toLowerCase() === "yes",
      kling: cells[7].toLowerCase() === "yes",
      veo: cells[8].toLowerCase() === "yes",
      status: approved ? "approved" : "draft"
    });
  }

  return assets;
}

export function parseShotlist(markdown: string): StoryboardShotRecord[] {
  const chunks = markdown.split(/(?=# SHOT\s+\d+)/g).filter((chunk) => /^# SHOT\s+\d+/.test(chunk.trim()));
  return chunks.map((chunk, index) => {
    const title = /^# SHOT\s+(\d+)/m.exec(chunk)?.[1] ?? String(index + 1).padStart(3, "0");
    return {
      id: `EP01-SHOT-${title}`,
      number: title,
      time: pickSection(chunk, "时间") || "--",
      storyFunction: pickSection(chunk, "剧情作用") || "待补充",
      frame: pickSection(chunk, "画面描述") || "待补充",
      camera: pickSection(chunk, "摄影设计") || "待补充",
      keyframe: pickSection(chunk, "AI生成关键帧需求") || "未绑定",
      video: pickSection(chunk, "视频运动要求") || "待生成",
      sound: pickSection(chunk, "声音") || "待设计",
      review: /IMAGE KEYFRAME|关键帧/i.test(chunk) ? "review" : "missing"
    };
  });
}

export function summarizeMarkdown(markdown: string, max = 180) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_\-|`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function pickSection(chunk: string, heading: string) {
  const pattern = new RegExp(`##\\s+${escapeRegex(heading)}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+|$)`);
  const match = pattern.exec(chunk);
  return match?.[1]?.replace(/-{3,}/g, "").replace(/\s+/g, " ").trim() ?? "";
}

function stripCode(value: string) {
  return value.replace(/`/g, "");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
