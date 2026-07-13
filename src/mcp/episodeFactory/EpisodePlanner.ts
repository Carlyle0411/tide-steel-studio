import { storyboardShots, productionDocs } from "../../pages/production/data/productionData";

export type EpisodePlanShot = {
  episodeId: string;
  shotId: string;
  sourceShotId: string;
  number: string;
  storyFunction: string;
  camera: string;
  promptStatus: "pending" | "generated";
};

export type EpisodePlan = {
  episodeId: string;
  title: string;
  storySource: string;
  totalShots: number;
  shots: EpisodePlanShot[];
};

export class EpisodePlanner {
  createPlan(episodeId: string): EpisodePlan {
    const shots = storyboardShots.map((shot) => ({
      episodeId,
      shotId: `${episodeId}_SHOT_${shot.number}`,
      sourceShotId: shot.id,
      number: shot.number,
      storyFunction: shot.storyFunction,
      camera: shot.camera,
      promptStatus: "pending" as const
    }));
    return {
      episodeId,
      title: episodeId === "EP01" ? "赤霆纪元 第一集" : "潮汐钢魂三部曲分集",
      storySource: productionDocs.episodeBibleMd,
      totalShots: shots.length,
      shots
    };
  }
}

export const episodePlanner = new EpisodePlanner();
