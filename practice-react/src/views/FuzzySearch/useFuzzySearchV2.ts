/**
 * useFuzzySearchV2 — Complete Logic Hook for Fuzzy Search Filter with Frequency Counting
 *
 * DSA Concepts:
 * - Fuzzy string matching (subsequence matching with scoring heuristics)
 * - Frequency map (HashMap / counting occurrences)
 * - Filtering + sorting by relevance score
 *
 * V2 Improvements over V1:
 * - All DSA logic fully implemented (no TO-DOs)
 * - fuzzyMatch validates all query chars are found (proper subsequence check)
 * - buildFrequencyMap uses Map<string, number> with case-insensitive counting
 * - fuzzySearchWithFrequency composes both functions with full pipeline
 * - Added debounced search support
 * - Added search history tracking
 * - Added algorithm complexity stats
 *
 * Flow:
 *   User types query → fuzzySearchWithFrequency(query, dataset)
 *   → for each item: fuzzyMatch(query, item) → score
 *   → buildFrequencyMap(matches) → frequency of each matched char
 *   → return sorted results with scores + frequency data
 */

import { useCallback, useRef, useState, useEffect, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────

export interface SearchResult {
  /** Original item string */
  item: string;
  /** Relevance score (higher = better match) */
  score: number;
  /** Indices of matched characters in the item */
  matchedIndices: number[];
}

export interface FrequencyEntry {
  /** The character */
  char: string;
  /** How many times it appeared across all matched results */
  count: number;
}

export interface SearchOutput {
  /** Filtered & sorted results */
  results: SearchResult[];
  /** Character frequency map from matched items */
  frequencyMap: FrequencyEntry[];
  /** Total items scanned */
  totalScanned: number;
  /** Total items matched */
  totalMatched: number;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  status: "success" | "error" | "info" | "warn";
  message: string;
  executionTime: number;
  data?: unknown;
}

export interface SearchHistoryEntry {
  query: string;
  matchCount: number;
  timestamp: number;
}

export interface AlgorithmStats {
  /** Total comparisons made during last search */
  comparisons: number;
  /** Total character lookups */
  characterLookups: number;
  /** Time complexity description */
  timeComplexity: string;
  /** Space complexity description */
  spaceComplexity: string;
}

// ─── Sample Dataset ──────────────────────────────────────────────────

export const SAMPLE_DATASET: string[] = [
  "TypeScript",
  "JavaScript",
  "React",
  "Angular",
  "Vue.js",
  "Svelte",
  "Next.js",
  "Nuxt.js",
  "Express",
  "NestJS",
  "GraphQL",
  "REST API",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS Lambda",
  "Firebase",
  "Supabase",
  "TailwindCSS",
  "Sass",
  "Webpack",
  "Vite",
  "ESLint",
  "Prettier",
  "Jest",
  "Cypress",
  "Playwright",
  "Storybook",
  "Figma",
  "Node.js",
  "Deno",
  "Bun",
  "Rust",
  "Go",
  "Python",
  "Java",
  "C++",
  "Swift",
];

// ─── Core DSA Functions (V2 — Fully Implemented) ─────────────────────

/** Internal stats tracker, reset per search cycle */
let _stats: AlgorithmStats = {
  comparisons: 0,
  characterLookups: 0,
  timeComplexity: "",
  spaceComplexity: "",
};

/**
 * Fuzzy match a query against a single item.
 * Returns a score (0 = no match) and the indices of matched characters.
 *
 * Algorithm: Greedy subsequence matching with scoring heuristics
 * - Iterate through query chars, find each in item (subsequence match)
 * - Award bonus for: consecutive matches, start-of-word, exact case match
 * - Penalize large gaps between matched characters
 * - Return score=0 if not ALL query chars are found (proper subsequence check)
 *
 * Time Complexity: O(Q * I) where Q = query length, I = item length
 * Space Complexity: O(Q) for matchedIndices array
 *
 * @param query  - The search string (e.g. "rct")
 * @param item   - The target string (e.g. "React")
 * @returns {{ score: number; matchedIndices: number[] }}
 */
export function fuzzyMatch(
  query: string,
  item: string,
): { score: number; matchedIndices: number[] } {
  if (!query || !item) return { score: 0, matchedIndices: [] };

  const queryLower = query.toLowerCase();
  const itemLower = item.toLowerCase();
  const matchedIndices: number[] = [];
  let score = 0;
  let qIdx = 0;

  _stats.comparisons++;

  // ── Pass 1: Greedy subsequence matching ──
  for (let i = 0; i < itemLower.length && qIdx < queryLower.length; i++) {
    _stats.characterLookups++;

    if (queryLower[qIdx] === itemLower[i]) {
      matchedIndices.push(i);

      // ── Scoring Heuristics ──

      // Bonus: match at the very start of the string
      if (i === 0) score += 10;

      // Bonus: match at start of a word (after space, dot, dash, uppercase boundary)
      if (i > 0) {
        const prevChar = item[i - 1];
        const currChar = item[i];
        const isWordBoundary =
          prevChar === " " ||
          prevChar === "." ||
          prevChar === "-" ||
          prevChar === "_" ||
          (prevChar === prevChar.toLowerCase() &&
            currChar === currChar.toUpperCase() &&
            currChar !== currChar.toLowerCase());
        if (isWordBoundary) score += 8;
      }

      // Bonus: consecutive match (previous matched char was at i-1)
      if (matchedIndices.length > 1) {
        const prevMatchIdx = matchedIndices[matchedIndices.length - 2];
        if (i === prevMatchIdx + 1) {
          score += 5;
        } else {
          // Penalty: gap between matches (smaller gap = smaller penalty)
          const gap = i - prevMatchIdx - 1;
          score -= Math.min(gap, 3);
        }
      }

      // Bonus: exact case match (query char matches item char case)
      if (query[qIdx] === item[i]) {
        score += 3;
      }

      // Base score for any match
      score += 1;

      qIdx++;
    }
  }

  // ── Validation: all query chars must be found (proper subsequence) ──
  if (qIdx < queryLower.length) {
    // Not all query characters were matched → no match
    return { score: 0, matchedIndices: [] };
  }

  // Bonus: shorter items that match get a relevance boost
  // (matching "React" with "rct" is more relevant than matching "ReactNativeComponent")
  const lengthRatio = query.length / item.length;
  score += Math.round(lengthRatio * 10);

  return { score: Math.max(score, 1), matchedIndices };
}

/**
 * Build a frequency map of characters from the matched results.
 *
 * Algorithm: HashMap-based character counting
 *   1. Create a Map<string, number>
 *   2. For each matched item, iterate its characters
 *   3. Skip spaces and special characters
 *   4. Increment count for each char (case-insensitive)
 *   5. Convert Map to array of FrequencyEntry
 *   6. Sort by count descending
 *
 * Time Complexity: O(N * L) where N = number of items, L = average item length
 * Space Complexity: O(K) where K = number of unique characters
 *
 * @param matchedItems - Array of matched item strings
 * @returns FrequencyEntry[]
 */
export function buildFrequencyMap(matchedItems: string[]): FrequencyEntry[] {
  // Step 1: Create a HashMap for counting
  const charMap = new Map<string, number>();

  // Step 2 & 3: Iterate all items and their characters
  for (const item of matchedItems) {
    for (const rawChar of item) {
      // Step 3: Skip spaces, dots, and special characters
      if (/[^a-zA-Z0-9]/.test(rawChar)) continue;

      // Step 4: Case-insensitive counting
      const char = rawChar.toLowerCase();
      charMap.set(char, (charMap.get(char) ?? 0) + 1);
    }
  }

  // Step 5: Convert Map to FrequencyEntry array
  const entries: FrequencyEntry[] = [];
  for (const [char, count] of charMap) {
    entries.push({ char, count });
  }

  // Step 6: Sort by count descending, then alphabetically for ties
  entries.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.char.localeCompare(b.char);
  });

  return entries;
}

/**
 * Main search function: combines fuzzyMatch + buildFrequencyMap.
 *
 * Pipeline:
 *   1. If query is empty, return all items with score 0
 *   2. For each item in dataset, call fuzzyMatch(query, item)
 *   3. Filter out items with score === 0
 *   4. Sort remaining by score descending
 *   5. Call buildFrequencyMap on matched items
 *   6. Return { results, frequencyMap, totalScanned, totalMatched }
 *
 * Time Complexity: O(D * Q * L) where D = dataset size, Q = query length, L = avg item length
 * Space Complexity: O(D + K) for results + frequency map
 *
 * @param query   - User's search input
 * @param dataset - Array of strings to search through
 * @returns SearchOutput
 */
export function fuzzySearchWithFrequency(
  query: string,
  dataset: string[],
): SearchOutput {
  // Reset stats for this search cycle
  _stats = {
    comparisons: 0,
    characterLookups: 0,
    timeComplexity: `O(${dataset.length} × ${query.length} × avg_len)`,
    spaceComplexity: `O(${dataset.length} + unique_chars)`,
  };

  // Step 1: If query is empty, return all items with score 0
  if (!query.trim()) {
    return {
      results: dataset.map((item) => ({
        item,
        score: 0,
        matchedIndices: [],
      })),
      frequencyMap: buildFrequencyMap(dataset),
      totalScanned: dataset.length,
      totalMatched: dataset.length,
    };
  }

  // Step 2: For each item, call fuzzyMatch
  const rawResults: SearchResult[] = [];
  for (const item of dataset) {
    const { score, matchedIndices } = fuzzyMatch(query, item);
    rawResults.push({ item, score, matchedIndices });
  }

  // Step 3: Filter out items with score === 0
  const matchedResults = rawResults.filter((r) => r.score > 0);

  // Step 4: Sort remaining by score descending
  matchedResults.sort((a, b) => b.score - a.score);

  // Step 5: Build frequency map from matched item strings
  const matchedItemStrings = matchedResults.map((r) => r.item);
  const frequencyMap = buildFrequencyMap(matchedItemStrings);

  // Step 6: Return full output
  return {
    results: matchedResults,
    frequencyMap,
    totalScanned: dataset.length,
    totalMatched: matchedResults.length,
  };
}

/** Retrieve the latest algorithm stats (call after fuzzySearchWithFrequency) */
export function getAlgorithmStats(): AlgorithmStats {
  return { ..._stats };
}

// ─── Internal Test Cases ─────────────────────────────────────────────

interface TestCase {
  name: string;
  run: () => { passed: boolean; message: string };
}

const TEST_CASES: TestCase[] = [
  {
    name: "fuzzyMatch: exact match should return high score",
    run: () => {
      const result = fuzzyMatch("react", "React");
      const passed = result.score > 0 && result.matchedIndices.length === 5;
      return {
        passed,
        message: passed
          ? `Score: ${result.score}, Indices: [${result.matchedIndices}]`
          : `Expected score > 0 and 5 matched indices, got score=${result.score}, indices=[${result.matchedIndices}]`,
      };
    },
  },
  {
    name: "fuzzyMatch: partial subsequence should match",
    run: () => {
      const result = fuzzyMatch("rct", "React");
      const passed = result.score > 0 && result.matchedIndices.length === 3;
      return {
        passed,
        message: passed
          ? `Score: ${result.score}, Indices: [${result.matchedIndices}]`
          : `Expected score > 0 and 3 matched indices, got score=${result.score}, indices=[${result.matchedIndices}]`,
      };
    },
  },
  {
    name: "fuzzyMatch: no match should return score 0",
    run: () => {
      const result = fuzzyMatch("xyz", "React");
      const passed = result.score === 0 && result.matchedIndices.length === 0;
      return {
        passed,
        message: passed
          ? "Correctly returned no match"
          : `Expected score=0 and no indices, got score=${result.score}`,
      };
    },
  },
  {
    name: "fuzzyMatch: incomplete subsequence returns 0",
    run: () => {
      const result = fuzzyMatch("reactzz", "React");
      const passed = result.score === 0;
      return {
        passed,
        message: passed
          ? "Correctly returned 0 for incomplete match"
          : `Expected score=0 for unmatched query, got score=${result.score}`,
      };
    },
  },
  {
    name: "fuzzyMatch: case-insensitive matching works",
    run: () => {
      const result = fuzzyMatch("REACT", "React");
      const passed = result.score > 0 && result.matchedIndices.length === 5;
      return {
        passed,
        message: passed
          ? `Case-insensitive match: Score=${result.score}`
          : `Expected case-insensitive match, got score=${result.score}`,
      };
    },
  },
  {
    name: "buildFrequencyMap: should count chars correctly",
    run: () => {
      const result = buildFrequencyMap(["aab", "abc"]);
      const aEntry = result.find((e) => e.char === "a");
      const passed = aEntry !== undefined && aEntry.count === 3;
      return {
        passed,
        message: passed
          ? `'a' count = ${aEntry!.count}`
          : `Expected 'a' to have count=3, got ${aEntry?.count ?? "not found"}`,
      };
    },
  },
  {
    name: "buildFrequencyMap: should skip special chars",
    run: () => {
      const result = buildFrequencyMap(["Vue.js", "Next.js"]);
      const dotEntry = result.find((e) => e.char === ".");
      const passed = dotEntry === undefined;
      return {
        passed,
        message: passed
          ? "Correctly skipped special characters"
          : `Expected no '.' entry, but found count=${dotEntry?.count}`,
      };
    },
  },
  {
    name: "buildFrequencyMap: should be sorted descending",
    run: () => {
      const result = buildFrequencyMap(["aaabbc"]);
      const passed =
        result.length === 3 &&
        result[0].char === "a" &&
        result[0].count === 3 &&
        result[1].char === "b" &&
        result[1].count === 2;
      return {
        passed,
        message: passed
          ? `Sorted: ${result.map((e) => `${e.char}=${e.count}`).join(", ")}`
          : `Expected a=3, b=2, c=1, got ${result.map((e) => `${e.char}=${e.count}`).join(", ")}`,
      };
    },
  },
  {
    name: "fuzzySearchWithFrequency: should return filtered results",
    run: () => {
      const result = fuzzySearchWithFrequency("react", SAMPLE_DATASET);
      const passed = result.totalMatched > 0 && result.results.length > 0;
      return {
        passed,
        message: passed
          ? `Matched ${result.totalMatched}/${result.totalScanned} items`
          : `Expected matches for "react", got ${result.totalMatched} matches`,
      };
    },
  },
  {
    name: "fuzzySearchWithFrequency: empty query returns all items",
    run: () => {
      const result = fuzzySearchWithFrequency("", SAMPLE_DATASET);
      const passed = result.totalMatched === SAMPLE_DATASET.length;
      return {
        passed,
        message: passed
          ? `All ${result.totalMatched} items returned for empty query`
          : `Expected ${SAMPLE_DATASET.length} results, got ${result.totalMatched}`,
      };
    },
  },
  {
    name: "fuzzySearchWithFrequency: results sorted by score desc",
    run: () => {
      const result = fuzzySearchWithFrequency("re", SAMPLE_DATASET);
      let isSorted = true;
      for (let i = 1; i < result.results.length; i++) {
        if (result.results[i].score > result.results[i - 1].score) {
          isSorted = false;
          break;
        }
      }
      return {
        passed: isSorted,
        message: isSorted
          ? `${result.results.length} results correctly sorted by score`
          : "Results are NOT sorted by score descending",
      };
    },
  },
];

// ─── React Hook (V2) ─────────────────────────────────────────────────

export function useFuzzySearchV2(dataset: string[] = SAMPLE_DATASET) {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState<SearchOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [stats, setStats] = useState<AlgorithmStats | null>(null);
  const logIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Append a log entry to the console */
  const addLog = useCallback(
    (
      status: LogEntry["status"],
      message: string,
      executionTime: number,
      data?: unknown,
    ) => {
      const entry: LogEntry = {
        id: logIdRef.current++,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        }),
        status,
        message,
        executionTime,
        data,
      };
      setLogs((prev) => [...prev, entry]);
    },
    [],
  );

  /** Execute search with timing, logging, and stats tracking */
  const executeSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      if (!searchQuery.trim()) {
        setOutput(null);
        setStats(null);
        addLog("info", "Query cleared", 0);
        return;
      }

      setIsProcessing(true);

      try {
        const start = performance.now();
        const result = fuzzySearchWithFrequency(searchQuery, dataset);
        const elapsed = performance.now() - start;
        const currentStats = getAlgorithmStats();

        setOutput(result);
        setStats(currentStats);

        // Track search history
        setSearchHistory((prev) => {
          const newEntry: SearchHistoryEntry = {
            query: searchQuery,
            matchCount: result.totalMatched,
            timestamp: Date.now(),
          };
          // Keep last 20 unique queries
          const filtered = prev.filter((h) => h.query !== searchQuery);
          return [...filtered, newEntry].slice(-20);
        });

        addLog(
          "success",
          `Search "${searchQuery}" → ${result.totalMatched}/${result.totalScanned} matches (${currentStats.comparisons} comparisons, ${currentStats.characterLookups} lookups)`,
          parseFloat(elapsed.toFixed(3)),
          { result, stats: currentStats },
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addLog("error", message, 0);
        setOutput(null);
        setStats(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [dataset, addLog],
  );

  /** Debounced search — waits 150ms after user stops typing */
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!searchQuery.trim()) {
        setOutput(null);
        setStats(null);
        addLog("info", "Query cleared", 0);
        return;
      }

      setIsProcessing(true);
      debounceRef.current = setTimeout(() => {
        executeSearch(searchQuery);
      }, 150);
    },
    [executeSearch, addLog],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /** Run internal test suite and log results */
  const runTests = useCallback(() => {
    addLog("info", "── Running V2 Test Suite ──", 0);

    let passed = 0;
    let failed = 0;

    for (const tc of TEST_CASES) {
      const start = performance.now();
      try {
        const result = tc.run();
        const elapsed = performance.now() - start;

        if (result.passed) {
          passed++;
          addLog(
            "success",
            `✓ ${tc.name}: ${result.message}`,
            parseFloat(elapsed.toFixed(3)),
          );
        } else {
          failed++;
          addLog(
            "error",
            `✗ ${tc.name}: ${result.message}`,
            parseFloat(elapsed.toFixed(3)),
          );
        }
      } catch (err) {
        failed++;
        const message = err instanceof Error ? err.message : "Unknown error";
        addLog("error", `✗ ${tc.name}: ${message}`, 0);
      }
    }

    addLog(
      failed === 0 ? "success" : "error",
      `── Tests Complete: ${passed} passed, ${failed} failed out of ${TEST_CASES.length} ──`,
      0,
    );
  }, [addLog]);

  /** Clear all logs */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /** Clear search history */
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    addLog("info", "Search history cleared", 0);
  }, [addLog]);

  /** Dataset stats — memoized */
  const datasetInfo = useMemo(
    () => ({
      totalItems: dataset.length,
      avgLength: Math.round(
        dataset.reduce((sum, item) => sum + item.length, 0) / dataset.length,
      ),
      totalChars: dataset.reduce((sum, item) => sum + item.length, 0),
    }),
    [dataset],
  );

  return {
    // State
    query,
    output,
    isProcessing,
    logs,
    searchHistory,
    stats,
    datasetInfo,
    // Actions
    executeSearch,
    debouncedSearch,
    runTests,
    clearLogs,
    clearHistory,
  };
}
