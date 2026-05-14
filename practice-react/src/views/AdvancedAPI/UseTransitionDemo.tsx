/**
 * ─────────────────────────────────────────────────────────────
 * useTransition — WHAT / WHY / HOW
 * ─────────────────────────────────────────────────────────────
 *
 * WHAT:
 *   useTransition() returns [isPending, startTransition].
 *   startTransition(fn) marks the state updates inside fn as
 *   "non-urgent transitions" — React can interrupt and deprioritise
 *   them in favour of urgent updates (like user input).
 *
 * WHY:
 *   Some state updates trigger expensive re-renders (route changes,
 *   tab switches with heavy content, large data loads). Without
 *   useTransition every click blocks the UI until the render finishes.
 *   useTransition lets the old UI stay interactive while the new one
 *   is prepared in the background.
 *
 * HOW:
 *   const [isPending, startTransition] = useTransition();
 *
 *   // On click:
 *   startTransition(() => {
 *     setExpensiveState(newValue);   // ← non-urgent
 *   });
 *
 *   // isPending === true while React is still rendering the transition
 *   // Use it to show a loading indicator on the TRIGGER, not the content.
 *
 * DIFFERENCE vs useDeferredValue:
 *   - useTransition  → you OWN the state setter (tabs, routing, filters)
 *   - useDeferredValue → you receive a value from elsewhere (prop, context)
 *
 * DEMO:
 *   Three tabs, each rendering a slow list of 5 000 items.
 *   - Without transition: clicking a tab freezes the old tab until done.
 *   - With transition:    old tab stays interactive; spinner on button.
 */

import React, { memo, useMemo, useState, useTransition } from "react";

// ── Simulate expensive tab content ───────────────────────────
const TABS = ["Posts", "Photos", "Videos"] as const;
type Tab = (typeof TABS)[number];

const makeItems = (tab: Tab, count = 5_000) =>
  Array.from({ length: count }, (_, i) => `${tab.toLowerCase()}-item-${i}`);

const TabContent = memo(({ tab }: { tab: Tab }) => {
  // Intentionally expensive — real apps would fetch data
  const items = useMemo(() => makeItems(tab), [tab]);

  return (
    <ul className="mt-3 space-y-0.5 max-h-64 overflow-y-auto pr-1">
      {items.slice(0, 150).map((item) => (
        <li
          key={item}
          className="px-3 py-1 rounded-md bg-white/10 text-sm font-mono text-slate-200"
        >
          {item}
        </li>
      ))}
      <li className="text-slate-500 text-xs text-center py-2">
        …and {items.length - 150} more
      </li>
    </ul>
  );
});

// ── Tab button ────────────────────────────────────────────────
const TabButton = ({
  label,
  active,
  pending,
  onClick,
}: {
  label: Tab;
  active: boolean;
  pending: boolean;
  onClick: () => void;
}) => (
  <button
    id={`tab-btn-${label.toLowerCase()}`}
    onClick={onClick}
    className={[
      "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
      active
        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
        : "bg-white/10 text-slate-300 hover:bg-white/20",
    ].join(" ")}
  >
    {label}
    {/* Spinner shown on the button while THIS tab's transition is pending */}
    {pending && active && (
      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
    )}
  </button>
);

// ── Main demo component ───────────────────────────────────────
export const UseTransitionDemo = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Posts");

  //  🔑  THE KEY LINE
  const [isPending, startTransition] = useTransition();

  const handleTabClick = (tab: Tab) => {
    //  Wrap the expensive state update in startTransition
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Concept badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          🔑 useTransition
        </span>
        <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
          5 000 items per tab
        </span>
        <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
          Non-blocking tab switch
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            active={activeTab === tab}
            pending={isPending}
            onClick={() => handleTabClick(tab)}
          />
        ))}
      </div>

      {/* isPending inspector */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-slate-400 mb-1">isPending</p>
          <p className={`font-mono font-bold ${isPending ? "text-amber-400" : "text-green-400"}`}>
            {String(isPending)}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-slate-400 mb-1">activeTab (committed)</p>
          <p className="font-mono text-cyan-400">"{activeTab}"</p>
        </div>
      </div>

      {isPending && (
        <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          ⚡ React is rendering the new tab in the background — old tab stays interactive
        </p>
      )}

      {/* Content fades while transition is in-flight */}
      <div
        className="transition-opacity duration-300"
        style={{ opacity: isPending ? 0.4 : 1 }}
      >
        <TabContent tab={activeTab} />
      </div>
    </div>
  );
};
