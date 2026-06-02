import { useEffect, useRef, useState } from "react";
import { useHammingWeight, type AlgorithmType, type Speed, type LogEntry, type BitState } from "./useHammingWeight";
import "./HammingWeight.css";

const PRESETS = [
  { label: "11 (1011)", val: 11 },
  { label: "42 (101010)", val: 42 },
  { label: "128 (10000000)", val: 128 },
  { label: "Max 32-bit (2147483647)", val: 2147483647 },
  { label: "0 (empty)", val: 0 },
];

const BIT_SHIFT_CODE = [
  "function hammingWeight(unsignedInteger) {", // 0
  "  let countOfOneBits = 0;", // 1
  "  let remainingInteger = unsignedInteger;", // 2
  "  while (remainingInteger !== 0) {", // 3
  "    const isLeastSignificantBitOne = (remainingInteger & 1) === 1;", // 4
  "    if (isLeastSignificantBitOne) {", // 5
  "      countOfOneBits = countOfOneBits + 1;", // 6
  "    }", // 7
  "    remainingInteger = remainingInteger >>> 1;", // 8
  "  }", // 9
  "  return countOfOneBits;", // 10
  "}" // 11
];

const BRIAN_KERNIGHAN_CODE = [
  "function hammingWeight(unsignedInteger) {", // 0
  "  let countOfOneBits = 0;", // 1
  "  let remainingInteger = unsignedInteger;", // 2
  "  while (remainingInteger !== 0) {", // 3
  "    remainingInteger = remainingInteger & (remainingInteger - 1);", // 4
  "    countOfOneBits = countOfOneBits + 1;", // 5
  "  }", // 6
  "  return countOfOneBits;", // 7
  "}" // 8
];

export default function HammingWeight() {
  const {
    inputValue,
    algoType,
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
    stepBackward,
    reset,
    changeInput,
    changeAlgo,
  } = useHammingWeight();

  const [customInputText, setCustomInputText] = useState(inputValue.toString());

  // Update input text field when inputValue changes externally
  useEffect(() => {
    setCustomInputText(inputValue.toString());
  }, [inputValue]);

  const activeLines = currentStep ? currentStep.activeLineIndices : [];

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customInputText, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      // Clamp to 32-bit unsigned int max
      const clamped = Math.min(parsed, 4294967295);
      changeInput(clamped);
      setCustomInputText(clamped.toString());
    }
  };

  const currentCode = algoType === "bit-shifting" ? BIT_SHIFT_CODE : BRIAN_KERNIGHAN_CODE;

  return (
    <div className="hw-app-layout">
      {/* Code Visualizer Panel - Left */}
      <div className="hw-section hw-code-section mt-[152px]">
        <h3 className="hw-section-title">💻 Algorithm Code</h3>
        <div className="hw-code-container">
          {currentCode.map((line, idx) => {
            const isActive = activeLines.includes(idx);
            return (
              <div
                key={idx}
                className={`hw-code-line ${isActive ? "hw-code-line-active" : ""}`}
              >
                <span className="hw-code-number">{idx + 1}</span>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                  }}
                >
                  {line || " "}
                </pre>
              </div>
            );
          })}
        </div>

        {/* Explain Card */}
        <div className="hw-explain-card">
          <h4>💡 Giải thích thuật ngữ</h4>
          <ul>
            <li>
              <strong>Logical Right Shift (<code>&gt;&gt;&gt;</code>)</strong>: Dịch chuyển các bit sang phải, luôn điền các bit <code>0</code> vào bên trái. Giúp giữ cho số nguyên luôn dương (không dấu) trong JavaScript.
            </li>
            <li>
              <strong>Bitwise AND (<code>&amp;</code>)</strong>: Phép toán so sánh bit. Chỉ trả về <code>1</code> khi cả hai bit so sánh đều là <code>1</code>.
            </li>
            <li>
              <strong>Brian Kernighan</strong>: Cách xóa bit <code>1</code> ở vị trí thấp nhất nhanh chóng bằng phép nhân nhị phân thông minh.
            </li>
          </ul>
        </div>
      </div>

      {/* Main Control Panel - Right */}
      <div className="hw-container">
        <header className="hw-header">
          <h1 className="hw-title">
            <span className="hw-title-icon">📊</span>
            Hamming Weight Visualizer
          </h1>
          <p className="hw-subtitle">
            Khám phá trực quan 2 cách đếm số lượng bit 1 (Popcount / Hamming Weight)
          </p>
        </header>

        {/* Config / Select Algo */}
        <div className="hw-config-row">
          <div className="hw-config-group">
            <span className="hw-toolbar-label">Thuật toán</span>
            <div className="hw-btn-group">
              <button
                className={`hw-btn ${algoType === "bit-shifting" ? "hw-btn-active" : ""}`}
                onClick={() => changeAlgo("bit-shifting")}
                disabled={isPlaying}
              >
                Dịch Bit tuần tự
              </button>
              <button
                className={`hw-btn ${algoType === "brian-kernighan" ? "hw-btn-active" : ""}`}
                onClick={() => changeAlgo("brian-kernighan")}
                disabled={isPlaying}
              >
                Brian Kernighan (Tối ưu)
              </button>
            </div>
          </div>

          <div className="hw-config-group">
            <span className="hw-toolbar-label">Nhập số tùy chỉnh</span>
            <form onSubmit={handleCustomInputSubmit} className="hw-input-form">
              <input
                type="number"
                min="0"
                max="4294967295"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                disabled={isPlaying}
                className="hw-text-input"
              />
              <button
                type="submit"
                className="hw-btn hw-btn-submit"
                disabled={isPlaying}
              >
                Áp dụng
              </button>
            </form>
          </div>
        </div>

        {/* Presets */}
        <div className="hw-presets">
          <span className="hw-presets-label">Mẫu nhanh:</span>
          {PRESETS.map((p) => (
            <button
              key={p.val}
              className={`hw-btn hw-btn-preset ${inputValue === p.val ? "hw-btn-active" : ""}`}
              onClick={() => {
                changeInput(p.val);
              }}
              disabled={isPlaying}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="hw-toolbar">
          <div className="hw-toolbar-group">
            <span className="hw-toolbar-label">Tốc độ chạy</span>
            <div className="hw-btn-group">
              {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                <button
                  key={s}
                  className={`hw-btn ${speed === s ? "hw-btn-active" : ""}`}
                  onClick={() => setSpeed(s)}
                  disabled={isPlaying}
                >
                  {s === "slow" ? "Chậm" : s === "normal" ? "Vừa" : "Nhanh"}
                </button>
              ))}
            </div>
          </div>

          <div className="hw-toolbar-group">
            <span className="hw-toolbar-label">Điều khiển</span>
            <div className="hw-btn-group">
              {!isPlaying ? (
                <button
                  className="hw-btn hw-btn-primary"
                  onClick={play}
                  disabled={isFinished}
                >
                  ▶ {totalSteps > 0 ? "Tiếp tục" : "Bắt đầu"}
                </button>
              ) : (
                <button className="hw-btn hw-btn-warning" onClick={pause}>
                  ⏸ Tạm dừng
                </button>
              )}
              <button
                className="hw-btn"
                onClick={stepBackward}
                disabled={isPlaying || currentStepIndex <= 0}
              >
                ⏮ Quay lại
              </button>
              <button
                className="hw-btn"
                onClick={stepForward}
                disabled={isPlaying || isFinished}
              >
                ⏭ Bước tiếp
              </button>
              <button className="hw-btn hw-btn-danger" onClick={reset}>
                ↺ Đặt lại
              </button>
            </div>
          </div>

          <div className="hw-toolbar-group">
            <span className="hw-toolbar-label">Tiến trình</span>
            <span className="hw-progress-text">
              {currentStepIndex >= 0 ? currentStepIndex + 1 : 0} / {totalSteps || "—"}
            </span>
          </div>
        </div>

        {/* Explanation Alert */}
        {currentStep && (
          <div className="hw-description-box">
            <div className="hw-description-header">
              <span>💡 Thuyết minh bước hiện tại:</span>
              <span className="hw-step-badge">Bước {currentStepIndex + 1}</span>
            </div>
            <p className="hw-description-text">{currentStep.description}</p>
          </div>
        )}

        {/* Main Visualization Grid (32-bit layout) */}
        <div className="hw-section">
          <h3 className="hw-section-title">
            🧮 Trạng thái nhị phân 32-bit (remainingInteger = {currentStep ? currentStep.remainingInteger : inputValue})
          </h3>
          <div className="hw-bit-grid">
            {/* Displaying 32 bits */}
            {(currentStep ? currentStep.binaryArray : getBitStates(inputValue)).map((bit) => {
              let cellClass = "hw-bit-cell";
              if (bit.isChecking) cellClass += " hw-bit-checking";
              if (bit.value === "1") cellClass += " hw-bit-active";
              if (bit.isCleared) cellClass += " hw-bit-cleared";

              return (
                <div key={bit.index} className={cellClass}>
                  <span className="hw-bit-pos">b{bit.index}</span>
                  <span className="hw-bit-val">{bit.value}</span>
                </div>
              );
            })}
          </div>

          {/* Indicators / Legend */}
          <div className="hw-legend">
            <div className="hw-legend-item">
              <span className="hw-legend-color hw-legend-zero" />
              <span>Bit 0</span>
            </div>
            <div className="hw-legend-item">
              <span className="hw-legend-color hw-legend-one" />
              <span>Bit 1</span>
            </div>
            <div className="hw-legend-item">
              <span className="hw-legend-color hw-legend-check" />
              <span>Đang kiểm tra</span>
            </div>
            {algoType === "brian-kernighan" && (
              <div className="hw-legend-item">
                <span className="hw-legend-color hw-legend-clear" />
                <span>Vừa bị xóa</span>
              </div>
            )}
          </div>
        </div>

        {/* Brian Kernighan Math Panel */}
        {algoType === "brian-kernighan" && currentStep?.brianKernighanState && (
          <div className="hw-section hw-math-panel animate-fade-in">
            <h3 className="hw-section-title">🔍 Chi tiết phép tính nhị phân: n & (n - 1)</h3>
            <div className="hw-math-layout">
              <div className="hw-math-row">
                <span className="hw-math-label">n ({currentStep.brianKernighanState.n})</span>
                <span className="hw-math-binary">{currentStep.brianKernighanState.nBinary}</span>
              </div>
              <div className="hw-math-row">
                <span className="hw-math-label">n - 1 ({currentStep.brianKernighanState.nMinusOne})</span>
                <span className="hw-math-binary">{currentStep.brianKernighanState.nMinusOneBinary}</span>
              </div>
              <div className="hw-math-divider" />
              <div className="hw-math-row hw-math-result">
                <span className="hw-math-label">n & (n - 1) = {currentStep.brianKernighanState.resultOfAnd}</span>
                <span className="hw-math-binary">{currentStep.brianKernighanState.resultOfAndBinary}</span>
              </div>
            </div>
          </div>
        )}

        {/* Current State / Result Counter */}
        <div className="hw-status-row">
          <div className="hw-status-card">
            <span className="hw-status-title">Biến đếm hiện tại (countOfOneBits)</span>
            <span className="hw-status-value">{currentStep ? currentStep.countOfOneBits : 0}</span>
          </div>

          <div className="hw-status-card">
            <span className="hw-status-title">Biểu diễn thập phân (Decimal)</span>
            <span className="hw-status-value">{currentStep ? currentStep.remainingInteger : inputValue}</span>
          </div>
        </div>

        {/* Log Console */}
        <LogConsole logs={logs} />
      </div>
    </div>
  );
}

function LogConsole({ logs }: { logs: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const typeColor: Record<LogEntry["type"], string> = {
    info: "#93c5fd",
    step: "#e879f9",
    success: "#34d399",
    warning: "#fbbf24",
  };

  return (
    <div className="hw-log">
      <div className="hw-log-header">📋 Nhật ký chạy thuật toán (Execution Log)</div>
      <div className="hw-log-body">
        {logs.length === 0 && (
          <div className="hw-log-empty">Nhấn "Bắt đầu" hoặc "Bước tiếp" để xem nhật ký chạy chi tiết ở đây...</div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className="hw-log-entry"
            style={{ color: typeColor[log.type] }}
          >
            <span className="hw-log-time">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="hw-log-text">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// Helper to compute states for static initial renders
function getBitStates(n: number): BitState[] {
  const binaryStr = (n >>> 0).toString(2).padStart(32, "0");
  return Array.from({ length: 32 }, (_, idx) => {
    const bitPos = 31 - idx;
    return {
      index: bitPos,
      value: binaryStr[idx] as "0" | "1",
      isChecking: false,
      isCleared: false,
    };
  });
}
