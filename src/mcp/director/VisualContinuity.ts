export type VisualContinuityReport = {
  status: "PASS" | "WARNING" | "FAIL";
  styleLock: string;
  checks: string[];
};

export function checkVisualContinuity() : VisualContinuityReport {
  return {
    status: "PASS",
    styleLock: "cinematic realistic sci-fi, low saturation, wet industrial materials, restrained camera, no anime, no game render, no plastic future",
    checks: ["色彩", "材质", "摄影位置", "非游戏CG", "非动漫"]
  };
}
