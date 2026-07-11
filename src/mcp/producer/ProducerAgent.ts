import { storyboardShots } from "../../pages/production/data/productionData";

export type ProductionRecommendation = {
  shotId: string;
  priority: "high" | "medium" | "low";
  risk: "character_consistency" | "reference_missing" | "creature_reveal" | "technical" | "low";
  recommendation: string;
};

export class ProducerAgent {
  analyzeEpisode(episodeId: string): ProductionRecommendation[] {
    return storyboardShots.map((shot) => {
      const text = `${shot.storyFunction} ${shot.frame} ${shot.camera}`;
      if (/陈牧|人物|face|角色/.test(text)) {
        return {
          shotId: `${episodeId}_SHOT_${shot.number}`,
          priority: "high",
          risk: "character_consistency",
          recommendation: "角色一致性风险：生成前确认人物Reference和服装锁。"
        } satisfies ProductionRecommendation;
      }
      if (/白潮|潮兽|creature/.test(text)) {
        return {
          shotId: `${episodeId}_SHOT_${shot.number}`,
          priority: "high",
          risk: "creature_reveal",
          recommendation: "生物展示风险：确认白潮当前展示阶段，不允许过早完整出现。"
        };
      }
      if (/赤霆|机甲|mecha/.test(text)) {
        return {
          shotId: `${episodeId}_SHOT_${shot.number}`,
          priority: "medium",
          risk: "technical",
          recommendation: "机甲结构风险：锁定赤霆局部Reference，EP01不展示完整机甲。"
        };
      }
      return {
        shotId: `${episodeId}_SHOT_${shot.number}`,
        priority: "low",
        risk: "low",
        recommendation: "可优先生成环境或物理异常类镜头。"
      };
    });
  }
}

export const producerAgent = new ProducerAgent();
