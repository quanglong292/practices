import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = "fixed" | "variable";

interface Step {
  leftIndex: number;
  rightIndex: number;
  windowSum?: number;
  maxSum?: number;
  maxLength?: number;
  codeLineHighlight: number; // which line of code is active
  note: string; // what is happening at this step
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIXED_ARRAY = [2, 1, 5, 1, 3, 2];
const WINDOW_SIZE = 3;
const VARIABLE_STRING = "abcabcbb";

// ─── Code snippets to show alongside the visualization ───────────────────────

const FIXED_CODE_LINES = [
  `let windowSum = arr[0] + arr[1] + arr[2];`, // line 0
  `let maxSum = windowSum;`,                    // line 1
  ``,                                            // line 2 (blank separator)
  `for (let i = k; i < arr.length; i++) {`,    // line 3
  `  const newElement = arr[i];`,               // line 4
  `  const removedElement = arr[i - k];`,       // line 5
  `  windowSum = windowSum + newElement`,        // line 6
  `             - removedElement;`,             // line 7
  `  maxSum = Math.max(maxSum, windowSum);`,    // line 8
  `}`,                                           // line 9
];

const VARIABLE_CODE_LINES = [
  `let leftPointer = 0;`,                              // line 0
  `let maxLength = 0;`,                                // line 1
  `const seenCharacters = new Set();`,                 // line 2
  ``,                                                   // line 3
  `for (let rightPointer = 0; ...) {`,                // line 4
  `  const currentChar = s[rightPointer];`,            // line 5
  `  while (seenCharacters.has(currentChar)) {`,       // line 6
  `    seenCharacters.delete(s[leftPointer]);`,        // line 7
  `    leftPointer++;`,                                // line 8
  `  }`,                                               // line 9
  `  seenCharacters.add(currentChar);`,                // line 10
  `  const windowLength = right - left + 1;`,         // line 11
  `  maxLength = Math.max(maxLength, windowLength);`,  // line 12
  `}`,                                                 // line 13
];

// ─── Build step-by-step traces ───────────────────────────────────────────────

function buildFixedSteps(): Step[] {
  const steps: Step[] = [];
  const arr = FIXED_ARRAY;
  const k = WINDOW_SIZE;

  // Step: initialize first window sum
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  steps.push({
    leftIndex: 0,
    rightIndex: k - 1,
    windowSum,
    maxSum: windowSum,
    codeLineHighlight: 0,
    note: `Khởi tạo window đầu tiên [0..${k - 1}] → windowSum = ${windowSum}`,
  });

  // Step: record initial maxSum
  let maxSum = windowSum;
  steps.push({
    leftIndex: 0,
    rightIndex: k - 1,
    windowSum,
    maxSum,
    codeLineHighlight: 1,
    note: `maxSum = ${maxSum} (gán bằng windowSum ban đầu)`,
  });

  // Steps: slide the window
  for (let i = k; i < arr.length; i++) {
    const newElement = arr[i];
    const removedElement = arr[i - k];

    // highlight: picking new and removed element
    steps.push({
      leftIndex: i - k + 1,
      rightIndex: i,
      windowSum,
      maxSum,
      codeLineHighlight: 4,
      note: `newElement = arr[${i}] = ${newElement},  removedElement = arr[${i - k}] = ${removedElement}`,
    });

    // highlight: compute new windowSum
    windowSum = windowSum + newElement - removedElement;
    steps.push({
      leftIndex: i - k + 1,
      rightIndex: i,
      windowSum,
      maxSum,
      codeLineHighlight: 6,
      note: `windowSum = ${windowSum + removedElement - newElement} + ${newElement} - ${removedElement} = ${windowSum}`,
    });

    // highlight: update maxSum
    maxSum = Math.max(maxSum, windowSum);
    steps.push({
      leftIndex: i - k + 1,
      rightIndex: i,
      windowSum,
      maxSum,
      codeLineHighlight: 8,
      note: `maxSum = Math.max(${maxSum === windowSum ? windowSum : maxSum - 1}, ${windowSum}) = ${maxSum}`,
    });
  }

  return steps;
}

function buildVariableSteps(): Step[] {
  const steps: Step[] = [];
  const s = VARIABLE_STRING;
  let leftPointer = 0;
  let maxLength = 0;
  const seenCharacters = new Set<string>();

  // init step
  steps.push({
    leftIndex: 0,
    rightIndex: 0,
    maxLength: 0,
    codeLineHighlight: 0,
    note: `Khởi tạo leftPointer = 0, maxLength = 0, seenCharacters = {}`,
  });

  for (let rightPointer = 0; rightPointer < s.length; rightPointer++) {
    const currentChar = s[rightPointer];

    steps.push({
      leftIndex: leftPointer,
      rightIndex: rightPointer,
      maxLength,
      codeLineHighlight: 5,
      note: `currentChar = "${currentChar}" (rightPointer = ${rightPointer})`,
    });

    // shrink phase
    while (seenCharacters.has(currentChar)) {
      const leftChar = s[leftPointer];
      seenCharacters.delete(leftChar);
      leftPointer++;
      steps.push({
        leftIndex: leftPointer,
        rightIndex: rightPointer,
        maxLength,
        codeLineHighlight: 7,
        note: `"${currentChar}" bị lặp → xoá "${leftChar}", leftPointer = ${leftPointer}`,
      });
    }

    seenCharacters.add(currentChar);
    const currentWindowLength = rightPointer - leftPointer + 1;
    maxLength = Math.max(maxLength, currentWindowLength);

    steps.push({
      leftIndex: leftPointer,
      rightIndex: rightPointer,
      maxLength,
      codeLineHighlight: 12,
      note: `window = "${s.slice(leftPointer, rightPointer + 1)}" (length=${currentWindowLength}) → maxLength = ${maxLength}`,
    });
  }

  return steps;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ArrayCell({
  value,
  index,
  isLeft,
  isRight,
  isInWindow,
}: {
  value: string | number;
  index: number;
  isLeft: boolean;
  isRight: boolean;
  isInWindow: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {/* Pointer label */}
      <div style={{ height: 18, fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>
        {isLeft && isRight ? "L/R" : isLeft ? "L" : isRight ? "R" : ""}
      </div>

      {/* Cell box */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 17,
          border: isInWindow ? "2px solid #6366f1" : "2px solid #334155",
          background: isInWindow ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#1e293b",
          color: isInWindow ? "#fff" : "#64748b",
          boxShadow: isInWindow ? "0 0 14px #6366f170" : "none",
          transition: "all 0.3s ease",
          transform: isInWindow ? "scale(1.1)" : "scale(1)",
        }}
      >
        {value}
      </div>

      {/* Index label */}
      <div style={{ fontSize: 10, color: "#475569" }}>{index}</div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 12,
        padding: "10px 18px",
        textAlign: "center",
        border: `1px solid ${color}30`,
        minWidth: 90,
      }}
    >
      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function CodePanel({
  lines,
  activeLine,
}: {
  lines: string[];
  activeLine: number;
}) {
  return (
    <div
      style={{
        background: "#0a0f1e",
        borderRadius: 12,
        padding: "16px",
        fontFamily: "'Fira Code', 'Courier New', monospace",
        fontSize: 13,
        overflowX: "auto",
      }}
    >
      {lines.map((line, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: 12,
            padding: "3px 8px",
            borderRadius: 6,
            background: index === activeLine ? "#4f46e520" : "transparent",
            borderLeft: index === activeLine ? "3px solid #6366f1" : "3px solid transparent",
            transition: "background 0.2s",
          }}
        >
          <span style={{ color: "#334155", minWidth: 18, textAlign: "right", userSelect: "none" }}>
            {index + 1}
          </span>
          <span style={{ color: index === activeLine ? "#c4b5fd" : "#64748b", whiteSpace: "pre" }}>
            {line}
          </span>
        </div>
      ))}
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 20px",
        borderRadius: 99,
        border: "1px solid #334155",
        background: "#1e293b",
        color: disabled ? "#2d3f52" : "#94a3b8",
        fontWeight: 600,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SlidingWindow() {
  const [mode, setMode] = useState<Mode>("fixed");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fixedSteps = buildFixedSteps();
  const variableSteps = buildVariableSteps();

  const steps = mode === "fixed" ? fixedSteps : variableSteps;
  const currentStep = steps[stepIndex];
  const codeLines = mode === "fixed" ? FIXED_CODE_LINES : VARIABLE_CODE_LINES;
  const dataSource = mode === "fixed" ? FIXED_ARRAY : VARIABLE_STRING.split("");

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((previousIndex) => {
          const isLastStep = previousIndex >= steps.length - 1;
          if (isLastStep) {
            setIsPlaying(false);
            return previousIndex;
          }
          return previousIndex + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, steps.length]);

  function handleReset() {
    setIsPlaying(false);
    setStepIndex(0);
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setIsPlaying(false);
    setStepIndex(0);
  }

  function handlePrev() {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  }

  function handleTogglePlay() {
    setIsPlaying((prev) => !prev);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#f1f5f9",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 12, letterSpacing: 3, color: "#a78bfa", margin: "0 0 8px" }}>
            DSA VISUALIZATION
          </p>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(90deg, #a78bfa, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🪟 Sliding Window
          </h1>
          <p style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>
            Xem window di chuyển từng bước, song song với code
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {(["fixed", "variable"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                padding: "10px 26px",
                borderRadius: 99,
                border: "none",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                background: mode === m ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#1e293b",
                color: mode === m ? "#fff" : "#64748b",
                boxShadow: mode === m ? "0 4px 16px #6366f140" : "none",
              }}
            >
              {m === "fixed" ? "📏 Fixed Window (k=3)" : "📐 Variable Window"}
            </button>
          ))}
        </div>

        {/* Problem statement */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 12,
            padding: "12px 20px",
            marginBottom: 24,
            fontSize: 14,
            color: "#94a3b8",
            borderLeft: "3px solid #6366f1",
          }}
        >
          {mode === "fixed" ? (
            <>
              Tìm <strong style={{ color: "#a78bfa" }}>tổng lớn nhất</strong> của bất kỳ{" "}
              <strong style={{ color: "#a78bfa" }}>3 phần tử liên tiếp</strong> trong{" "}
              <strong style={{ color: "#e2e8f0" }}>[{FIXED_ARRAY.join(", ")}]</strong>
            </>
          ) : (
            <>
              Tìm <strong style={{ color: "#a78bfa" }}>substring dài nhất</strong> không có ký tự lặp trong{" "}
              <strong style={{ color: "#e2e8f0" }}>"{VARIABLE_STRING}"</strong>
            </>
          )}
        </div>

        {/* Main visualization + code side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Left: Array visualization */}
          <div
            style={{
              background: "#0f172a",
              borderRadius: 16,
              padding: 24,
              border: "1px solid #1e293b",
            }}
          >
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 16, letterSpacing: 1 }}>
              WINDOW VISUALIZATION
            </div>

            {/* Array cells */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
              {dataSource.map((value, index) => {
                const isInWindow = index >= currentStep.leftIndex && index <= currentStep.rightIndex;
                const isLeft = index === currentStep.leftIndex;
                const isRight = index === currentStep.rightIndex;
                return (
                  <ArrayCell
                    key={index}
                    value={value}
                    index={index}
                    isLeft={isLeft}
                    isRight={isRight}
                    isInWindow={isInWindow}
                  />
                );
              })}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {mode === "fixed" ? (
                <>
                  <StatCard label="windowSum" value={currentStep.windowSum ?? 0} color="#6366f1" />
                  <StatCard label="maxSum" value={currentStep.maxSum ?? 0} color="#10b981" />
                  <StatCard
                    label="window"
                    value={`[${currentStep.leftIndex}..${currentStep.rightIndex}]`}
                    color="#f59e0b"
                  />
                </>
              ) : (
                <>
                  <StatCard
                    label="window"
                    value={`"${VARIABLE_STRING.slice(currentStep.leftIndex, currentStep.rightIndex + 1)}"`}
                    color="#6366f1"
                  />
                  <StatCard
                    label="length"
                    value={currentStep.rightIndex - currentStep.leftIndex + 1}
                    color="#f59e0b"
                  />
                  <StatCard label="maxLength" value={currentStep.maxLength ?? 0} color="#10b981" />
                </>
              )}
            </div>
          </div>

          {/* Right: Code panel */}
          <div
            style={{
              background: "#0f172a",
              borderRadius: 16,
              padding: 24,
              border: "1px solid #1e293b",
            }}
          >
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 16, letterSpacing: 1 }}>
              CODE
            </div>
            <CodePanel lines={codeLines} activeLine={currentStep.codeLineHighlight} />
          </div>
        </div>

        {/* Step note */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: "14px 20px",
            fontSize: 14,
            color: "#e2e8f0",
            marginBottom: 20,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span
            style={{
              background: "#4f46e5",
              borderRadius: 99,
              padding: "2px 12px",
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Step {stepIndex + 1} / {steps.length}
          </span>
          <span style={{ color: "#94a3b8" }}>{currentStep.note}</span>
        </div>

        {/* Controls: Play / Prev / Next / Reset */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <NavButton onClick={handleReset} disabled={stepIndex === 0 && !isPlaying}>
            ⏮ Reset
          </NavButton>
          <NavButton onClick={handlePrev} disabled={stepIndex === 0}>
            ← Prev
          </NavButton>
          <button
            onClick={handleTogglePlay}
            style={{
              padding: "12px 32px",
              borderRadius: 99,
              border: "none",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 18px #6366f150",
            }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <NavButton onClick={handleNext} disabled={stepIndex === steps.length - 1}>
            Next →
          </NavButton>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 20,
            background: "#1e293b",
            borderRadius: 99,
            height: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((stepIndex + 1) / steps.length) * 100}%`,
              background: "linear-gradient(90deg, #6366f1, #a78bfa)",
              borderRadius: 99,
              transition: "width 0.35s ease",
            }}
          />
        </div>

        {/* Complexity footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          {[
            { label: "Brute Force", value: "O(n × k)", color: "#ef4444" },
            { label: "Sliding Window", value: "O(n)", color: "#10b981" },
            { label: "Space", value: mode === "fixed" ? "O(1)" : "O(n)", color: "#f59e0b" },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                background: "#1e293b",
                borderRadius: 8,
                padding: "7px 16px",
                fontSize: 13,
                color: "#94a3b8",
                border: `1px solid ${badge.color}30`,
              }}
            >
              {badge.label}: <strong style={{ color: badge.color }}>{badge.value}</strong>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
