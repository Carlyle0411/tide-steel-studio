import type { MasterGenerationTask } from "./AssetGenerationQueue";

export type ValidationResult = {
  passed: boolean;
  issues: string[];
};

export function validateGeneratedAsset(task: MasterGenerationTask, localPath: string): ValidationResult {
  const issues: string[] = [];
  if (!localPath.toLowerCase().endsWith(".png")) issues.push("生成结果必须是PNG文件。");
  if (!localPath.includes("assets/")) issues.push("项目引用图片必须复制到workspace的assets目录。");
  if (!task.prompt.includes("16:9")) issues.push("Prompt缺少16:9比例锁定。");
  if (!task.negativePrompt) issues.push("缺少Negative Prompt。");
  return { passed: issues.length === 0, issues };
}

export function nextStatusAfterImport(validation: ValidationResult) {
  return validation.passed ? "REVIEW" : "GENERATION_FAILED";
}
