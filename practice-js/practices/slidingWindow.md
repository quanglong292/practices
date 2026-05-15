# Monotonic Deque — The Complete Guide

> Master the **Sliding Window Maximum** pattern by deeply understanding the data structure that powers it.

---

## Table of Contents

1. [What is a Monotonic Deque?](#1-what-is-a-monotonic-deque)
2. [Why do we need it?](#2-why-do-we-need-it)
3. [How it works — The Mental Model](#3-how-it-works--the-mental-model)
4. [The Lifecycle — Step by Step](#4-the-lifecycle--step-by-step)
5. [Code Walkthrough](#5-code-walkthrough)
6. [Visual Trace — Full Example](#6-visual-trace--full-example)
7. [The 4 Rules (Cheat Sheet)](#7-the-4-rules-cheat-sheet)
8. [Complexity Analysis](#8-complexity-analysis)
9. [When to Use Monotonic Deque](#9-when-to-use-monotonic-deque)
10. [Common Mistakes](#10-common-mistakes)

---

## 1. What is a Monotonic Deque?

A **Deque** (Double-Ended Queue) is a data structure that allows insertion and removal from **both ends** — front and back.

A **Monotonic Deque** is a deque where the elements are always maintained in a **sorted order** (either increasing or decreasing).

```
Monotonic DECREASING Deque (used for Sliding Window Maximum):

  Front ←──── [8, 5, 3, 1] ────→ Back
               ↑                   ↑
            Largest             Smallest
          (window max)       (most recent)
```

> [!IMPORTANT]
> The deque stores **indices**, not values. We use `arr[deque[i]]` to access the actual values. Storing indices lets us check whether an element has fallen outside the window.

---

## 2. Why do we need it?

### The Problem

> Given `arr = [1, 3, -1, -3, 5, 3, 6, 7]` and window size `k = 3`, find the **maximum** in every sliding window.

### Brute Force — O(n × k)

For each window position, scan all `k` elements to find the max:

```
Window [1, 3, -1]   → scan 3 elements → max = 3
Window [3, -1, -3]  → scan 3 elements → max = 3
Window [-1, -3, 5]  → scan 3 elements → max = 5
...
```

**Problem**: We're re-checking elements we've already seen. With `n = 1,000,000` and `k = 10,000`, that's **10 billion** operations.

### Monotonic Deque — O(n)

Each element enters and leaves the deque **at most once**. Total operations = `2n` = **O(n)**.

| Approach | Time | Space | When `n=1M, k=10K` |
|----------|------|-------|---------------------|
| Brute Force | O(n × k) | O(1) | ~10 billion ops |
| Monotonic Deque | O(n) | O(k) | ~2 million ops |

> [!TIP]
> The speedup comes from one key insight: **we preemptively discard elements that can never be the answer**.

---

## 3. How it works — The Mental Model

### 🏢 The "Tallest Person in Line" Analogy

Imagine people standing in a line at a concert, and you can only see through a window of size `k`:

```
You're looking through a window of width 3:

  [Person A: 180cm]  [Person B: 190cm]  [Person C: 170cm]  Person D: 195cm ...
  ╚══════════════════ Window ═══════════╝
```

**Rules:**
1. A **tall person blocks shorter people behind them** — you'll never see the short person as "tallest" as long as the tall one is in the window.
2. When the tall person **exits the window** (walks past), the next tallest becomes visible.
3. When a **new tall person enters**, all shorter people in front of them become irrelevant.

This is exactly how the Monotonic Deque works:

| Analogy | Deque Operation |
|---------|-----------------|
| New tall person enters, shorter ones become invisible | **Pop from back** while `arr[back] ≤ arr[i]` |
| Tallest person walks past the window | **Shift from front** if `front < i - k + 1` |
| New person joins the line | **Push to back** |
| Who's tallest right now? | **Peek front** → `deque[0]` |

---

## 4. The Lifecycle — Step by Step

The deque goes through **4 phases** on every iteration. Think of it as a cycle:

```
┌─────────────────────────────────────────────────────┐
│                  FOR EACH ELEMENT i                  │
│                                                      │
│   ┌──────────────┐                                   │
│   │  PHASE 1:    │  Is the front index outside       │
│   │  EXPIRE      │  the window [i-k+1, i]?           │
│   │  (shift)     │  YES → Remove from front           │
│   └──────┬───────┘                                   │
│          ↓                                            │
│   ┌──────────────┐                                   │
│   │  PHASE 2:    │  Is arr[i] ≥ arr[back]?           │
│   │  CLEAN       │  YES → Pop from back (repeat)     │
│   │  (pop)       │  "Evict the losers"                │
│   └──────┬───────┘                                   │
│          ↓                                            │
│   ┌──────────────┐                                   │
│   │  PHASE 3:    │  Push index i to the back          │
│   │  ENTER       │  of the deque                      │
│   │  (push)      │                                    │
│   └──────┬───────┘                                   │
│          ↓                                            │
│   ┌──────────────┐                                   │
│   │  PHASE 4:    │  Is i ≥ k-1? (window is full?)    │
│   │  HARVEST     │  YES → deque[0] is the max        │
│   │  (read)      │  Push arr[deque[0]] to result      │
│   └──────────────┘                                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Phase Descriptions

#### Phase 1 — EXPIRE (Remove outdated front)
```js
if (deque.length && deque[0] < i - k + 1) {
  deque.shift();
}
```
The element at the front may have been the max, but if its index is **outside the current window**, it's no longer valid. Evict it.

#### Phase 2 — CLEAN (Remove weaker backs)
```js
while (deque.length && arr[deque[deque.length - 1]] <= arr[i]) {
  deque.pop();
}
```
The new element `arr[i]` is **bigger and newer** than some elements at the back. Those back elements can **never** be the max in any future window — `arr[i]` will always be in the window longer and is bigger. So discard them.

> [!NOTE]
> This is the **key insight**: an older, smaller element is **dominated** by a newer, larger element. It will never win.

#### Phase 3 — ENTER (Add current element)
```js
deque.push(i);
```
Add the current index. It might be the max for a future window.

#### Phase 4 — HARVEST (Collect the answer)
```js
if (i >= k - 1) {
  result.push(arr[deque[0]]);
}
```
Once we've processed at least `k` elements, the front of the deque is guaranteed to be the maximum of the current window.

---

## 5. Code Walkthrough

```js
const maxSlidingWindow = (arr, k) => {
  const result = [];
  const deque = [];            // Stores INDICES, not values

  for (let i = 0; i < arr.length; i++) {

    // PHASE 1: EXPIRE — remove front if out of window
    if (deque.length && deque[0] < i - k + 1) {
      deque.shift();
    }

    // PHASE 2: CLEAN — remove back elements ≤ arr[i]
    while (deque.length && arr[deque[deque.length - 1]] <= arr[i]) {
      deque.pop();
    }

    // PHASE 3: ENTER — add current index
    deque.push(i);

    // PHASE 4: HARVEST — collect max once window is full
    if (i >= k - 1) {
      result.push(arr[deque[0]]);
    }
  }

  return result;
};
```

### Why indices instead of values?

If we stored values, we couldn't know **when** an element entered the window. Indices let us compute:
- **Is it in the window?** → `index >= i - k + 1`
- **What's its value?** → `arr[index]`

---

## 6. Visual Trace — Full Example

```
Input: arr = [1, 3, -1, -3, 5, 3, 6, 7],  k = 3
```

### Step-by-step

```
i=0  arr[i]=1
  Phase 1: deque=[]          → nothing to expire
  Phase 2: deque=[]          → nothing to clean
  Phase 3: deque=[0]         → push index 0
  Phase 4: i=0 < k-1=2      → window not full yet
  Deque state: [0]           → values: [1]

i=1  arr[i]=3
  Phase 1: deque=[0]         → 0 ≥ 1-3+1=-1 → keep
  Phase 2: arr[0]=1 ≤ 3      → pop 0!
           deque=[]           → empty, stop
  Phase 3: deque=[1]         → push index 1
  Phase 4: i=1 < k-1=2      → window not full yet
  Deque state: [1]           → values: [3]

i=2  arr[i]=-1
  Phase 1: deque=[1]         → 1 ≥ 2-3+1=0 → keep
  Phase 2: arr[1]=3 > -1     → keep (stop immediately)
  Phase 3: deque=[1,2]       → push index 2
  Phase 4: i=2 ≥ k-1=2      → ✅ HARVEST! arr[deque[0]] = arr[1] = 3
  Deque state: [1,2]         → values: [3,-1]
  Result: [3]

i=3  arr[i]=-3
  Phase 1: deque=[1,2]       → 1 ≥ 3-3+1=1 → keep
  Phase 2: arr[2]=-1 > -3    → keep (stop)
  Phase 3: deque=[1,2,3]     → push index 3
  Phase 4: ✅ HARVEST!        → arr[1] = 3
  Deque state: [1,2,3]       → values: [3,-1,-3]
  Result: [3, 3]

i=4  arr[i]=5
  Phase 1: deque=[1,2,3]     → 1 < 4-3+1=2 → 💀 EXPIRE! shift 1
           deque=[2,3]
  Phase 2: arr[3]=-3 ≤ 5     → pop 3!
           arr[2]=-1 ≤ 5     → pop 2!
           deque=[]           → empty, stop
  Phase 3: deque=[4]         → push index 4
  Phase 4: ✅ HARVEST!        → arr[4] = 5
  Deque state: [4]           → values: [5]
  Result: [3, 3, 5]

i=5  arr[i]=3
  Phase 1: deque=[4]         → 4 ≥ 5-3+1=3 → keep
  Phase 2: arr[4]=5 > 3      → keep (stop)
  Phase 3: deque=[4,5]       → push index 5
  Phase 4: ✅ HARVEST!        → arr[4] = 5
  Deque state: [4,5]         → values: [5,3]
  Result: [3, 3, 5, 5]

i=6  arr[i]=6
  Phase 1: deque=[4,5]       → 4 ≥ 6-3+1=4 → keep
  Phase 2: arr[5]=3 ≤ 6      → pop 5!
           arr[4]=5 ≤ 6      → pop 4!
           deque=[]           → empty, stop
  Phase 3: deque=[6]         → push index 6
  Phase 4: ✅ HARVEST!        → arr[6] = 6
  Deque state: [6]           → values: [6]
  Result: [3, 3, 5, 5, 6]

i=7  arr[i]=7
  Phase 1: deque=[6]         → 6 ≥ 7-3+1=5 → keep
  Phase 2: arr[6]=6 ≤ 7      → pop 6!
           deque=[]           → empty, stop
  Phase 3: deque=[7]         → push index 7
  Phase 4: ✅ HARVEST!        → arr[7] = 7
  Deque state: [7]           → values: [7]
  Result: [3, 3, 5, 5, 6, 7] ✅
```

### Deque Visualization Over Time

```
Step   arr[i]   Deque (indices)   Deque (values)     Window            Max
─────  ──────   ───────────────   ──────────────     ──────────────    ───
i=0    1        [0]               [1]                [1]  _  _          -
i=1    3        [1]               [3]                [1, 3]  _          -
i=2    -1       [1, 2]            [3, -1]            [1, 3, -1]        3
i=3    -3       [1, 2, 3]         [3, -1, -3]        [3, -1, -3]       3
i=4    5        [4]               [5]                [-1, -3, 5]       5
i=5    3        [4, 5]            [5, 3]             [-3, 5, 3]        5
i=6    6        [6]               [6]                [5, 3, 6]         6
i=7    7        [7]               [7]                [3, 6, 7]         7
```

> [!TIP]
> Notice the deque values are **always decreasing** (front to back). This is the "monotonic" property. That's why the front is always the maximum!

---

## 7. The 4 Rules (Cheat Sheet)

```
╔═══════════════════════════════════════════════════════════╗
║              MONOTONIC DEQUE — 4 RULES                    ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  1. EXPIRE:  if front is outside window → shift()         ║
║                                                           ║
║  2. CLEAN:   while back ≤ new element  → pop()            ║
║              "A newer, bigger element dominates"           ║
║                                                           ║
║  3. ENTER:   always push the new index → push()           ║
║                                                           ║
║  4. HARVEST: once window is full       → read front       ║
║              deque[0] = index of max                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### The One-Liner Intuition

> **"Why keep a smaller, older candidate when a bigger, newer one just arrived — and will stay in the window longer?"**

---

## 8. Complexity Analysis

### Time Complexity: O(n)

This might seem surprising since there's a `while` loop inside a `for` loop. But:

- Each element is pushed onto the deque **exactly once** → `n` pushes total
- Each element is popped from the deque **at most once** → at most `n` pops total
- Total operations = `n + n = 2n` = **O(n)**

This is called **amortized O(1)** per element.

```
Think of it this way:

  You have n coins (one per element).
  Each coin pays for ONE push and ONE pop.
  No element can be pushed or popped more than once.
  Total cost = 2n = O(n).
```

### Space Complexity: O(k)

The deque holds at most `k` elements (the window size).

---

## 9. When to Use Monotonic Deque

Use a monotonic deque when you need to:

| Problem Pattern | Example |
|----------------|---------|
| Find **max/min in a sliding window** | LeetCode #239 — Sliding Window Maximum |
| Find **max/min in every subarray of size k** | Max of all subarrays of size k |
| Optimize DP transitions with range queries | Jump Game VI (LeetCode #1696) |
| Shortest subarray with sum ≥ k | LeetCode #862 |

### How to Identify

Ask yourself:
1. Is there a **fixed-size or bounded window**?
2. Do I need the **max or min** within that window?
3. Is the brute force approach **O(n × k)** and I need **O(n)**?

If yes to all three → **Monotonic Deque**.

### Monotonic Deque vs Monotonic Stack

| Feature | Monotonic Stack | Monotonic Deque |
|---------|----------------|-----------------|
| Removal | Back only (pop) | Both ends (shift + pop) |
| Use case | Next Greater/Smaller Element | Sliding Window Max/Min |
| Window? | No fixed window | Fixed window size k |
| Example | Daily Temperatures (#739) | Sliding Window Max (#239) |

---

## 10. Common Mistakes

### ❌ Mistake 1: Storing values instead of indices
```js
// WRONG — can't check if element is outside window
deque.push(arr[i]);

// CORRECT — store indices, access values via arr[index]
deque.push(i);
```

### ❌ Mistake 2: Forgetting the EXPIRE phase
```js
// WRONG — expired elements pollute the max
// (missing the shift check entirely)

// CORRECT
if (deque.length && deque[0] < i - k + 1) {
  deque.shift();
}
```

### ❌ Mistake 3: Using `<` instead of `<=` in CLEAN phase
```js
// WRONG — keeps equal elements, causing duplicates
while (arr[deque[deque.length - 1]] < arr[i])

// CORRECT — equal elements should be replaced by newer one
while (arr[deque[deque.length - 1]] <= arr[i])
```
Why `<=`? If two elements are equal, the **newer** one should stay because it will remain in the window longer.

### ❌ Mistake 4: Harvesting too early
```js
// WRONG — collecting results before window is full
result.push(arr[deque[0]]); // runs from i=0

// CORRECT — only after we have k elements
if (i >= k - 1) {
  result.push(arr[deque[0]]);
}
```

---

## Quick Reference

```
              MONOTONIC DECREASING DEQUE
              
  ┌─── Front (max) ───────────── Back (min) ───┐
  │                                              │
  │   [idx₁]  [idx₂]  [idx₃]  ...  [idxₙ]      │
  │     ↓       ↓       ↓             ↓          │
  │   val₁  ≥ val₂  ≥ val₃  ≥ ... ≥ valₙ        │
  │                                              │
  │   ← shift()                    pop() →       │
  │   (expire old)              (evict losers)   │
  │                            ← push() (enter)  │
  │                                              │
  └──────────────────────────────────────────────┘
  
  answer = arr[deque[0]]  ← always the window max
```
