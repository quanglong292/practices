/** @jsx Act.createElement */
import { Act, useState } from "./core/dom";
import "./style.css";

const container = document.getElementById("root");

// -------------------------------------------------------------
// 1. Counter Component demonstrating multiple hooks & functional updates
// -------------------------------------------------------------
function CounterComponent() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div className="hook-counter-card">
      <div className="card-title">
        <span>⚡ Functional Component with Multiple Hooks</span>
        <span className="hook-badge">2 Active Hooks</span>
      </div>
      <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
        State updates are handled via <code>setState(action)</code> which queues
        actions in <code>oldHook.queue</code> and schedules a time-sliced render pass.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "8px 0" }}>
        <button
          className="btn"
          onClick={() => setCount((c) => c - step)}
        >
          - {step}
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#38bdf8" }}>
            {count}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Current Value</span>
        </div>
        <button
          className="btn"
          onClick={() => setCount((c) => c + step)}
        >
          + {step}
        </button>
        <button
          className="btn btn-reset"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Step size (Hook #2):</span>
        {[1, 5, 10].map((s) => (
          <button
            className={step === s ? "btn btn-active" : "btn"}
            onClick={() => setStep(s)}
            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Functional Component List demonstrating PLACEMENT and DELETION
// -------------------------------------------------------------
function TaskItem({ title, onRemove }) {
  return (
    <li className="demo-list-item">
      <span>🔹 {title}</span>
      <button
        className="btn"
        onClick={onRemove}
        style={{
          padding: "2px 8px",
          fontSize: "0.75rem",
          backgroundColor: "#881337",
          borderColor: "#f43f5e",
        }}
      >
        ✕ Remove
      </button>
    </li>
  );
}

function DynamicComponentList() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Fiber LCRS Pointer Traversal" },
    { id: 2, title: "Time Slicing via requestIdleCallback" },
    { id: 3, title: "Function Component Fiber Boundaries" },
  ]);

  const addTask = () => {
    const nextId = Date.now();
    setTasks((prev) => [
      ...prev,
      { id: nextId, title: `Custom Component #${prev.length + 1}` },
    ]);
  };

  const removeTask = (idToRemove) => {
    setTasks((prev) => prev.filter((t) => t.id !== idToRemove));
  };

  return (
    <div className="card">
      <div className="card-title">
        <span>🧩 Component Tree Lifecycle (Placement & Deletion)</span>
        <span className="badge badge-placement">{tasks.length} Components</span>
      </div>
      <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
        Verifies <code>commitDeletion(fiber, domParent)</code> descending recursively
        through Function Component boundaries when a component is unmounted.
      </p>

      <div style={{ margin: "6px 0" }}>
        <button className="btn" onClick={addTask}>
          ➕ Mount New Component (PLACEMENT)
        </button>
      </div>

      <ul className="demo-list">
        {tasks.map((task) => (
          <TaskItem
            title={task.title}
            onRemove={() => removeTask(task.id)}
          />
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Nested Functional Components verifying DOM parent climbing
// -------------------------------------------------------------
function NestedCard({ children }) {
  return <div className="component-box">{children}</div>;
}

function MiddleLayer({ label, children }) {
  return (
    <div>
      <div style={{ color: "#38bdf8", fontSize: "0.82rem", marginBottom: "4px" }}>
        [Function Component Boundary: {label}]
      </div>
      {children}
    </div>
  );
}

function DeeplyNestedDemo() {
  const [nestedCount, setNestedCount] = useState(0);

  return (
    <div className="card">
      <div className="card-title">
        <span>🌲 Deep Function Component Nesting</span>
        <span className="badge badge-update">DOM Parent Climb</span>
      </div>
      <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
        Verifies <code>commitWork</code> climbing up non-DOM parent fibers via{" "}
        <code>while (!domParentFiber.dom)</code> until reaching the container.
      </p>

      <NestedCard>
        <MiddleLayer label="Outer Logical Wrapper">
          <MiddleLayer label="Inner Logical Wrapper">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
              <span style={{ fontSize: "0.95rem" }}>
                Deeply Nested Button:{" "}
                <strong style={{ color: "#34d399" }}>{nestedCount} clicks</strong>
              </span>
              <button
                className="btn"
                onClick={() => setNestedCount((c) => c + 1)}
              >
                Click Nested Node
              </button>
            </div>
          </MiddleLayer>
        </MiddleLayer>
      </NestedCard>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Controlled Input verifying state-driven DOM property sync
// -------------------------------------------------------------
function LiveInputDemo() {
  const [text, setText] = useState("Function components with hooks in Own-React!");

  return (
    <div className="card">
      <div className="card-title">
        <span>✍️ Live State Typing & Focus Preservation</span>
        <span className="badge badge-update">Controlled Input</span>
      </div>
      <input
        type="text"
        value={text}
        onInput={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          backgroundColor: "#0b1120",
          border: "1px solid #334155",
          color: "#f8fafc",
          borderRadius: "6px",
          fontSize: "0.92rem",
        }}
      />
      <div style={{ fontSize: "0.85rem", color: "#34d399" }}>
        Current State: "{text}" ({text.length} characters)
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Classic Reconciliation Scenarios (Step 07 Verification)
// -------------------------------------------------------------
function ReconciliationSandbox() {
  const [scenario, setScenario] = useState("baseline");
  const [renderCount, setRenderCount] = useState(1);

  const switchScenario = (name) => {
    setScenario(name);
    setRenderCount((c) => c + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="scenarios-nav">
        <button
          className={scenario === "baseline" ? "btn btn-active" : "btn"}
          onClick={() => switchScenario("baseline")}
        >
          Baseline
        </button>
        <button
          className={scenario === "update" ? "btn btn-active" : "btn"}
          onClick={() => switchScenario("update")}
        >
          1. Props (UPDATE)
        </button>
        <button
          className={scenario === "placement" ? "btn btn-active" : "btn"}
          onClick={() => switchScenario("placement")}
        >
          2. Insert (PLACEMENT)
        </button>
        <button
          className={scenario === "deletion" ? "btn btn-active" : "btn"}
          onClick={() => switchScenario("deletion")}
        >
          3. Remove (DELETION)
        </button>
        <button
          className={scenario === "type_change" ? "btn btn-active" : "btn"}
          onClick={() => switchScenario("type_change")}
        >
          4. Tag Change (REPLACE)
        </button>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Active Scenario Details</span>
          {scenario === "update" && (
            <span className="badge badge-update">effectTag: UPDATE</span>
          )}
          {scenario === "placement" && (
            <span className="badge badge-placement">effectTag: PLACEMENT</span>
          )}
          {scenario === "deletion" && (
            <span className="badge badge-deletion">effectTag: DELETION</span>
          )}
          {scenario === "type_change" && (
            <span className="badge badge-multi">DELETION + PLACEMENT</span>
          )}
          {scenario === "baseline" && (
            <span className="badge" style={{ backgroundColor: "#334155", color: "#f8fafc" }}>
              INITIAL MOUNT
            </span>
          )}
        </div>

        <div className="inspector">
          {scenario === "baseline" && (
            <div>
              <p className="inspector-highlight">👉 Baseline Initial State</p>
              <p>• Initial fiber tree mounted to <code>currentRoot</code>.</p>
              <p>• Click any scenario above to trigger reconciliation passes.</p>
            </div>
          )}

          {scenario === "update" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 1: Props & Attribute Mutation (UPDATE)</p>
              <p>• <strong>Condition:</strong> <code>sameType === true</code>.</p>
              <p>• <strong>Action:</strong> <code>newFiber.dom = oldFiber.dom</code> (Reuses existing DOM node).</p>
              <p className="inspector-success">✅ SAME DOM NODE REUSED (Zero element recreation!)</p>
            </div>
          )}

          {scenario === "placement" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 2: Element Insertion (PLACEMENT)</p>
              <p>• <strong>Condition:</strong> Array length grew from 2 to 3.</p>
              <p>• <strong>Action:</strong> Created <code>newFiber</code> with <code>effectTag: PLACEMENT</code>.</p>
              <p>• <strong>Commit:</strong> Appended 3rd item to container.</p>
            </div>
          )}

          {scenario === "deletion" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 3: Element Removal (DELETION)</p>
              <p>• <strong>Condition:</strong> Array length reduced from 2 to 1.</p>
              <p>• <strong>Action:</strong> <code>oldFiber.effectTag = 'DELETION'</code>.</p>
              <p>• <strong>Commit:</strong> <code>removeChild</code> removed item from DOM.</p>
            </div>
          )}

          {scenario === "type_change" && (
            <div>
              <p className="inspector-highlight">👉 Scenario 4: Element Type Change (REPLACE)</p>
              <p>• <strong>Condition:</strong> Tag changed from <code>&lt;h3&gt;</code> to <code>&lt;blockquote&gt;</code>.</p>
              <p>• <strong>Old Fiber:</strong> <code>DELETION</code> $\rightarrow$ removed from DOM.</p>
              <p>• <strong>New Fiber:</strong> <code>PLACEMENT</code> $\rightarrow$ brand-new blockquote appended.</p>
            </div>
          )}
        </div>

        <div className="demo-stage">
          <div
            className="demo-box"
            style={
              scenario === "update"
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
            {scenario === "update"
              ? "✨ [UPDATE SUCCESS] I am the exact same DOM node, but props & styles changed!"
              : "📦 [BASELINE DOM NODE] (Click '1. Props (UPDATE)' to diff me)"}
          </div>

          <div style={{ width: "100%", marginTop: "8px" }}>
            <ul className="demo-list">
              <li className="demo-list-item">
                <span>📁 Item 1: Core Didact Engine</span>
                <span className="badge" style={{ backgroundColor: "#334155", color: "#94a3b8" }}>
                  Persistent
                </span>
              </li>
              {scenario !== "deletion" && (
                <li className="demo-list-item">
                  <span>📁 Item 2: Fiber WorkLoop Architecture</span>
                  <span className="badge" style={{ backgroundColor: "#334155", color: "#94a3b8" }}>
                    Persistent
                  </span>
                </li>
              )}
              {scenario === "placement" && (
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

          <div style={{ width: "100%", marginTop: "8px" }}>
            {scenario === "type_change" ? (
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
                🏷️ [Original Type: &lt;h3&gt;] (Click '4. Tag Change' to replace me)
              </h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Architecture Checklist Card
// -------------------------------------------------------------
function StepChecklist() {
  const items = [
    { text: "Discriminate Host vs Function Components via typeof fiber.type", done: true },
    { text: "updateFunctionComponent invokes function & reconciles children", done: true },
    { text: "useState hook with ordered hooks array & queue action replay", done: true },
    { text: "commitWork upward climb (while (!domParentFiber.dom))", done: true },
    { text: "commitDeletion downward recursive removal of DOM nodes", done: true },
  ];

  return (
    <div className="card">
      <div className="card-title">
        <span>✅ Step 08 Checklist (TODO 4 Complete)</span>
        <span className="badge badge-placement">All Passed</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((it) => (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem" }}>
            <span style={{ color: "#34d399", fontWeight: "bold" }}>✓</span>
            <span style={{ color: "#e2e8f0" }}>{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. Root App Component
// -------------------------------------------------------------
function App() {
  const [activeTab, setActiveTab] = useState("showcase");

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1>⚛️ Own-React Fiber Engine</h1>
        <p>
          Step 08: Function Components & <code>useState</code> Hook integration.
          Now with full virtual boundary reconciliation!
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={activeTab === "showcase" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("showcase")}
        >
          🚀 Function Components & Hooks
        </button>
        <button
          className={activeTab === "reconcile" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("reconcile")}
        >
          🔬 Reconciliation Sandbox (TODO 3)
        </button>
        <button
          className={activeTab === "internals" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("internals")}
        >
          📖 Step 08 Architecture
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === "showcase" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <CounterComponent />
          <DynamicComponentList />
          <div className="grid-2">
            <DeeplyNestedDemo />
            <LiveInputDemo />
          </div>
        </div>
      )}

      {activeTab === "reconcile" && <ReconciliationSandbox />}

      {activeTab === "internals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <StepChecklist />
          <div className="card">
            <div className="card-title">
              <span>🧠 Hook Order & Rules Explained</span>
            </div>
            <div className="inspector">
              <p className="inspector-highlight">Why the "Rules of Hooks" Exist:</p>
              <p>
                Hooks are stored in a flat array (<code>wipFiber.hooks</code>) indexed solely by execution order (<code>hookIndex</code>).
              </p>
              <p>
                On re-renders, the engine aligns the current execution with the previous commit:
                <br />
                <code>oldHook = wipFiber.alternate.hooks[hookIndex]</code>
              </p>
              <p>
                Putting a hook inside an <code>if</code> condition or loop disrupts the index sequence, causing React to mismatch state between hooks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Kick off initial mount
Act.render(<App />, container);
