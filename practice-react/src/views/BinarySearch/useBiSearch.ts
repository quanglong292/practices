import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
//  Types & interfaces
// ============================================================

export type SearchPhase =
  | "init_low"
  | "init_high"
  | "check_range"
  | "calc_mid"
  | "get_mid_val"
  | "check_found"
  | "return_found"
  | "check_left"
  | "update_high"
  | "update_low"
  | "return_not_found";

export interface StepSnapshot {
  lowIndex: number;
  highIndex: number;
  midIndex: number; // -1 if not computed yet
  midValue: number | null; // null if not computed yet
  isSearchRangeValid: boolean | null;
  isTargetFound: boolean | null;
  isTargetInLeftHalf: boolean | null;
  activeLine: number;
  phase: SearchPhase;
  description: string;
  foundIndex: number; // -1 if not found, or matching index
}

export interface LogEntry {
  type: "info" | "step" | "success" | "warning";
  message: string;
  timestamp: number;
}

export type Speed = "slow" | "normal" | "fast";

const SPEED_MS: Record<Speed, number> = {
  slow: 1500,
  normal: 800,
  fast: 350,
};

// ============================================================
//  Pre-compute Binary Search Steps
// ============================================================

export function computeBinarySearchSteps(arr: number[], target: number): StepSnapshot[] {
  const steps: StepSnapshot[] = [];

  let lowIndex = 0;
  let highIndex = arr.length - 1;
  let midIndex = -1;
  let midValue: number | null = null;
  let isSearchRangeValid: boolean | null = null;
  let isTargetFound: boolean | null = null;
  let isTargetInLeftHalf: boolean | null = null;
  let foundIndex = -1;

  // Step 1: Initialize lowIndex
  steps.push({
    lowIndex,
    highIndex,
    midIndex,
    midValue,
    isSearchRangeValid,
    isTargetFound,
    isTargetInLeftHalf,
    activeLine: 2,
    phase: "init_low",
    description: `Khởi tạo: Đặt lowIndex = 0 (bắt đầu array).`,
    foundIndex,
  });

  // Step 2: Initialize highIndex
  steps.push({
    lowIndex,
    highIndex,
    midIndex,
    midValue,
    isSearchRangeValid,
    isTargetFound,
    isTargetInLeftHalf,
    activeLine: 3,
    phase: "init_high",
    description: `Khởi tạo: Đặt highIndex = arr.length - 1 = ${highIndex} (cuối array).`,
    foundIndex,
  });

  while (true) {
    const currentLow = lowIndex;
    const currentHigh = highIndex;
    const rangeValid = currentLow <= currentHigh;
    isSearchRangeValid = rangeValid;

    // Step 3: Check loop condition
    steps.push({
      lowIndex: currentLow,
      highIndex: currentHigh,
      midIndex: -1,
      midValue: null,
      isSearchRangeValid: rangeValid,
      isTargetFound: null,
      isTargetInLeftHalf: null,
      activeLine: 5,
      phase: "check_range",
      description: `Kiểm tra điều kiện lặp: lowIndex (${currentLow}) <= highIndex (${currentHigh}) là ${rangeValid ? "ĐÚNG (TRUE)" : "SAI (FALSE)"}.`,
      foundIndex,
    });

    if (!rangeValid) {
      break;
    }

    // Step 4: Calculate midIndex
    const calculatedMid = Math.floor((currentLow + currentHigh) / 2);
    midIndex = calculatedMid;
    steps.push({
      lowIndex: currentLow,
      highIndex: currentHigh,
      midIndex: calculatedMid,
      midValue: null,
      isSearchRangeValid: rangeValid,
      isTargetFound: null,
      isTargetInLeftHalf: null,
      activeLine: 8,
      phase: "calc_mid",
      description: `Tính toán chỉ số ở giữa (midIndex): lấy (lowIndex + highIndex) / 2 rồi làm tròn xuống = ${calculatedMid}.`,
      foundIndex,
    });

    // Step 5: Get midValue
    const calculatedVal = arr[calculatedMid];
    midValue = calculatedVal;
    steps.push({
      lowIndex: currentLow,
      highIndex: currentHigh,
      midIndex: calculatedMid,
      midValue: calculatedVal,
      isSearchRangeValid: rangeValid,
      isTargetFound: null,
      isTargetInLeftHalf: null,
      activeLine: 9,
      phase: "get_mid_val",
      description: `Lấy giá trị tại midIndex: midValue = array[${calculatedMid}] = ${calculatedVal}.`,
      foundIndex,
    });

    // Step 6: Compare midValue with target
    const targetFound = calculatedVal === target;
    isTargetFound = targetFound;
    steps.push({
      lowIndex: currentLow,
      highIndex: currentHigh,
      midIndex: calculatedMid,
      midValue: calculatedVal,
      isSearchRangeValid: rangeValid,
      isTargetFound: targetFound,
      isTargetInLeftHalf: null,
      activeLine: 11,
      phase: "check_found",
      description: `So sánh: midValue (${calculatedVal}) === target (${target}) là ${targetFound ? "ĐÚNG (TRUE)" : "SAI (FALSE)"}.`,
      foundIndex,
    });

    if (targetFound) {
      foundIndex = calculatedMid;
      steps.push({
        lowIndex: currentLow,
        highIndex: currentHigh,
        midIndex: calculatedMid,
        midValue: calculatedVal,
        isSearchRangeValid: rangeValid,
        isTargetFound: true,
        isTargetInLeftHalf: null,
        activeLine: 13,
        phase: "return_found",
        description: `Thành công: Tìm thấy target tại index ${calculatedMid}. Trả về chỉ số này!`,
        foundIndex,
      });
      break;
    }

    // Step 7: Check if target is in left half
    const targetInLeft = target < calculatedVal;
    isTargetInLeftHalf = targetInLeft;
    steps.push({
      lowIndex: currentLow,
      highIndex: currentHigh,
      midIndex: calculatedMid,
      midValue: calculatedVal,
      isSearchRangeValid: rangeValid,
      isTargetFound: false,
      isTargetInLeftHalf: targetInLeft,
      activeLine: 16,
      phase: "check_left",
      description: `So sánh: target (${target}) < midValue (${calculatedVal}) là ${targetInLeft ? "ĐÚNG (TRUE)" : "SAI (FALSE)"}.`,
      foundIndex,
    });

    if (targetInLeft) {
      highIndex = calculatedMid - 1;
      steps.push({
        lowIndex: currentLow,
        highIndex: calculatedMid - 1,
        midIndex: calculatedMid,
        midValue: calculatedVal,
        isSearchRangeValid: rangeValid,
        isTargetFound: false,
        isTargetInLeftHalf: true,
        activeLine: 18,
        phase: "update_high",
        description: `Cập nhật highIndex = midIndex - 1 = ${calculatedMid - 1}. Nửa bên phải bị loại bỏ.`,
        foundIndex,
      });
    } else {
      lowIndex = calculatedMid + 1;
      steps.push({
        lowIndex: calculatedMid + 1,
        highIndex: currentHigh,
        midIndex: calculatedMid,
        midValue: calculatedVal,
        isSearchRangeValid: rangeValid,
        isTargetFound: false,
        isTargetInLeftHalf: false,
        activeLine: 20,
        phase: "update_low",
        description: `Cập nhật lowIndex = midIndex + 1 = ${calculatedMid + 1}. Nửa bên trái bị loại bỏ.`,
        foundIndex,
      });
    }

    // Clear mid states for next iteration
    midIndex = -1;
    midValue = null;
    isSearchRangeValid = null;
    isTargetFound = null;
    isTargetInLeftHalf = null;
  }

  // If ended without finding
  if (foundIndex === -1) {
    steps.push({
      lowIndex,
      highIndex,
      midIndex: -1,
      midValue: null,
      isSearchRangeValid: false,
      isTargetFound: false,
      isTargetInLeftHalf: null,
      activeLine: 23,
      phase: "return_not_found",
      description: `Kết thúc: Không tìm thấy target. Trả về -1.`,
      foundIndex: -1,
    });
  }

  return steps;
}

// ============================================================
//  Hook Implementation
// ============================================================

export function useBiSearch() {
  const [arr, setArr] = useState<number[]>([2, 5, 8, 12, 16, 23, 38, 56, 72, 91]);
  const [target, setTarget] = useState<number>(23);
  const [speed, setSpeed] = useState<Speed>("normal");

  const [steps, setSteps] = useState<StepSnapshot[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepsRef = useRef<StepSnapshot[]>([]);
  const indexRef = useRef(-1);

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) => [...prev, { type, message, timestamp: Date.now() }]);
  }, []);

  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < steps.length
      ? steps[currentStepIndex]
      : null;

  // Single step forward
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

    let logType: LogEntry["type"] = "step";
    if (step.phase === "return_found") logType = "success";
    if (step.phase === "return_not_found") logType = "warning";
    if (step.phase.startsWith("init")) logType = "info";

    addLog(logType, `[Dòng ${step.activeLine}] ${step.description}`);
  }, [addLog]);

  // Autoplay loop
  const playLoop = useCallback(() => {
    if (indexRef.current >= stepsRef.current.length - 1) {
      setIsPlaying(false);
      setIsFinished(true);
      addLog("success", "✅ Hoàn thành mô phỏng!");
      return;
    }
    advanceStep();
    timerRef.current = setTimeout(playLoop, SPEED_MS[speed]);
  }, [speed, advanceStep, addLog]);

  // Trigger Play
  const play = useCallback(() => {
    if (isFinished) return;
    if (steps.length === 0) {
      // Sort array before running just in case
      const sortedArr = [...arr].sort((a, b) => a - b);
      setArr(sortedArr);
      const computed = computeBinarySearchSteps(sortedArr, target);
      stepsRef.current = computed;
      indexRef.current = -1;
      setSteps(computed);
      setCurrentStepIndex(-1);
      setLogs([]);
      addLog("info", `▶ Khởi chạy Binary Search: Mảng =[${sortedArr.join(", ")}], Target = ${target}`);
    }
    setIsPlaying(true);
    setTimeout(() => {
      advanceStep();
      timerRef.current = setTimeout(playLoop, SPEED_MS[speed]);
    }, 100);
  }, [arr, target, speed, steps.length, isFinished, advanceStep, playLoop, addLog]);

  // Pause
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Step Forward Manually
  const stepForward = useCallback(() => {
    if (isPlaying) return;
    if (steps.length === 0) {
      const sortedArr = [...arr].sort((a, b) => a - b);
      setArr(sortedArr);
      const computed = computeBinarySearchSteps(sortedArr, target);
      stepsRef.current = computed;
      indexRef.current = -1;
      setSteps(computed);
      setLogs([]);
      addLog("info", `▶ Khởi chạy Binary Search: Mảng =[${sortedArr.join(", ")}], Target = ${target}`);
    }
    advanceStep();
    if (indexRef.current >= stepsRef.current.length - 1) {
      setIsFinished(true);
      addLog("success", "✅ Hoàn thành mô phỏng!");
    }
  }, [arr, target, steps.length, isPlaying, advanceStep, addLog]);

  // Step Backward Manually
  const stepBackward = useCallback(() => {
    if (isPlaying || steps.length === 0) return;
    const prevIndex = indexRef.current - 1;
    if (prevIndex < 0) return;
    indexRef.current = prevIndex;
    setCurrentStepIndex(prevIndex);
    setIsFinished(false);
    const step = stepsRef.current[prevIndex];
    addLog("info", `⏪ Quay lại: [Dòng ${step.activeLine}] ${step.description}`);
  }, [isPlaying, steps.length, addLog]);

  // Reset
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

  const updateTarget = useCallback(
    (newTarget: number) => {
      reset();
      setTarget(newTarget);
    },
    [reset]
  );

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    arr,
    target,
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
    stepBackward,
    reset,
    updateArray,
    updateTarget,
  };
}


// const biSearch = (second) => { third }