import { useEffect, useRef } from "react";
import {
  useMonotonicDeque,
  type LogEntry,
  type Phase,
  type Speed,
} from "./useMonotonicDeque";
import "./MonotonicDeque.css";

const PHASE_COLORS: Record<Phase, string> = {
  expire: "#f87171",
  clean: "#fb923c",
  enter: "#34d399",
  harvest: "#a78bfa",
  idle: "#64748b",
};

const PHASE_LABELS: Record<Phase, string> = {
  expire: "💀 EXPIRE",
  clean: "🧹 CLEAN",
  enter: "📥 ENTER",
  harvest: "🎯 HARVEST",
  idle: "⏸ IDLE",
};

const PRESETS = [
  { label: "Default", arr: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
  { label: "Descending", arr: [5, 4, 3, 2, 1], k: 3 },
  { label: "Ascending", arr: [1, 2, 3, 4, 5], k: 3 },
  { label: "All Same", arr: [3, 3, 3, 3, 3], k: 2 },
  { label: "Large Window", arr: [2, 1, 5, 3, 6, 4, 8, 7], k: 4 },
];

export default function MonotonicDeque() {
  const {
    arr,
    k,
    speed,
    setSpeed,
    currentStep,
    currentStepIndex,
    totalSteps,
    isPlaying,
    isFinished,
    logs,
    play,
    pause,
    stepForward,
    reset,
    updateArray,
    updateK,
  } = useMonotonicDeque();

  const phase = currentStep?.phase ?? "idle";

  return (
    <div className="md-container">
      <header className="md-header">
        <h1 className="md-title">
          <span className="md-title-icon">📊</span>
          Monotonic Deque Visualizer
        </h1>
        <p className="md-subtitle">
          Sliding Window Maximum — Step through the 4-phase lifecycle
        </p>
      </header>

      {/* Presets */}
      <div className="md-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`md-btn md-btn-preset ${arr.join(",") === p.arr.join(",") && k === p.k ? "md-btn-active" : ""}`}
            onClick={() => {
              updateArray(p.arr);
              updateK(p.k);
            }}
            disabled={isPlaying}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="md-toolbar">
        <div className="md-toolbar-group">
          <span className="md-toolbar-label">Speed</span>
          <div className="md-btn-group">
            {(["slow", "normal", "fast"] as const).map((s) => (
              <button
                key={s}
                className={`md-btn ${speed === s ? "md-btn-active" : ""}`}
                onClick={() => setSpeed(s as Speed)}
                disabled={isPlaying}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="md-toolbar-group">
          <span className="md-toolbar-label">Controls</span>
          <div className="md-btn-group">
            {!isPlaying ? (
              <button
                className="md-btn md-btn-primary"
                onClick={play}
                disabled={isFinished}
              >
                ▶ {totalSteps > 0 ? "Resume" : "Play"}
              </button>
            ) : (
              <button className="md-btn md-btn-warning" onClick={pause}>
                ⏸ Pause
              </button>
            )}
            <button
              className="md-btn"
              onClick={stepForward}
              disabled={isPlaying || isFinished}
            >
              ⏭ Step
            </button>
            <button className="md-btn md-btn-danger" onClick={reset}>
              ↺ Reset
            </button>
          </div>
        </div>
        <div className="md-toolbar-group">
          <span className="md-toolbar-label">Progress</span>
          <span className="md-progress-text">
            {currentStepIndex + 1} / {totalSteps || "—"}
          </span>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="md-phase-bar">
        {(["expire", "clean", "enter", "harvest"] as Phase[]).map((p) => (
          <div
            key={p}
            className={`md-phase-chip ${phase === p ? "md-phase-active" : ""}`}
            style={{
              borderColor: phase === p ? PHASE_COLORS[p] : "transparent",
              background: phase === p ? `${PHASE_COLORS[p]}22` : undefined,
            }}
          >
            {PHASE_LABELS[p]}
          </div>
        ))}
      </div>

      {/* Description */}
      {currentStep && (
        <div
          className="md-description"
          style={{ borderLeftColor: PHASE_COLORS[phase] }}
        >
          <strong style={{ color: PHASE_COLORS[phase] }}>
            [i={currentStep.i}]
          </strong>{" "}
          {currentStep.description}
        </div>
      )}

      {/* Main Visualization */}
      <div className="md-vis-grid">
        {/* Array Row */}
        <div className="md-section">
          <h3 className="md-section-title">Input Array</h3>
          <div className="md-array-row">
            {arr.map((val, idx) => {
              let cls = "md-cell";
              if (currentStep) {
                if (
                  idx >= currentStep.windowLeft &&
                  idx <= currentStep.windowRight
                )
                  cls += " md-cell-window";
                if (idx === currentStep.i) cls += " md-cell-current";
                if (currentStep.deque.includes(idx)) cls += " md-cell-in-deque";
              }
              return (
                <div key={idx} className={cls}>
                  <span className="md-cell-index">i={idx}</span>
                  <span className="md-cell-value">{val}</span>
                </div>
              );
            })}
          </div>
          {/* Window bracket */}
          {currentStep && (
            <div className="md-window-label">
              Window: [{currentStep.windowLeft}, {currentStep.windowRight}]
              {currentStep.i < k - 1 && (
                <span className="md-window-partial"> (filling...)</span>
              )}
            </div>
          )}
        </div>

        {/* Deque */}
        <div className="md-section">
          <h3 className="md-section-title">
            Monotonic Deque
            <span className="md-section-hint">
              (stores indices, values always decreasing ↘)
            </span>
          </h3>
          <div className="md-deque-container">
            <span className="md-deque-label">Front (max)</span>
            <div className="md-deque-body">
              {currentStep && currentStep.deque.length > 0 ? (
                currentStep.deque.map((idx, pos) => (
                  <div
                    key={`${idx}-${pos}`}
                    className={`md-deque-item ${idx === currentStep.affectedDequeIndex ? `md-deque-${currentStep.action}` : ""}`}
                  >
                    <span className="md-deque-idx">idx {idx}</span>
                    <span className="md-deque-val">{arr[idx]}</span>
                  </div>
                ))
              ) : (
                <div className="md-deque-empty">empty</div>
              )}
            </div>
            <span className="md-deque-label">Back (min)</span>
          </div>
        </div>

        {/* Result */}
        <div className="md-section">
          <h3 className="md-section-title">Result</h3>
          <div className="md-result-row">
            {currentStep && currentStep.result.length > 0 ? (
              currentStep.result.map((val, idx) => (
                <div
                  key={idx}
                  className={`md-result-item ${idx === currentStep.result.length - 1 && phase === "harvest" ? "md-result-new" : ""}`}
                >
                  {val}
                </div>
              ))
            ) : (
              <span className="md-result-empty">
                Waiting for first full window...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Log Console */}
      <LogConsole logs={logs} />
    </div>
  );
}

function LogConsole({ logs }: { logs: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const typeColor: Record<LogEntry["type"], string> = {
    info: "#93c5fd",
    step: "#d8b4fe",
    success: "#6ee7b7",
    warning: "#fcd34d",
  };

  return (
    <div className="md-log h-[500px]">
      <div className="md-log-header">📋 Execution Log</div>
      <div className="md-log-body">
        {logs.length === 0 && (
          <div className="md-log-empty">Click "Play" or "Step" to begin...</div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className="md-log-entry"
            style={{ color: typeColor[log.type] }}
          >
            <span className="md-log-time">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {log.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
