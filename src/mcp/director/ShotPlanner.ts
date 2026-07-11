import { analyzeShot } from "./ShotAnalyzer";

export function planShot(episodeId: string, shotId: string) {
  const shot = analyzeShot(episodeId, shotId);
  return {
    shotId,
    plan: [
      "确认剧情目的",
      "锁定角色/机甲/场景",
      "确认镜头语言",
      "生成Director Prompt",
      "进入MCP Production Runner"
    ],
    shot
  };
}
