/**
 * ─────────────────────────────────────────────────────────────
 * useDeferredValue — WHAT / WHY / HOW
 * ─────────────────────────────────────────────────────────────
 *
 * WHAT:
 *   useDeferredValue(value) returns a "deferred" copy of the value.
 *   During an urgent update (e.g. keystroke), the deferred copy keeps
 *   its OLD value so React can re-render the expensive part later,
 *   without blocking the input.
 *
 * WHY:
 *   Some parts of the UI are expensive to re-render (large lists,
 *   heavy computations). Without deferral, every keystroke blocks the
 *   browser until the expensive render finishes → input lag.
 *   useDeferredValue lets the input stay snappy while the slow part
 *   catches up asynchronously.
 *
 * HOW:
 *   const deferred = useDeferredValue(liveValue);
 *   - deferred === liveValue  → UI is up-to-date (no pending work)
 *   - deferred !== liveValue  → stale, expensive render in progress
 *   Use that difference to show a "stale" visual hint.
 *
 * DEMO:
 *   - 20,000 items rendered in a list.
 *   - Typing in the input updates the query immediately (fast).
 *   - The list filters against the DEFERRED query (slow, non-blocking).
 *   - While stale: list fades slightly so the user knows it's updating.
 */

import React, { useDeferredValue, useMemo, useState } from "react";

// ── Simulate a heavy dataset ──────────────────────────────────
const ALL_ITEMS: string[] = Array.from({ length: 20_000 }, (_, i) => {
  const words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"];
  return `${words[i % words.length]}-${i}`;
});

// ── Heavy filtered list ──────────────────────────────────────
const HeavyList = React.memo(({ query }: { query: string }) => {
  const filtered = useMemo(() => {
    if (!query) return ALL_ITEMS.slice(0, 100);
    return ALL_ITEMS.filter((item) => item.includes(query.toLowerCase())).slice(0, 200);
  }, [query]);

  return (
    <ul className="mt-3 space-y-0.5 max-h-64 overflow-y-auto pr-1">
      {filtered.map((item) => (
        <li
          key={item}
          className="px-3 py-1 rounded-md bg-white/10 text-sm font-mono text-slate-200"
        >
          {item}
        </li>
      ))}
      {filtered.length === 0 && (
        <li className="text-slate-400 text-sm text-center py-4">No results</li>
      )}
    </ul>
  );
});

// ── Main demo component ───────────────────────────────────────
export const UseDeferredValueDemo = () => {
  const [query, setQuery] = useState("");

  //  🔑  THE KEY LINE: defer the slow part
  const deferredQuery = useDeferredValue(query);

  //  When the two differ, an expensive render is still in-flight
  const isStale = deferredQuery !== query;

  return (
    <div className="flex flex-col gap-4">
      {/* Concept badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
          🔑 useDeferredValue
        </span>
        <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
          20 000 items
        </span>
        <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
          React.memo + useMemo
        </span>
      </div>

      {/* Input — always snappy */}
      <div className="relative">
        <input
          id="deferred-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to filter 20 000 items…"
          className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        />
        {/* Spinner when stale */}
        {isStale && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-violet-400 animate-pulse">
            ⟳ updating…
          </span>
        )}
      </div>

      {/* State inspector */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-slate-400 mb-1">live query (input)</p>
          <p className="font-mono text-green-400">"{query}"</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-slate-400 mb-1">deferred query (list)</p>
          <p className={`font-mono ${isStale ? "text-amber-400" : "text-green-400"}`}>
            "{deferredQuery}"
          </p>
        </div>
      </div>

      {/* Stale indicator */}
      {isStale && (
        <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          ⚡ Input is ahead of the list — React is rendering the slow list in the background
        </p>
      )}

      {/* Heavy list fades when stale */}
      <div
        className="transition-opacity duration-300"
        style={{ opacity: isStale ? 0.5 : 1 }}
      >
        <HeavyList query={deferredQuery} />
      </div>
    </div>
  );
};
