import React, { useState } from "react";
import { useBiSearch, type Speed } from "./useBiSearch";
import "./BinarySearch.css";

// ============================================================
//  Code Display Definition
// ============================================================

const CODE_LINES = [
    { num: 1, text: "function binarySearch(arr: number[], target: number) {" },
    { num: 2, text: "  let lowIndex = 0;" },
    { num: 3, text: "  let highIndex = arr.length - 1;" },
    { num: 4, text: "" },
    { num: 5, text: "  while (lowIndex <= highIndex) {" },
    { num: 6, text: "    const isSearchRangeValid = lowIndex <= highIndex;" },
    { num: 7, text: "" },
    { num: 8, text: "    const midIndex = Math.floor((lowIndex + highIndex) / 2);" },
    { num: 9, text: "    const midValue = arr[midIndex];" },
    { num: 10, text: "" },
    { num: 11, text: "    const isTargetFound = midValue === target;" },
    { num: 12, text: "    if (isTargetFound) {" },
    { num: 13, text: "      return midIndex;" },
    { num: 14, text: "    }" },
    { num: 15, text: "" },
    { num: 16, text: "    const isTargetInLeftHalf = target < midValue;" },
    { num: 17, text: "    if (isTargetInLeftHalf) {" },
    { num: 18, text: "      highIndex = midIndex - 1;" },
    { num: 19, text: "    } else {" },
    { num: 20, text: "      lowIndex = midIndex + 1;" },
    { num: 21, text: "    }" },
    { num: 22, text: "  }" },
    { num: 23, text: "  return -1;" },
    { num: 24, text: "}" }
];

// Inline State Value Printer
function getInlineVal(lineNum: number, step: any): string | null {
    if (!step) return null;
    const { lowIndex, highIndex, midIndex, midValue, isSearchRangeValid, isTargetFound, isTargetInLeftHalf, phase } = step;

    switch (lineNum) {
        case 2:
            return "lowIndex = 0";
        case 3:
            return `highIndex = ${highIndex}`;
        case 5:
            return `lowIndex(${lowIndex}) <= highIndex(${highIndex}) là ${lowIndex <= highIndex}`;
        case 6:
            return isSearchRangeValid !== null ? `isSearchRangeValid = ${isSearchRangeValid}` : null;
        case 8:
            return midIndex !== -1 ? `midIndex = ${midIndex}` : null;
        case 9:
            return midValue !== null ? `midValue = ${midValue}` : null;
        case 11:
            return isTargetFound !== null ? `isTargetFound = ${isTargetFound}` : null;
        case 13:
            return step.foundIndex !== -1 ? `Trả về ${step.foundIndex}` : null;
        case 16:
            return isTargetInLeftHalf !== null ? `isTargetInLeftHalf = ${isTargetInLeftHalf}` : null;
        case 18:
            return phase === "update_high" ? `highIndex = ${highIndex}` : null;
        case 20:
            return phase === "update_low" ? `lowIndex = ${lowIndex}` : null;
        case 23:
            return phase === "return_not_found" ? "Trả về -1" : null;
        default:
            return null;
    }
}

// ============================================================
//  Presets Data
// ============================================================

interface Preset {
    id: string;
    label: string;
    array: number[];
    target: number;
}

const PRESETS: Preset[] = [
    {
        id: "standard",
        label: "Tìm thông thường (Found)",
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        target: 23,
    },
    {
        id: "boundary-first",
        label: "Phần tử đầu mảng",
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        target: 2,
    },
    {
        id: "boundary-last",
        label: "Phần tử cuối mảng",
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        target: 91,
    },
    {
        id: "not-found",
        label: "Không tìm thấy (Not Found)",
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        target: 30,
    },
    {
        id: "single-found",
        label: "Mảng có 1 phần tử (Found)",
        array: [42],
        target: 42,
    },
];

// ============================================================
//  Component
// ============================================================

export default function BinarySearch() {
    const {
        arr,
        target,
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
        updateArray,
        updateTarget,
    } = useBiSearch();

    const [activePreset, setActivePreset] = useState<string>("standard");
    const [arrayInput, setArrayInput] = useState<string>(arr.join(", "));
    const [targetInput, setTargetInput] = useState<string>(target.toString());
    const [inputError, setInputError] = useState<string>("");

    // Handle Preset Select
    const selectPreset = (p: Preset) => {
        setActivePreset(p.id);
        setArrayInput(p.array.join(", "));
        setTargetInput(p.target.toString());
        setInputError("");
        updateArray(p.array);
        updateTarget(p.target);
    };

    // Submit custom input arrays or targets
    const handleApplyCustom = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedArr = arrayInput
                .split(",")
                .map((x) => x.trim())
                .filter((x) => x.length > 0)
                .map((x) => {
                    const num = Number(x);
                    if (isNaN(num)) throw new Error("Chứa ký tự không phải số!");
                    return num;
                });

            if (parsedArr.length === 0) {
                throw new Error("Mảng không được để trống!");
            }

            const parsedTarget = Number(targetInput.trim());
            if (isNaN(parsedTarget)) {
                throw new Error("Target phải là một số hợp lệ!");
            }

            // Sort input array
            const sortedArr = [...parsedArr].sort((a, b) => a - b);
            setArrayInput(sortedArr.join(", "));

            setInputError("");
            setActivePreset("custom");
            updateArray(sortedArr);
            updateTarget(parsedTarget);
        } catch (err: any) {
            setInputError(err.message || "Lỗi định dạng dữ liệu đầu vào!");
        }
    };

    // Current Step Variables
    const lowIndex = currentStep ? currentStep.lowIndex : 0;
    const highIndex = currentStep ? currentStep.highIndex : arr.length - 1;
    const midIndex = currentStep ? currentStep.midIndex : -1;
    const midValue = currentStep ? currentStep.midValue : null;
    const foundIndex = currentStep ? currentStep.foundIndex : -1;
    const activeLine = currentStep ? currentStep.activeLine : -1;

    return (
        <div className="bs-container">
            {/* 1. Header */}
            <header className="bs-header">
                <h1 className="bs-title">
                    <span className="bs-title-icon">🔍</span>
                    Binary Search Visualizer
                </h1>
                <p className="bs-subtitle">
                    Trực quan hóa hoạt động của thuật toán **Tìm kiếm nhị phân** trên **Sorted Array**.
                    Học cơ chế chia để trị, quản lý con trỏ và kiểm tra code song song.
                </p>
            </header>

            {/* 2. Presets Selector */}
            <div className="bs-presets">
                {PRESETS.map((p) => (
                    <button
                        key={p.id}
                        className={`bs-btn-preset ${activePreset === p.id ? "active" : ""}`}
                        onClick={() => selectPreset(p)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* 3. Controls & Configuration Toolbar */}
            <form onSubmit={handleApplyCustom} className="bs-toolbar">
                <div className="bs-toolbar-group">
                    <label className="bs-toolbar-label">Mảng Sorted Array</label>
                    <input
                        type="text"
                        className="bs-input-text"
                        value={arrayInput}
                        onChange={(e) => setArrayInput(e.target.value)}
                        placeholder="Ví dụ: 2, 5, 8, 12, 16"
                    />
                </div>

                <div className="bs-toolbar-group">
                    <label className="bs-toolbar-label">Giá Trị Target</label>
                    <input
                        type="text"
                        className="bs-input-text"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        style={{ width: "80px", minWidth: "80px" }}
                        placeholder="Target"
                    />
                </div>

                <button type="submit" className="bs-btn bs-btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Áp dụng
                </button>

                {/* Divider */}
                <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

                {/* Speed Selection */}
                <div className="bs-toolbar-group">
                    <label className="bs-toolbar-label">Tốc độ chạy</label>
                    <div className="bs-speed-group">
                        {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                            <button
                                type="button"
                                key={s}
                                className={`bs-btn-speed ${speed === s ? "active" : ""}`}
                                onClick={() => setSpeed(s)}
                            >
                                {s === "slow" ? "Chậm" : s === "normal" ? "Vừa" : "Nhanh"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="bs-toolbar-group">
                    <label className="bs-toolbar-label">Mô phỏng</label>
                    <div className="bs-btn-group">
                        {/* Prev step */}
                        <button
                            type="button"
                            className="bs-btn"
                            onClick={stepBackward}
                            disabled={isPlaying || currentStepIndex <= 0}
                            title="Quay lại 1 dòng code"
                        >
                            ⏪ Trở lại
                        </button>

                        {/* Play/Pause */}
                        {isPlaying ? (
                            <button
                                type="button"
                                className="bs-btn bs-btn-danger"
                                onClick={pause}
                                title="Tạm dừng mô phỏng"
                            >
                                ⏸ Tạm dừng
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="bs-btn bs-btn-primary"
                                onClick={play}
                                disabled={isFinished}
                                title="Tự động chạy"
                            >
                                ▶ Bắt đầu
                            </button>
                        )}

                        {/* Next step */}
                        <button
                            type="button"
                            className="bs-btn"
                            onClick={stepForward}
                            disabled={isPlaying || isFinished}
                            title="Tiến tới 1 dòng code"
                        >
                            Tiếp tục ⏩
                        </button>

                        {/* Reset */}
                        <button
                            type="button"
                            className="bs-btn"
                            onClick={reset}
                            title="Đặt lại từ đầu"
                        >
                            🔄 Reset
                        </button>
                    </div>
                </div>

                {currentStepIndex >= 0 && (
                    <span className="bs-progress-text">
                        Bước {currentStepIndex + 1}/{totalSteps}
                    </span>
                )}
            </form>

            {inputError && (
                <div style={{ color: "#f87171", textAlign: "center", marginBottom: "16px", fontSize: "0.85rem", fontWeight: "600" }}>
                    ⚠️ Lỗi đầu vào: {inputError}
                </div>
            )}

            {/* 4. Main Arena Layout */}
            <main className="bs-layout-grid">
                {/* Left Column: Visualizer Arena & Description & Semantic Variables */}
                <div className="bs-left-column">
                    {/* Visual Array Arena */}
                    <div className="bs-panel">
                        <h2 className="bs-panel-title">Mảng Trực Quan & Định Vị Con Trỏ</h2>
                        <div className="bs-arena-container">
                            <div className="bs-array-row">
                                {arr.map((val, idx) => {
                                    // Determine cell state
                                    const isDimmed = currentStepIndex >= 0 && (idx < lowIndex || idx > highIndex);
                                    const isActiveSpace = currentStepIndex >= 0 && idx >= lowIndex && idx <= highIndex;
                                    const isMid = currentStepIndex >= 0 && idx === midIndex;
                                    const isFound = currentStepIndex >= 0 && idx === foundIndex;

                                    let cellClass = "bs-cell";
                                    if (isDimmed) cellClass += " bs-cell-dimmed";
                                    if (isActiveSpace) cellClass += " bs-cell-active";
                                    if (isMid) cellClass += " bs-cell-mid";
                                    if (isFound) cellClass += " bs-cell-found";

                                    return (
                                        <div key={idx} className="bs-cell-wrapper">
                                            <div className={cellClass}>
                                                <span className="bs-cell-index">idx: {idx}</span>
                                                <span className="bs-cell-value">{val}</span>
                                            </div>

                                            {/* Display stacked pointers if pointing to this cell */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "8px", width: "100%", alignItems: "center" }}>
                                                {currentStepIndex >= 0 && idx === lowIndex && (
                                                    <div className="bs-pointer bs-pointer-low" style={{ position: "relative" }}>
                                                        <div className="bs-pointer-arrow" />
                                                        <div className="bs-pointer-badge">low ({lowIndex})</div>
                                                    </div>
                                                )}
                                                {currentStepIndex >= 0 && idx === highIndex && (
                                                    <div className="bs-pointer bs-pointer-high" style={{ position: "relative" }}>
                                                        <div className="bs-pointer-arrow" />
                                                        <div className="bs-pointer-badge">high ({highIndex})</div>
                                                    </div>
                                                )}
                                                {currentStepIndex >= 0 && idx === midIndex && (
                                                    <div className="bs-pointer bs-pointer-mid" style={{ position: "relative" }}>
                                                        <div className="bs-pointer-arrow" />
                                                        <div className="bs-pointer-badge">mid ({midIndex})</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step Explanation Banner */}
                        {currentStep && (
                            <div className="bs-description">
                                <div className="bs-description-text">
                                    <strong>💡 Giải thích: </strong>
                                    {currentStep.description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* State Inspect Panel */}
                    <div className="bs-panel">
                        <h2 className="bs-panel-title">Bảng Trạng Thái Biến (Semantic Variables)</h2>
                        <div className="bs-state-grid">
                            <div className="bs-state-card">
                                <div className="bs-state-name">lowIndex</div>
                                <div className="bs-state-val" style={{ color: "#60a5fa" }}>{currentStepIndex >= 0 ? lowIndex : 0}</div>
                            </div>
                            <div className="bs-state-card">
                                <div className="bs-state-name">highIndex</div>
                                <div className="bs-state-val" style={{ color: "#f87171" }}>{currentStepIndex >= 0 ? highIndex : arr.length - 1}</div>
                            </div>
                            <div className="bs-state-card">
                                <div className="bs-state-name">midIndex</div>
                                <div className="bs-state-val" style={{ color: "#fbbf24" }}>
                                    {currentStepIndex >= 0 && midIndex !== -1 ? midIndex : <span className="bs-state-val-null">null</span>}
                                </div>
                            </div>
                            <div className="bs-state-card">
                                <div className="bs-state-name">midValue</div>
                                <div className="bs-state-val" style={{ color: "#e2e8f0" }}>
                                    {currentStepIndex >= 0 && midValue !== null ? midValue : <span className="bs-state-val-null">null</span>}
                                </div>
                            </div>
                            <div className="bs-state-card">
                                <div className="bs-state-name">rangeValid</div>
                                <div className="bs-state-val">
                                    {currentStepIndex >= 0 && currentStep.isSearchRangeValid !== null ? (
                                        currentStep.isSearchRangeValid ? (
                                            <span className="bs-state-val-true">TRUE</span>
                                        ) : (
                                            <span className="bs-state-val-false">FALSE</span>
                                        )
                                    ) : (
                                        <span className="bs-state-val-null">null</span>
                                    )}
                                </div>
                            </div>
                            <div className="bs-state-card">
                                <div className="bs-state-name">isTargetFound</div>
                                <div className="bs-state-val">
                                    {currentStepIndex >= 0 && currentStep.isTargetFound !== null ? (
                                        currentStep.isTargetFound ? (
                                            <span className="bs-state-val-true">TRUE</span>
                                        ) : (
                                            <span className="bs-state-val-false">FALSE</span>
                                        )
                                    ) : (
                                        <span className="bs-state-val-null">null</span>
                                    )}
                                </div>
                            </div>
                            <div className="bs-state-card">
                                <div className="bs-state-name">isTargetInLeft</div>
                                <div className="bs-state-val">
                                    {currentStepIndex >= 0 && currentStep.isTargetInLeftHalf !== null ? (
                                        currentStep.isTargetInLeftHalf ? (
                                            <span className="bs-state-val-true">TRUE</span>
                                        ) : (
                                            <span className="bs-state-val-false">FALSE</span>
                                        )
                                    ) : (
                                        <span className="bs-state-val-null">null</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Parallel Code Highlights & Log Feed */}
                <div className="bs-right-column">
                    {/* Parallel Code Visualizer */}
                    <div className="bs-panel" style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <h2 className="bs-panel-title">Mã Nguồn Song Song (Source Code)</h2>
                        <div className="bs-code-container" style={{ flexGrow: 1 }}>
                            {CODE_LINES.map((line) => {
                                const isActive = line.num === activeLine;
                                const inlineVal = getInlineVal(line.num, currentStep);

                                return (
                                    <div
                                        key={line.num}
                                        className={`bs-code-line ${isActive ? "bs-code-line-active" : ""}`}
                                    >
                                        <span className="bs-code-number">{line.num}</span>
                                        <span className="bs-code-text">{line.text}</span>
                                        {isActive && inlineVal && (
                                            <span className="bs-code-inline-val">
                        /* {inlineVal} */
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bilingual Console Logs */}
                    <div className="bs-panel">
                        <h2 className="bs-panel-title">Bilingual Console Logs</h2>
                        <div className="bs-log-body">
                            {logs.length === 0 ? (
                                <div className="bs-log-empty">Chưa có log. Hãy click Play hoặc Tiến tiếp...</div>
                            ) : (
                                logs.map((l, index) => (
                                    <div key={index} className={`bs-log-entry bs-log-type-${l.type}`}>
                                        <span className="bs-log-time">
                                            [{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                        </span>
                                        <span className="bs-log-text">{l.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
