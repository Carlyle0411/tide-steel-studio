export type SubtitleEntry = {
  start: string;
  end: string;
  text: string;
  speaker?: string;
};

export function generateSRT(entries: SubtitleEntry[]) {
  return entries.map((entry, index) => [
    index + 1,
    `${entry.start} --> ${entry.end}`,
    entry.speaker ? `${entry.speaker}: ${entry.text}` : entry.text,
    ""
  ].join("\n")).join("\n");
}

export function generateEpisodeSubtitleStub() {
  return generateSRT([
    { start: "00:00:00,000", end: "00:00:04,000", text: "海面低频开始。", speaker: "SYSTEM" }
  ]);
}
