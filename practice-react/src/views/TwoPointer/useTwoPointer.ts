import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
//  Types & Interfaces
// ============================================================

export interface TwoPointerStepSnapshot {
  leftIndex: number;
  rightIndex: number;
  currentSum: number;
  matchState: "searching" | "too-small" | "too-large" | "found" | "not-found";
  description: string;
  activeLineIndices: number[]; // Code line numbers to highlight (0-indexed)
  isFinished?: boolean;
}

export interface TwoPointerLogEntry {
  type: "info" | "step" | "success" | "warning" | "error";
  message: string;
  timestamp: number;
}

export type PlaybackSpeed = "slow" | "normal" | "fast";

const SPEED_DURATION_MS: Record<PlaybackSpeed, number> = {
  slow: 2000,
  normal: 1200,
  fast: 500,
};

// ============================================================
//  Two Pointer Step Snapshot Generator
// ============================================================

export function computeTwoSumSteps(
  numbers: number[],
  targetValue: number,
): TwoPointerStepSnapshot[] {
  const steps: TwoPointerStepSnapshot[] = [];
  let leftIndex = 0;
  let rightIndex = numbers.length - 1;

  // Step 0: Khởi tạo biến
  steps.push({
    leftIndex,
    rightIndex,
    currentSum: 0,
    matchState: "searching",
    description: `Khởi tạo con trỏ leftIndex = ${leftIndex} (giá trị: ${numbers[leftIndex]}) ở đầu mảng, và rightIndex = ${rightIndex} (giá trị: ${numbers[rightIndex]}) ở cuối mảng.`,
    activeLineIndices: [1, 2, 4], // Let's highlight lines for initialization
  });

  // Vòng lặp chính của con trỏ
  while (leftIndex < rightIndex) {
    const currentSum = numbers[leftIndex] + numbers[rightIndex];
    const isSumEqualToTarget = currentSum === targetValue;
    const isSumLessThanTarget = currentSum < targetValue;
    const isSumGreaterThanTarget = currentSum > targetValue;

    // Step A: Tính tổng hiện tại và kiểm tra điều kiện lặp
    steps.push({
      leftIndex,
      rightIndex,
      currentSum,
      matchState: "searching",
      description: `Kiểm tra điều kiện leftIndex < rightIndex (${leftIndex} < ${rightIndex}: Thỏa mãn). Tính tổng hai số hiện tại: numbers[leftIndex] + numbers[rightIndex] = ${numbers[leftIndex]} + ${numbers[rightIndex]} = ${currentSum}.`,
      activeLineIndices: [7, 8],
    });

    // Step B: So sánh tổng với target
    if (isSumEqualToTarget) {
      steps.push({
        leftIndex,
        rightIndex,
        currentSum,
        matchState: "found",
        description: `Chúc mừng! Tổng hai số hiện tại ${currentSum} bằng chính xác target ${targetValue}. Cặp index cần tìm là leftIndex + 1 = ${leftIndex + 1} và rightIndex + 1 = ${rightIndex + 1}.`,
        activeLineIndices: [10, 11, 12, 13, 14],
        isFinished: true,
      });
      return steps;
    }

    if (isSumLessThanTarget) {
      // Show check state
      steps.push({
        leftIndex,
        rightIndex,
        currentSum,
        matchState: "too-small",
        description: `Tổng hai số hiện tại ${currentSum} nhỏ hơn target ${targetValue}. Vì mảng đã sắp xếp tăng dần, ta cần tăng tổng lên bằng cách dịch chuyển con trỏ trái leftIndex sang phải 1 đơn vị.`,
        activeLineIndices: [17, 18],
      });

      leftIndex = leftIndex + 1;

      // Show state after moving pointer
      steps.push({
        leftIndex,
        rightIndex,
        currentSum,
        matchState: "searching",
        description: `Dịch chuyển con trỏ trái thành công! leftIndex tăng lên thành ${leftIndex} (giá trị mới: ${numbers[leftIndex]}).`,
        activeLineIndices: [19],
      });
    } else if (isSumGreaterThanTarget) {
      // Show check state
      steps.push({
        leftIndex,
        rightIndex,
        currentSum,
        matchState: "too-large",
        description: `Tổng hai số hiện tại ${currentSum} lớn hơn target ${targetValue}. Vì mảng đã sắp xếp tăng dần, ta cần giảm tổng xuống bằng cách dịch chuyển con trỏ phải rightIndex sang trái 1 đơn vị.`,
        activeLineIndices: [23, 24],
      });

      rightIndex = rightIndex - 1;

      // Show state after moving pointer
      steps.push({
        leftIndex,
        rightIndex,
        currentSum,
        matchState: "searching",
        description: `Dịch chuyển con trỏ phải thành công! rightIndex giảm xuống thành ${rightIndex} (giá trị mới: ${numbers[rightIndex]}).`,
        activeLineIndices: [25],
      });
    }
  }

  // Kết thúc vòng lặp mà không tìm thấy cặp số thỏa mãn
  steps.push({
    leftIndex,
    rightIndex,
    currentSum: 0,
    matchState: "not-found",
    description: `Hai con trỏ giao nhau hoặc vượt quá nhau (leftIndex >= rightIndex). Kết thúc vòng lặp. Không tìm thấy cặp phần tử nào có tổng bằng ${targetValue}.`,
    activeLineIndices: [29, 30],
    isFinished: true,
  });

  return steps;
}

// ============================================================
//  Custom Hook Hook useTwoPointer
// ============================================================

export function useTwoPointer() {
  const [arrayData, setArrayData] = useState<number[]>([
    2, 5, 8, 12, 16, 23, 38, 56,
  ]);
  const [targetVal, setTargetVal] = useState<number>(28);
  const [speed, setSpeed] = useState<PlaybackSpeed>("normal");

  const [steps, setSteps] = useState<TwoPointerStepSnapshot[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [logs, setLogs] = useState<TwoPointerLogEntry[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepsRef = useRef<TwoPointerStepSnapshot[]>([]);
  const stepIndexRef = useRef<number>(-1);

  const addLog = useCallback(
    (type: TwoPointerLogEntry["type"], message: string) => {
      setLogs((prev) => [...prev, { type, message, timestamp: Date.now() }]);
    },
    [],
  );

  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < steps.length
      ? steps[currentStepIndex]
      : null;

  const clearRunningTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const advanceStep = useCallback(() => {
    const nextStepIndex = stepIndexRef.current + 1;
    const isStepOutOfBound = nextStepIndex >= stepsRef.current.length;

    if (isStepOutOfBound) {
      setIsPlaying(false);
      setIsFinished(true);
      return;
    }

    stepIndexRef.current = nextStepIndex;
    setCurrentStepIndex(nextStepIndex);

    const step = stepsRef.current[nextStepIndex];
    const logType = step.isFinished
      ? step.matchState === "found"
        ? "success"
        : "warning"
      : "step";

    addLog(logType, `[Bước ${nextStepIndex + 1}] ${step.description}`);
  }, [addLog]);

  const playSimulationLoop = useCallback(() => {
    const isAtLastStep = stepIndexRef.current >= stepsRef.current.length - 1;

    if (isAtLastStep) {
      setIsPlaying(false);
      setIsFinished(true);
      const lastStep = stepsRef.current[stepIndexRef.current];
      if (lastStep?.matchState === "found") {
        addLog("success", "✅ Thuật toán hoàn thành: Tìm thấy cặp số!");
      } else {
        addLog(
          "warning",
          "📭 Thuật toán hoàn thành: Không tìm thấy cặp số thỏa mãn.",
        );
      }
      return;
    }

    advanceStep();
    timerRef.current = setTimeout(playSimulationLoop, SPEED_DURATION_MS[speed]);
  }, [speed, advanceStep, addLog]);

  // Action: Bắt đầu / Tiếp tục chạy tự động
  const play = useCallback(() => {
    if (isFinished) return;

    const isSimulationNotStartedYet = steps.length === 0;

    if (isSimulationNotStartedYet) {
      const computedSteps = computeTwoSumSteps(arrayData, targetVal);
      stepsRef.current = computedSteps;
      stepIndexRef.current = -1;
      setSteps(computedSteps);
      setCurrentStepIndex(-1);
      setLogs([]);
      addLog(
        "info",
        `▶ Khởi chạy Two Pointer: Mảng = [${arrayData.join(", ")}], Target = ${targetVal}`,
      );
    }

    setIsPlaying(true);

    // Timeout nhỏ đảm bảo state React đã được cập nhật trước khi chạy loop
    setTimeout(() => {
      advanceStep();
      timerRef.current = setTimeout(
        playSimulationLoop,
        SPEED_DURATION_MS[speed],
      );
    }, 100);
  }, [
    arrayData,
    targetVal,
    speed,
    steps.length,
    isFinished,
    advanceStep,
    playSimulationLoop,
    addLog,
  ]);

  // Action: Tạm dừng
  const pause = useCallback(() => {
    setIsPlaying(false);
    clearRunningTimer();
    addLog("info", "⏸ Tạm dừng mô phỏng.");
  }, [addLog]);

  // Action: Bước tiếp theo
  const stepForward = useCallback(() => {
    if (isPlaying) return;

    const isSimulationNotStartedYet = steps.length === 0;

    if (isSimulationNotStartedYet) {
      const computedSteps = computeTwoSumSteps(arrayData, targetVal);
      stepsRef.current = computedSteps;
      stepIndexRef.current = -1;
      setSteps(computedSteps);
      setLogs([]);
      addLog(
        "info",
        `▶ Bắt đầu mô phỏng từng bước: Mảng = [${arrayData.join(", ")}], Target = ${targetVal}`,
      );
    }

    advanceStep();

    const isAtLastStep = stepIndexRef.current >= stepsRef.current.length - 1;
    if (isAtLastStep) {
      setIsFinished(true);
      const lastStep = stepsRef.current[stepIndexRef.current];
      if (lastStep?.matchState === "found") {
        addLog("success", "✅ Thuật toán hoàn thành: Tìm thấy cặp số!");
      } else {
        addLog("warning", "📭 Thuật toán hoàn thành: Không tìm thấy cặp số.");
      }
    }
  }, [arrayData, targetVal, steps.length, isPlaying, advanceStep, addLog]);

  // Action: Quay lại bước trước
  const stepBackward = useCallback(() => {
    const isStepBackForbidden = isPlaying || steps.length === 0;
    if (isStepBackForbidden) return;

    const previousStepIndex = stepIndexRef.current - 1;
    const isIndexBelowBound = previousStepIndex < 0;

    if (isIndexBelowBound) return;

    stepIndexRef.current = previousStepIndex;
    setCurrentStepIndex(previousStepIndex);
    setIsFinished(false);

    const step = stepsRef.current[previousStepIndex];
    addLog(
      "info",
      `⏪ Quay lại [Bước ${previousStepIndex + 1}]: ${step.description}`,
    );
  }, [isPlaying, steps.length, addLog]);

  // Action: Đặt lại toàn bộ
  const reset = useCallback(() => {
    setIsPlaying(false);
    clearRunningTimer();
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsFinished(false);
    setLogs([]);
    stepsRef.current = [];
    stepIndexRef.current = -1;
    addLog("info", "↺ Đã đặt lại trạng thái ban đầu.");
  }, [addLog]);

  // Action: Cập nhật mảng dữ liệu đầu vào
  const changeInputArray = useCallback(
    (newArray: number[]) => {
      reset();
      setArrayData(newArray);
    },
    [reset],
  );

  // Action: Cập nhật Target
  const changeTarget = useCallback(
    (newTarget: number) => {
      reset();
      setTargetVal(newTarget);
    },
    [reset],
  );

  // Dọn dẹp timer khi component bị unmount
  useEffect(() => {
    return () => clearRunningTimer();
  }, []);

  return {
    arrayData,
    targetVal,
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
    changeInputArray,
    changeTarget,
  };
}

// Give s = string (string and numbers, ignore cases)
// Stop condition = two pointers have equal index

const isStringPalindrome = (s: string) => {
  if (!s) return true;

  const clrString = s.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");

  let leftI = 0;
  let rightI = clrString.length - 1;

  while (leftI < rightI) {
    const leftS = clrString[leftI].toLocaleLowerCase();
    const rightS = clrString[rightI].toLocaleLowerCase();

    if (leftS !== rightS) return false;

    leftI++;
    rightI--;
  }

  return true;
};
