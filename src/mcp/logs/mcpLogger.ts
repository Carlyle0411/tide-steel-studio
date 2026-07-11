export type MCPLogEntry = {
  id: string;
  at: string;
  level: "info" | "warn" | "error";
  scope: "tool" | "workflow" | "queue" | "review" | "asset" | "adapter";
  message: string;
  taskId?: string;
  toolId?: string;
  assetId?: string;
  version?: string;
  input?: unknown;
  output?: unknown;
  reason?: string;
};

type Listener = () => void;

class MCPLogger {
  private entries: MCPLogEntry[] = [];
  private listeners = new Set<Listener>();

  log(entry: Omit<MCPLogEntry, "id" | "at">) {
    const next: MCPLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      at: new Date().toISOString()
    };
    this.entries.unshift(next);
    this.entries = this.entries.slice(0, 500);
    this.emit();
    return next;
  }

  info(entry: Omit<MCPLogEntry, "id" | "at" | "level">) {
    return this.log({ ...entry, level: "info" });
  }

  warn(entry: Omit<MCPLogEntry, "id" | "at" | "level">) {
    return this.log({ ...entry, level: "warn" });
  }

  error(entry: Omit<MCPLogEntry, "id" | "at" | "level">) {
    return this.log({ ...entry, level: "error" });
  }

  list() {
    return [...this.entries];
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const mcpLogger = new MCPLogger();
