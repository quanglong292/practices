import React, { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────
// Register Web Components (idempotent — safe to call many times)
// ─────────────────────────────────────────────────────────
function registerComponents() {
  // ── 1. <user-card> ── Custom Element with Shadow DOM + attributes
  if (!customElements.get("user-card")) {
    class UserCard extends HTMLElement {
      static observedAttributes = ["name", "role", "color"];

      connectedCallback() {
        this._render();
      }

      attributeChangedCallback() {
        this._render();
      }

      _render() {
        const name  = this.getAttribute("name")  ?? "Anonymous";
        const role  = this.getAttribute("role")  ?? "Member";
        const color = this.getAttribute("color") ?? "#6366f1";

        const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
          <style>
            :host {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              border-radius: 14px;
              background: rgba(255,255,255,0.06);
              border: 1px solid rgba(255,255,255,0.12);
              font-family: 'Inter', system-ui, sans-serif;
            }
            .avatar {
              width: 40px; height: 40px; border-radius: 50%;
              display: grid; place-items: center;
              font-size: 18px; font-weight: 700; color: #fff;
              background: ${color};
              flex-shrink: 0;
            }
            .name  { font-size: 14px; font-weight: 600; color: #f1f5f9; }
            .role  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
          </style>
          <div class="avatar">${name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="name">${name}</div>
            <div class="role">${role}</div>
          </div>
        `;
      }
    }
    customElements.define("user-card", UserCard);
  }

  // ── 2. <toast-alert> ── Custom Element using <template> + <slot>
  if (!customElements.get("toast-alert")) {
    // Create template in document
    if (!document.getElementById("toast-template")) {
      const tpl = document.createElement("template");
      tpl.id = "toast-template";
      tpl.innerHTML = `
        <style>
          :host {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 14px 18px;
            border-radius: 12px;
            background: rgba(15,23,42,0.85);
            border: 1px solid rgba(255,255,255,0.12);
            backdrop-filter: blur(12px);
            font-family: 'Inter', system-ui, sans-serif;
            animation: slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(12px) scale(0.96); }
            to   { opacity: 1; transform: none; }
          }
          .icon    { font-size: 18px; flex-shrink: 0; }
          .content { flex: 1; }
          .title   { font-size: 13px; font-weight: 600; color: #f1f5f9; }
          .message { font-size: 12px; color: #94a3b8; margin-top: 2px; }
          ::slotted([slot="action"]) {
            display: inline-block;
            margin-top: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #818cf8;
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
          }
          ::slotted([slot="action"]):hover { color: #a5b4fc; }
        </style>
        <span class="icon">
          <slot name="icon">ℹ️</slot>
        </span>
        <div class="content">
          <div class="title"><slot name="title">Notification</slot></div>
          <div class="message"><slot></slot></div>
          <slot name="action"></slot>
        </div>
      `;
      document.body.appendChild(tpl);
    }

    class ToastAlert extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        const shadow = this.attachShadow({ mode: "open" });
        const tpl = document.getElementById("toast-template") as HTMLTemplateElement;
        shadow.appendChild(tpl.content.cloneNode(true));
      }
    }
    customElements.define("toast-alert", ToastAlert);
  }
}

// ─────────────────────────────────────────────────────────
// Demo A: Custom Elements (user-card)
// ─────────────────────────────────────────────────────────
export const CustomElementDemo: React.FC = () => {
  const [name, setName]   = useState("Long");
  const [role, setRole]   = useState("Frontend Engineer");
  const [color, setColor] = useState("#6366f1");
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => { registerComponents(); }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.setAttribute("name",  name);
    el.setAttribute("role",  role);
    el.setAttribute("color", color);
  }, [name, role, color]);

  return (
    <div className="space-y-5">
      {/* Live preview */}
      <div className="flex justify-center py-4">
        {/* @ts-ignore — custom element */}
        <user-card ref={cardRef} name={name} role={role} color={color} />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">name attribute</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            placeholder="Your name"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">role attribute</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            placeholder="Your role"
          />
        </label>
        <label className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">color attribute</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
          <code className="text-xs text-violet-400">{color}</code>
        </label>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        React updates the <code className="text-violet-400">name</code>,{" "}
        <code className="text-violet-400">role</code>, and{" "}
        <code className="text-violet-400">color</code> attributes on{" "}
        <code className="text-violet-400">&lt;user-card&gt;</code>.{" "}
        <code>attributeChangedCallback()</code> fires inside the class and re-renders
        the Shadow DOM.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Demo B: HTML <template> + <slot> (toast-alert)
// ─────────────────────────────────────────────────────────
export const TemplateSlotDemo: React.FC = () => {
  const [toasts, setToasts] = useState<
    { id: number; icon: string; title: string; msg: string }[]
  >([]);
  const [icon, setIcon]   = useState("✅");
  const [title, setTitle] = useState("Success");
  const [msg, setMsg]     = useState("Your changes have been saved.");

  useEffect(() => { registerComponents(); }, []);

  const addToast = () => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, icon, title, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const PRESETS = [
    { icon: "✅", title: "Success",  msg: "Operation completed successfully." },
    { icon: "⚠️", title: "Warning",  msg: "Please review before continuing."  },
    { icon: "❌", title: "Error",    msg: "Something went wrong. Try again."   },
    { icon: "ℹ️", title: "Info",     msg: "Your session expires in 5 minutes." },
  ];

  return (
    <div className="space-y-5">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.title}
            onClick={() => { setIcon(p.icon); setTitle(p.title); setMsg(p.msg); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: title === p.title ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)",
              color: title === p.title ? "#a5b4fc" : "#94a3b8",
              border: `1px solid ${title === p.title ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {p.icon} {p.title}
          </button>
        ))}
      </div>

      {/* Custom message */}
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        placeholder="Toast message…"
      />

      <button
        onClick={addToast}
        className="w-full py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.4)" }}
      >
        🚀 Fire Toast
      </button>

      {/* Live toasts */}
      <div className="space-y-2 min-h-[60px]">
        {toasts.map((t) => (
          <div key={t.id}>
            {/* @ts-ignore — custom element */}
            <toast-alert style={{ width: "100%" }}>
              <span slot="icon">{t.icon}</span>
              <span slot="title">{t.title}</span>
              {t.msg}
              <button slot="action" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
                Dismiss
              </button>
            {/* @ts-ignore */}
            </toast-alert>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Each toast is a <code className="text-violet-400">&lt;toast-alert&gt;</code> Web Component.
        Its internal structure is stamped from an HTML{" "}
        <code className="text-violet-400">&lt;template&gt;</code> and uses{" "}
        <code className="text-violet-400">&lt;slot&gt;</code> to project your light-DOM children.
      </p>
    </div>
  );
};
