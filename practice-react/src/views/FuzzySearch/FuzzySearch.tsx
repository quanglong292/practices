import { useRef, useEffect } from "react";
import {
  Search,
  Play,
  Trash2,
  BarChart3,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
} from "lucide-react";
import { useFuzzySearch, SAMPLE_DATASET } from "./useFuzzySearch";
import type { LogEntry, SearchResult, FrequencyEntry } from "./useFuzzySearch";

// ─── Sub-components ──────────────────────────────────────────────────

function HighlightedText({
  text,
  matchedIndices,
}: {
  text: string;
  matchedIndices: number[];
}) {
  const indexSet = new Set(matchedIndices);
  return (
    <span>
      {text.split("").map((char, i) =>
        indexSet.has(i) ? (
          <span key={i} className="text-amber-400 font-bold underline underline-offset-2">
            {char}
          </span>
        ) : (
          <span key={i} className="text-slate-300">
            {char}
          </span>
        )
      )}
    </span>
  );
}

function ResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50 hover:border-slate-600/80 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md bg-slate-700/80 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
          {result.score}
        </div>
        <span className="font-mono text-sm truncate">
          <HighlightedText
            text={result.item}
            matchedIndices={result.matchedIndices}
          />
        </span>
      </div>
      <span className="text-xs text-slate-500 font-mono shrink-0 ml-2">
        {result.matchedIndices.length} hits
      </span>
    </div>
  );
}

function FrequencyBar({ entry, maxCount }: { entry: FrequencyEntry; maxCount: number }) {
  const pct = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-center font-mono text-amber-400 font-bold">
        {entry.char}
      </span>
      <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono text-slate-400">
        {entry.count}
      </span>
    </div>
  );
}

function LogStatusIcon({ status }: { status: LogEntry["status"] }) {
  switch (status) {
    case "success":
      return <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />;
    case "error":
      return <XCircle size={13} className="text-red-400 shrink-0" />;
    case "info":
      return <Info size={13} className="text-sky-400 shrink-0" />;
  }
}

function LogLine({ log }: { log: LogEntry }) {
  return (
    <div className="flex items-start gap-2 py-1 px-2 text-xs font-mono hover:bg-slate-800/60 rounded transition-colors">
      <LogStatusIcon status={log.status} />
      <span className="text-slate-500 shrink-0">{log.timestamp}</span>
      {log.executionTime > 0 && (
        <span className="text-violet-400 shrink-0">{log.executionTime}ms</span>
      )}
      <span
        className={
          log.status === "error"
            ? "text-red-300"
            : log.status === "success"
              ? "text-emerald-300"
              : "text-slate-300"
        }
      >
        {log.message}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function FuzzySearch() {
  const {
    query,
    output,
    isProcessing,
    logs,
    executeSearch,
    runTests,
    clearLogs,
  } = useFuzzySearch(SAMPLE_DATASET);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log console
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const maxFreq =
    output && output.frequencyMap.length > 0
      ? output.frequencyMap[0].count
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        {/* ── Header ── */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
            Fuzzy Search Filter
          </h1>
          <p className="text-sm text-slate-500">
            Subsequence matching · Frequency counting · HashMap + Two-pointer
          </p>
        </header>

        {/* ── Search Bar ── */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => executeSearch(e.target.value)}
            placeholder="Type to fuzzy search (e.g. 'rct' → React)…"
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
          {isProcessing && (
            <Loader2
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin"
            />
          )}
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Results Panel ── */}
          <div className="lg:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Hash size={14} />
                <span>
                  Results
                  {output && (
                    <span className="ml-1 text-slate-500">
                      ({output.totalMatched}/{output.totalScanned})
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-80">
              {!output && !query && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm gap-2 py-10">
                  <Search size={32} strokeWidth={1.5} />
                  <span>Start typing to search {SAMPLE_DATASET.length} items</span>
                </div>
              )}

              {output && output.results.length === 0 && query && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm gap-2 py-10">
                  <XCircle size={32} strokeWidth={1.5} />
                  <span>No matches found for "{query}"</span>
                </div>
              )}

              {output &&
                output.results.map((r, i) => (
                  <ResultCard key={`${r.item}-${i}`} result={r} />
                ))}
            </div>
          </div>

          {/* ── Frequency Panel ── */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 text-sm font-medium text-slate-400">
              <BarChart3 size={14} />
              <span>Character Frequency</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-80">
              {(!output || output.frequencyMap.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm gap-2 py-10">
                  <BarChart3 size={32} strokeWidth={1.5} />
                  <span>Frequency data will appear here</span>
                </div>
              )}

              {output &&
                output.frequencyMap.slice(0, 20).map((entry) => (
                  <FrequencyBar
                    key={entry.char}
                    entry={entry}
                    maxCount={maxFreq}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* ── Log Console ── */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Clock size={14} />
              <span>Console</span>
              <span className="text-xs text-slate-600">({logs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-run-tests"
                onClick={runTests}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-indigo-500/15 text-indigo-400 rounded-md hover:bg-indigo-500/25 transition-colors border border-indigo-500/20"
              >
                <Play size={12} />
                Run Tests
              </button>
              <button
                id="btn-clear-logs"
                onClick={clearLogs}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-700/50 text-slate-400 rounded-md hover:bg-slate-700/80 transition-colors border border-slate-600/30"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-48 p-2 space-y-0.5">
            {logs.length === 0 && (
              <div className="text-center text-slate-600 text-xs py-4 font-mono">
                — Console output will appear here —
              </div>
            )}
            {logs.map((log) => (
              <LogLine key={log.id} log={log} />
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
