import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "projects", "tide-steel-soul", "master-generation-queue");
const sources = [
  ["character", "projects/tide-steel-soul/hero-character-library/CHARACTER_ASSET_MANIFEST.json"],
  ["mecha_creature", "projects/tide-steel-soul/hero-mecha-creature-library/MECHA_CREATURE_ASSET_MANIFEST.json"],
  ["world", "projects/tide-steel-soul/world-asset-library/WORLD_ASSET_MANIFEST.json"]
];

const tasks = [];
for (const [sourceType, relativePath] of sources) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) continue;
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const asset of manifest.assets) {
    const pending = !asset.status || asset.status.includes("待图片") || asset.status.includes("待生成") || asset.status.includes("寰呭浘");
    const generated = asset.status?.includes("审核") || asset.status?.includes("通过") || asset.status?.includes("寰呬汉");
    tasks.push({
      taskId: `GEN-${asset.assetId}`,
      assetId: asset.assetId,
      sourceType,
      name: asset.name || asset.character || asset.category,
      category: asset.domain || asset.category || "人物",
      variant: asset.variant,
      prompt: asset.prompt,
      negativePrompt: asset.negativePrompt,
      outputPath: asset.imagePath,
      metadataPath: asset.metadataPath,
      promptPath: asset.promptPath,
      referencePath: asset.referencePath,
      status: generated ? "REVIEW" : pending ? "WAITING" : "WAITING",
      previewPath: generated ? asset.imagePath : "",
      failureReason: "",
      createdAt: "2026-07-10T00:00:00.000+08:00",
      updatedAt: asset.updatedAt || "2026-07-10T00:00:00.000+08:00"
    });
  }
}

const queue = {
  project: "潮汐钢魂",
  phase: "PHASE 22 MASTER ASSET GENERATION ENGINE",
  generatedAt: new Date().toISOString(),
  rule: "只记录真实生成工作流。没有真实PNG返回时不得标记completed或APPROVED。",
  total: tasks.length,
  pending: tasks.filter((task) => task.status === "WAITING").length,
  review: tasks.filter((task) => task.status === "REVIEW").length,
  approved: tasks.filter((task) => task.status === "APPROVED").length,
  failed: tasks.filter((task) => task.status === "GENERATION_FAILED").length,
  tasks
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "GENERATION_QUEUE.json"), `${JSON.stringify(queue, null, 2)}\n`, "utf8");
console.log(`Master generation queue built: ${queue.total} tasks, ${queue.pending} pending, ${queue.review} review.`);
