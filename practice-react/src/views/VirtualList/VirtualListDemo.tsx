import React, { useState, useMemo } from "react";
import { useVirtualList } from "./useVirtualList";
import "./VirtualList.css";

// Deterministic generator to avoid storing huge arrays in memory
const getMockUser = (index: number) => {
  const firstNames = [
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Oliver", "Sophia", "Elijah",
    "Isabella", "James", "Mia", "Benjamin", "Lucas", "Charlotte", "Amelia", "Mason"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"
  ];

  const firstNameIndex = index % firstNames.length;
  const lastNameIndex = (index * 7) % lastNames.length;

  const firstName = firstNames[firstNameIndex];
  const lastName = lastNames[lastNameIndex];
  const fullName = `${firstName} ${lastName}`;
  
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@practices.dev`;
  
  const isActive = index % 3 !== 0;
  const statusString = isActive ? "Active" : "Offline";
  
  const valueMultiplier = 137;
  const userScore = (index * valueMultiplier) % 1000;

  return {
    id: index,
    name: fullName,
    email: email,
    status: statusString,
    isActive: isActive,
    score: `${userScore} pts`,
    avatarLetter: firstName.charAt(0)
  };
};

export default function VirtualListDemo() {
  // Config state
  const [itemCount, setItemCount] = useState<number>(10000);
  const [itemHeight, setItemHeight] = useState<number>(60);
  const [overscan, setOverscan] = useState<number>(3);
  const [isVirtualizationEnabled, setIsVirtualizationEnabled] = useState<boolean>(true);

  // Hook usage for virtualized mode
  const {
    containerRef,
    visibleItems,
    totalHeight,
    startIndex,
    endIndex
  } = useVirtualList({
    itemCount,
    itemHeight,
    overscan
  });

  // Handle setting item count safely
  const handleItemCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const parsedValue = parseInt(rawValue, 10);
    const isValidNumber = !isNaN(parsedValue) && parsedValue >= 0;
    
    if (isValidNumber) {
      setItemCount(parsedValue);
    } else if (rawValue === "") {
      setItemCount(0);
    }
  };

  // Warning check if user turns off virtualization with high item counts
  const isLargeList = itemCount > 2000;
  const willLagIfDisabled = isLargeList && !isVirtualizationEnabled;

  // Compute stats semantically
  const mountedDomCount = isVirtualizationEnabled 
    ? (visibleItems.length + 2) // visible items + outer container + inner spacer
    : (itemCount + 1); // all items + outer container

  // Array of indexes when virtualization is disabled
  const fullIndexList = useMemo(() => {
    const indices: number[] = [];
    for (let indexValue = 0; indexValue < itemCount; indexValue++) {
      indices.push(indexValue);
    }
    return indices;
  }, [itemCount]);

  return (
    <div className="virtual-list-page">
      <header className="virtual-list-header">
        <div>
          <h1>Virtual List Playground</h1>
          <p>Trải nghiệm và so sánh cơ chế hoạt động của Virtual List (Windowing)</p>
        </div>
        <span className="virtual-list-badge">Performance Lab</span>
      </header>

      <div className="virtual-list-grid">
        {/* Controls & Stats Sidebar */}
        <aside className="panel-card">
          <div>
            <h2 className="panel-title">Cấu hình danh sách</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              <div className="control-group">
                <label className="control-label">
                  Số lượng Items (Dataset Size)
                  <span className="control-value">{itemCount.toLocaleString()}</span>
                </label>
                <input
                  type="number"
                  className="control-input"
                  min="0"
                  max="1000000"
                  value={itemCount}
                  onChange={handleItemCountChange}
                />
              </div>

              <div className="control-group">
                <label className="control-label">
                  Chiều cao mỗi Item (Height)
                  <span className="control-value">{itemHeight}px</span>
                </label>
                <input
                  type="range"
                  className="control-range"
                  min="40"
                  max="100"
                  step="5"
                  value={itemHeight}
                  onChange={(e) => setItemHeight(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="control-group">
                <label className="control-label">
                  Số lượng vùng đệm (Overscan / Buffer)
                  <span className="control-value">{overscan}</span>
                </label>
                <input
                  type="range"
                  className="control-range"
                  min="0"
                  max="15"
                  step="1"
                  value={overscan}
                  disabled={!isVirtualizationEnabled}
                  onChange={(e) => setOverscan(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="toggle-container">
                <span className="control-label" style={{ margin: 0 }}>Bật Virtualization</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isVirtualizationEnabled}
                    onChange={(e) => setIsVirtualizationEnabled(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

            </div>
          </div>

          <div>
            <h2 className="panel-title">Chỉ số Hiệu năng (Metrics)</h2>
            <div className="stats-grid">
              
              <div className="stat-item">
                <span className="stat-label">DOM Nodes Mounted</span>
                <span className={`stat-value ${mountedDomCount > 1000 ? "danger" : "highlight"}`}>
                  {mountedDomCount.toLocaleString()}
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-label">Chỉ số hiển thị</span>
                <span className="stat-value">
                  {isVirtualizationEnabled ? `${startIndex} - ${endIndex}` : "0 - All"}
                </span>
              </div>

            </div>
          </div>

          {willLagIfDisabled && (
            <div className="warning-banner">
              <strong>⚠️ WARNING: BẮT ĐẦU LAG</strong>
              Bạn đang render {itemCount.toLocaleString()} items đồng thời mà không có virtualization. Trình duyệt có thể bị đứng (UI Freeze) hoặc quá tải RAM.
            </div>
          )}

          <a 
            className="doc-link" 
            href="file:///c:/Users/Le.Quang.Long/Desktop/practices/practice-react/src/views/VirtualList/VirtualList.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            📖 Đọc tài liệu giải thích (WHAT/WHY/HOW)
          </a>
        </aside>

        {/* Main List Rendering Area */}
        <main className="list-wrapper">
          {isVirtualizationEnabled ? (
            /* VIRTUALIZED VIEW */
            <div 
              className="scroll-container" 
              ref={containerRef} 
              style={{ height: "600px" }}
            >
              <div 
                className="scroll-spacer" 
                style={{ height: `${totalHeight}px`, position: "relative" }}
              >
                <div className="scroll-content">
                  {visibleItems.map((virtualItem) => {
                    const itemIndex = virtualItem.index;
                    const user = getMockUser(itemIndex);
                    const isUserActive = user.isActive;

                    return (
                      <div 
                        key={itemIndex} 
                        className="list-item-card" 
                        style={virtualItem.style}
                      >
                        <div className="item-left">
                          <div className="item-index-badge">#{itemIndex}</div>
                          <div className="item-avatar">{user.avatarLetter}</div>
                          <div className="item-info">
                            <span className="item-name">{user.name}</span>
                            <span className="item-subtitle">{user.email}</span>
                          </div>
                        </div>
                        <div className="item-right">
                          <span className={`status-dot ${isUserActive ? "active" : "inactive"}`}></span>
                          <span className="item-value">{user.score}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* NON-VIRTUALIZED VIEW (STANDARD SCROLL) */
            <div 
              className="scroll-container" 
              style={{ height: "600px" }}
            >
              <div style={{ position: "relative", minHeight: "100%" }}>
                {fullIndexList.map((itemIndex) => {
                  const user = getMockUser(itemIndex);
                  const isUserActive = user.isActive;

                  return (
                    <div 
                      key={itemIndex} 
                      className="list-item-card" 
                      style={{ height: `${itemHeight}px` }}
                    >
                      <div className="item-left">
                        <div className="item-index-badge">#{itemIndex}</div>
                        <div className="item-avatar">{user.avatarLetter}</div>
                        <div className="item-info">
                          <span className="item-name">{user.name}</span>
                          <span className="item-subtitle">{user.email}</span>
                        </div>
                      </div>
                      <div className="item-right">
                        <span className={`status-dot ${isUserActive ? "active" : "inactive"}`}></span>
                        <span className="item-value">{user.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
