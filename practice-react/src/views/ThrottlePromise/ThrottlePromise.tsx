import { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Plus,
  Minus,
  Code,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  AlertCircle,
  List,
  Sliders,
  PlayCircle
} from "lucide-react";
import { throttlePromiseBuggy, throttlePromiseFixed, type Fn } from "./useThrottlePromise";

interface TaskConfig {
  id: number;
  duration: number; // in ms
  behavior: "resolve" | "reject";
  status: "idle" | "running" | "resolved" | "rejected";
  progress: number;
  result: string | null;
}

const DEFAULT_PRESETS: Record<string, Omit<TaskConfig, "status" | "progress" | "result">[]> = {
  standard: [
    { id: 0, duration: 1500, behavior: "resolve" },
    { id: 1, duration: 2500, behavior: "resolve" },
    { id: 2, duration: 1000, behavior: "resolve" },
    { id: 3, duration: 3000, behavior: "resolve" },
    { id: 4, duration: 2000, behavior: "resolve" },
    { id: 5, duration: 1500, behavior: "resolve" },
  ],
  slowFirst: [
    { id: 0, duration: 4000, behavior: "resolve" }, // slow first task
    { id: 1, duration: 1000, behavior: "resolve" },
    { id: 2, duration: 1000, behavior: "resolve" },
    { id: 3, duration: 1000, behavior: "resolve" },
    { id: 4, duration: 1000, behavior: "resolve" },
  ],
  mixedErrors: [
    { id: 0, duration: 1500, behavior: "resolve" },
    { id: 1, duration: 2000, behavior: "reject" }, // will fail
    { id: 2, duration: 1200, behavior: "resolve" },
    { id: 3, duration: 2500, behavior: "reject" }, // will fail
    { id: 4, duration: 1800, behavior: "resolve" },
  ],
};

const ThrottlePromise = () => {
  const [tasks, setTasks] = useState<TaskConfig[]>(
    DEFAULT_PRESETS.standard.map(t => ({ ...t, status: "idle", progress: 0, result: null }))
  );
  const [limit, setLimit] = useState<number>(2);
  const [algorithm, setAlgorithm] = useState<"buggy" | "fixed">("fixed");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeSlots, setActiveSlots] = useState<(number | null)[]>(new Array(2).fill(null));
  const [returnedValue, setReturnedValue] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Resize active slots array whenever the limit changes
  useEffect(() => {
    if (!isRunning) {
      setActiveSlots(new Array(limit).fill(null));
    }
  }, [limit, isRunning]);

  // Autoscroll logs console
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" | "system" = "info") => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatted = `[${time}] ${message}`;
    setLogs(prev => [...prev, formatted]);
  };

  const handleReset = () => {
    setTasks(prev => prev.map(t => ({ ...t, status: "idle", progress: 0, result: null })));
    setActiveSlots(new Array(limit).fill(null));
    setReturnedValue(null);
    setLogs([]);
    setIsRunning(false);
    addLog("System reset. Ready for simulation.", "system");
  };

  const loadPreset = (presetKey: keyof typeof DEFAULT_PRESETS) => {
    if (isRunning) return;
    const selected = DEFAULT_PRESETS[presetKey];
    setTasks(selected.map(t => ({ ...t, status: "idle", progress: 0, result: null })));
    setReturnedValue(null);
    setLogs([]);
    addLog(`Loaded preset: "${presetKey}"`, "info");
  };

  const addTask = () => {
    if (isRunning || tasks.length >= 10) return;
    const newId = tasks.length;
    const duration = Math.floor(Math.random() * 4 + 1) * 1000; // 1s to 4s
    setTasks(prev => [...prev, { id: newId, duration, behavior: "resolve", status: "idle", progress: 0, result: null }]);
    addLog(`Added Task ${newId} (duration: ${duration}ms) to queue.`, "info");
  };

  const removeTask = (id: number) => {
    if (isRunning || tasks.length <= 1) return;
    setTasks(prev => prev.filter(t => t.id !== id).map((t, idx) => ({ ...t, id: idx })));
    addLog(`Removed task and reindexed remaining tasks.`, "info");
  };

  const updateTaskDuration = (id: number, delta: number) => {
    if (isRunning) return;
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextDuration = Math.max(500, t.duration + delta);
        return { ...t, duration: nextDuration };
      }
      return t;
    }));
  };

  const toggleTaskBehavior = (id: number) => {
    if (isRunning) return;
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, behavior: t.behavior === "resolve" ? "reject" : "resolve" };
      }
      return t;
    }));
  };

  const handleStartSimulation = async () => {
    setIsRunning(true);
    setReturnedValue(null);
    setLogs([]);
    setActiveSlots(new Array(limit).fill(null));

    // Reset task statuses
    const resetTasks = tasks.map(t => ({ ...t, status: "idle" as const, progress: 0, result: null }));
    setTasks(resetTasks);

    addLog(`🚀 Starting simulation with ${algorithm.toUpperCase()} algorithm (Limit: ${limit})...`, "system");

    // Construct the actual array of functions that represent each task
    const fns: Fn[] = resetTasks.map((task, idx) => {
      return async () => {
        // Mark task as running in state
        setTasks(prev => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], status: "running" };
          return next;
        });

        // Claim slot in activeSlots
        let assignedSlot = -1;
        setActiveSlots(prev => {
          const next = [...prev];
          // Find first empty slot
          const slot = next.indexOf(null);
          if (slot !== -1) {
            next[slot] = idx;
            assignedSlot = slot;
          } else {
            // Buggy algorithm duplicate trap: multiple handlers run concurrently exceeding limit
            next.push(idx);
            assignedSlot = next.length - 1;
          }
          return next;
        });

        addLog(`⚡ Task ${idx} (duration: ${task.duration}ms) launched and claimed Slot ${assignedSlot}`, "info");

        // Simulate progress with interval
        const startTime = Date.now();
        await new Promise<void>((resolve) => {
          const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / task.duration) * 100, 100);

            setTasks(prev => {
              const next = [...prev];
              if (next[idx]) {
                next[idx] = { ...next[idx], progress: Math.round(pct) };
              }
              return next;
            });

            if (elapsed >= task.duration) {
              clearInterval(timer);
              resolve();
            }
          }, 50);
        });

        // Release slot
        setActiveSlots(prev => {
          const next = [...prev];
          const slotIdx = next.indexOf(idx);
          if (slotIdx !== -1) {
            next[slotIdx] = null;
          }
          return next;
        });

        const isSuccess = task.behavior === "resolve";
        if (isSuccess) {
          setTasks(prev => {
            const next = [...prev];
            if (next[idx]) {
              next[idx] = { ...next[idx], status: "resolved", result: `✓ Success (Val ${idx})` };
            }
            return next;
          });
          addLog(`✅ Task ${idx} finished successfully.`, "success");
          return `Val ${idx}`;
        } else {
          setTasks(prev => {
            const next = [...prev];
            if (next[idx]) {
              next[idx] = { ...next[idx], status: "rejected", result: `✗ Failed (Err ${idx})` };
            }
            return next;
          });
          addLog(`❌ Task ${idx} failed/rejected.`, "error");
          throw `Err ${idx}`;
        }
      };
    });

    try {
      const selectedAlgo = algorithm === "buggy" ? throttlePromiseBuggy : throttlePromiseFixed;

      addLog(`📥 Invoking throttlePromise wrapper...`, "info");
      const executionPromise = selectedAlgo(fns, limit);

      // Race the promise with a tiny 40ms delay to check if it resolves immediately (Bug 4!)
      const quickCheck = await Promise.race([
        executionPromise.then(val => ({ immediate: true, val })),
        new Promise(r => setTimeout(() => r({ immediate: false }), 40))
      ]) as { immediate: boolean; val?: any };

      if (quickCheck.immediate) {
        addLog(`⚠️ BUG DETECTED: throttlePromise returned instantly before tasks resolved!`, "error");
        addLog(`Returned value reference at start: ${JSON.stringify(quickCheck.val)}`, "warning");
        setReturnedValue(quickCheck.val);
      } else {
        addLog(`⏳ throttlePromise returned a pending Promise. Waiting for pool execution...`, "info");
      }

      // Await final actual resolution of the returned promise
      const finalResult = await executionPromise;

      addLog(`🎉 Main promise resolution triggered!`, "success");
      setReturnedValue(finalResult);
      addLog(`🎁 Final Returned Array: ${JSON.stringify(finalResult)}`, "success");

    } catch (err) {
      addLog(`💥 Simulation aborted due to unhandled promise error: ${err}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans selection:bg-teal-500/30">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-semibold tracking-wider uppercase text-xs">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Interactive Algorithms Laboratory
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Promise Throttler Visualizer
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Visualize how a concurrency limit coordinates asynchronous promise-returning functions.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="file:///c:/Users/Le.Quang.Long/Desktop/practices/practice-react/src/views/ThrottlePromise/GUIDE.md"
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Info className="h-4 w-4 text-teal-400" />
              Read Teacher's Guide
            </a>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Controls Column (Span 4) */}
          <section className="lg:col-span-4 space-y-6">

            {/* Algorithm Selector Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-base">
                <Code className="h-5 w-5 text-indigo-400" />
                Select Algorithm
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => !isRunning && setAlgorithm("fixed")}
                  disabled={isRunning}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${algorithm === "fixed"
                      ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Correct (Semantic)
                </button>
                <button
                  onClick={() => !isRunning && setAlgorithm("buggy")}
                  disabled={isRunning}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${algorithm === "buggy"
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Original (Buggy)
                </button>
              </div>

              {/* Dynamic Warning for Buggy version */}
              {algorithm === "buggy" && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-300 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-bold block">Buggy Version Issues:</span>
                    1. Duplicate runs of task 0 (launches multiple times concurrently).<br />
                    2. Instant synchronous return of empty results.<br />
                    3. Skips the final task completely due to off-by-one check.
                  </div>
                </div>
              )}

              {algorithm === "fixed" && (
                <div className="p-3 bg-teal-950/20 border border-teal-800/30 rounded-xl text-xs text-teal-300 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-teal-400" />
                  <div>
                    <span className="font-bold block">Correct Semantic Design:</span>
                    Uses a <strong>Worker-Pool</strong> configuration. Spawns persistent workers that synchronously claim and process indexes, preserving order and handling errors safely.
                  </div>
                </div>
              )}
            </div>

            {/* Parameter Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-base">
                <Sliders className="h-5 w-5 text-purple-400" />
                Parameters
              </div>

              {/* Slider for Concurrency Limit */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Concurrency Limit (limit)</span>
                  <span className="text-teal-400 font-bold text-base">{limit}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={limit}
                  disabled={isRunning}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-[10px] text-slate-500 px-1">
                  <span>1 (Sequential)</span>
                  <span>5 (Max)</span>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium block">Load Simulation Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => loadPreset("standard")}
                    disabled={isRunning}
                    className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-[10px] font-semibold rounded-lg text-slate-300 border border-slate-800 transition disabled:opacity-50"
                  >
                    Standard Mix
                  </button>
                  <button
                    onClick={() => loadPreset("slowFirst")}
                    disabled={isRunning}
                    className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-[10px] font-semibold rounded-lg text-slate-300 border border-slate-800 transition disabled:opacity-50"
                  >
                    Slow First
                  </button>
                  <button
                    onClick={() => loadPreset("mixedErrors")}
                    disabled={isRunning}
                    className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-[10px] font-semibold rounded-lg text-slate-300 border border-slate-800 transition disabled:opacity-50"
                  >
                    Errors Mix
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleStartSimulation}
                  disabled={isRunning}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 hover:from-teal-300 hover:to-indigo-400 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-teal-500/20 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4 fill-current text-inherit" />
                  Run Concurrency Simulation
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset View
                </button>
              </div>
            </div>

            {/* Active Workers Visualization */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex justify-between items-center text-slate-300 font-semibold text-base">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-teal-400" />
                  Active Concurrency Slots
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Pool Size: {limit}</span>
              </div>

              <div className="space-y-2.5">
                {activeSlots.map((slotTaskIdx, slotIdx) => (
                  <div
                    key={slotIdx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${slotTaskIdx !== null
                        ? "bg-teal-950/20 border-teal-800/60 shadow-inner shadow-teal-500/5 animate-pulse"
                        : "bg-slate-950 border-slate-800 text-slate-500"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${slotTaskIdx !== null ? "bg-teal-400" : "bg-slate-700"}`} />
                      <span className="text-xs font-semibold">Slot {slotIdx}</span>
                    </div>

                    <div className="text-right">
                      {slotTaskIdx !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-teal-300">
                            Task {slotTaskIdx}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tasks[slotTaskIdx]?.progress}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium tracking-wide uppercase italic text-slate-600">
                          Idle / Waiting
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* Queue & Logs Column (Span 8) */}
          <section className="lg:col-span-8 space-y-6">

            {/* Task Queue Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-base">
                  <PlayCircle className="h-5 w-5 text-indigo-400" />
                  Task Queue Manager
                </div>

                <button
                  onClick={addTask}
                  disabled={isRunning || tasks.length >= 10}
                  className="py-1 px-3 bg-slate-950 hover:bg-slate-800 text-xs font-semibold border border-slate-800 text-teal-400 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  Add Custom Task
                </button>
              </div>

              {/* Task Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 bg-slate-950 ${task.status === "running"
                        ? "border-teal-500/70 ring-1 ring-teal-500/20"
                        : task.status === "resolved"
                          ? "border-emerald-500/60"
                          : task.status === "rejected"
                            ? "border-rose-500/60"
                            : "border-slate-800/80 hover:border-slate-700"
                      }`}
                  >

                    {/* Background Progress Slider */}
                    {task.status === "running" && (
                      <div
                        className="absolute inset-y-0 left-0 bg-teal-500/5 transition-all duration-100 ease-out"
                        style={{ width: `${task.progress}%` }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col h-full justify-between gap-3">

                      {/* Top Row: Task Name & Remove */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">
                              Task {task.id}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              (index {idx})
                            </span>
                          </div>

                          {/* Duration adjustments */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                              {task.duration / 1000}s
                            </span>

                            {!isRunning && (
                              <div className="flex gap-0.5">
                                <button
                                  onClick={() => updateTaskDuration(task.id, -500)}
                                  className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                                >
                                  <Minus className="h-2.5 w-2.5" />
                                </button>
                                <button
                                  onClick={() => updateTaskDuration(task.id, 500)}
                                  className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {!isRunning && tasks.length > 1 && (
                          <button
                            onClick={() => removeTask(task.id)}
                            className="p-1 hover:bg-slate-900 text-slate-600 hover:text-rose-400 rounded-lg transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Middle: Behavior Selector (Resolve/Reject) & Progress Indicator */}
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => toggleTaskBehavior(task.id)}
                          disabled={isRunning}
                          className={`px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase rounded-md transition ${task.behavior === "resolve"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/20"
                              : "bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/20"
                            } disabled:opacity-75 disabled:pointer-events-none`}
                        >
                          {task.behavior === "resolve" ? "✓ Will Resolve" : "✗ Will Reject"}
                        </button>

                        <div className="text-[10px] text-right font-medium">
                          {task.status === "idle" && <span className="text-slate-500 uppercase tracking-wider text-[8px]">Pending</span>}
                          {task.status === "running" && <span className="text-teal-400 animate-pulse font-mono">{task.progress}%</span>}
                          {task.status === "resolved" && <span className="text-emerald-400">Completed</span>}
                          {task.status === "rejected" && <span className="text-rose-400">Failed</span>}
                        </div>
                      </div>

                      {/* Bottom Status Output */}
                      {task.result && (
                        <div className={`mt-1.5 text-[10px] font-semibold font-mono p-1.5 rounded-lg border text-center ${task.status === "resolved"
                            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                            : "bg-rose-950/20 border-rose-900/40 text-rose-400"
                          }`}>
                          {task.result}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Returned Array Output */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-base">
                  <AlertCircle className="h-5 w-5 text-purple-400" />
                  Function Returned Result (State)
                </div>

                {returnedValue !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase border ${algorithm === "buggy"
                      ? "bg-amber-950/30 text-amber-400 border-amber-900/40"
                      : "bg-emerald-950/30 text-emerald-400 border-emerald-900/40"
                    }`}>
                    {algorithm === "buggy" ? "Immediate Reference (Buggy)" : "Final Resolved Value"}
                  </span>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner min-h-[50px] flex items-center justify-center">
                {returnedValue !== null ? (
                  <div className="w-full">
                    <pre className={`text-center ${algorithm === "buggy" ? "text-amber-400" : "text-emerald-400"}`}>
                      {JSON.stringify(returnedValue, null, 2)}
                    </pre>
                    {algorithm === "buggy" && (
                      <p className="text-[10px] text-amber-500 mt-2 text-center italic font-sans">
                        ℹ️ Note: Because of Bug 4, your function returned this array reference immediately as <strong>[]</strong>.
                        As concurrent executions mutated it in the background, it filled up out of order!
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-600 text-xs italic uppercase tracking-wider">
                    {isRunning ? "Waiting for function invocation..." : "Click 'Run Concurrency Simulation' above"}
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Terminal Logs */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex justify-between items-center text-slate-300 font-semibold text-base">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-mono text-xs text-slate-400 ml-1">Terminal Execution Console</span>
                </div>

                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition"
                >
                  Clear Console
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 select-text shadow-inner">
                {logs.length > 0 ? (
                  logs.map((log, idx) => {
                    let color = "text-slate-300";
                    if (log.includes("🚀") || log.includes("Invoking")) color = "text-purple-400 font-semibold";
                    else if (log.includes("✅") || log.includes("🎉") || log.includes("Final")) color = "text-emerald-400";
                    else if (log.includes("⚡")) color = "text-teal-300";
                    else if (log.includes("❌")) color = "text-rose-400";
                    else if (log.includes("⚠️") || log.includes("WARNING")) color = "text-amber-400 bg-amber-950/20 px-1 py-0.5 rounded";

                    return (
                      <div key={idx} className={`${color} whitespace-pre-wrap leading-5`}>
                        {log}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-600 text-center py-20 italic">
                    Terminal ready. Run a simulation to log internal state transitions.
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

          </section>

        </div>

      </div>
    </div>
  );
};

export default ThrottlePromise;
