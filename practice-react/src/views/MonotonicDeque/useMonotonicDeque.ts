import { useState, useCallback, useRef } from "react";

// ============================================================
//  Types
// ============================================================

export type Phase = "expire" | "clean" | "enter" | "harvest" | "idle";

export interface StepSnapshot {
  /** Current iteration index */
  i: number;
  /** Current array value */
  value: number;
  /** Deque contents (indices) AFTER this phase */
  deque: number[];
  /** Which phase just executed */
  phase: Phase;
  /** Human-readable description of what happened */
  description: string;
  /** The result array so far */
  result: number[];
  /** The window range [left, right] */
  windowLeft: number;
  windowRight: number;
  /** Which deque index was removed/added (for animation) */
  affectedDequeIndex?: number;
  /** Direction of the deque change */
  action?: "shift" | "pop" | "push" | "read" | "none";
}

export interface LogEntry {
  type: "info" | "step" | "success" | "warning";
  message: string;
  timestamp: number;
}

export type Speed = "slow" | "normal" | "fast";

const SPEED_MS: Record<Speed, number> = {
  slow: 1200,
  normal: 600,
  fast: 250,
};

// ============================================================
//  Pre-compute ALL steps for the algorithm
// ============================================================

function computeAllSteps(arr: number[], k: number): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  const deque: number[] = [];
  const result: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    const windowLeft = Math.max(0, i - k + 1);
    const windowRight = i;

    // ---- PHASE 1: EXPIRE ----
    if (deque.length && deque[0] < i - k + 1) {
      const expired = deque[0];
      deque.shift();
      steps.push({
        i,
        value: arr[i],
        deque: [...deque],
        phase: "expire",
        description: `EXPIRE: Removed index ${expired} (value ${arr[expired]}) — it's outside window [${windowLeft}, ${windowRight}]`,
        result: [...result],
        windowLeft,
        windowRight,
        affectedDequeIndex: expired,
        action: "shift",
      });
    } else {
      steps.push({
        i,
        value: arr[i],
        deque: [...deque],
        phase: "expire",
        description:
          deque.length === 0
            ? `EXPIRE: Deque is empty — nothing to expire`
            : `EXPIRE: Front index ${deque[0]} is still inside window [${windowLeft}, ${windowRight}] — keep it`,
        result: [...result],
        windowLeft,
        windowRight,
        action: "none",
      });
    }

    // ---- PHASE 2: CLEAN ----
    let cleaned = false;
    while (deque.length && arr[deque[deque.length - 1]] <= arr[i]) {
      const removed = deque[deque.length - 1];
      deque.pop();
      cleaned = true;
      steps.push({
        i,
        value: arr[i],
        deque: [...deque],
        phase: "clean",
        description: `CLEAN: Popped index ${removed} (value ${arr[removed]}) — it's ≤ incoming ${arr[i]}, so it can never be max`,
        result: [...result],
        windowLeft,
        windowRight,
        affectedDequeIndex: removed,
        action: "pop",
      });
    }
    if (!cleaned) {
      steps.push({
        i,
        value: arr[i],
        deque: [...deque],
        phase: "clean",
        description:
          deque.length === 0
            ? `CLEAN: Deque is empty — nothing to clean`
            : `CLEAN: Back value ${arr[deque[deque.length - 1]]} > incoming ${arr[i]} — keep it (maintains decreasing order)`,
        result: [...result],
        windowLeft,
        windowRight,
        action: "none",
      });
    }

    // ---- PHASE 3: ENTER ----
    deque.push(i);
    steps.push({
      i,
      value: arr[i],
      deque: [...deque],
      phase: "enter",
      description: `ENTER: Pushed index ${i} (value ${arr[i]}) to back of deque`,
      result: [...result],
      windowLeft,
      windowRight,
      affectedDequeIndex: i,
      action: "push",
    });

    // ---- PHASE 4: HARVEST ----
    if (i >= k - 1) {
      const maxVal = arr[deque[0]];
      result.push(maxVal);
      steps.push({
        i,
        value: arr[i],
        deque: [...deque],
        phase: "harvest",
        description: `HARVEST: Window full! Front of deque = index ${deque[0]}, value ${maxVal} → result = [${result.join(", ")}]`,
        result: [...result],
        windowLeft,
        windowRight,
        affectedDequeIndex: deque[0],
        action: "read",
      });
    } else {
      steps.push({
        i,
        value: arr[i],
        deque: [...deque],
        phase: "harvest",
        description: `HARVEST: Window not full yet (need ${k} elements, have ${i + 1}) — skip`,
        result: [...result],
        windowLeft,
        windowRight,
        action: "none",
      });
    }
  }

  return steps;
}

// ============================================================
//  Hook
// ============================================================

export function useMonotonicDeque() {
  const [arr, setArr] = useState<number[]>([1, 3, -1, -3, 5, 3, 6, 7]);
  const [k, setK] = useState(3);
  const [speed, setSpeed] = useState<Speed>("normal");

  const [steps, setSteps] = useState<StepSnapshot[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepsRef = useRef<StepSnapshot[]>([]);
  const indexRef = useRef(-1);

  const addLog = useCallback(
    (type: LogEntry["type"], message: string) => {
      setLogs((prev) => [...prev, { type, message, timestamp: Date.now() }]);
    },
    []
  );

  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < steps.length
      ? steps[currentStepIndex]
      : null;

  // ---- Play one step forward ----
  const advanceStep = useCallback(() => {
    const nextIndex = indexRef.current + 1;
    if (nextIndex >= stepsRef.current.length) {
      setIsPlaying(false);
      setIsFinished(true);
      return;
    }
    indexRef.current = nextIndex;
    setCurrentStepIndex(nextIndex);
    const step = stepsRef.current[nextIndex];
    addLog(
      step.action === "none" ? "info" : "step",
      `[i=${step.i}] ${step.description}`
    );
  }, [addLog]);

  // ---- Auto-play loop ----
  const playLoop = useCallback(() => {
    if (indexRef.current >= stepsRef.current.length - 1) {
      setIsPlaying(false);
      setIsFinished(true);
      addLog("success", "✅ Algorithm complete!");
      return;
    }
    advanceStep();
    timerRef.current = setTimeout(playLoop, SPEED_MS[speed]);
  }, [speed, advanceStep, addLog]);

  // ---- Public API ----

  const play = useCallback(() => {
    if (isFinished) return;
    if (steps.length === 0) {
      // First play — compute all steps
      const computed = computeAllSteps(arr, k);
      stepsRef.current = computed;
      indexRef.current = -1;
      setSteps(computed);
      setCurrentStepIndex(-1);
      setLogs([]);
      addLog(
        "info",
        `▶ Starting Sliding Window Maximum: arr=[${arr.join(", ")}], k=${k}`
      );
    }
    setIsPlaying(true);
    // Small delay so state settles
    setTimeout(() => {
      advanceStep();
      timerRef.current = setTimeout(playLoop, SPEED_MS[speed]);
    }, 100);
  }, [arr, k, speed, steps.length, isFinished, advanceStep, playLoop, addLog]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stepForward = useCallback(() => {
    if (isPlaying) return;
    if (steps.length === 0) {
      const computed = computeAllSteps(arr, k);
      stepsRef.current = computed;
      indexRef.current = -1;
      setSteps(computed);
      setLogs([]);
      addLog(
        "info",
        `▶ Starting Sliding Window Maximum: arr=[${arr.join(", ")}], k=${k}`
      );
    }
    advanceStep();
    if (indexRef.current >= stepsRef.current.length - 1) {
      setIsFinished(true);
      addLog("success", "✅ Algorithm complete!");
    }
  }, [arr, k, steps.length, isPlaying, advanceStep, addLog]);

  const reset = useCallback(() => {
    pause();
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsFinished(false);
    setLogs([]);
    stepsRef.current = [];
    indexRef.current = -1;
  }, [pause]);

  const updateArray = useCallback(
    (newArr: number[]) => {
      reset();
      setArr(newArr);
    },
    [reset]
  );

  const updateK = useCallback(
    (newK: number) => {
      reset();
      setK(newK);
    },
    [reset]
  );

  return {
    arr,
    k,
    speed,
    setSpeed,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isPlaying,
    isFinished,
    logs,
    play,
    pause,
    stepForward,
    reset,
    updateArray,
    updateK,
  };
}
