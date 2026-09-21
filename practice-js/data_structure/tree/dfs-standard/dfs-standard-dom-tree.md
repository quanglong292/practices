# Step 01: Recursive DFS on N-ary Tree (The Stack Reconciler Era)

## 1. Context & Motivation

Before React 16, React used the **Stack Reconciler**.

When `render()` or `setState()` was triggered, React traversed the Virtual DOM tree recursively using the native JavaScript Call Stack. While simple and elegant, this approach had an architectural bottleneck: **it was completely synchronous and uninterruptible**.

To understand why React had to re-architect its entire engine around **Fibers**, you first need to master how recursive Depth-First Search (DFS) interacts with the JavaScript runtime.

---

## 2. Problem Statement

Given the root of an N-ary tree representing a simplified DOM component hierarchy, implement a function `traverseTree(root)` that visits every node in **Pre-order (Parent $\rightarrow$ Children from left to right)** using **recursion**.

### Node Schema

```typescript
interface TreeNode {
  val: string;
  children: TreeNode[];
}
```

### Input

- `root`: The root node of the N-ary tree (can be `null`).

### Output

- An array of strings (`string[]`) representing the nodes in the order they were processed.

---

## 3. Visual Example

### Tree Diagram

```text
          [ div ]
         /       \
      [ h1 ]    [ h2 ]
      /    \
    [ p ]  [ a ]
```

### Raw JavaScript Object

```javascript
const tree = {
  val: "div",
  children: [
    {
      val: "h1",
      children: [
        { val: "p", children: [] },
        { val: "a", children: [] },
      ],
    },
    {
      val: "h2",
      children: [],
    },
  ],
};
```

### Expected Output

```javascript
["div", "h1", "p", "a", "h2"];
```

---

## 4. Implementation

```javascript
/**
 * Traverses an N-ary tree using standard recursion (DFS Pre-order).
 * @param {Object|null} node - The current tree node.
 * @param {string[]} result - Accumulator for the visited node values.
 * @returns {string[]}
 */
function traverseTree(node, result = []) {
  // Base case: empty node
  if (!node) {
    return result;
  }

  // 1. Process current node (Pre-order: Parent first)
  result.push(node.val);

  // 2. Recurse through children from left to right
  for (let i = 0; i < node.children.length; i++) {
    traverseTree(node.children[i], result);
  }

  return result;
}

// Execution
const output = traverseTree(tree);
console.log("Traversal Order:", output);
// Output: ["div", "h1", "p", "a", "h2"]
```

---

## 5. Under The Hood: The JavaScript Call Stack

Here is step-by-step what the V8 Engine does in memory during execution:

```text
Time --->

1. Call Stack: [ traverse(div) ]
   - Action: Push "div" to result.
   - Loop: Calls traverse(h1).

2. Call Stack: [ traverse(div), traverse(h1) ]
   - Action: Push "h1" to result.
   - Loop: Calls traverse(p).

3. Call Stack: [ traverse(div), traverse(h1), traverse(p) ]
   - Action: Push "p" to result.
   - Loop: p.children is empty.
   - Return: traverse(p) pops off the stack.

4. Call Stack: [ traverse(div), traverse(h1) ]
   - Action: Resume h1 loop at index 1 -> calls traverse(a).

5. Call Stack: [ traverse(div), traverse(h1), traverse(a) ]
   - Action: Push "a" to result.
   - Loop: a.children is empty.
   - Return: traverse(a) pops off the stack.

6. Call Stack: [ traverse(div), traverse(h1) ]
   - Action: h1 loop finished.
   - Return: traverse(h1) pops off the stack.

7. Call Stack: [ traverse(div) ]
   - Action: Resume div loop at index 1 -> calls traverse(h2).

8. Call Stack: [ traverse(div), traverse(h2) ]
   - Action: Push "h2" to result.
   - Loop: h2.children is empty.
   - Return: traverse(h2) pops off the stack.

9. Call Stack: [ traverse(div) ]
   - Action: div loop finished.
   - Return: traverse(div) pops off the stack.

10. Call Stack: [] (Empty)
    - Program complete.
```

---

## 6. Critical Analysis: Why This Breaks in High-Scale UI

1. **Synchronous Monopoly (Thread Blocking):**
   - JavaScript is single-threaded. When `traverseTree(root)` is running, the Call Stack is continuously occupied.
   - If the tree has $10,000$ elements and takes $80\text{ms}$ to reconcile, the browser cannot fire event handlers, run CSS transitions, or render at $60\text{fps}$ ($16.6\text{ms}$ budget per frame). The UI freezes.

2. **No Pause/Resume Capability:**
   - The state of where you are in the tree (which child index you were on, which parent you need to return to) is locked inside **C++ stack frames** managed by the JS engine.
   - You cannot serialize or yield the Call Stack mid-execution to let a user click pass through, then resume seamlessly where you left off.

3. **Risk of Stack Overflow:**
   - Deeply nested component trees create deep call stacks, increasing memory pressure and risking `Maximum call stack size exceeded`.

---

## 7. Hands-on Practice: Simulation of Thread Blocking

Run this snippet in Node.js or the browser console to witness how deep recursion locks execution:

```javascript
// Generator to build a deep, single-branch tree
function createDeepTree(depth) {
  let root = { val: `node-0`, children: [] };
  let current = root;
  for (let i = 1; i <= depth; i++) {
    const next = { val: `node-${i}`, children: [] };
    current.children.push(next);
    current = next;
  }
  return root;
}

const largeTree = createDeepTree(5000);

console.time("Recursive-DFS-5000");
const traversalResult = traverseTree(largeTree);
console.timeEnd("Recursive-DFS-5000");
console.log("Total nodes visited:", traversalResult.length);
```

---

## 8. Summary Checklist Before Moving to Step 2

- [x] You can write recursive pre-order tree traversal from memory.
- [x] You clearly understand that **returning from a function** is how the algorithm backtracks to the parent node.
- [x] You understand the fatal limitation: **The Call Stack cannot be paused, inspected, or scheduled.**

$\rightarrow$ **Next Milestone:** _Step 02: Iterative DFS using an Explicit Stack (Decoupling traversal from the native Call Stack)._
