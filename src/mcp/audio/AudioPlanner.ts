export type EpisodeAudioPlan = {
  voice: string[];
  sfx: string[];
  bgm: string[];
};

export function planEpisodeAudio(episodeId: string): EpisodeAudioPlan {
  return {
    voice: episodeId === "EP01" ? ["minimal command-room voice, no exposition"] : [],
    sfx: ["Ocean Storm", "Low Frequency Drone", "Mechanical Noise", "Distant Metal Resonance"],
    bgm: ["silence first", "restrained low brass only after irreversible choice"]
  };
}
