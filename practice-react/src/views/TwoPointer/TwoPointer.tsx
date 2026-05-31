import { useEffect, useRef, useState } from "react";
import { useTwoPointer, type PlaybackSpeed, type TwoPointerLogEntry } from "./useTwoPointer";
import "./TwoPointer.css";

const PRESETS = [
  { label: "Target 28 (Tìm thấy)", array: [2, 5, 8, 12, 16, 23, 38, 56], target: 28 },
  { label: "Target 8 (Tìm thấy)", array: [1, 3, 5, 7, 9, 11], target: 8 },
  { label: "Số âm (Tìm thấy)", array: [-10, -3, 0, 5, 9, 15], target: 6 },
  { label: "Không có kết quả", array: [2, 4, 6, 8, 10], target: 15 },
];

const TWO_SUM_CODE = [
  "function twoSumSorted(numbers, target) {",                  // 0
  "  let leftIndex = 0;",                                        // 1
  "  let rightIndex = numbers.length - 1;",                      // 2
  "  ",                                                          // 3
  "  while (leftIndex < rightIndex) {",                          // 4
  "    // Tính tổng hiện tại của hai con trỏ",                   // 5
  "    ",                                                        // 6
  "    const currentSum = numbers[leftIndex] + numbers[rightIndex];", // 7
  "    const isSumEqualToTarget = currentSum === target;",       // 8
  "    ",                                                        // 9
  "    if (isSumEqualToTarget) {",                               // 10
  "      const firstIndexResult = leftIndex + 1;",               // 11
  "      const secondIndexResult = rightIndex + 1;",             // 12
  "      return [firstIndexResult, secondIndexResult];",         // 13
  "    }",                                                       // 14
  "    ",                                                        // 15
  "    // Nếu tổng quá nhỏ, ta cần dịch trái sang phải",         // 16
  "    const isSumLessThanTarget = currentSum < target;",        // 17
  "    if (isSumLessThanTarget) {",                              // 18
  "      leftIndex = leftIndex + 1;",                            // 19
  "    }",                                                       // 20
  "    ",                                                        // 21
  "    // Nếu tổng quá lớn, ta cần dịch phải sang trái",         // 22
  "    const isSumGreaterThanTarget = currentSum > target;",     // 23
  "    if (isSumGreaterThanTarget) {",                           // 24
  "      rightIndex = rightIndex - 1;",                          // 25
  "    }",                                                       // 26
  "  }",                                                         // 27
  "  ",                                                          // 28
  "  return [];",                                                // 29
  "}"                                                            // 30
];

export default function TwoPointer() {
  const {
    arrayData,
    targetVal,
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
    changeInputArray,
    changeTarget,
  } = useTwoPointer();

  const [customArrayText, setCustomArrayText] = useState(arrayData.join(", "));
  const [customTargetText, setCustomTargetText] = useState(targetVal.toString());

  // Đồng bộ hóa text input khi presets được bấm
  useEffect(() => {
    setCustomArrayText(arrayData.join(", "));
    setCustomTargetText(targetVal.toString());
  }, [arrayData, targetVal]);

  const activeLines = currentStep ? currentStep.activeLineIndices : [];

  // Xử lý nộp mảng/target tùy chỉnh
  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse mảng
    const parsedArray = customArrayText
      .split(",")
      .map((item) => parseInt(item.trim(), 10))
      .filter((num) => !isNaN(num));

    const parsedTarget = parseInt(customTargetText, 10);

    if (parsedArray.length < 2) {
      alert("Mảng phải có ít nhất 2 phần tử số!");
      return;
    }

    // Kiểm tra mảng đã sắp xếp chưa
    const isSorted = parsedArray.every((val, index) => {
      const isFirstItem = index === 0;
      if (isFirstItem) return true;
      const isSortedAscending = val >= parsedArray[index - 1];
      return isSortedAscending;
    });

    if (!isSorted) {
      alert("Hai con trỏ đối đầu yêu cầu một MẢNG ĐÃ SẮP XẾP TĂNG DẦN (Sorted Array)! Hãy nhập các số tăng dần.");
      return;
    }

    if (isNaN(parsedTarget)) {
      alert("Target phải là một số nguyên hợp lệ!");
      return;
    }

    changeInputArray(parsedArray);
    changeTarget(parsedTarget);
  };

  // ============================================================
  //  State & Logic cho phần Bài tập thực hành
  // ============================================================
  const [exerciseCode, setExerciseCode] = useState<string>(
`function isPalindrome(s) {
  // Chỉ lấy ký tự chữ cái và số, chuyển thành chữ thường (English: clean string)
  const cleanStr = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Khởi tạo con trỏ trái và phải
  let leftIndex = 0;
  let rightIndex = cleanStr.length - 1;
  
  // Viết logic Two Pointer của bạn dưới đây
  while (leftIndex < rightIndex) {
    const leftChar = cleanStr[leftIndex];
    const rightChar = cleanStr[rightIndex];
    
    const areCharsDifferent = (leftChar !== rightChar);
    if (areCharsDifferent) {
      return false;
    }
    
    leftIndex = leftIndex + 1;
    rightIndex = rightIndex - 1;
  }
  
  return true;
}`
  );

  const [verifyResults, setVerifyResults] = useState<{
    status: "idle" | "success" | "fail";
    message: string;
    details?: { input: string; expected: boolean; actual: boolean; passed: boolean }[];
  }>({ status: "idle", message: "" });

  const handleVerifyExercise = () => {
    try {
      // Dùng new Function để build hàm động trong môi trường local
      // eslint-disable-next-line no-new-func
      const userFunc = new Function(`return (${exerciseCode})`)();
      
      if (typeof userFunc !== "function") {
        setVerifyResults({
          status: "fail",
          message: "Lỗi: Không tìm thấy định nghĩa hàm hợp lệ! Đảm bảo khai báo 'function isPalindrome(s) ...'",
        });
        return;
      }

      const testCases = [
        { input: "racecar", expected: true },
        { input: "hello", expected: false },
        { input: "Aba", expected: true },
        { input: "12321", expected: true },
        { input: "A man, a plan, a canal: Panama", expected: true },
        { input: "race a car", expected: false },
      ];

      const testResults = testCases.map((tc) => {
        try {
          const actual = userFunc(tc.input);
          return {
            input: tc.input,
            expected: tc.expected,
            actual: typeof actual === "boolean" ? actual : false,
            passed: actual === tc.expected,
          };
        } catch (err: any) {
          return {
            input: tc.input,
            expected: tc.expected,
            actual: false,
            passed: false,
            error: err.message,
          };
        }
      });

      const allPassed = testResults.every((tr) => tr.passed);

      if (allPassed) {
        setVerifyResults({
          status: "success",
          message: "🎉 TUYỆT VỜI! Tất cả bộ kiểm thử đều đã VƯỢT QUA thành công!",
          details: testResults,
        });
      } else {
        setVerifyResults({
          status: "fail",
          message: "❌ Thất bại: Có một số trường hợp trả về sai giá trị.",
          details: testResults,
        });
      }
    } catch (error: any) {
      setVerifyResults({
        status: "fail",
        message: `Lỗi biên dịch mã nguồn: ${error.message}`,
      });
    }
  };

  return (
    <div className="tp-app-layout">
      {/* CỘT TRÁI - Mã nguồn thuật toán & Giải thích */}
      <div className="tp-section tp-code-section">
        <h3 className="tp-section-title">💻 Code Algorithm (JavaScript)</h3>
        <div className="tp-code-container">
          {TWO_SUM_CODE.map((line, idx) => {
            const isActive = activeLines.includes(idx);
            return (
              <div
                key={idx}
                className={`tp-code-line ${isActive ? "tp-code-line-active" : ""}`}
              >
                <span className="tp-code-number">{idx + 1}</span>
                <pre style={{ margin: 0, whiteSpace: "pre", fontFamily: "inherit" }}>
                  {line || " "}
                </pre>
              </div>
            );
          })}
        </div>

        <div className="tp-explain-card">
          <h4>💡 Thuật ngữ bài học</h4>
          <ul>
            <li>
              <strong>Sorted Array (Mảng đã sắp xếp)</strong>: Điều kiện tiên quyết để áp dụng Two Pointer hướng đối đầu. Nếu mảng chưa sắp xếp, việc di chuyển con trỏ sẽ không có quy luật đúng đắn.
            </li>
            <li>
              <strong>Index Pointer (Chỉ số con trỏ)</strong>: Biến lưu trữ vị trí trong mảng (như <code>leftIndex</code> và <code>rightIndex</code>), tránh việc tạo thêm mảng phụ tốn bộ nhớ.
            </li>
            <li>
              <strong>Complexity (Độ phức tạp)</strong>: Giúp giảm đáng kể số lần duyệt mảng từ <code>O(n²)</code> xuống còn tuyến tính <code>O(n)</code>.
            </li>
          </ul>
        </div>
      </div>

      {/* CỘT PHẢI - Visualizer & Bảng điều khiển */}
      <div className="tp-container">
        <header className="tp-header">
          <h1 className="tp-title">
            <span style={{ fontSize: "2rem" }}>👉👈</span>
            Two Pointer Visualizer
          </h1>
          <p className="tp-subtitle">
            Trực quan sinh động kỹ thuật Hai Con Trỏ thông qua bài toán kinh điển **Two Sum II (Mảng đã sắp xếp)**
          </p>
        </header>

        {/* Thiết lập tham số */}
        <div className="tp-section">
          <h3 className="tp-section-title">⚙️ Cấu hình mảng & Target</h3>
          <div className="tp-config-row">
            <div className="tp-config-group">
              <span className="tp-toolbar-label">Nhập mảng (cách nhau bởi dấu phẩy)</span>
              <form onSubmit={handleConfigSubmit} className="tp-input-form">
                <input
                  type="text"
                  value={customArrayText}
                  onChange={(e) => setCustomArrayText(e.target.value)}
                  disabled={isPlaying}
                  className="tp-text-input"
                  placeholder="Ví dụ: 2, 5, 8, 12"
                />
              </form>
            </div>

            <div className="tp-config-group">
              <span className="tp-toolbar-label">Nhập số Target</span>
              <form onSubmit={handleConfigSubmit} className="tp-input-form">
                <input
                  type="number"
                  value={customTargetText}
                  onChange={(e) => setCustomTargetText(e.target.value)}
                  disabled={isPlaying}
                  className="tp-text-input"
                  placeholder="Ví dụ: 28"
                />
                <button
                  type="submit"
                  className="tp-btn-submit"
                  disabled={isPlaying}
                >
                  Áp dụng
                </button>
              </form>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <span className="tp-toolbar-label" style={{ display: "block", marginBottom: "8px" }}>Bộ dữ liệu mẫu (Presets)</span>
            <div className="tp-presets">
              {PRESETS.map((p, i) => {
                const isSelected =
                  arrayData.length === p.array.length &&
                  arrayData.every((val, index) => val === p.array[index]) &&
                  targetVal === p.target;
                return (
                  <button
                    key={i}
                    className={`tp-btn-preset ${isSelected ? "tp-btn-active" : ""}`}
                    onClick={() => {
                      changeInputArray(p.array);
                      changeTarget(p.target);
                    }}
                    disabled={isPlaying}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trình điều khiển mô phỏng */}
        <div className="tp-toolbar">
          <div className="tp-toolbar-group">
            <span className="tp-toolbar-label">Tốc độ chạy</span>
            <div className="tp-btn-group">
              {(["slow", "normal", "fast"] as PlaybackSpeed[]).map((s) => (
                <button
                  key={s}
                  className={`tp-btn ${speed === s ? "tp-btn-active" : ""}`}
                  onClick={() => setSpeed(s)}
                  disabled={isPlaying}
                >
                  {s === "slow" ? "Chậm" : s === "normal" ? "Vừa" : "Nhanh"}
                </button>
              ))}
            </div>
          </div>

          <div className="tp-toolbar-group">
            <span className="tp-toolbar-label">Bảng Điều Khiển</span>
            <div className="tp-btn-group">
              {!isPlaying ? (
                <button
                  className="tp-btn tp-btn-primary"
                  onClick={play}
                  disabled={isFinished}
                >
                  ▶ {totalSteps > 0 ? "Tiếp tục" : "Bắt đầu"}
                </button>
              ) : (
                <button className="tp-btn tp-btn-warning" onClick={pause}>
                  ⏸ Tạm dừng
                </button>
              )}
              <button
                className="tp-btn"
                onClick={stepBackward}
                disabled={isPlaying || currentStepIndex <= 0}
              >
                ⏮ Quay lại
              </button>
              <button
                className="tp-btn"
                onClick={stepForward}
                disabled={isPlaying || isFinished}
              >
                ⏭ Bước tiếp
              </button>
              <button className="tp-btn tp-btn-danger" onClick={reset}>
                ↺ Đặt lại
              </button>
            </div>
          </div>

          <div className="tp-toolbar-group">
            <span className="tp-toolbar-label">Tiến trình</span>
            <span className="tp-progress-text">
              {currentStepIndex >= 0 ? currentStepIndex + 1 : 0} / {totalSteps || "—"}
            </span>
          </div>
        </div>

        {/* Thuyết minh mô tả bước hiện tại */}
        {currentStep && (
          <div className="tp-description-box">
            <div className="tp-description-header">
              <span>💡 Thuyết minh từ thầy giáo:</span>
              <span className="tp-step-badge">Bước {currentStepIndex + 1}</span>
            </div>
            <p className="tp-description-text">{currentStep.description}</p>
          </div>
        )}

        {/* KHÔNG GIAN TRỰC QUAN HÓA (Horizontal DSA Canvas) */}
        <div className="tp-section tp-visualization-board">
          <h3 className="tp-section-title" style={{ width: "100%" }}>
            🧮 Trực quan trạng thái con trỏ và giá trị mảng
          </h3>
          <div className="tp-array-viewport">
            <div className="tp-array-container">
              {arrayData.map((val, idx) => {
                const isLeft = currentStep ? currentStep.leftIndex === idx : false;
                const isRight = currentStep ? currentStep.rightIndex === idx : false;
                const isFound = currentStep ? currentStep.matchState === "found" : false;

                const isLeftActive = isLeft && !isFound;
                const isRightActive = isRight && !isFound;
                const isBothActive = isLeft && isRight && !isFound;
                const isFoundActive = isFound && (isLeft || isRight);

                let cardClass = "tp-array-card";
                if (isBothActive) cardClass += " tp-card-both-active";
                else if (isLeftActive) cardClass += " tp-card-left-active";
                else if (isRightActive) cardClass += " tp-card-right-active";
                else if (isFoundActive) cardClass += " tp-card-found";

                return (
                  <div key={idx} className={cardClass}>
                    {/* Bảng tên con trỏ bay lên */}
                    {isLeft && (
                      <span className="tp-pointer-badge tp-pointer-left">
                        Left (L)
                        <span className="tp-pointer-arrow" />
                      </span>
                    )}
                    {isRight && (
                      <span className="tp-pointer-badge tp-pointer-right" style={{ top: isLeft ? "-68px" : "-38px" }}>
                        Right (R)
                        <span className="tp-pointer-arrow" />
                      </span>
                    )}

                    <span className="tp-array-value">{val}</span>
                    <span className="tp-array-index">idx: {idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tp-legend">
            <div className="tp-legend-item">
              <span className="tp-legend-color tp-legend-left" />
              <span>Con trỏ Trái (Left)</span>
            </div>
            <div className="tp-legend-item">
              <span className="tp-legend-color tp-legend-right" />
              <span>Con trỏ Phải (Right)</span>
            </div>
            <div className="tp-legend-item">
              <span className="tp-legend-color tp-legend-found" />
              <span>Cặp số thỏa mãn (Found)</span>
            </div>
          </div>
        </div>

        {/* Thông tin thống kê trạng thái */}
        <div className="tp-status-row">
          <div className="tp-status-card">
            <span className="tp-status-title">Con trỏ Trái (Left)</span>
            <span className="tp-status-value" style={{ color: "#22d3ee" }}>
              {currentStep ? `idx ${currentStep.leftIndex} (val ${arrayData[currentStep.leftIndex]})` : `idx 0 (val ${arrayData[0]})`}
            </span>
          </div>

          <div className="tp-status-card">
            <span className="tp-status-title">Con trỏ Phải (Right)</span>
            <span className="tp-status-value" style={{ color: "#a78bfa" }}>
              {currentStep ? `idx ${currentStep.rightIndex} (val ${arrayData[currentStep.rightIndex]})` : `idx ${arrayData.length - 1} (val ${arrayData[arrayData.length - 1]})`}
            </span>
          </div>

          <div className="tp-status-card">
            <span className="tp-status-title">Tổng Hai Số & Target</span>
            <span className="tp-status-value" style={{ color: currentStep?.matchState === "found" ? "#34d399" : "#fbbf24" }}>
              {currentStep ? `${currentStep.currentSum}` : "—"} / {targetVal}
            </span>
          </div>
        </div>

        {/* Console Logs */}
        <div className="tp-log">
          <div className="tp-log-header">📋 Nhật ký thực thi thuật toán (Execution Log)</div>
          <div className="tp-log-body">
            {logs.length === 0 && (
              <div className="tp-log-empty">Nhấn "Bắt đầu" hoặc "Bước tiếp" để hiển thị nhật ký chạy...</div>
            )}
            {logs.map((log, index) => {
              const colors: Record<TwoPointerLogEntry["type"], string> = {
                info: "#93c5fd",
                step: "#e879f9",
                success: "#34d399",
                warning: "#fbbf24",
                error: "#ef4444",
              };
              return (
                <div key={index} className="tp-log-entry" style={{ color: colors[log.type] }}>
                  <span className="tp-log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="tp-log-text">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BÀI TẬP THỰC HÀNH TƯƠNG TÁC (Interactive Exercise Playground) */}
        <div className="tp-section tp-exercise-section">
          <h3 className="tp-section-title" style={{ color: "#fbbf24" }}>
            ✏️ Bài tập thực hành: Valid Palindrome (Kiểm tra chuỗi đối xứng)
          </h3>
          <div className="tp-exercise-prompt">
            <h4>Yêu cầu:</h4>
            <p>
              Sử dụng kỹ thuật <strong>Two Pointer</strong> hướng đối đầu để kiểm tra một chuỗi có đối xứng (đọc xuôi ngược đều giống nhau) hay không. Bỏ qua chữ hoa thường và ký tự không phải chữ/số.
            </p>
            <div className="tp-exercise-cases">
              <div className="tp-case-item">
                <span>Input: "racecar"</span>
                <span>Expected: true</span>
              </div>
              <div className="tp-case-item">
                <span>Input: "hello"</span>
                <span>Expected: false</span>
              </div>
              <div className="tp-case-item">
                <span>Input: "A man, a plan, a canal: Panama"</span>
                <span>Expected: true</span>
              </div>
            </div>
          </div>

          <div className="tp-editor-panel">
            <div className="tp-editor-header">
              <span>Trình soạn thảo code (JavaScript)</span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Gợi ý: Dùng con trỏ leftIndex, rightIndex</span>
            </div>
            <textarea
              className="tp-editor-textarea"
              value={exerciseCode}
              onChange={(e) => setExerciseCode(e.target.value)}
              spellCheck={false}
            />
            <div className="tp-verify-panel">
              <button className="tp-btn-verify" onClick={handleVerifyExercise}>
                🚀 Xác thực đáp án (Run Tests)
              </button>

              {verifyResults.status !== "idle" && (
                <div className={`tp-verify-result ${verifyResults.status === "success" ? "tp-result-success" : "tp-result-fail"}`}>
                  {verifyResults.status === "success" ? "✅ " : "❌ "}
                  {verifyResults.message}
                </div>
              )}
            </div>
          </div>

          {verifyResults.details && (
            <div style={{ marginTop: "8px" }}>
              <span className="tp-toolbar-label" style={{ display: "block", marginBottom: "8px" }}>Chi tiết các Test Cases:</span>
              <div className="tp-exercise-cases">
                {verifyResults.details.map((dt, i) => (
                  <div
                    key={i}
                    className="tp-case-item"
                    style={{
                      borderLeft: `3px solid ${dt.passed ? "#10b981" : "#ef4444"}`,
                      background: dt.passed ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
                    }}
                  >
                    <span>Input: "{dt.input}"</span>
                    <span style={{ color: dt.passed ? "#10b981" : "#ef4444" }}>
                      Expected: {dt.expected.toString()} | Actual: {dt.actual.toString()} — {dt.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
