export type AudioPlan = {
  voice: string;
  sfx: string[];
  bgm: string;
};

export function planAudio(shotDescription: string): AudioPlan {
  return {
    voice: /对白|voice|speaker/i.test(shotDescription) ? "reserved for script dialogue" : "none",
    sfx: ["Ocean Storm", "Low Frequency Drone", "Mechanical Noise"].filter((item) => /海|storm|机械|低频|防线/i.test(shotDescription) || item === "Low Frequency Drone"),
    bgm: "no music unless emotional transition requires restrained low brass / analog drone"
  };
}
