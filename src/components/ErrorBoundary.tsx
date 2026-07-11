import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  error?: Error;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Workbench crashed:", error, info);
  }

  exportBackup() {
    const payload = {
      exportedAt: new Date().toISOString(),
      localStorage: { ...localStorage },
      note: "错误恢复导出：包含 localStorage 轻量数据。IndexedDB 素材请进入安全模式导出完整备份。"
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-video-workbench-error-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink p-6 text-mist">
        <section className="w-full max-w-2xl rounded-md border border-line bg-panel p-6 shadow-soft">
          <p className="text-sm text-jade">页面发生错误，但数据仍在本地</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">工作台已进入恢复页</h1>
          <pre className="mt-4 max-h-40 overflow-auto rounded border border-line bg-ink/60 p-3 text-xs text-slate-300">
            {this.state.error.message}
          </pre>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => location.reload()}>重新加载</button>
            <button className="btn" onClick={() => { location.href = "/?safe=1"; }}>进入安全模式</button>
            <button className="btn" onClick={() => { location.href = "/?safe=1&repair=1"; }}>清理损坏素材数据</button>
            <button className="btn btn-gold" onClick={() => this.exportBackup()}>导出本地项目备份</button>
          </div>
        </section>
      </main>
    );
  }
}
