# Step 04: Stackless DFS Traversal with Parent Pointer (React Fiber's Core Work Loop)

## 1. Context & Motivation

In **Step 01**, we used the native Call Stack (caused UI thread blocking).  
In **Step 02**, we used an explicit array stack on the Heap (solved thread blocking, but wasted memory on dynamic arrays and lacked ancestor awareness).  
In **Step 03**, we transformed the hierarchy into an **LCRS Tree** (`child`, `sibling`, `return`).

Now, in **Step 04**, we achieve the ultimate goal: **traversing an entire tree with $O(1)$ auxiliary space**—no recursive stack, no array stack. All we need is a **single moving pointer** (`currentUnitOfWork`).

This is the exact traversal mechanism inside React's `ReactFiberWorkLoop.js` and Didact's `performUnitOfWork`.

---

## 2. The 3-Rule Traversal State Machine

At any given fiber node, the pointer decides the next node using a strict priority order:

1. **Down (Child First):**  
   If `current.child` exists, visit `current.child`.
2. **Right (Sibling Next):**  
   If no child exists, but `current.sibling` exists, visit `current.sibling`.
3. **Up and Right (Climb Ancestors via Return):**  
   If neither child nor sibling exists, climb up using `current.return` until finding an ancestor with a `sibling`. Visit that sibling (the "uncle").
4. **Terminate:**  
   If climbing reaches `null` (above the root), traversal is finished.

```text
Visual Traversal Order:
       [ div ] (1)
          |
        child
          |
          v
       [ h1 ] (2)  --- sibling --->  [ h2 ] (5)
          |
        child
          |
          v
        [ p ] (3)  --- sibling --->  [ a ] (4)

Path: div -> h1 -> p -> a -> (climb to h1, find h2) -> h2 -> (climb to div -> root finish)
Output: ["div", "h1", "p", "a", "h2"]
```

---

## 3. Implementation: Standalone Stackless DFS

```javascript
/**
 * Executes a single unit of work and finds the next unit of work.
 * Exactly maps to React's performUnitOfWork / beginWork + completeWork.
 *
 * @param {Object} fiber
 * @param {string[]} result - Accumulator for traversal output
 * @returns {Object|null} - Next fiber node to work on
 */
function performUnitOfWork(fiber, result) {
  // 1. Perform work on current fiber (Pre-order action)
  result.push(fiber.val);

  // 2. Rule 1: If it has a child, that's the next unit of work
  if (fiber.child) {
    return fiber.child;
  }

  // 3. Rule 2 & 3: If no child, look for sibling or climb to uncle
  let nextFiber = fiber;
  while (nextFiber) {
    // If current level has a sibling, jump to it
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // Otherwise climb up to parent and inspect parent's sibling
    nextFiber = nextFiber.return;
  }

  // Climbed beyond root -> all work complete
  return null;
}

/**
 * Stackless driver loop using a single pointer.
 * @param {Object|null} rootFiber
 * @returns {string[]}
 */
function traverseTreeStackless(rootFiber) {
  if (!rootFiber) return [];

  const result = [];
  let nextUnitOfWork = rootFiber;

  while (nextUnitOfWork !== null) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork, result);
  }

  return result;
}

// ------------------- Verification -------------------

// Construct LCRS Tree from Step 03
const div = { val: "div", child: null, sibling: null, return: null };
const h1 = { val: "h1", child: null, sibling: null, return: div };
const h2 = { val: "h2", child: null, sibling: null, return: div };
const p = { val: "p", child: null, sibling: null, return: h1 };
const a = { val: "a", child: null, sibling: null, return: h1 };

div.child = h1;
h1.sibling = h2;
h1.child = p;
p.sibling = a;

console.log("Stackless Traversal:", traverseTreeStackless(div));
// Output: ["div", "h1", "p", "a", "h2"]
```

---

## 4. Why This Unlocks React's Time-Slicing (Concurrent Mode)

Because the entire execution state is stored in a single variable (`nextUnitOfWork`), we can pause the while-loop whenever the browser runs out of time:

```javascript
let nextUnitOfWork = rootFiber;

function workLoop(deadline) {
  let shouldYield = false;

  // Run as many units of work as possible within the frame budget (~16ms)
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork, result);
    // Yield to browser if less than 1ms left in this frame
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (nextUnitOfWork) {
    // Interrupted! Main thread takes over to process clicks / paint screen.
    // When idle again, pick up EXACTLY from nextUnitOfWork without data loss.
    requestIdleCallback(workLoop);
  } else {
    console.log("All work finished! Commit phase begins.");
  }
}

requestIdleCallback(workLoop);
```

---

## 5. Mapping to React Source Code (`packages/react-reconciler`)

When reading React core, you will see this exact algorithm split into two operational concepts:

```text
             [ Fiber Root ]
                   |
     beginWork()   |   completeWork()
   (Go down .child)| (Climb up .return)
                   v
             [ Leaf Node ] ---> .sibling ---> (Next Subtree)
```

1. **`beginWork(fiber)`**:
   - Compares props, evaluates hooks, computes diff.
   - Creates child fiber and returns `fiber.child`.
2. **`completeWork(fiber)`**:
   - Called when a node has no children or finished its children.
   - Prepares DOM node, bubbles flags up.
   - If `fiber.sibling` exists, resumes `beginWork` on that sibling.
   - If no sibling, calls `completeWork(fiber.return)`.

---

## 6. Comparison: Step 01 through Step 04

| Metric               | Step 01: Recursive DFS            | Step 02: Explicit Stack DFS   | Step 04: Stackless LCRS DFS                          |
| :------------------- | :-------------------------------- | :---------------------------- | :--------------------------------------------------- |
| **State Storage**    | Engine Call Stack (C++)           | JavaScript Array (Heap)       | Tree Node Pointers (`child`, `sibling`, `return`)    |
| **Auxiliary Memory** | $O(D)$ where $D$ = depth          | $O(N)$ dynamic array elements | **$O(1)$** (1 pointer variable)                      |
| **Interruptible?**   | **NO** (Blocks thread)            | YES (Can pause `while`)       | **YES** (Can pause anywhere, zero stack reconstruct) |
| **React Era**        | React 0.x – 15 (Stack Reconciler) | Intermediate Prototype        | **React 16+ (Fiber Engine)**                         |

---

## 7. Master Checklist (Complete Journey)

- [x] **Step 01:** Understand why Call Stack recursion blocks the single thread.
- [x] **Step 02:** Externalize execution state to a loop and an array.
- [x] **Step 03:** Eliminate array overhead by converting N-ary trees to LCRS trees.
- [x] **Step 04:** Achieve pointer-based traversal that can pause and resume indefinitely with zero memory overhead.

$\rightarrow$ **You now have the complete DSA foundation required to understand React Fiber.**
