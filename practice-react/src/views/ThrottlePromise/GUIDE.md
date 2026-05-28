# Teacher's Guide: Understanding Promise Throttling

Welcome! Let's master the **Promise Throttling** (or *Promise Concurrency Limit*) problem. 

Throttling promises is a crucial skill in modern web development. It prevents overloading external APIs, saves database connections, and optimizes client performance by ensuring we run only a maximum of `N` tasks concurrently.

---

## 1. Analyzing Your Original Implementation

Let's review your implementation line-by-line, including your latest adjustment where you removed `currentIndex++` from the initial launcher loop.

```typescript
type Fn = () => Promise<any>

const throttlePromise = async (fns: (Fn)[], limit: number) => {
    let currentIndex = 0;
    let results: any[] = [];

    const handler = async () => {
        // 🔴 BUG 1: The Off-By-One Skip
        if (currentIndex + 1 === fns.length) return;

        const fn = fns[currentIndex];

        // 🔴 BUG 2: Result Reordering / Mutation Race
        await fn().then((resolved) => {
            results.push(resolved)
            currentIndex++
            handler()
        }).catch((rejected) => {
            results.push(rejected)
            currentIndex++
            handler()
        })
    }

    // 🔴 BUG 3: The Initial Synchronous Duplicate Trap
    for (let i = 0; i < limit; i++) {
        handler()
    }

    // 🔴 BUG 4: The Instant Empty Return
    return results;
}
```

### Let's dissect the 4 critical bugs in this version:

### 🔴 BUG 1: The Off-By-One Skip (`currentIndex + 1 === fns.length`)
* **The Symptom**: The final task in your array (`fns[fns.length - 1]`) is **never executed**.
* **Why it happens**: If your array has 5 tasks (indices `0, 1, 2, 3, 4`), when `currentIndex` reaches `4`, the check `4 + 1 === 5` becomes `true`. The handler returns immediately, skipping the execution of `fns[4]`.
* **The Lesson**: Always check boundaries directly (e.g. `if (currentIndex >= fns.length) return;`) rather than predicting the next index relative to the length. Also, if `fns` is empty, `currentIndex + 1 === 0` is false, and it will try to run `fns[0]()`, which is `undefined` and throws an error.

### 🔴 BUG 2: Result Reordering
* **The Symptom**: Your results array will **not** match the order of your input tasks.
* **Why it happens**: You use `results.push(resolved)` inside the `.then()` callback. Because tasks are asynchronous and take different durations, a fast task at index 3 might resolve *before* a slow task at index 0. The fast task's result is pushed first, ending up at `results[0]` instead of `results[3]`.
* **The Lesson**: When mapping an array of tasks, the results must preserve index alignment (`results[index] = resolved`), regardless of when they complete.

### 🔴 BUG 3: The Initial Synchronous Duplicate Trap (Latest Adjustment)
* **The Symptom**: The **first task (`fns[0]`) is launched `limit` times concurrently**, and subsequent indexes get skipped or corrupted!
* **Why it happens**: 
  1. JavaScript executes code synchronously until it encounters the first asynchronous boundary (an `await` or `.then` chain).
  2. Inside the `for (let i = 0; i < limit; i++)` loop, `handler()` is called synchronously.
  3. Inside `handler()`, it evaluates `const fn = fns[currentIndex]`. Since `currentIndex` starts at `0`, it selects `fns[0]`.
  4. It calls `await fn().then(...)`. This starts task `0`, but immediately suspends the execution of `handler` and yields control back to the `for` loop.
  5. The loop moves to `i = 1` and calls `handler()` again. **However, `currentIndex` is still `0`** because the `.then(...)` callback that increments it hasn't run yet!
  6. As a result, it launches task `0` again. This repeats `limit` times.
* **The Lesson**: Shared mutable variables accessed across asynchronous boundaries must be incremented/captured **synchronously** at the moment the task is claimed.

### 🔴 BUG 4: The Instant Empty Return
* **The Symptom**: Calling `throttlePromise` returns an empty array `[]` immediately.
* **Why it happens**: `throttlePromise` is marked as `async`, but at the bottom, it synchronously returns `results` right after starting the initial loop. Since the tasks are asynchronous, they won't have resolved when `return results` is hit.
* **The Lesson**: You must return a `Promise` that explicitly resolves only when all tasks have finished executing.

---

## 2. A Correct, Semantic, and Simple Version: The "Worker-Pool" Pattern

To fix all these issues cleanly and keep the code highly readable, we use the **Worker Pool** pattern. 
Instead of complex recursion, we spawn `limit` active "workers" (concurrency slots). Each worker continuously pulls the next available task from a shared queue, processes it, stores the result at the exact index, and loops until the queue is empty.

Here is the elegant, professional implementation:

```typescript
type Fn = () => Promise<any>;

/**
 * Executes an array of promise-returning functions with a concurrency limit.
 * Preserves the exact index order in the returned results array.
 */
export const throttlePromiseFixed = async (fns: Fn[], limit: number): Promise<any[]> => {
  // 1. Prepare a pre-allocated results array of the exact same size
  const results: any[] = new Array(fns.length);
  
  // 2. Track indices and completion progress
  let nextIndex = 0;
  let completedCount = 0;

  // 3. Return a Promise that resolves when every single task has finished
  return new Promise((resolve) => {
    // Edge case: Empty task list resolves immediately
    if (fns.length === 0) {
      resolve([]);
      return;
    }

    // 4. Declare a persistent worker that executes tasks from the queue
    const worker = async () => {
      // Loop while there are still unclaimed tasks
      while (nextIndex < fns.length) {
        // Crucial: Synchronously capture and claim the task index
        const currentIndex = nextIndex;
        nextIndex++; // Increment synchronously so other workers don't grab this task

        const fn = fns[currentIndex];

        try {
          // Execute task and place result in its designated slot
          const resolvedValue = await fn();
          results[currentIndex] = resolvedValue;
        } catch (rejectedError) {
          // Handle rejection without crashing the pool
          results[currentIndex] = rejectedError;
        } finally {
          // Track overall progress
          completedCount++;
          // If this was the final task, resolve the main promise
          if (completedCount === fns.length) {
            resolve(results);
          }
        }
      }
    };

    // 5. Spawn workers up to the concurrency limit (or total tasks if smaller)
    const activeWorkersCount = Math.min(limit, fns.length);
    for (let i = 0; i < activeWorkersCount; i++) {
      worker();
    }
  });
};
```

### Why this version is superior and robust:
1. **Perfect Ordering**: Results are saved directly into `results[currentIndex]`, guaranteeing the output array aligns perfectly with `fns`.
2. **Zero Duplicate Runs**: Spawning the `nextIndex` is protected by synchronous capture (`const currentIndex = nextIndex; nextIndex++`) inside the `while` block, avoiding race conditions entirely.
3. **No Early Exit**: The main promise only resolves when `completedCount === fns.length`.
4. **Handles Failures Gracefully**: The `try...catch` block ensures that even if one task fails, other tasks keep executing, and the error is preserved in the results.

---

## 3. Let's Visualize It!

Open the dashboard we've created in the app to watch these two implementations run side-by-side! You will see exactly how the duplicate runs occur in the buggy version, and how beautifully the correct version coordinates tasks.
