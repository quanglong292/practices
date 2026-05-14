import React from "react";
import { UseDeferredValueDemo } from "./UseDeferredValueDemo";
import { UseTransitionDemo } from "./UseTransitionDemo";

// ─────────────────────────────────────────────────────────────
// Shared layout helpers
// ─────────────────────────────────────────────────────────────

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}
  >
    {label}
  </span>
);

const ConceptCard = ({
  title,
  hook,
  color,
  items,
}: {
  title: string;
  hook: string;
  color: string;
  items: { label: string; text: string }[];
}) => (
  <div
    className={`rounded-2xl border p-5 backdrop-blur-sm space-y-3 ${color}`}
  >
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-white text-base">{title}</h3>
      <code className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">{hook}</code>
    </div>
    <dl className="space-y-2">
      {items.map(({ label, text }) => (
        <div key={label}>
          <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            {label}
          </dt>
          <dd className="text-sm text-slate-200 leading-relaxed">{text}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const DemoCard = ({
  title,
  accentClass,
  children,
}: {
  title: string;
  accentClass: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
    {/* Header */}
    <div className={`px-6 py-4 border-b border-white/10 ${accentClass}`}>
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
    {/* Body */}
    <div className="flex-1 p-6 overflow-auto">{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Comparison table
// ─────────────────────────────────────────────────────────────
const COMPARISON = [
  {
    aspect: "Who controls the state update?",
    deferred: "Someone else (prop / context)",
    transition: "You (you call the setter)",
  },
  {
    aspect: "Use-case pattern",
    deferred: "Receiving a value, wrapping a slow render",
    transition: "Triggering an update (click, route change)",
  },
  {
    aspect: "Loading indicator",
    deferred: "deferredVal !== liveVal",
    transition: "isPending flag",
  },
  {
    aspect: "API",
    deferred: "const deferred = useDeferredValue(value)",
    transition: "const [isPending, start] = useTransition()",
  },
  {
    aspect: "Interrupts urgent updates?",
    deferred: "✅ Yes",
    transition: "✅ Yes",
  },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
const AdvancedAPI = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      {/* Page title */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <Badge label="React 18 — Concurrent Features" color="border-indigo-500/40 text-indigo-300 bg-indigo-500/10" />
        <h1 className="mt-4 text-4xl font-extrabold text-white tracking-tight">
          useDeferredValue &amp; useTransition
        </h1>
        <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
          Both hooks keep the UI responsive during expensive renders by telling
          React which updates are <strong className="text-white">urgent</strong> and
          which can wait. Interact with the demos below to feel the difference.
        </p>
      </div>

      {/* Concept cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ConceptCard
          title="useDeferredValue"
          hook="useDeferredValue(value)"
          color="border-violet-500/20 bg-violet-500/5"
          items={[
            {
              label: "What",
              text: "Returns a deferred copy of a value. The copy lags behind during urgent updates.",
            },
            {
              label: "Why",
              text: "The expensive part (list) keeps using the old value while you type, so the input is never blocked.",
            },
            {
              label: "How",
              text: "Pass the live value in. Compare deferred !== live to show a stale indicator. Wrap the heavy component in React.memo so it only re-renders when the deferred value changes.",
            },
          ]}
        />
        <ConceptCard
          title="useTransition"
          hook="useTransition()"
          color="border-cyan-500/20 bg-cyan-500/5"
          items={[
            {
              label: "What",
              text: "Marks a state update as a non-urgent transition. Returns isPending and startTransition.",
            },
            {
              label: "Why",
              text: "Tab switches, route changes, or any heavy state update won't freeze the current view.",
            },
            {
              label: "How",
              text: "Wrap your setState call with startTransition(() => { ... }). Show a spinner using isPending on the trigger element (button), not the content.",
            },
          ]}
        />
      </div>

      {/* Live demos */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <DemoCard
          title="Demo 1 — useDeferredValue"
          accentClass="bg-gradient-to-r from-violet-600/30 to-transparent"
        >
          <UseDeferredValueDemo />
        </DemoCard>

        <DemoCard
          title="Demo 2 — useTransition"
          accentClass="bg-gradient-to-r from-cyan-600/30 to-transparent"
        >
          <UseTransitionDemo />
        </DemoCard>
      </div>

      {/* Comparison table */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          Side-by-Side Comparison
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-5 py-3 text-slate-400 font-medium w-1/3">Aspect</th>
                <th className="text-left px-5 py-3 text-violet-300 font-medium w-1/3">useDeferredValue</th>
                <th className="text-left px-5 py-3 text-cyan-300 font-medium w-1/3">useTransition</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.aspect}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                >
                  <td className="px-5 py-3 text-slate-300 font-medium">{row.aspect}</td>
                  <td className="px-5 py-3 text-slate-200 font-mono text-xs">{row.deferred}</td>
                  <td className="px-5 py-3 text-slate-200 font-mono text-xs">{row.transition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rule of thumb */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">
              Rule of thumb — useDeferredValue
            </p>
            <p className="text-sm text-slate-200">
              Use when you <strong>receive</strong> a value from outside (prop, context, URL param)
              and want to make a slow derived render non-blocking.
            </p>
            <code className="block mt-3 bg-white/5 rounded-lg px-3 py-2 text-xs text-violet-300">
              {`// parent passes query, child defers it\nconst deferred = useDeferredValue(props.query);\n<HeavyList query={deferred} />`}
            </code>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Rule of thumb — useTransition
            </p>
            <p className="text-sm text-slate-200">
              Use when you <strong>own</strong> the state update — a button click, tab change, or
              route navigation that triggers an expensive render.
            </p>
            <code className="block mt-3 bg-white/5 rounded-lg px-3 py-2 text-xs text-cyan-300">
              {`// you control the setter\nstartTransition(() => {\n  setActiveTab(newTab);\n});`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAPI;
