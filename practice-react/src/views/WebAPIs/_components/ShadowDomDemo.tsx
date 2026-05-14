import React, { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────
// Demo 1: Style Encapsulation — Shadow DOM prevents global
//         styles from leaking in (and vice-versa).
// ─────────────────────────────────────────────────────────
export const StyleEncapsulationDemo: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowColor, setShadowColor] = useState("#6366f1");
  const [globalLeaks, setGlobalLeaks] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Avoid attaching twice (React StrictMode)
    if (host.shadowRoot) return;

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display: block; padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); }
        p    { font-family: 'Inter', sans-serif; font-size: 14px; margin: 0 0 8px; }
        .badge {
          display: inline-block;
          background: var(--shadow-color, #6366f1);
          color: #fff;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          transition: background 0.3s;
        }
      </style>
      <p>👋 I live inside <strong>Shadow DOM</strong>.</p>
      <p>Global CSS <em>cannot</em> reach me.</p>
      <span class="badge">Shadow Color</span>
    `;
  }, []);

  // Update CSS custom property to change badge colour from React
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.style.setProperty("--shadow-color", shadowColor);
  }, [shadowColor]);

  return (
    <div className="space-y-4">
      {/* Global styles panel */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{
          background: globalLeaks ? "#fbbf24" : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: globalLeaks ? "#1e293b" : "#e2e8f0",
          transition: "all 0.3s",
        }}
      >
        🌐 I am in the <strong>Light DOM</strong>. Global styles apply to me.
        {globalLeaks && (
          <span className="ml-2 font-bold">(styled globally ✅)</span>
        )}
      </div>

      {/* Shadow host */}
      <div ref={hostRef} id="shadow-host-style" />

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Shadow badge color
        </label>
        <input
          type="color"
          value={shadowColor}
          onChange={(e) => setShadowColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          title="Pick shadow badge color"
        />
        <button
          onClick={() => setGlobalLeaks((v) => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}
        >
          {globalLeaks ? "Remove" : "Apply"} global highlight
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Notice: changing the badge colour via a CSS custom property (
        <code className="text-violet-400">--shadow-color</code>) works because
        custom properties <em>do</em> cross the shadow boundary — they are
        intentional style hooks.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Demo 2: DOM Isolation — querySelector from outside
//         cannot reach elements inside a closed shadow.
// ─────────────────────────────────────────────────────────
export const DomIsolationDemo: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [mode, setMode] = useState<"open" | "closed">("open");

  // Track shadow root in a ref so we can query it for "open" mode
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Clean up old shadow root isn't directly possible; re-mount host
    host.innerHTML = "";
    // We rebuild by replacing the element — simplest approach
    const newHost = document.createElement("div");
    newHost.id = "shadow-host-isolation";
    host.appendChild(newHost);

    const shadow = newHost.attachShadow({ mode });
    shadowRef.current = shadow;
    shadow.innerHTML = `
      <style>
        :host { display:block; padding:12px; border-radius:10px; background:rgba(99,102,241,0.1); border:1px dashed rgba(99,102,241,0.4); }
        #secret { color:#a5b4fc; font-size:13px; font-family:monospace; }
      </style>
      <p id="secret">🔒 secret-element (id="secret")</p>
    `;
  }, [mode]);

  const queryFromOutside = () => {
    // document.querySelector cannot reach inside shadow DOM
    const fromDoc = document.querySelector("#secret");
    if (fromDoc) {
      setQueryResult(`document.querySelector found it! → "${fromDoc.textContent}"`);
    } else {
      setQueryResult('❌ document.querySelector("#secret") → null  (shadow boundary blocked it)');
    }
  };

  const queryFromShadow = () => {
    if (mode === "closed") {
      setQueryResult("🔐 Mode is 'closed' — even shadowRoot ref returns null externally.");
      return;
    }
    const el = shadowRef.current?.querySelector("#secret");
    setQueryResult(
      el
        ? `✅ shadowRoot.querySelector found: "${el.textContent}"`
        : "Nothing found in shadow root."
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["open", "closed"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setQueryResult(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: mode === m ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)",
              color: mode === m ? "#a5b4fc" : "#94a3b8",
              border: `1px solid ${mode === m ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            mode="{m}"
          </button>
        ))}
      </div>

      <div ref={hostRef} />

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={queryFromOutside}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}
        >
          document.querySelector("#secret")
        </button>
        <button
          onClick={queryFromShadow}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "rgba(34,197,94,0.15)", color: "#86efac" }}
        >
          shadowRoot.querySelector("#secret")
        </button>
      </div>

      {queryResult && (
        <div className="rounded-lg p-3 font-mono text-xs bg-slate-900/60 text-slate-200 border border-white/10">
          {queryResult}
        </div>
      )}
    </div>
  );
};
