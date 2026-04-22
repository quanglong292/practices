import { useState, useCallback, useRef } from "react";
import {
  createGrid,
  resetGridState,
  bfs,
  reconstructPath,
  type Cell,
  type CellType,
} from "./graph-matrix";

// ----- Constants -----
const ROWS = 25;
const COLS = 50;
const DEFAULT_START: [number, number] = [12, 5];
const DEFAULT_END: [number, number] = [12, 44];

// Animation speeds (ms per cell)
const SPEED_MAP = {
  slow: 30,
  normal: 12,
  fast: 4,
} as const;

export type Speed = keyof typeof SPEED_MAP;

export interface LogEntry {
  timestamp: number;
  message: string;
  type: "info" | "success" | "error" | "step";
}

// ----- Hook -----

export function useMaze() {
  // Initialize grid with start & end placed
  const buildInitialGrid = useCallback((): Cell[][] => {
    const grid = createGrid(ROWS, COLS);
    grid[DEFAULT_START[0]][DEFAULT_START[1]].type = "start";
    grid[DEFAULT_END[0]][DEFAULT_END[1]].type = "end";
    return grid;
  }, []);

  const [grid, setGrid] = useState<Cell[][]>(buildInitialGrid);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 });

  // Track which "mode" the user is painting in
  const [paintMode, setPaintMode] = useState<CellType>("wall");
  const isPaintingRef = useRef(false);

  // For cancelling animations
  const timeoutsRef = useRef<number[]>([]);

  // ----- Logging -----

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      { timestamp: Date.now(), message, type },
    ]);
  }, []);

  // ----- Grid Manipulation -----

  const toggleCell = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;

      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
        const cell = newGrid[row][col];

        // Don't overwrite start/end in wall mode
        if (paintMode === "wall") {
          if (cell.type === "start" || cell.type === "end") return prev;
          cell.type = cell.type === "wall" ? "empty" : "wall";
        } else if (paintMode === "start") {
          // Move start: clear old, set new
          if (cell.type === "end") return prev;
          for (const r of newGrid) for (const c of r) if (c.type === "start") c.type = "empty";
          cell.type = "start";
        } else if (paintMode === "end") {
          if (cell.type === "start") return prev;
          for (const r of newGrid) for (const c of r) if (c.type === "end") c.type = "empty";
          cell.type = "end";
        }

        return newGrid;
      });
    },
    [isRunning, paintMode]
  );

  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      isPaintingRef.current = true;
      toggleCell(row, col);
    },
    [toggleCell]
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isPaintingRef.current && paintMode === "wall") {
        toggleCell(row, col);
      }
    },
    [toggleCell, paintMode]
  );

  const handleMouseUp = useCallback(() => {
    isPaintingRef.current = false;
  }, []);

  // ----- Generate Random Maze -----

  const generateRandomWalls = useCallback(() => {
    if (isRunning) return;
    setIsFinished(false);

    setGrid((prev) => {
      const newGrid = createGrid(ROWS, COLS);

      // Preserve start/end positions
      let startR = DEFAULT_START[0], startC = DEFAULT_START[1];
      let endR = DEFAULT_END[0], endC = DEFAULT_END[1];
      for (const r of prev) {
        for (const c of r) {
          if (c.type === "start") { startR = c.row; startC = c.col; }
          if (c.type === "end") { endR = c.row; endC = c.col; }
        }
      }

      newGrid[startR][startC].type = "start";
      newGrid[endR][endC].type = "end";

      // ~30% walls
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newGrid[r][c].type !== "empty") continue;
          if (Math.random() < 0.3) {
            newGrid[r][c].type = "wall";
          }
        }
      }

      return newGrid;
    });

    addLog("🎲 Random maze generated (30% wall density)", "info");
  }, [isRunning, addLog]);

  // ----- Run BFS -----

  const runBFS = useCallback(() => {
    if (isRunning) return;

    // Clear previous animation timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setIsFinished(false);
    setIsRunning(true);
    addLog("▶️  BFS started...", "info");

    const startTime = performance.now();

    // Reset visited state but keep walls/start/end
    const cleanGrid = resetGridState(grid);
    setGrid(cleanGrid);

    // Find start and end cells
    let startCell: Cell | null = null;
    let endCell: Cell | null = null;
    for (const row of cleanGrid) {
      for (const cell of row) {
        if (cell.type === "start") startCell = cell;
        if (cell.type === "end") endCell = cell;
      }
    }

    if (!startCell || !endCell) {
      addLog("❌ Missing start or end node!", "error");
      setIsRunning(false);
      return;
    }

    // Run BFS (instant — the algorithm itself is fast)
    const { visitedInOrder, pathFound } = bfs(cleanGrid, startCell, endCell);
    const elapsed = performance.now() - startTime;

    addLog(`🔍 BFS explored ${visitedInOrder.length} cells in ${elapsed.toFixed(2)}ms`, "step");

    // ----- Animate visited cells -----
    const delay = SPEED_MAP[speed];

    for (let i = 0; i < visitedInOrder.length; i++) {
      const tid = window.setTimeout(() => {
        const cell = visitedInOrder[i];
        setGrid((prev) => {
          const copy = prev.map((r) => r.map((c) => ({ ...c })));
          copy[cell.row][cell.col].isVisited = true;
          return copy;
        });
      }, delay * i);
      timeoutsRef.current.push(tid);
    }

    // ----- Animate shortest path after visited -----
    const pathDelay = delay * visitedInOrder.length;

    if (pathFound) {
      const path = reconstructPath(endCell);

      for (let i = 0; i < path.length; i++) {
        const tid = window.setTimeout(() => {
          const cell = path[i];
          setGrid((prev) => {
            const copy = prev.map((r) => r.map((c) => ({ ...c })));
            // Mark as "path" by adding a flag we'll check in render
            (copy[cell.row][cell.col] as Cell & { isPath?: boolean }).isPath = true;
            return copy;
          });
        }, pathDelay + 40 * i);
        timeoutsRef.current.push(tid);
      }

      const finishTid = window.setTimeout(() => {
        setIsRunning(false);
        setIsFinished(true);
        setStats({ visited: visitedInOrder.length, pathLength: path.length, time: elapsed });
        addLog(`✅ Path found! Length: ${path.length} cells`, "success");
      }, pathDelay + 40 * path.length);
      timeoutsRef.current.push(finishTid);
    } else {
      const finishTid = window.setTimeout(() => {
        setIsRunning(false);
        setIsFinished(true);
        setStats({ visited: visitedInOrder.length, pathLength: 0, time: elapsed });
        addLog("🚫 No path exists — end is unreachable!", "error");
      }, pathDelay);
      timeoutsRef.current.push(finishTid);
    }
  }, [grid, isRunning, speed, addLog]);

  // ----- Reset -----

  const resetGrid = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setGrid(buildInitialGrid());
    setIsRunning(false);
    setIsFinished(false);
    setStats({ visited: 0, pathLength: 0, time: 0 });
    setLogs([]);
    addLog("🔄 Grid reset", "info");
  }, [buildInitialGrid, addLog]);

  // ----- Clear walls only (keep start/end) -----

  const clearWalls = useCallback(() => {
    if (isRunning) return;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsFinished(false);

    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          type: cell.type === "wall" ? "empty" as CellType : cell.type,
          isVisited: false,
          previousNode: null,
          distance: Infinity,
        }))
      )
    );
    addLog("🧹 Walls cleared", "info");
  }, [isRunning, addLog]);

  return {
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
    ROWS,
    COLS,
  };
}
