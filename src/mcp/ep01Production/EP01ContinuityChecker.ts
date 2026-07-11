import { productionAssets } from "../../pages/production/data/productionData";
import { getEP01Shots } from "./EP01ShotData";

export type ContinuityCheckItem = {
  subject: "林舟" | "许燃" | "赤霆01" | "白潮";
  rule: string;
  status: "PASS" | "WARNING" | "FAIL";
  note: string;
};

export type EP01ContinuityReport = {
  episodeId: "EP01";
  generatedAt: string;
  items: ContinuityCheckItem[];
  summary: string;
};

function hasApprovedAsset(name: string) {
  return productionAssets.some((asset) => asset.name.includes(name) && asset.approved);
}

export function runEP01ContinuityCheck(): EP01ContinuityReport {
  const shots = getEP01Shots();
  const linzhouInEp01 = shots.some((shot) => shot.character.includes("林舟"));
  const xuranInEp01 = shots.some((shot) => shot.character.includes("许燃"));
  const report: ContinuityCheckItem[] = [
    {
      subject: "林舟",
      rule: "发型一致 / 服装一致 / 年龄一致",
      status: linzhouInEp01 && !hasApprovedAsset("林舟") ? "FAIL" : "WARNING",
      note: linzhouInEp01 ? "林舟若正式出现，必须先锁定角色 Reference。" : "EP01 林舟不正式出现；保持为伏笔，不需要脸部连续性。"
    },
    {
      subject: "许燃",
      rule: "外貌一致 / 驾驶服一致",
      status: xuranInEp01 && !hasApprovedAsset("许燃") ? "FAIL" : "WARNING",
      note: xuranInEp01 ? "许燃镜头进入生成前需要 Approved Reference。" : "EP01 不依赖许燃正面资产。"
    },
    {
      subject: "赤霆01",
      rule: "暗红装甲 / 黑色骨架 / 蓝色能源 / 比例一致 / 武器不提前展示",
      status: hasApprovedAsset("赤霆") ? "PASS" : "WARNING",
      note: "EP01 只允许背部、舱门、装甲局部，不展示完整机甲。"
    },
    {
      subject: "白潮",
      rule: "身体结构一致 / 不拍成怪兽 Boss / 只允许局部或环境反应",
      status: "WARNING",
      note: "EP01 不完整展示白潮；后续需在 Creature Bible 规则下建立局部 Reference。"
    }
  ];
  const failed = report.filter((item) => item.status === "FAIL").length;
  const warnings = report.filter((item) => item.status === "WARNING").length;
  return {
    episodeId: "EP01",
    generatedAt: new Date().toISOString(),
    items: report,
    summary: failed ? `${failed} continuity blockers found.` : `${warnings} warnings; EP01 can continue if no new face/full creature shots are added.`
  };
}
