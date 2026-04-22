// ============================================================
// graph-matrix.ts — Core BFS Algorithm on a 2D Grid (Matrix)
// ============================================================
//
// 📚 CONCEPT: A 2D grid IS a graph.
//
//   Each cell (row, col) = a NODE
//   Each cell's neighbors (up, down, left, right) = EDGES
//
//   Grid (what you see):          Graph (what BFS sees):
//   ┌───┬───┬───┐
//   │0,0│0,1│0,2│                 (0,0)──(0,1)──(0,2)
//   ├───┼───┼───┤                   │      │      │
//   │1,0│1,1│1,2│                 (1,0)──(1,1)──(1,2)
//   ├───┼───┼───┤                   │      │      │
//   │2,0│2,1│2,2│                 (2,0)──(2,1)──(2,2)
//   └───┴───┴───┘
//
//   Wall cells = removed nodes (BFS skips them)
// ============================================================

// ----- Types -----

export type CellType = "empty" | "wall" | "start" | "end";

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  isVisited: boolean;
  /** Used to reconstruct the shortest path — points to the cell we came from */
  previousNode: Cell | null;
  /** Distance from start (BFS guarantees shortest in unweighted graph) */
  distance: number;
}

// ----- Grid Factory -----

/**
 * Creates a ROWS x COLS grid of Cell objects.
 * Think of this as building the "adjacency" structure implicitly —
 * neighbors are determined by (row ± 1, col ± 1) at traversal time.
 */
export function createGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        type: "empty",
        isVisited: false,
        previousNode: null,
        distance: Infinity,
      });
    }
    grid.push(row);
  }

  return grid;
}

// ----- Neighbor Discovery -----

/**
 * For a given cell, return its valid, unvisited, non-wall neighbors.
 *
 * 📚 This is the "adjacency list" equivalent for a grid-graph.
 *     Instead of storing edges explicitly, we compute them on-the-fly
 *     using the 4-directional offsets: UP, DOWN, LEFT, RIGHT.
 */
const DIRECTIONS = [
  [-1, 0], // UP
  [1, 0],  // DOWN
  [0, -1], // LEFT
  [0, 1],  // RIGHT
] as const;

export function getUnvisitedNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
  const neighbors: Cell[] = [];
  const rows = grid.length;
  const cols = grid[0].length;

  for (const [dr, dc] of DIRECTIONS) {
    const newRow = cell.row + dr;
    const newCol = cell.col + dc;

    // Bounds check — don't walk off the grid
    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) continue;

    const neighbor = grid[newRow][newCol];

    // Skip walls and already-visited cells
    if (neighbor.type === "wall" || neighbor.isVisited) continue;

    neighbors.push(neighbor);
  }

  return neighbors;
}

// ----- BFS Algorithm -----

/**
 * Breadth-First Search on a 2D grid.
 *
 * 📚 WHY BFS?
 *   BFS explores nodes LEVEL-BY-LEVEL (like ripples in water).
 *   In an unweighted graph, the first time BFS reaches a node,
 *   that IS the shortest path. Guaranteed.
 *
 * 📚 HOW IT WORKS:
 *   1. Start with the "start" cell in a queue
 *   2. Dequeue a cell, mark it visited
 *   3. For each unvisited neighbor:
 *      - Set its `previousNode` to current cell (for path reconstruction)
 *      - Set its `distance` = current distance + 1
 *      - Enqueue it
 *   4. If we dequeue the "end" cell → path found!
 *   5. If queue is empty → no path exists.
 *
 * @returns Array of cells in the ORDER they were visited (for animation)
 */
export function bfs(
  grid: Cell[][],
  startCell: Cell,
  endCell: Cell
): { visitedInOrder: Cell[]; pathFound: boolean } {
  const visitedInOrder: Cell[] = [];

  // Reset state
  startCell.isVisited = true;
  startCell.distance = 0;

  // 📚 The QUEUE is what makes BFS "breadth-first".
  //    FIFO = First In, First Out = explore nearest cells first.
  //    (If you used a STACK instead, you'd get DFS — depth-first.)
  const queue: Cell[] = [startCell];

  while (queue.length > 0) {
    // Dequeue the FIRST element (FIFO)
    const current = queue.shift()!;

    // Record this cell as visited (we'll animate this later)
    visitedInOrder.push(current);

    // 🎯 Did we reach the end?
    if (current.row === endCell.row && current.col === endCell.col) {
      return { visitedInOrder, pathFound: true };
    }

    // Get all valid neighbors (up/down/left/right, not walls, not visited)
    const neighbors = getUnvisitedNeighbors(current, grid);

    for (const neighbor of neighbors) {
      // Mark visited BEFORE enqueuing to prevent duplicates
      neighbor.isVisited = true;
      neighbor.distance = current.distance + 1;
      neighbor.previousNode = current;
      queue.push(neighbor);
    }
  }

  // Queue empty, end never reached — no path exists
  return { visitedInOrder, pathFound: false };
}

// ----- Path Reconstruction -----

/**
 * Walk backwards from end → start using the `previousNode` pointers
 * to reconstruct the shortest path.
 *
 * 📚 This is like following breadcrumbs back home.
 *    Each cell remembers who "discovered" it first (its previousNode).
 *    Since BFS guarantees shortest path, this chain IS the shortest route.
 */
export function reconstructPath(endCell: Cell): Cell[] {
  const path: Cell[] = [];
  let current: Cell | null = endCell;

  while (current !== null) {
    path.unshift(current); // prepend to get start → end order
    current = current.previousNode;
  }

  return path;
}

// ----- Reset Helpers -----

/** Deep-clone the grid and reset all traversal state (visited, previous, distance) */
export function resetGridState(grid: Cell[][]): Cell[][] {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isVisited: false,
      previousNode: null,
      distance: Infinity,
    }))
  );
}
