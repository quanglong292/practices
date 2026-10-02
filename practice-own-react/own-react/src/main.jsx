/** @jsx Act.createElement */
import { Act } from "./core/dom";
import "./style.css";

// Application State
const state = {
  currentScenario: "baseline",
  counter: 0,
  textInput: "Live Typing Demo",
  renderCount: 0,
};

const container = document.getElementById("root");

// Reference to verify DOM node preservation across renders
let trackedBoxDom = null;

function setScenario(name) {
  state.currentScenario = name;
  state.renderCount++;
  console.group(`%c[Reconciliation Triggered] Scenario: ${name.toUpperCase()}`, "color: #38bdf8; font-weight: bold;");
  console.log(`Render Pass: #${state.renderCount}`);
  console.log("Current State:", { ...state });
  renderApp();
  console.groupEnd();
}

function handleIncrement() {
  state.counter++;
  state.renderCount++;
  renderApp();
}

function handleDecrement() {
  state.counter--;
  state.renderCount++;
  renderApp();
}

function handleInput(e) {
  state.textInput = e.target.value;
  state.renderCount++;
  renderApp();
}

function renderApp() {
  // Capture the DOM node reference on the very first mount
  setTimeout(() => {
    const box = document.getElementById("reusable-box");
    if (box && !trackedBoxDom) {
      trackedBoxDom = box;
    }
  }, 0);

  const isBoxPreserved =
    trackedBoxDom && document.getElementById("reusable-box") === trackedBoxDom;

  const element = (
    <div className="app-container">
      {/* 1. Header */}
      <div className="header">
        <p>
          Interactive sandbox to verify and debug <strong>UPDATE</strong>,{" "}
          <strong>PLACEMENT</strong>, and <strong>DELETION</strong> algorithms
          under <code>reconcileChildren()</code>.
        </p>
      </div>

      {/* 2. Scenario Navigation */}
      <div className="scenarios-nav">
        <button
          className={state.currentScenario === "baseline" ? "btn btn-active" : "btn"}
          onClick={() => setScenario("baseline")}
        >
          Baseline
        </button>
        <button
          className={state.currentScenario === "update" ? "btn btn-active" : "btn"}
          onClick={() => setScenario("update")}
        >
          1. Props (UPDATE)
        </button>
        <button
          className={state.currentScenario === "placement" ? "btn btn-active" : "btn"}
          onClick={() => setScenario("placement")}
        >
          2. Insert (PLACEMENT)
        </button>
        <button
          className={state.currentScenario === "deletion" ? "btn btn-active" : "btn"}
          onClick={() => setScenario("deletion")}
        >
          3. Remove (DELETION)
        </button>
        <button
          className={state.currentScenario === "type_change" ? "btn btn-active" : "btn"}
          onClick={() => setScenario("type_change")}
        >
          4. Tag Change (REPLACE)
        </button>
        <button
          className={state.currentScenario === "counter" ? "btn btn-active" : "btn"}
          onClick={() => setScenario("counter")}
        >
          5. Events & Input
        </button>
        <button
          className="btn btn-reset"
          onClick={() => {
            state.counter = 0;
            state.textInput = "Live Typing Demo";
            setScenario("baseline");
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* 3. Concept & Inspector Panel */}
      <div className="card">
        <div className="card-title">
          <span>Active Scenario Details</span>
          {state.currentScenario === "update" && (
            <span className="badge badge-update">effectTag: UPDATE</span>
          )}
          {state.currentScenario === "placement" && (
            <span className="badge badge-placement">effectTag: PLACEMENT</span>
          )}
          {state.currentScenario === "deletion" && (
            <span className="badge badge-deletion">effectTag: DELETION</span>
          )}
          {state.currentScenario === "type_change" && (
            <span className="badge badge-multi">DELETION + PLACEMENT</span>
          )}
          {state.currentScenario === "baseline" && (
            <span className="badge" style={{ backgroundColor: "#334155", color: "#f8fafc" }}>
              INITIAL MOUNT
            </span>
          )}
          {state.currentScenario === "counter" && (
            <span className="badge badge-update">EVENT MUTATIONS</span>
          )}
        </div>

        <div className="inspector">
          {state.currentScenario === "baseline" && (
            <div>
              <p className="inspector-highlight">👉 Baseline Initial State</p>
              <p>• Initial fiber tree mounted to <code>currentRoot</code>.</p>
              <p>• Tracking DOM element pointer for <code>#reusable-box</code>.</p>
              <p>• Click any scenario above to trigger reconciliation passes.</p>
            </div>
          )}

          {state.currentScenario === "update" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 1: Props & Attribute Mutation (UPDATE)</p>
              <p>• <strong>Condition:</strong> <code>sameType === true</code> (both are <code>&lt;div&gt;</code>).</p>
              <p>• <strong>Action:</strong> <code>newFiber.dom = oldFiber.dom</code> (Reuses existing DOM node).</p>
              <p>• <strong>Commit:</strong> <code>updateDom(dom, prevProps, nextProps)</code> mutated styles & text.</p>
              <p>
                • <strong>Memory Pointer Check:</strong>{" "}
                {isBoxPreserved ? (
                  <span className="inspector-success">✅ SAME DOM NODE REUSED (Zero element recreation!)</span>
                ) : (
                  <span style={{ color: "#f43f5e" }}>Evaluating pointer...</span>
                )}
              </p>
            </div>
          )}

          {state.currentScenario === "placement" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 2: Element Insertion (PLACEMENT)</p>
              <p>• <strong>Condition:</strong> <code>element && !sameType</code> (Array length grew from 2 to 3).</p>
              <p>• <strong>Action:</strong> <code>oldFiber</code> was <code>null</code>. Created <code>newFiber</code> with <code>dom = null</code>.</p>
              <p>• <strong>Commit:</strong> <code>domParent.appendChild(fiber.dom)</code> inserted the 3rd list item.</p>
            </div>
          )}

          {state.currentScenario === "deletion" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 3: Element Removal (DELETION)</p>
              <p>• <strong>Condition:</strong> <code>oldFiber && !sameType</code> (Array length shrank from 2 to 1).</p>
              <p>• <strong>Action:</strong> <code>oldFiber.effectTag = 'DELETION'</code>, added to <code>deletions[]</code>.</p>
              <p>• <strong>Commit:</strong> <code>domParent.removeChild(oldFiber.dom)</code> stripped Item B from screen.</p>
            </div>
          )}

          {state.currentScenario === "type_change" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 4: Element Type Change (REPLACE)</p>
              <p>• <strong>Condition:</strong> Position 0 changed from <code>&lt;h2&gt;</code> to <code>&lt;blockquote&gt;</code>.</p>
              <p>• <strong>Action:</strong> <code>sameType</code> is false. Triggers both Case 2 and Case 3!</p>
              <p>• <strong>Old Fiber:</strong> Tagged <code>DELETION</code> $\rightarrow$ removed from DOM.</p>
              <p>• <strong>New Fiber:</strong> Tagged <code>PLACEMENT</code> $\rightarrow$ brand-new blockquote appended.</p>
            </div>
          )}

          {state.currentScenario === "counter" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 5: Event Listeners & Double Buffering</p>
              <p>• Each click updates <code>state.counter</code> and triggers <code>Act.render()</code>.</p>
              <p>• Notice input focus is preserved, and only the counter number node re-renders.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Demonstration Stage */}
      <div className="card">
        <div className="card-title">
          <span>Live Rendered DOM</span>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            Total Render Passes: {state.renderCount}
          </span>
        </div>

        <div className="demo-stage">
          {/* Target Element A: Reusable Box for Scenario 1 (UPDATE) */}
          <div
            id="reusable-box"
            className="demo-box"
            style={
              state.currentScenario === "update"
                ? {
                    backgroundColor: "#064e3b",
                    color: "#ecfdf5",
                    border: "2px solid #10b981",
                  }
                : {
                    backgroundColor: "#1e3a8a",
                    color: "#eff6ff",
                    border: "2px solid #3b82f6",
                  }
            }
          >
            {state.currentScenario === "update"
              ? "✨ [UPDATE SUCCESS] I am the exact same DOM node, but my props & styles changed!"
              : "📦 [BASELINE DOM NODE] ID: reusable-box (Click '1. Props (UPDATE)' to diff me)"}
          </div>

          {/* Target Element B: List for Scenario 2 (PLACEMENT) and Scenario 3 (DELETION) */}
          <div style={{ width: "100%", marginTop: "12px" }}>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "8px" }}>
              Reconciliation Children List:
            </p>
            <ul className="demo-list">
              <li className="demo-list-item">
                <span>📁 Item 1: Core Didact Engine</span>
                <span className="badge" style={{ backgroundColor: "#334155", color: "#94a3b8" }}>
                  Persistent
                </span>
              </li>

              {state.currentScenario !== "deletion" && (
                <li className="demo-list-item">
                  <span>📁 Item 2: Fiber WorkLoop Architecture</span>
                  <span className="badge" style={{ backgroundColor: "#334155", color: "#94a3b8" }}>
                    Persistent
                  </span>
                </li>
              )}

              {state.currentScenario === "placement" && (
                <li
                  className="demo-list-item"
                  style={{ borderColor: "#10b981", backgroundColor: "#064e3b" }}
                >
                  <span>🎉 Item 3: Brand New Child Node!</span>
                  <span className="badge badge-placement">PLACED</span>
                </li>
              )}
            </ul>
          </div>

          {/* Target Element C: Type Change (Scenario 4) */}
          <div style={{ width: "100%", marginTop: "12px" }}>
            {state.currentScenario === "type_change" ? (
              <blockquote
                style={{
                  borderLeft: "4px solid #a855f7",
                  padding: "10px 14px",
                  backgroundColor: "#2e1065",
                  color: "#faf5ff",
                  borderRadius: "4px",
                  margin: "0",
                }}
              >
                🔮 [New Type: &lt;blockquote&gt;] The old &lt;h3&gt; node was destroyed and replaced with me!
              </blockquote>
            ) : (
              <h3
                style={{
                  color: "#e2e8f0",
                  fontSize: "1.05rem",
                  padding: "6px 0",
                }}
              >
                🏷️ [Original Type: &lt;h3&gt;] (Click '4. Tag Change' to replace my type with a &lt;blockquote&gt;)
              </h3>
            )}
          </div>

          {/* Target Element D: Interactive Counter & Live Event Handling (Scenario 5) */}
          {state.currentScenario === "counter" && (
            <div
              style={{
                width: "100%",
                marginTop: "14px",
                padding: "14px",
                backgroundColor: "#1e293b",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div className="counter-controls">
                <span>Interactive Counter: </span>
                <button className="btn" onClick={handleDecrement}>
                  ➖ Decrease
                </button>
                <strong style={{ fontSize: "1.2rem", color: "#38bdf8", minWidth: "30px", textAlign: "center" }}>
                  {state.counter}
                </strong>
                <button className="btn" onClick={handleIncrement}>
                  ➕ Increase
                </button>
              </div>

              <div>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Live Input (Verifies Event Listeners & Focus):
                </p>
                <input
                  type="text"
                  value={state.textInput}
                  onInput={handleInput}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #475569",
                    color: "#f8fafc",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                  }}
                />
                <p style={{ fontSize: "0.85rem", color: "#34d399", marginTop: "6px" }}>
                  Echo: {state.textInput}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  Act.render(element, container);
}

// Initial Mount
renderApp();
