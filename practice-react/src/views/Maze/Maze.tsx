import { memo, useEffect, useRef } from "react";
import { useMaze, type LogEntry, type Speed } from "./useMaze";
import type { Cell } from "./graph-matrix";

// ============================================================
//  Maze BFS Visualizer
// ============================================================

export default function Maze() {
  const {
    grid,
    isRunning,
    isFinished,
    speed,
    setSpeed,
    paintMode,
    setPaintMode,
    logs,
    stats,
    runBFS,
    resetGrid,
    clearWalls,
    generateRandomWalls,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
  } = useMaze();

  return (
    <div
      className="maze-container"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Title */}
      <header className="maze-header">
        <h1 className="maze-title">
          <span className="maze-title-icon">🧭</span>
          BFS Pathfinder
        </h1>
        <p className="maze-subtitle">
          Visualize Breadth-First Search on a grid graph
        </p>
      </header>

      {/* Toolbar */}
      <div className="maze-toolbar">
        {/* Paint mode selector */}
        <div className="toolbar-group">
          <span className="toolbar-label">Paint</span>
          <div className="btn-group">
            {(["wall", "start", "end"] as const).map((mode) => (
              <button
                key={mode}
                className={`btn btn-paint ${paintMode === mode ? "btn-active" : ""} btn-${mode}`}
                onClick={() => setPaintMode(mode)}
                disabled={isRunning}
              >
                {mode === "wall" && "🧱 Wall"}
                {mode === "start" && "🟢 Start"}
                {mode === "end" && "🔴 End"}
              </button>
            ))}
          </div>
        </div>

        {/* Speed selector */}
        <div className="toolbar-group">
          <span className="toolbar-label">Speed</span>
          <div className="btn-group">
            {(["slow", "normal", "fast"] as const).map((s) => (
              <button
                key={s}
                className={`btn btn-speed ${speed === s ? "btn-active" : ""}`}
                onClick={() => setSpeed(s as Speed)}
                disabled={isRunning}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="toolbar-group">
          <span className="toolbar-label">Actions</span>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={runBFS} disabled={isRunning}>
              ▶ Run BFS
            </button>
            <button className="btn btn-secondary" onClick={generateRandomWalls} disabled={isRunning}>
              🎲 Random
            </button>
            <button className="btn btn-secondary" onClick={clearWalls} disabled={isRunning}>
              🧹 Clear Walls
            </button>
            <button className="btn btn-danger" onClick={resetGrid}>
              ↺ Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {isFinished && (
        <div className="maze-stats">
          <div className="stat">
            <span className="stat-value">{stats.visited}</span>
            <span className="stat-label">Cells Visited</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.pathLength || "∅"}</span>
            <span className="stat-label">Path Length</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.time.toFixed(2)}ms</span>
            <span className="stat-label">Algorithm Time</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="maze-legend">
        <LegendItem className="legend-start" label="Start" />
        <LegendItem className="legend-end" label="End" />
        <LegendItem className="legend-wall" label="Wall" />
        <LegendItem className="legend-visited" label="Visited" />
        <LegendItem className="legend-path" label="Shortest Path" />
      </div>

      {/* Grid */}
      <div
        className="maze-grid"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length ?? 50}, 1fr)`,
        }}
      >
        {grid.map((row) =>
          row.map((cell) => (
            <GridCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
            />
          ))
        )}
      </div>

      {/* Log Console */}
      <LogConsole logs={logs} />

      {/* CSS */}
      <MazeStyles />
    </div>
  );
}

// ============================================================
//  Grid Cell (memoized for performance on 25x50 = 1250 cells)
// ============================================================

interface GridCellProps {
  cell: Cell & { isPath?: boolean };
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
}

const GridCell = memo(function GridCell({ cell, onMouseDown, onMouseEnter }: GridCellProps) {
  let className = "cell";

  if (cell.type === "start") className += " cell-start";
  else if (cell.type === "end") className += " cell-end";
  else if (cell.type === "wall") className += " cell-wall";
  else if (cell.isPath) className += " cell-path";
  else if (cell.isVisited) className += " cell-visited";

  return (
    <div
      className={className}
      onMouseDown={() => onMouseDown(cell.row, cell.col)}
      onMouseEnter={() => onMouseEnter(cell.row, cell.col)}
    />
  );
});

// ============================================================
//  Legend Item
// ============================================================

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <div className="legend-item">
      <div className={`legend-swatch ${className}`} />
      <span>{label}</span>
    </div>
  );
}

// ============================================================
//  Log Console
// ============================================================

function LogConsole({ logs }: { logs: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const typeColor: Record<LogEntry["type"], string> = {
    info: "#93c5fd",
    success: "#6ee7b7",
    error: "#fca5a5",
    step: "#d8b4fe",
  };

  return (
    <div className="log-console">
      <div className="log-header">📋 Execution Log</div>
      <div className="log-body">
        {logs.length === 0 && (
          <div className="log-empty">Draw walls, then click "Run BFS" to begin...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="log-entry" style={{ color: typeColor[log.type] }}>
            <span className="log-time">
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

// ============================================================
//  All Styles (scoped via .maze-container)
// ============================================================

function MazeStyles() {
  return (
    <style>{`
      /* ----- Layout ----- */
      .maze-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px 16px 40px;
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #e2e8f0;
        user-select: none;
      }

      /* ----- Header ----- */
      .maze-header {
        text-align: center;
        margin-bottom: 20px;
      }
      .maze-title {
        font-size: 2rem;
        font-weight: 800;
        margin: 0 0 4px;
        background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .maze-title-icon {
        -webkit-text-fill-color: initial;
        margin-right: 8px;
      }
      .maze-subtitle {
        margin: 0;
        font-size: 0.9rem;
        color: #94a3b8;
      }

      /* ----- Toolbar ----- */
      .maze-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: flex-end;
        justify-content: center;
        margin-bottom: 16px;
        padding: 16px;
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.12);
      }
      .toolbar-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .toolbar-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        font-weight: 600;
      }
      .btn-group {
        display: flex;
        gap: 6px;
      }

      /* ----- Buttons ----- */
      .btn {
        padding: 7px 14px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px;
        background: rgba(51, 65, 85, 0.6);
        color: #cbd5e1;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .btn:hover:not(:disabled) {
        background: rgba(71, 85, 105, 0.8);
        transform: translateY(-1px);
      }
      .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .btn-active {
        border-color: #60a5fa;
        background: rgba(96, 165, 250, 0.2);
        color: #93c5fd;
        box-shadow: 0 0 12px rgba(96, 165, 250, 0.15);
      }
      .btn-primary {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: #fff;
        border-color: transparent;
      }
      .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
      }
      .btn-danger {
        color: #fca5a5;
        border-color: rgba(252, 165, 165, 0.2);
      }
      .btn-danger:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.2);
      }

      /* ----- Stats ----- */
      .maze-stats {
        display: flex;
        justify-content: center;
        gap: 32px;
        margin-bottom: 14px;
        animation: fadeInUp 0.4s ease;
      }
      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .stat-value {
        font-size: 1.6rem;
        font-weight: 800;
        background: linear-gradient(135deg, #60a5fa, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .stat-label {
        font-size: 0.7rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      /* ----- Legend ----- */
      .maze-legend {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        color: #94a3b8;
      }
      .legend-swatch {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 1px solid rgba(148, 163, 184, 0.15);
      }
      .legend-start { background: #22c55e; }
      .legend-end { background: #ef4444; }
      .legend-wall { background: #1e293b; border-color: #475569; }
      .legend-visited { background: rgba(99, 102, 241, 0.5); }
      .legend-path { background: #facc15; }

      /* ----- Grid ----- */
      .maze-grid {
        display: grid;
        gap: 1px;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.12);
        margin-bottom: 16px;
      }

      /* ----- Cells ----- */
      .cell {
        aspect-ratio: 1;
        background: rgba(51, 65, 85, 0.35);
        transition: background 0.1s ease;
        cursor: pointer;
        min-width: 0;
      }
      .cell:hover {
        background: rgba(148, 163, 184, 0.2);
      }
      .cell-start {
        background: #22c55e;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
      }
      .cell-end {
        background: #ef4444;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
      }
      .cell-wall {
        background: #1e293b;
        border: 1px solid #334155;
        animation: wallPop 0.15s ease;
      }
      .cell-visited {
        background: rgba(99, 102, 241, 0.45);
        animation: visitPulse 0.3s ease;
      }
      .cell-path {
        background: #facc15 !important;
        border-radius: 3px;
        animation: pathGlow 0.3s ease;
        box-shadow: 0 0 6px rgba(250, 204, 21, 0.5);
      }

      /* ----- Animations ----- */
      @keyframes wallPop {
        0% { transform: scale(0.5); }
        100% { transform: scale(1); }
      }
      @keyframes visitPulse {
        0% { transform: scale(0.3); background: rgba(167, 139, 250, 0.7); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); background: rgba(99, 102, 241, 0.45); }
      }
      @keyframes pathGlow {
        0% { transform: scale(0.5); background: #fef08a; }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); background: #facc15; }
      }
      @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(8px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      /* ----- Log Console ----- */
      .log-console {
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        overflow: hidden;
      }
      .log-header {
        padding: 10px 16px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #94a3b8;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        background: rgba(30, 41, 59, 0.5);
      }
      .log-body {
        padding: 12px 16px;
        max-height: 160px;
        overflow-y: auto;
        font-family: 'Fira Code', 'Cascadia Code', monospace;
        font-size: 0.78rem;
        line-height: 1.7;
      }
      .log-empty {
        color: #475569;
        font-style: italic;
      }
      .log-entry {
        display: flex;
        gap: 10px;
      }
      .log-time {
        color: #475569;
        flex-shrink: 0;
      }

      /* scrollbar */
      .log-body::-webkit-scrollbar { width: 6px; }
      .log-body::-webkit-scrollbar-track { background: transparent; }
      .log-body::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    `}</style>
  );
}
