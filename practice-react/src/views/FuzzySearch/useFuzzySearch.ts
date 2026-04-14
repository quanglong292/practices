/**
 * useFuzzySearch — Logic Hook for Fuzzy Search Filter with Frequency Counting
 *
 * DSA Concepts:
 * - Fuzzy string matching (edit distance / subsequence matching)
 * - Frequency map (HashMap / counting occurrences)
 * - Filtering + sorting by relevance score
 *
 * Flow:
 *   User types query → fuzzySearchWithFrequency(query, dataset)
 *   → for each item: fuzzyMatch(query, item) → score
 *   → buildFrequencyMap(matches) → frequency of each matched char
 *   → return sorted results with scores + frequency data
 */

import { useCallback, useRef, useState } from "react";

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
  status: "success" | "error" | "info";
  message: string;
  executionTime: number;
  data?: unknown;
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

// ─── Core DSA Functions (Skeleton) ───────────────────────────────────

/**
 * Fuzzy match a query against a single item.
 * Returns a score (0 = no match) and the indices of matched characters.
 *
 * Algorithm idea:
 * - Iterate through query chars, find each in item (subsequence match)
 * - Award bonus for consecutive matches, start-of-word matches
 * - Return 0 if not all query chars found
 *
 * @param query  - The search string (e.g. "rct")
 * @param item   - The target string (e.g. "React")
 * @returns {{ score: number; matchedIndices: number[] }}
 */
export function fuzzyMatch(
  _query: string,
  _item: string,
): { score: number; matchedIndices: number[] } {
  let score = 0;
  let matchedIndices = [];
  let qIdx = 0;

  for (let i = 0; i < _item.length; i++) {
    const query = _query[qIdx]?.toLowerCase();
    const item = _item[i]?.toLowerCase();
    const normalItem = _item[i];

    if (query == item) {
      matchedIndices.push(i);
      // Match first case
      if (i === 0) score += 10;
      // Continuous + 5
      if (matchedIndices.length > 1) {
        const lastMatched = matchedIndices[matchedIndices.length - 2];
        if (i === lastMatched + 1) score += 5;
      }
      // Different case + 8
      if (query !== normalItem) score += 8;
      qIdx++;
    }
  }

  return { score, matchedIndices };
}

/**
 * Build a frequency map of characters from the matched results.
 *
 * Algorithm idea:
 * - Use a HashMap (Map<string, number>) to count character occurrences
 * - Iterate all matched items, count each character
 * - Return sorted by frequency (descending)
 *
 * @param matchedItems - Array of matched item strings
 * @returns FrequencyEntry[]
 */
export function buildFrequencyMap(_matchedItems: string[]): FrequencyEntry[] {
  // TO-DO: Implement DSA logic here
  // Hints:
  //   1. Create a Map<string, number>
  //   2. For each item, iterate its characters
  //   3. Skip spaces and special characters (optional)
  //   4. Increment count for each char (case-insensitive)
  //   5. Convert Map to array of FrequencyEntry
  //   6. Sort by count descending
  return [];
}

/**
 * Main search function: combines fuzzyMatch + buildFrequencyMap.
 *
 * @param query   - User's search input
 * @param dataset - Array of strings to search through
 * @returns SearchOutput
 */
export function fuzzySearchWithFrequency(
  _query: string,
  _dataset: string[],
): SearchOutput {
  // TO-DO: Implement DSA logic here
  // Hints:
  //   1. If query is empty, return all items with score 0
  //   2. For each item in dataset, call fuzzyMatch(query, item)
  //   3. Filter out items with score === 0
  //   4. Sort remaining by score descending
  //   5. Call buildFrequencyMap on matched items
  //   6. Return { results, frequencyMap, totalScanned, totalMatched }
  return {
    results: [],
    frequencyMap: [],
    totalScanned: 0,
    totalMatched: 0,
  };
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
];

// ─── React Hook ──────────────────────────────────────────────────────

export function useFuzzySearch(dataset: string[] = SAMPLE_DATASET) {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState<SearchOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

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

  /** Execute search with timing and logging */
  const executeSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      if (!searchQuery.trim()) {
        setOutput(null);
        addLog("info", "Query cleared", 0);
        return;
      }

      setIsProcessing(true);

      try {
        const start = performance.now();
        const result = fuzzySearchWithFrequency(searchQuery, dataset);
        const elapsed = performance.now() - start;

        setOutput(result);
        addLog(
          "success",
          `Search "${searchQuery}" → ${result.totalMatched}/${result.totalScanned} matches`,
          parseFloat(elapsed.toFixed(3)),
          result,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addLog("error", message, 0);
        setOutput(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [dataset, addLog],
  );

  /** Run internal test suite and log results */
  const runTests = useCallback(() => {
    addLog("info", "── Running Test Suite ──", 0);

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
      `── Tests Complete: ${passed} passed, ${failed} failed ──`,
      0,
    );
  }, [addLog]);

  /** Clear all logs */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    // State
    query,
    output,
    isProcessing,
    logs,
    // Actions
    executeSearch,
    runTests,
    clearLogs,
  };
}
