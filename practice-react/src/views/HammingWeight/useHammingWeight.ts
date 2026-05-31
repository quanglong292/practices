import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
//  Types
// ============================================================

export type AlgorithmType = "bit-shifting" | "brian-kernighan";

export interface BitState {
  index: number; // 0 (LSB) to 31 (MSB)
  value: "0" | "1";
  isChecking: boolean;
  isCleared: boolean;
}

export interface StepSnapshot {
  remainingInteger: number;
  binaryArray: BitState[];
  countOfOneBits: number;
  description: string;
  activeLineIndices: number[]; // Code lines to highlight
  // Algorithm-specific state
  bitIndexChecked?: number; // For bit-shifting: index 0 to 31 checked
  brianKernighanState?: {
    n: number;
    nMinusOne: number;
    nBinary: string;
    nMinusOneBinary: string;
    resultOfAnd: number;
    resultOfAndBinary: string;
  };
  isFinished?: boolean;
}

export interface LogEntry {
  type: "info" | "step" | "success" | "warning";
  message: string;
  timestamp: number;
}

export type Speed = "slow" | "normal" | "fast";

const SPEED_MS: Record<Speed, number> = {
  slow: 1500,
  normal: 850,
  fast: 350,
};

// Helper to get 32-bit binary representation
function get32BitBinary(n: number): string {
  return (n >>> 0).toString(2).padStart(32, "0");
}

// Convert 32-bit string to array of BitState
function getBitStates(n: number, checkingIndex = -1): BitState[] {
  const binaryStr = get32BitBinary(n);
  // binaryStr index 0 is MSB (bit 31), index 31 is LSB (bit 0)
  return Array.from({ length: 32 }, (_, idx) => {
    const bitPos = 31 - idx; // 31 down to 0
    return {
      index: bitPos,
      value: binaryStr[idx] as "0" | "1",
      isChecking: bitPos === checkingIndex,
      isCleared: false,
    };
  });
}

// ============================================================
//  Step Generation
// ============================================================

function computeBitShiftingSteps(unsignedInteger: number): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let remainingInteger = unsignedInteger;
  let countOfOneBits = 0;
  let bitIndex = 0;

  // Step 0: Initial state before loop
  steps.push({
    remainingInteger,
    binaryArray: getBitStates(unsignedInteger),
    countOfOneBits,
    description: `Khởi tạo biến đếm count = 0 và gán số cần kiểm tra remainingInteger = ${remainingInteger} (${get32BitBinary(remainingInteger)}).`,
    activeLineIndices: [1, 2],
  });

  while (remainingInteger !== 0) {
    // Step 1: Check condition of while loop
    steps.push({
      remainingInteger,
      binaryArray: getBitStates(remainingInteger),
      countOfOneBits,
      description: `Kiểm tra điều kiện lặp: remainingInteger (${remainingInteger}) khác 0. Tiếp tục lặp.`,
      activeLineIndices: [3],
    });

    // Step 2: Check LSB
    const isLeastSignificantBitOne = (remainingInteger & 1) === 1;
    // Highlight the current LSB (bitIndex in original context, or bit 0 in current context)
    const currentBits = getBitStates(remainingInteger, 0);

    steps.push({
      remainingInteger,
      binaryArray: currentBits,
      countOfOneBits,
      bitIndexChecked: bitIndex,
      description: `Kiểm tra bit ngoài cùng bên phải (LSB): remainingInteger & 1 = ${remainingInteger} & 1 = ${isLeastSignificantBitOne ? "1 (Thỏa mãn)" : "0 (Không thỏa mãn)"}.`,
      activeLineIndices: [4],
    });

    if (isLeastSignificantBitOne) {
      countOfOneBits = countOfOneBits + 1;
      steps.push({
        remainingInteger,
        binaryArray: currentBits,
        countOfOneBits,
        bitIndexChecked: bitIndex,
        description: `Vì bit LSB là 1, ta tăng biến đếm: count = count + 1 = ${countOfOneBits}.`,
        activeLineIndices: [5, 6],
      });
    }

    // Step 3: Shift right logical
    const nextInteger = remainingInteger >>> 1;
    steps.push({
      remainingInteger,
      binaryArray: currentBits,
      countOfOneBits,
      bitIndexChecked: bitIndex,
      description: `Dịch chuyển không dấu sang phải 1 bit (Logical Right Shift): remainingInteger >>> 1.`,
      activeLineIndices: [8],
    });

    remainingInteger = nextInteger;
    bitIndex = bitIndex + 1;

    // Show result of shifting
    steps.push({
      remainingInteger,
      binaryArray: getBitStates(remainingInteger),
      countOfOneBits,
      description: `Kết quả sau khi dịch bit: remainingInteger = ${remainingInteger} (${get32BitBinary(remainingInteger)}).`,
      activeLineIndices: [8],
    });
  }

  // Step 4: Final termination and return
  steps.push({
    remainingInteger,
    binaryArray: getBitStates(remainingInteger),
    countOfOneBits,
    description: `remainingInteger đã bằng 0. Kết thúc vòng lặp và trả về kết quả cuối cùng: ${countOfOneBits}.`,
    activeLineIndices: [10],
    isFinished: true,
  });

  return steps;
}

function computeBrianKernighanSteps(unsignedInteger: number): StepSnapshot[] {
  const steps: StepSnapshot[] = [];
  let remainingInteger = unsignedInteger;
  let countOfOneBits = 0;

  // Step 0: Initial state
  steps.push({
    remainingInteger,
    binaryArray: getBitStates(unsignedInteger),
    countOfOneBits,
    description: `Khởi tạo biến đếm count = 0 và gán số ban đầu remainingInteger = ${remainingInteger} (${get32BitBinary(remainingInteger)}).`,
    activeLineIndices: [1, 2],
  });

  while (remainingInteger !== 0) {
    // Step 1: Check condition
    steps.push({
      remainingInteger,
      binaryArray: getBitStates(remainingInteger),
      countOfOneBits,
      description: `Kiểm tra điều kiện lặp: remainingInteger (${remainingInteger}) khác 0. Tiếp tục lặp.`,
      activeLineIndices: [3],
    });

    const nMinusOne = remainingInteger - 1;
    const resultOfAnd = remainingInteger & nMinusOne;

    // Find which bit was cleared (the lowest set bit)
    // XORing n and resultOfAnd will give a number with only the cleared bit set
    const clearedBitMask = remainingInteger ^ resultOfAnd;
    const clearedBitIndex = Math.log2(clearedBitMask >>> 0);

    const binaryArray = getBitStates(remainingInteger);
    if (clearedBitIndex >= 0 && clearedBitIndex < 32) {
      // Mark this bit as checking/about to be cleared
      const bitInArray = binaryArray.find(b => b.index === clearedBitIndex);
      if (bitInArray) {
        bitInArray.isChecking = true;
      }
    }

    // Step 2: Show n & (n - 1) computation
    steps.push({
      remainingInteger,
      binaryArray: [...binaryArray],
      countOfOneBits,
      description: `Thực hiện phép toán n & (n - 1) để xóa bit 1 ngoài cùng bên phải. n = ${remainingInteger}, n - 1 = ${nMinusOne}.`,
      activeLineIndices: [4],
      brianKernighanState: {
        n: remainingInteger,
        nMinusOne,
        nBinary: get32BitBinary(remainingInteger),
        nMinusOneBinary: get32BitBinary(nMinusOne),
        resultOfAnd,
        resultOfAndBinary: get32BitBinary(resultOfAnd),
      },
    });

    // Step 3: Show n updated
    remainingInteger = resultOfAnd;
    const nextBinaryArray = getBitStates(remainingInteger);
    if (clearedBitIndex >= 0 && clearedBitIndex < 32) {
      const bitInArray = nextBinaryArray.find(b => b.index === clearedBitIndex);
      if (bitInArray) {
        bitInArray.isCleared = true;
      }
    }

    steps.push({
      remainingInteger,
      binaryArray: nextBinaryArray,
      countOfOneBits,
      description: `Bit 1 ở vị trí ${clearedBitIndex} đã được triệt tiêu thành công! Giá trị mới của n = ${remainingInteger} (${get32BitBinary(remainingInteger)}).`,
      activeLineIndices: [4],
    });

    // Step 4: Increment count
    countOfOneBits = countOfOneBits + 1;
    steps.push({
      remainingInteger,
      binaryArray: nextBinaryArray,
      countOfOneBits,
      description: `Tăng biến đếm: count = count + 1 = ${countOfOneBits}.`,
      activeLineIndices: [5],
    });
  }

  // Step 5: Termination
  steps.push({
    remainingInteger,
    binaryArray: getBitStates(remainingInteger),
    countOfOneBits,
    description: `remainingInteger đã bằng 0. Kết thúc thuật toán và trả về kết quả cuối cùng: ${countOfOneBits}.`,
    activeLineIndices: [7],
    isFinished: true,
  });

  return steps;
}

// ============================================================
//  Hook Implementation
// ============================================================

export function useHammingWeight() {
  const [inputValue, setInputValue] = useState<number>(11); // Default to 11
  const [algoType, setAlgoType] = useState<AlgorithmType>("bit-shifting");
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

  // Clear running timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Play one step forward
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
      step.isFinished ? "success" : "step",
      `[Bước ${nextIndex}] ${step.description}`
    );
  }, [addLog]);

  // Auto-play loop
  const playLoop = useCallback(() => {
    if (indexRef.current >= stepsRef.current.length - 1) {
      setIsPlaying(false);
      setIsFinished(true);
      addLog("success", "✅ Thuật toán hoàn thành!");
      return;
    }
    advanceStep();
    timerRef.current = setTimeout(playLoop, SPEED_MS[speed]);
  }, [speed, advanceStep, addLog]);

  // Actions

  const play = useCallback(() => {
    if (isFinished) return;
    if (steps.length === 0) {
      // Generate steps
      const computed =
        algoType === "bit-shifting"
          ? computeBitShiftingSteps(inputValue)
          : computeBrianKernighanSteps(inputValue);
      stepsRef.current = computed;
      indexRef.current = -1;
      setSteps(computed);
      setCurrentStepIndex(-1);
      setLogs([]);
      addLog(
        "info",
        `▶ Bắt đầu tính Hamming Weight: Số vào = ${inputValue} (nhị phân: ${get32BitBinary(inputValue)}), Thuật toán: ${algoType === "bit-shifting" ? "Dịch Bit tuần tự" : "Brian Kernighan"}`
      );
    }
    setIsPlaying(true);
    // Timeout for state settlement
    setTimeout(() => {
      advanceStep();
      timerRef.current = setTimeout(playLoop, SPEED_MS[speed]);
    }, 100);
  }, [inputValue, algoType, speed, steps.length, isFinished, advanceStep, playLoop, addLog]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, []);

  const stepForward = useCallback(() => {
    if (isPlaying) return;
    if (steps.length === 0) {
      const computed =
        algoType === "bit-shifting"
          ? computeBitShiftingSteps(inputValue)
          : computeBrianKernighanSteps(inputValue);
      stepsRef.current = computed;
      indexRef.current = -1;
      setSteps(computed);
      setLogs([]);
      addLog(
        "info",
        `▶ Bắt đầu tính Hamming Weight: Số vào = ${inputValue}, Thuật toán: ${algoType === "bit-shifting" ? "Dịch Bit tuần tự" : "Brian Kernighan"}`
      );
    }
    advanceStep();
    if (indexRef.current >= stepsRef.current.length - 1) {
      setIsFinished(true);
      addLog("success", "✅ Thuật toán hoàn thành!");
    }
  }, [inputValue, algoType, steps.length, isPlaying, advanceStep, addLog]);

  const stepBackward = useCallback(() => {
    if (isPlaying || steps.length === 0) return;
    const prevIndex = indexRef.current - 1;
    if (prevIndex < 0) return;
    indexRef.current = prevIndex;
    setCurrentStepIndex(prevIndex);
    setIsFinished(false);
    const step = stepsRef.current[prevIndex];
    addLog(
      "info",
      `⏪ Quay lại [Bước ${prevIndex}]: ${step.description}`
    );
  }, [isPlaying, steps.length, addLog]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsFinished(false);
    setLogs([]);
    stepsRef.current = [];
    indexRef.current = -1;
  }, []);

  // Update input or algorithm type resets state
  const changeInput = useCallback((val: number) => {
    reset();
    setInputValue(val);
  }, [reset]);

  const changeAlgo = useCallback((algo: AlgorithmType) => {
    reset();
    setAlgoType(algo);
  }, [reset]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTimer();
  }, []);

  return {
    inputValue,
    algoType,
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
    changeInput,
    changeAlgo,
  };
}
