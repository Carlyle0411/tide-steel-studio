import { useCallback, useState } from "react";
import { ToastItem } from "../components/Toast";

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = crypto.randomUUID();
    setItems((prev) => [{ id, message, type }, ...prev].slice(0, 5));
    window.setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  return {
    items,
    dismiss,
    success: (message: string) => push(message, "success"),
    error: (message: string) => push(message, "error"),
    info: (message: string) => push(message, "info")
  };
}
