# Step 02: Iterative DFS using an Explicit Stack (Decoupling from the Call Stack)

## 1. Context & Motivation

In **Step 01**, we saw that recursive DFS relies on the JavaScript engine's internal **Call Stack**. The problem: you cannot inspect, pause, serialize, or yield execution back to the browser while a deep recursion is running.

To solve this, the first refactoring step is to **eliminate recursion entirely**. Instead of letting the runtime manage execution frames, we instantiate our own stack in the **Heap memory** using a regular JavaScript Array (`const stack = []`).

By taking control of the stack, we gain the ability to stop the traversal loop at any iteration and resume it later without losing our position.

---

## 2. Problem Statement

Given the root of an N-ary tree, implement an iterative function `traverseTreeIterative(root)` that visits every node in **Pre-order (Parent $\rightarrow$ Children from left to right)** using a **while loop** and an **explicit Stack (Array)**.

> **Crucial Rule:** Absolutely NO recursive function calls allowed.

### Node Schema

```typescript
interface TreeNode {
  val: string;
  children: TreeNode[];
}
```

### Constraints & Edge Cases

- Must handle `root === null` gracefully.
- Must preserve identical Pre-order output as Step 01: `["div", "h1", "p", "a", "h2"]`.
- Note the push order of children onto a LIFO (Last-In-First-Out) stack.

---

## 3. The LIFO Trap (Children Push Order)

Because a stack is **Last-In, First-Out (LIFO)**, whatever you push _last_ will be popped and processed _first_.

```text
Children of [h1] are: [ p, a ]

If you push in normal order (p, then a):
Stack: [ p, a ]
Pop: 'a' is processed before 'p' -> WRONG (Post-order / Reverse)!

If you push in REVERSE order (a, then p):
Stack: [ a, p ]
Pop: 'p' is processed first, then 'a' -> CORRECT (Pre-order left-to-right)!
```

---

## 4. Implementation

```javascript
/**
 * Iterative Pre-order DFS using an explicit array stack on the Heap.
 * @param {TreeNode|null} root
 * @returns {string[]}
 */
function traverseTreeIterative(root) {
  if (!root) return [];

  const result = [];
  // 1. Initialize stack with root node
  const stack = [root];

  // 2. Drive traversal using a loop instead of call frames
  while (stack.length > 0) {
    // Pop the most recent unit of work
    const currentNode = stack.pop();

    // Process current node
    result.push(currentNode.val);

    // Push children in REVERSE order so the first child is popped first
    const children = currentNode.children;
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }

  return result;
}

// Verification with Sample Tree
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

console.log("Iterative Traversal:", traverseTreeIterative(tree));
// Output: ["div", "h1", "p", "a", "h2"]
```

---

## 5. Memory State Trace (Heap Inspection)

Observe how our array `stack` acts as an externalized, inspectable Call Stack:

| Loop Iteration | Stack State (Top is right) | Popped / Processed Node | Children Pushed (Reverse) | Output Accumulator              |
| :------------- | :------------------------- | :---------------------- | :------------------------ | :------------------------------ |
| **Start**      | `[ div ]`                  | -                       | -                         | `[]`                            |
| **Iter 1**     | `[]`                       | `div`                   | push `h2`, push `h1`      | `["div"]`                       |
| **Iter 2**     | `[ h2 ]`                   | `h1`                    | push `a`, push `p`        | `["div", "h1"]`                 |
| **Iter 3**     | `[ h2, a ]`                | `p`                     | _(none)_                  | `["div", "h1", "p"]`            |
| **Iter 4**     | `[ h2 ]`                   | `a`                     | _(none)_                  | `["div", "h1", "p", "a"]`       |
| **Iter 5**     | `[]`                       | `h2`                    | _(none)_                  | `["div", "h1", "p", "a", "h2"]` |
| **End**        | `[]` (length 0)            | Loop terminates         | -                         | Complete                        |

---

## 6. The Breakthrough vs. The New Bottleneck

### The Breakthrough (Time-Slicing is now possible):

Because the stack lives in a normal array, we can now break the `while` loop when the browser runs out of time:

```javascript
function workLoop(deadline) {
  // We can PAUSE when time runs out!
  while (stack.length > 0 && deadline.timeRemaining() > 1) {
    const node = stack.pop();
    processNode(node);
    pushChildren(node);
  }

  // Still have work left? Schedule continuation on next idle cycle!
  if (stack.length > 0) {
    requestIdleCallback(workLoop);
  }
}
```

### The New Bottleneck (Why this still isn't React Fiber):

1. **Memory Allocation Overhead:**
   Every time a node is processed, we allocate and push its children onto the array stack. For a large UI tree, this array grows and shrinks rapidly, stressing the garbage collector.
2. **Reverse Looping Constraint:**
   We are forced to iterate backwards `for (let i = children.length - 1; i >= 0; i--)` just to satisfy the LIFO nature of the stack.
3. **No Sibling/Parent Awareness:**
   Nodes in the stack have no idea who their siblings or parents are. Once a node is popped, its connection to its ancestors is severed unless explicitly wrapped in metadata objects.

---

## 7. Summary Checklist Before Moving to Step 3

- [x] You replaced the implicit runtime Call Stack with an explicit Array stack on the Heap.
- [x] You understand why pushing children in **reverse order** produces standard pre-order traversal.
- [x] You see how a `while` loop enables pausing/resuming execution across frames.

$\rightarrow$ **Next Milestone:** _Step 03: Transforming N-ary Tree into LCRS Tree (Left-Child Right-Sibling Representation)._
