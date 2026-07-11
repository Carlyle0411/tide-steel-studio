export type ToastItem = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export function ToastViewport({ items, dismiss }: { items: ToastItem[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed right-4 top-4 z-[80] grid w-[min(360px,calc(100vw-32px))] gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => dismiss(item.id)}
          className={`rounded-md border px-4 py-3 text-left text-sm shadow-soft ${
            item.type === "success"
              ? "border-jade/50 bg-jade/15 text-jade"
              : item.type === "error"
                ? "border-red-400/50 bg-red-500/15 text-red-200"
                : "border-line bg-panel text-mist"
          }`}
        >
          {item.message}
        </button>
      ))}
    </div>
  );
}
