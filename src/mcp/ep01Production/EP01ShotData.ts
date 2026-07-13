import { storyboardShots } from "../../pages/production/data/productionData";

export type EP01ShotStatus = "LOCKED" | "GENERATING" | "REVIEW" | "APPROVED" | "FAILED";

export type EP01ShotProductionData = {
  shot_id: string;
  sourceShotId: string;
  duration: string;
  description: string;
  camera: string;
  lens: string;
  movement: string;
  character: string;
  character_action: string;
  emotion: string;
  lighting: string;
  environment: string;
  vfx: string;
  sound: string;
};

const enrichment = [
  ["8s", "24mm", "极慢推进", "无", "海防线保持正常运行，远处海面出现几乎难以察觉的反向水纹。", "隐约不安", "清晨阴天冷光", "杭州湾海防墙", "轻微反向海纹"],
  ["7s", "85mm微距", "固定近焦", "无", "杯中水纹违反常规向中心聚拢，桌面与杯体没有震动。", "怀疑", "观测室低亮实景光", "深蓝外海观测站", "仅使用真实水体异常"],
  ["9s", "35mm", "缓慢横移", "陈牧", "陈牧先观察到室内细节变化，系统仍未识别海面异常。", "克制怀疑", "冷蓝屏幕反射光", "深蓝基地指挥通道", "无"],
  ["8s", "50mm", "克制推进", "陈牧", "陈牧离开正常读数屏幕，转身侧听画外低频。", "经验对抗系统", "低调屏幕侧光", "深蓝基地指挥中心", "低频监测脉冲"],
  ["10s", "35mm", "克制手持", "陈牧 / 值班员", "值班员继续执行流程，陈牧手动停止自动放行。", "压力上升", "冷蓝警戒光轻微闪动", "观测控制区", "界面状态不一致"],
  ["7s", "24mm", "固定广角", "无", "巨型观测闸结构压过下方人员尺度，雨和海雾进入闸门空间。", "制度重量", "暴雨前灰色海光", "观测闸舱", "雨与海雾"],
  ["8s", "50mm", "跟随至控制台", "陈牧", "陈牧走向手动控制台，没有发布英雄式命令。", "承担责任", "硬质侧光", "观测闸手动控制台", "无"],
  ["6s", "85mm", "固定细节", "陈牧", "陈牧的手在控制器前停顿，完成选择后离开画面。", "不可逆选择", "冷金属反射光", "手动控制面板", "真实机械操作"],
  ["12s", "24mm", "缓慢建筑后拉", "陈牧", "巨大观测闸缓慢关闭，门外最后一条海光逐渐消失。", "选择代价", "蓝色警戒光对比灰色海面", "巨型观测闸", "闸门关闭尺度效果"],
  ["6s", "50mm", "固定", "AI澜系统", "AI澜在正常确认中出现0.2秒延迟，不出现人形界面。", "规则出错", "冷蓝透明界面光", "指挥系统界面层", "仅表现界面延迟"],
  ["8s", "35mm", "缓慢推进", "陈牧", "陈牧看着系统在手动关闭后仍把异常标记为正常。", "孤立", "监控蓝光与实景暗部", "深蓝基地指挥中心", "无"],
  ["7s", "24mm", "固定外景", "无", "关闭闸门外的海面失去自然波浪节奏。", "寂静", "压低的暴雨天光", "杭州湾外海线", "水体运动突然中断"],
  ["8s", "50mm", "受控摇移", "值班员", "年轻值班员在日志中发现三年前事故编号重新出现。", "过去被唤醒", "暗室屏幕光", "深蓝基地日志工作位", "事故日志短暂闪现"],
  ["9s", "35mm", "缓慢跟移", "陈牧", "陈牧要求所有人安静，却没有解释自己听见了什么。", "倾听未知", "低反差蓝灰光", "指挥甲板", "声音主导异常"],
  ["7s", "85mm", "固定特写", "无", "声呐曲线突然变成直线，像海洋停止发声。", "恐惧", "监测屏幕微光", "声呐监听台", "声呐静默"],
  ["8s", "24mm", "垂直缓慢读取", "无", "基地深处只露出赤霆01局部，机体停在冷蓝待机光中。", "潜伏力量", "蓝色维护工作光", "机甲维护井", "只展示机甲局部"],
  ["6s", "50mm", "缓慢推进", "无", "赤霆01背部装甲与驾驶舱缝隙接住蓝色警戒光。", "后果临近", "冷蓝警戒光", "赤霆01背部驾驶舱区", "禁止完整展示机甲"],
  ["10s", "24mm", "结尾固定远景", "无", "在人类关闭的闸门之外，海纹仍朝基地移动，像某个生命正在靠近。", "未知", "暴雨蓝灰天光", "杭州湾海防墙外", "极轻微生命式海纹运动"]
] as const;

export function getEP01Shots(): EP01ShotProductionData[] {
  return Array.from({ length: 18 }, (_, index) => {
    const shot = storyboardShots[index];
    const [, lens, movement, character, action, emotion, lighting, environment, vfx] = enrichment[index];
    return {
      shot_id: `EP01_SHOT_${String(index + 1).padStart(2, "0")}`,
      sourceShotId: shot?.id ?? `EP01-SHOT-${String(index + 1).padStart(3, "0")}`,
      duration: "15s",
      description: shot?.storyFunction || action,
      camera: shot?.camera || "cinematic production camera",
      lens,
      movement,
      character: character === "None" ? "无" : character,
      character_action: action,
      emotion,
      lighting,
      environment,
      vfx,
      sound: shot?.sound || "深海低频与远处金属共振"
    };
  });
}
