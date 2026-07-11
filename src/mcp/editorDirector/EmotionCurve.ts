export type EmotionPoint = {
  timestamp: string;
  emotion: "mysterious" | "fear" | "pressure" | "choice" | "hope" | "dread";
  intensity: number;
  description: string;
};

export function generateEmotionCurve(episodeId: string): EmotionPoint[] {
  return [
    { timestamp: "00:00", emotion: "mysterious", intensity: 30, description: `${episodeId} opens with order intact, but the sea behaves incorrectly.` },
    { timestamp: "00:45", emotion: "pressure", intensity: 45, description: "Small physical evidence makes the system feel less reliable." },
    { timestamp: "01:20", emotion: "fear", intensity: 80, description: "Human experience recognizes danger before the machine names it." },
    { timestamp: "02:30", emotion: "choice", intensity: 70, description: "Chen Mu accepts responsibility before certainty arrives." },
    { timestamp: "03:25", emotion: "dread", intensity: 78, description: "The closed gate turns protection into moral weight." },
    { timestamp: "03:55", emotion: "mysterious", intensity: 55, description: "The audience leaves with a question, not an answer." }
  ];
}
