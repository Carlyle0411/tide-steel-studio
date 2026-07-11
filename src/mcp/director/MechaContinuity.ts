export type MechaLock = {
  mecha: string;
  status: "PASS" | "WARNING" | "FAIL";
  lockPrompt: string;
  checks: string[];
};

export function getMechaLock(mecha: string, episodeId: string): MechaLock {
  if (/赤霆|crt001|red thunder/i.test(mecha)) {
    return {
      mecha: "赤霆01",
      status: episodeId === "EP01" ? "WARNING" : "PASS",
      lockPrompt: "CRT-001 Red Thunder mechanical lock: dark red armor, black mechanical frame, blue synchronization core light, heavy industrial weight; EP01 only partial back/cockpit detail, no full body hero pose",
      checks: ["红黑装甲", "胸口蓝色核心", "右臂等离子链刃", "EP01禁止完整展示"]
    };
  }
  if (/玄鲸|xuanjing/i.test(mecha)) {
    return { mecha: "玄鲸03", status: "WARNING", lockPrompt: "Xuanjing03 mechanical lock: black-blue long-range structure, reference not approved", checks: ["黑蓝远程结构"] };
  }
  if (/白鸢|baiyuan/i.test(mecha)) {
    return { mecha: "白鸢07", status: "WARNING", lockPrompt: "Baiyuan07 mechanical lock: white-gray reconnaissance structure, reference not approved", checks: ["白灰侦察结构"] };
  }
  return { mecha: "none", status: "PASS", lockPrompt: "no mecha visible in frame", checks: ["none"] };
}
