export type SceneLock = {
  scene: string;
  status: "PASS" | "WARNING" | "FAIL";
  lockPrompt: string;
  checks: string[];
};

export function getSceneLock(environment: string): SceneLock {
  if (/杭州湾|ocean defense|防线/i.test(environment)) {
    return {
      scene: "杭州湾防线",
      status: "PASS",
      lockPrompt: "Hangzhou Bay ocean defense line lock: 2047 future industrial ocean wall, observation towers, buoy arrays, wet cold air, low storm cloud, ocean larger than human defense, no cyberpunk neon",
      checks: ["天气", "海浪", "时间", "防线结构", "海洋尺度"]
    };
  }
  if (/深蓝|deep blue/i.test(environment)) {
    return {
      scene: "深蓝基地",
      status: "PASS",
      lockPrompt: "Deep Blue Base lock: heavy industrial ocean-defense interior, wet metal, glass observation windows, maintenance platforms, cold blue system light, no clean sci-fi lobby",
      checks: ["位置", "建筑结构", "光照", "湿冷空气"]
    };
  }
  if (/潮门|tide gate/i.test(environment)) {
    return {
      scene: "潮门",
      status: "WARNING",
      lockPrompt: "Tide Gate lock: not a portal, not wormhole, unknown marine ecology overlap, low saturation deep ocean blue, no purple energy, no lightning",
      checks: ["颜色", "规模", "裂口状态", "生态入口"]
    };
  }
  return { scene: environment || "unknown", status: "WARNING", lockPrompt: "scene reference not approved; keep visual style consistent with Tide Steel Soul industrial ocean future", checks: ["reference"] };
}
