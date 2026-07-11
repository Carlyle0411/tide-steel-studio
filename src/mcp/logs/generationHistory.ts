export type GenerationHistoryItem = {
  id: string;
  taskId: string;
  model: string;
  prompt: string;
  inputReference: string[];
  outputAsset?: string;
  at: string;
  status: "pending" | "running" | "completed" | "failed" | "needs_key";
  error?: string;
};

type Listener = () => void;
const storageKey = "tide-generation-history-v1";

class GenerationHistory {
  private listeners = new Set<Listener>();

  add(item: Omit<GenerationHistoryItem, "id" | "at">) {
    const next: GenerationHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      at: new Date().toISOString()
    };
    const items = this.list();
    localStorage.setItem(storageKey, JSON.stringify([next, ...items].slice(0, 500)));
    this.emit();
    return next;
  }

  list(): GenerationHistoryItem[] {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as GenerationHistoryItem[];
    } catch {
      return [];
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const generationHistory = new GenerationHistory();
