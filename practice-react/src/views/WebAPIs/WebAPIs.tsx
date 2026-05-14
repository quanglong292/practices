import React, { useState } from "react";
import { StyleEncapsulationDemo, DomIsolationDemo } from "./_components/ShadowDomDemo";
import { CustomElementDemo, TemplateSlotDemo } from "./_components/WebComponentDemo";

// ─────────────────────────────────────────────────────────
// Shared helpers (same pattern as AdvancedAPI)
// ─────────────────────────────────────────────────────────
const Badge = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
    {label}
  </span>
);

const ConceptCard = ({
  icon,
  title,
  code,
  color,
  items,
}: {
  icon: string;
  title: string;
  code: string;
  color: string;
  items: { label: string; text: string }[];
}) => (
  <div className={`rounded-2xl border p-5 space-y-3 ${color}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-white text-sm">{title}</h3>
      </div>
      <code className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">{code}</code>
    </div>
    <dl className="space-y-2">
      {items.map(({ label, text }) => (
        <div key={label}>
          <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</dt>
          <dd className="text-sm text-slate-200 leading-relaxed">{text}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const DemoCard = ({
  title,
  tag,
  accentClass,
  children,
}: {
  title: string;
  tag: string;
  accentClass: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
    <div className={`px-6 py-4 border-b border-white/10 ${accentClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <code className="text-xs px-2 py-0.5 rounded bg-black/30 text-slate-300">{tag}</code>
      </div>
    </div>
    <div className="flex-1 p-6 overflow-auto">{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────
// Architecture diagram (pure CSS)
// ─────────────────────────────────────────────────────────
const ArchDiagram = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 font-mono text-xs text-slate-300 leading-7 overflow-x-auto">
    <pre>{`
  ┌─────────────────────────────────────────────────────────────┐
  │                      document (Light DOM)                   │
  │                                                             │
  │   <div id="app">          ← regular DOM tree               │
  │     <my-widget>           ← Custom Element (host)           │
  │       │                                                     │
  │       └──● Shadow Root  (mode: open | closed)              │
  │            │  ┌─────────────────────────────────────────┐  │
  │            │  │          Shadow DOM subtree             │  │
  │            │  │                                         │  │
  │            │  │  <style> ← scoped, won't leak out       │  │
  │            │  │  <slot>  ← projects Light DOM children  │  │
  │            │  │  <div class="internal">…</div>          │  │
  │            │  └─────────────────────────────────────────┘  │
  │   </div>                                                    │
  └─────────────────────────────────────────────────────────────┘

  Web Component = Custom Elements + Shadow DOM + HTML Templates
`}</pre>
  </div>
);

// ─────────────────────────────────────────────────────────
// Comparison table
// ─────────────────────────────────────────────────────────
const COMPARISON = [
  {
    aspect: "What is it?",
    shadow: "A hidden, encapsulated DOM subtree attached to a host element",
    wc: "A bundle: Custom Elements + Shadow DOM + HTML Templates",
  },
  {
    aspect: "Style isolation",
    shadow: "✅ Global CSS cannot penetrate; component CSS cannot leak out",
    wc: "✅ Achieved through Shadow DOM inside the custom element",
  },
  {
    aspect: "DOM isolation",
    shadow: "✅ querySelector from outside returns null (open mode still allows it via .shadowRoot)",
    wc: "✅ Inherited from Shadow DOM",
  },
  {
    aspect: "Reusability",
    shadow: "⚙️ API is low-level; manual wiring needed",
    wc: "✅ Ship as a single HTML tag, use anywhere",
  },
  {
    aspect: "Content projection",
    shadow: "<slot> distributes Light DOM children into shadow tree",
    wc: "Same — <slot> is the standard pattern",
  },
  {
    aspect: "Framework needed?",
    shadow: "❌ Pure browser API",
    wc: "❌ Pure browser API — works with React, Vue, Angular…",
  },
];

// ─────────────────────────────────────────────────────────
// Tab navigator
// ─────────────────────────────────────────────────────────
type Tab = "overview" | "shadow" | "components" | "compare";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",    label: "Overview",       icon: "🗺️" },
  { id: "shadow",      label: "Shadow DOM",     icon: "🌑" },
  { id: "components",  label: "Web Components", icon: "🧩" },
  { id: "compare",     label: "Comparison",     icon: "⚖️" },
];

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
const WebAPIs: React.FC = () => {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <Badge
          label="Browser Native APIs"
          color="border-violet-500/40 text-violet-300 bg-violet-500/10"
        />
        <h1 className="mt-4 text-4xl font-extrabold text-white tracking-tight">
          Shadow DOM &amp; Web Components
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
          The browser's built-in component model: encapsulate styles, isolate DOM subtrees, and ship
          reusable elements that work with{" "}
          <strong className="text-white">any framework — or none at all</strong>.
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit mx-auto flex-wrap justify-center">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? "rgba(99,102,241,0.3)" : "transparent",
                color: tab === t.id ? "#a5b4fc" : "#64748b",
                border: tab === t.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Overview ── */}
      {tab === "overview" && (
        <div className="max-w-6xl mx-auto space-y-8">
          <ArchDiagram />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConceptCard
              icon="🌑"
              title="Shadow DOM"
              code="attachShadow({ mode })"
              color="border-violet-500/20 bg-violet-500/5"
              items={[
                { label: "What", text: "A hidden DOM tree attached to a regular element. Styles inside it are scoped and don't bleed in or out." },
                { label: "Why", text: "Create UI widgets with zero style conflicts, regardless of the page's global CSS." },
                { label: "How", text: "Call host.attachShadow({ mode: 'open' }) then populate shadow.innerHTML. Use CSS custom properties as intentional style hooks." },
              ]}
            />
            <ConceptCard
              icon="🧩"
              title="Custom Elements"
              code="customElements.define(tag, Class)"
              color="border-cyan-500/20 bg-cyan-500/5"
              items={[
                { label: "What", text: "Lets you define new HTML tags (e.g. <user-card>) backed by a JavaScript class." },
                { label: "Why", text: "Package UI + behaviour into a single tag that works in any environment." },
                { label: "How", text: "Extend HTMLElement, implement lifecycle callbacks (connectedCallback, attributeChangedCallback…), then register with customElements.define()." },
              ]}
            />
            <ConceptCard
              icon="📄"
              title="HTML <template>"
              code="<template id='tpl'>…</template>"
              color="border-emerald-500/20 bg-emerald-500/5"
              items={[
                { label: "What", text: "An inert HTML fragment — parsed but not rendered until cloned." },
                { label: "Why", text: "Efficient blueprint for stamping out multiple identical structures without re-parsing HTML strings." },
                { label: "How", text: "Write markup inside <template>. Clone with tpl.content.cloneNode(true) and attach to the shadow root." },
              ]}
            />
            <ConceptCard
              icon="🎰"
              title="<slot> (Content Projection)"
              code="<slot name='x'></slot>"
              color="border-amber-500/20 bg-amber-500/5"
              items={[
                { label: "What", text: "A placeholder inside Shadow DOM that displays Light DOM children supplied by the consumer." },
                { label: "Why", text: "Makes components composable — consumers pass their own content; the component decides where it appears." },
                { label: "How", text: "Add <slot> in the template. Consumers use slot='x' attribute to target named slots." },
              ]}
            />
          </div>
        </div>
      )}

      {/* ── Tab: Shadow DOM ── */}
      {tab === "shadow" && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DemoCard
            title="Demo 1 — Style Encapsulation"
            tag="attachShadow"
            accentClass="bg-gradient-to-r from-violet-600/30 to-transparent"
          >
            <StyleEncapsulationDemo />
          </DemoCard>

          <DemoCard
            title="Demo 2 — DOM Isolation"
            tag='mode: "open" | "closed"'
            accentClass="bg-gradient-to-r from-indigo-600/30 to-transparent"
          >
            <DomIsolationDemo />
          </DemoCard>
        </div>
      )}

      {/* ── Tab: Web Components ── */}
      {tab === "components" && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DemoCard
            title="Demo 3 — Custom Element"
            tag="<user-card>"
            accentClass="bg-gradient-to-r from-cyan-600/30 to-transparent"
          >
            <CustomElementDemo />
          </DemoCard>

          <DemoCard
            title="Demo 4 — Template + Slot"
            tag="<toast-alert>"
            accentClass="bg-gradient-to-r from-emerald-600/30 to-transparent"
          >
            <TemplateSlotDemo />
          </DemoCard>
        </div>
      )}

      {/* ── Tab: Comparison ── */}
      {tab === "compare" && (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium w-1/3">Aspect</th>
                  <th className="text-left px-5 py-3 text-violet-300 font-medium w-1/3">Shadow DOM</th>
                  <th className="text-left px-5 py-3 text-cyan-300 font-medium w-1/3">Web Components</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.aspect}
                    className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                  >
                    <td className="px-5 py-3 text-slate-300 font-medium">{row.aspect}</td>
                    <td className="px-5 py-3 text-slate-200 text-xs leading-relaxed">{row.shadow}</td>
                    <td className="px-5 py-3 text-slate-200 text-xs leading-relaxed">{row.wc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* When to use callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                color: "border-violet-500/20 bg-violet-500/5",
                accent: "text-violet-400",
                title: "Use Shadow DOM when…",
                points: [
                  "You need scoped styles in a plain HTML/JS project",
                  "You're building a widget for 3rd-party embedding",
                  "You want to hide implementation details from devtools",
                ],
              },
              {
                color: "border-cyan-500/20 bg-cyan-500/5",
                accent: "text-cyan-400",
                title: "Use Web Components when…",
                points: [
                  "You need a cross-framework reusable component",
                  "You're building a design system for multiple teams",
                  "You ship a component library that others consume as HTML tags",
                ],
              },
              {
                color: "border-amber-500/20 bg-amber-500/5",
                accent: "text-amber-400",
                title: "Prefer React/Vue/etc when…",
                points: [
                  "You need server-side rendering out of the box",
                  "Your app is already framework-specific",
                  "You need rich reactive state management",
                ],
              },
            ].map((card) => (
              <div key={card.title} className={`rounded-2xl border p-5 ${card.color}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${card.accent}`}>
                  {card.title}
                </p>
                <ul className="space-y-2">
                  {card.points.map((pt) => (
                    <li key={pt} className="text-sm text-slate-200 flex gap-2">
                      <span>•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebAPIs;
