import React, { useState, useEffect } from "react";
import { useQuery } from "./useQuery";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface FetchResult {
  todos: Todo[];
  fetchedAt: string;
}

// Dummy database
const TODO_TEMPLATES: Record<string, string[]> = {
  personal: [
    "Uống 2L nước mỗi ngày 💧",
    "Tập thể dục 30 phút buổi sáng 🏃‍♂️",
    "Đọc sách 15 trang tối nay 📖",
    "Ngủ trước 11h đêm 😴",
  ],
  work: [
    "Họp Daily Standup lúc 9h 🤝",
    "Review Pull Request của đồng nghiệp 💻",
    "Hoàn thành tính năng Custom useQuery 🚀",
    "Viết tài liệu giải thích cơ chế Re-validation 📝",
  ],
  shopping: [
    "Mua sữa tươi chua🥛",
    "Mua táo đỏ hữu cơ 🍎",
    "Bánh mì nguyên cám 🍞",
    "Cà phê hạt ngon ☕",
  ],
};

export default function UseQueryDemo() {
  const [tab, setTab] = useState<"personal" | "work" | "shopping">("personal");
  const [staleTime, setStaleTime] = useState<number>(5000); // default 5 seconds
  const [refetchOnWindowFocus, setRefetchOnWindowFocus] = useState<boolean>(true);
  const [logs, setLogs] = useState<{ id: string; time: string; msg: string; type: "info" | "success" | "warn" }[]>([]);

  // Log logger helper
  const addLog = (msg: string, type: "info" | "success" | "warn" = "info") => {
    const formattedTime = new Date().toLocaleTimeString();
    const logId = Math.random().toString(36).substring(7);
    setLogs((prev) => [{ id: logId, time: formattedTime, msg, type }, ...prev].slice(0, 15));
  };

  // Mock API with 1.5 seconds latency
  const fetchTodos = async (category: string): Promise<FetchResult> => {
    addLog(`📡 [API Call] Đang gọi API lấy danh sách cho tab: [${category}]...`, "info");
    
    // Simulating API loading latency
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const templates = TODO_TEMPLATES[category];
    const generatedTodos: Todo[] = templates.map((title, index) => {
      const generatedId = index + 1;
      const isCompleted = index % 2 === 0;
      return {
        id: generatedId,
        title: title,
        completed: isCompleted,
      };
    });

    const currentTimeString = new Date().toLocaleTimeString();
    addLog(`✅ [API Success] Nhận dữ liệu mới cho tab: [${category}]`, "success");

    const result: FetchResult = {
      todos: generatedTodos,
      fetchedAt: currentTimeString,
    };
    return result;
  };

  // Using our custom hook!
  const { data, isLoading, isFetching, error, refetch } = useQuery<FetchResult>(
    ["todos", tab],
    () => fetchTodos(tab),
    {
      staleTime,
      refetchOnWindowFocus,
    }
  );

  // Monitor cache status changes
  useEffect(() => {
    addLog(`🔄 [Component Mounted / Tab Changed] Tab hiện tại: [${tab}]`, "info");
  }, [tab]);

  // Log whenever isFetching transitions
  useEffect(() => {
    const isCurrentlyFetching = isFetching === true;
    if (isCurrentlyFetching) {
      addLog(`⚡ [Fetching State] Đang tải ngầm (background refetching) cho tab: [${tab}]`, "warn");
    } else {
      addLog(`💤 [Fetching State] Hoàn thành luồng tải cho tab: [${tab}]`, "info");
    }
  }, [isFetching, tab]);

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Custom useQuery & Re-validation Demo 🚀</h1>
        <p style={styles.subtitle}>
          Trực quan hóa cơ chế <strong>Stale-While-Revalidate (SWR)</strong>, <strong>Stale Time</strong> và <strong>Re-validation</strong> của TanStack Query.
        </p>
      </header>

      <div style={styles.dashboard}>
        {/* Left Side: Options & Status */}
        <div style={styles.leftPanel}>
          {/* Controls */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚙️ Cấu Hình (Query Options)</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                staleTime (Thời gian dữ liệu "Fresh"): <strong>{staleTime / 1000}s</strong>
              </label>
              <input
                type="range"
                min="0"
                max="20000"
                step="2500"
                value={staleTime}
                onChange={(e) => {
                  const newStaleTime = Number(e.target.value);
                  setStaleTime(newStaleTime);
                  addLog(`⚙️ Thay đổi staleTime thành ${newStaleTime / 1000} giây`, "info");
                }}
                style={styles.slider}
              />
              <span style={styles.helperText}>
                Nếu thời gian trôi qua từ lần cập nhật cuối nhỏ hơn thời gian này, dữ liệu được coi là "Fresh" và sẽ không refetch ngầm khi chuyển tab/mount.
              </span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={refetchOnWindowFocus}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setRefetchOnWindowFocus(isChecked);
                    addLog(`⚙️ ${isChecked ? "Bật" : "Tắt"} cơ chế refetchOnWindowFocus`, "info");
                  }}
                  style={styles.checkbox}
                />
                Tự động Refetch khi focus lại trình duyệt (Window Focus)
              </label>
              <span style={styles.helperText}>
                Hãy thử chuyển tab trình duyệt khác hoặc nhấn ra ngoài ứng dụng rồi click quay lại đây để xem re-validation kích hoạt ngầm!
              </span>
            </div>
          </div>

          {/* Caching Status Map */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📊 Trạng Thái Trình Xem</h3>
            <div style={styles.statusRow}>
              <div style={styles.statusBadge(isLoading)}>
                <span>Initial Loading:</span>
                <strong>{isLoading ? "Đang tải dữ liệu lần đầu... ⏳" : "Không 🟢"}</strong>
              </div>
              <div style={styles.statusBadge(isFetching)}>
                <span>Background Fetching (isFetching):</span>
                <strong>{isFetching ? "Đang gọi ngầm... ⚡" : "Nghỉ ngơi 💤"}</strong>
              </div>
            </div>
            <button style={styles.refetchBtn} onClick={refetch} disabled={isFetching}>
              {isFetching ? "Đang Refetch..." : "Manual Refetch (Gọi Lại Thủ Công)"}
            </button>
          </div>
        </div>

        {/* Right Side: Tab View & Main Screen */}
        <div style={styles.rightPanel}>
          {/* Navigation Tabs */}
          <div style={styles.tabsContainer}>
            {(["personal", "work", "shopping"] as const).map((tabName) => {
              const isTabActive = tab === tabName;
              return (
                <button
                  key={tabName}
                  onClick={() => setTab(tabName)}
                  style={styles.tabButton(isTabActive)}
                >
                  {tabName === "personal" && "👤 Cá Nhân"}
                  {tabName === "work" && "💼 Công Việc"}
                  {tabName === "shopping" && "🛒 Mua Sắm"}
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div style={styles.contentCard}>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>
                Danh sách: {tab === "personal" ? "Cá Nhân" : tab === "work" ? "Công Việc" : "Mua Sắm"}
              </h2>
              {data && (
                <span style={styles.timestamp}>
                  Cập nhật lần cuối lúc: <strong>{data.fetchedAt}</strong>
                </span>
              )}
            </div>

            {isLoading && (
              <div style={styles.loaderContainer}>
                <div style={styles.spinner}></div>
                <p>Đang tải dữ liệu lần đầu tiên (Chưa có gì trong cache)...</p>
              </div>
            )}

            {!isLoading && error && (
              <div style={styles.errorContainer}>
                <p>⚠️ Đã xảy ra lỗi: {(error as any).message || "Unknown error"}</p>
              </div>
            )}

            {!isLoading && data && (
              <ul style={styles.todoList}>
                {data.todos.map((todo) => (
                  <li key={todo.id} style={styles.todoItem}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      readOnly
                      style={styles.todoCheckbox}
                    />
                    <span style={todo.completed ? styles.todoTextCompleted : styles.todoText}>
                      {todo.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* SWR Indicator overlay during background refetching */}
            {!isLoading && isFetching && (
              <div style={styles.swrOverlay}>
                <div style={styles.miniSpinner}></div>
                <span>Đang kiểm tra và cập nhật dữ liệu mới ngầm (SWR)...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logger Panel */}
      <div style={styles.logSection}>
        <div style={styles.logHeader}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#e2e8f0" }}>📜 Nhật Ký Hoạt Động (Live Activity Logs)</h3>
          <button style={styles.clearBtn} onClick={clearLogs}>
            Xóa Nhật Ký
          </button>
        </div>
        <div style={styles.logContainer}>
          {logs.length === 0 ? (
            <p style={{ color: "#718096", textAlign: "center", margin: "20px 0" }}>Chưa có sự kiện nào được ghi nhận. Hãy thử chuyển tab!</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} style={styles.logItem(log.type)}>
                <span style={styles.logTime}>[{log.time}]</span>
                <span style={styles.logMsg}>{log.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Scoped inline CSS to provide modern, elegant styling
const styles = {
  container: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
    maxWidth: "1100px",
    margin: "20px auto",
  },
  header: {
    borderBottom: "1px solid #1e293b",
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    background: "linear-gradient(to right, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "15px",
    margin: 0,
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "24px",
    marginBottom: "24px",
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column" as const,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #334155",
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  formGroup: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    color: "#e2e8f0",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#e2e8f0",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  slider: {
    width: "100%",
    height: "6px",
    backgroundColor: "#475569",
    borderRadius: "3px",
    outline: "none",
    cursor: "pointer",
  },
  helperText: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: "1.4",
  },
  statusRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    marginBottom: "16px",
  },
  statusBadge: (active: boolean) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: active ? "rgba(56, 189, 248, 0.1)" : "#0f172a",
    border: active ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid #1e293b",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    transition: "all 0.2s ease",
  }),
  refetchBtn: {
    width: "100%",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  tabsContainer: {
    display: "flex",
    gap: "10px",
    backgroundColor: "#1e293b",
    padding: "6px",
    borderRadius: "10px",
    marginBottom: "16px",
  },
  tabButton: (isActive: boolean) => ({
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: isActive ? "#0f172a" : "transparent",
    color: isActive ? "#38bdf8" : "#94a3b8",
    boxShadow: isActive ? "0 4px 6px -1px rgba(0, 0, 0, 0.2)" : "none",
    transition: "all 0.2s ease",
  }),
  contentCard: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #334155",
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    position: "relative" as const,
    minHeight: "260px",
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #334155",
    paddingBottom: "12px",
    marginBottom: "16px",
  },
  contentTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  timestamp: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: "12px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #334155",
    borderTop: "4px solid #38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  miniSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #1e293b",
    borderTop: "2px solid #38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    color: "#f87171",
    padding: "16px",
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderRadius: "8px",
    border: "1px solid rgba(248, 113, 113, 0.2)",
    textAlign: "center" as const,
  },
  todoList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    border: "1px solid #1e293b",
  },
  todoCheckbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  todoText: {
    fontSize: "14px",
    color: "#e2e8f0",
  },
  todoTextCompleted: {
    fontSize: "14px",
    color: "#64748b",
    textDecoration: "line-through",
  },
  swrOverlay: {
    position: "absolute" as const,
    bottom: "16px",
    right: "16px",
    backgroundColor: "#0f172a",
    border: "1px solid #38bdf8",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "12px",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
  },
  logSection: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "16px",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "10px",
    marginBottom: "10px",
  },
  clearBtn: {
    backgroundColor: "transparent",
    border: "1px solid #475569",
    borderRadius: "4px",
    color: "#94a3b8",
    padding: "4px 8px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  logContainer: {
    maxHeight: "180px",
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    paddingRight: "8px",
  },
  logItem: (type: "info" | "success" | "warn") => {
    let color = "#e2e8f0";
    if (type === "success") color = "#4ade80";
    if (type === "warn") color = "#fbbf24";
    return {
      fontSize: "12px",
      fontFamily: "monospace",
      color,
      padding: "4px 8px",
      backgroundColor: "rgba(30, 41, 59, 0.4)",
      borderRadius: "4px",
      lineHeight: "1.4",
      display: "flex",
      gap: "10px",
    };
  },
  logTime: {
    color: "#64748b",
    flexShrink: 0,
  },
  logMsg: {
    wordBreak: "break-all" as const,
  },
};
