import React, { useState, useMemo, useEffect, useRef } from "react";

const CODE_LINES = [
  "function backtrack() {", // 0
  "  if (currentArray.length === n) {", // 1
  "    results.push(currentArray.join(''));", // 2
  "    return;", // 3
  "  }", // 4
  "  for (const char of ['0', '1']) {", // 5
  "    currentArray.push(char); // THỬ", // 6
  "    backtrack();             // ĐI TIẾP", // 7
  "    currentArray.pop();      // QUAY LUI", // 8
  "  }", // 9
  "}", // 10
];

interface VisualizerStep {
  lineIndex: number;
  currentArray: string[];
  results: string[];
  note: string;
}

const BackTrackVisualizer = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetLengthN = 2; // N=2 for simpler visualization

  const steps = useMemo(() => {
    const recordedSteps: VisualizerStep[] = [];
    const results: string[] = [];
    const currentArray: string[] = [];

    const record = (lineIndex: number, note: string) => {
      recordedSteps.push({
        lineIndex,
        currentArray: [...currentArray],
        results: [...results],
        note,
      });
    };

    const backtrack = () => {
      record(0, "Gọi hàm backtrack()");
      record(1, `Kiểm tra xem mảng tạm đã đủ ${targetLengthN} ký tự chưa?`);

      const isLengthReached = currentArray.length === targetLengthN;

      if (isLengthReached) {
        const resultString = currentArray.join("");
        results.push(resultString);
        record(2, `Đã đủ! Ghép mảng thành chuỗi '${resultString}' và thêm vào kết quả.`);
        record(3, "Kết thúc nhánh này (return) và quay lại.");
        return;
      }

      record(5, "Chưa đủ, bắt đầu duyệt qua các lựa chọn: '0' và '1'");
      const choices = ["0", "1"];

      for (const char of choices) {
        currentArray.push(char);
        record(6, `[THỬ]: Đưa ký tự '${char}' vào mảng tạm.`);

        record(7, `[ĐI TIẾP]: Gọi đệ quy backtrack() để điền vị trí tiếp theo.`);
        backtrack();

        currentArray.pop();
        record(8, `[QUAY LUI]: Rút ký tự '${char}' ra khỏi mảng để nhường chỗ cho lựa chọn khác.`);
      }

      record(10, "Kết thúc vòng lặp cho các lựa chọn tại vị trí này.");
    };

    backtrack();

    // Thêm bước cuối cùng
    recordedSteps.push({
      lineIndex: -1,
      currentArray: [],
      results: [...results],
      note: "Chương trình kết thúc! Đã tìm được tất cả kết quả.",
    });

    return recordedSteps;
  }, []);

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentStepIndex === totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        handleNext();
      }, 1500); // 1.5 step per second
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: "20px", width: "100%", boxSizing: "border-box" }}>
      <h2>Trực quan hóa thuật toán Backtracking (N = {targetLengthN})</h2>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button onClick={handlePrev} disabled={currentStepIndex === 0} style={buttonStyle}>
          Previous
        </button>
        <button onClick={togglePlay} style={{ ...buttonStyle, backgroundColor: isPlaying ? "#ff9800" : "#4caf50", color: "white" }}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={handleNext} disabled={currentStepIndex === totalSteps - 1} style={buttonStyle}>
          Next
        </button>
        <button onClick={handleReset} style={buttonStyle}>
          Reset
        </button>
        <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
          Bước: {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* Main Content: Horizontal Layout */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Code Panel */}
        <div style={{ flex: 1, minWidth: "400px", backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
          <h3 style={{ marginTop: 0, color: "#9cdcfe" }}>Mã Code</h3>
          <pre style={{ fontSize: "15px", lineHeight: "1.5", margin: 0 }}>
            {CODE_LINES.map((line, index) => {
              const isHighlighted = currentStep.lineIndex === index;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: isHighlighted ? "#063970" : "transparent",
                    borderLeft: isHighlighted ? "4px solid #4daafc" : "4px solid transparent",
                    paddingLeft: "8px",
                    display: "flex",
                  }}
                >
                  <span style={{ width: "30px", color: "#858585", userSelect: "none" }}>{index + 1}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* State Panel */}
        <div style={{ flex: 1, minWidth: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>

          <div style={{ backgroundColor: "#e3f2fd", padding: "15px", borderRadius: "8px", border: "1px solid #90caf9" }}>
            <h3 style={{ marginTop: 0, color: "#1565c0" }}>Giải thích (Ghi chú)</h3>
            <p style={{ fontSize: "16px", margin: 0 }}>
              <strong>{currentStep.note}</strong>
            </p>
          </div>

          <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
            <h3 style={{ marginTop: 0, color: "#424242" }}>Trạng thái bộ nhớ</h3>

            <div style={{ marginBottom: "15px" }}>
              <strong>Mảng tạm (`currentArray`):</strong>
              <div style={{ display: "flex", gap: "5px", marginTop: "10px", minHeight: "40px" }}>
                {currentStep.currentArray.length === 0 && <span style={{ color: "#9e9e9e", fontStyle: "italic", alignSelf: "center" }}>[ Rỗng ]</span>}
                {currentStep.currentArray.map((char, idx) => (
                  <div key={idx} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", border: "2px solid #2196f3", borderRadius: "4px", fontSize: "18px", fontWeight: "bold" }}>
                    {char}
                  </div>
                ))}
                {/* Empty slots placeholders */}
                {Array.from({ length: targetLengthN - currentStep.currentArray.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", border: "2px dashed #bdbdbd", borderRadius: "4px" }} />
                ))}
              </div>
            </div>

            <div>
              <strong>Kết quả gom được (`results`):</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px", minHeight: "30px" }}>
                {currentStep.results.length === 0 && <span style={{ color: "#9e9e9e", fontStyle: "italic" }}>[ Chưa có kết quả ]</span>}
                {currentStep.results.map((res, idx) => (
                  <div key={idx} style={{ padding: "5px 10px", backgroundColor: "#4caf50", color: "white", borderRadius: "15px", fontSize: "14px", fontWeight: "bold" }}>
                    {res}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: "14px",
  cursor: "pointer",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#fff",
};

export default BackTrackVisualizer;
