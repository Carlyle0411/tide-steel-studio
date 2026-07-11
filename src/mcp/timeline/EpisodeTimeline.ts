export type TimelineNode = {
  id: string;
  shotId: string;
  order: number;
  image?: string;
  video?: string;
  audio?: string;
  subtitle?: string;
};

export class EpisodeTimeline {
  private nodes: TimelineNode[];

  constructor(nodes: TimelineNode[]) {
    this.nodes = [...nodes].sort((a, b) => a.order - b.order);
  }

  moveNode(id: string, nextOrder: number) {
    this.nodes = this.nodes.map((node) => node.id === id ? { ...node, order: nextOrder } : node).sort((a, b) => a.order - b.order);
    return this.list();
  }

  list() {
    return [...this.nodes];
  }
}

export function createEpisodeTimeline(episodeId: string, shotCount = 18) {
  return new EpisodeTimeline(Array.from({ length: shotCount }, (_, index) => ({
    id: `${episodeId}_TL_${String(index + 1).padStart(2, "0")}`,
    shotId: `${episodeId}_SHOT_${String(index + 1).padStart(3, "0")}`,
    order: index + 1
  })));
}
