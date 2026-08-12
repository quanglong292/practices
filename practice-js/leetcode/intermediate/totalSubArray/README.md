# Subarray Sum Equals K

This document explains the **Subarray Sum Equals K** problem, the math behind the optimal solution, and walks through a step-by-step example.

---

## 1. What is a Subarray?

Before we look at the problem, we need to understand what a **subarray** is:
* A **subarray** is a **contiguous** (continuous) part of an array.
* The elements in a subarray must be next to each other in the original array.

**Example with `[1, 2, 3]`:**
* `[1, 2]` is a subarray (continuous).
* `[3]` is a subarray.
* `[1, 3]` is **NOT** a subarray because we skipped `2` (not continuous).

---

## 2. The Goal of the Problem

Given:
1. An array of integers: `nums`
2. A target integer: `k`

We want to find **how many subarrays** have elements that sum up to exactly `k`.

### Example 1:
* **Input**: `nums = [1, 1, 1]`, `k = 2`
* **Output**: `2`
* **Why?** The subarrays that sum to `2` are:
  * `[1, 1]` (from index 0 to 1)
  * `[1, 1]` (from index 1 to 2)

### Example 2:
* **Input**: `nums = [1, 2, 3]`, `k = 3`
* **Output**: `2`
* **Why?** The subarrays that sum to `3` are:
  * `[1, 2]` (index 0 to 1: $1 + 2 = 3$)
  * `[3]` (index 2: $3$)

---

## 3. The Math: Prefix Sums

A brute-force solution would check every single possible subarray. That takes $O(N^2)$ time, which is too slow for large inputs. 

To solve it in $O(N)$ time, we use a concept called **Prefix Sum**.

### What is a Prefix Sum?
A prefix sum is the sum of all numbers from the beginning of the array up to a certain index.

For an array `nums = [1, 2, 3]`:
* Prefix sum up to index 0: $S_0 = 1$
* Prefix sum up to index 1: $S_1 = 1 + 2 = 3$
* Prefix sum up to index 2: $S_2 = 1 + 2 + 3 = 6$

### The Magic Formula
If we want to find the sum of a subarray between index `i + 1` and `j`, we can compute it using prefix sums:
$$\text{Sum from index } (i+1) \text{ to } j = S_j - S_i$$

For example, the sum of the subarray `[2, 3]` (index 1 to 2) in `[1, 2, 3]` is:
$$S_2 - S_0 = 6 - 1 = 5 \implies (2 + 3 = 5)$$

### How does this help us find `k`?
We want to find a subarray sum that equals $k$:
$$S_j - S_i = k$$

If we rearrange this equation:
$$S_i = S_j - k$$

This means: **When we are at index $j$ (with prefix sum $S_j$), if we have seen a prefix sum equal to $(S_j - k)$ somewhere earlier (at index $i$), then the subarray between $i+1$ and $j$ sums up to $k$!**

---

## 4. The Algorithm using a Hash Map

Instead of searching the array again and again, we store the prefix sums we have seen so far in a **Hash Map (Map)**, keeping track of how many times each prefix sum has occurred.

As we iterate through the array:
1. Add the current number to `currentSum` (our $S_j$).
2. Check if `currentSum - k` (our $S_j - k$) exists in our Map.
   * If it does, it means we found one or more subarrays that sum to $k$. We add its count from the map to our `total`.
3. Add/Update `currentSum` in our Map.

### Why do we start with `{ 0: 1 }` in the Map?
Before we start, we record that the prefix sum `0` has been seen `1` time. 
* This is for cases where `currentSum === k`. 
* If `currentSum - k = 0`, we look up `0` in our map. Because we initialized it, we correctly count the subarray starting from index `0`.

---

## 5. Walkthrough: Step-by-Step

Let's trace `nums = [1, 2, 3]`, `k = 3`.

* **Initial State**:
  * `total = 0`
  * `currentSum = 0`
  * `prefixSums = { 0: 1 }` (meaning sum 0 has appeared 1 time)

---

### **Step 1: i = 0 (num = 1)**
1. `currentSum` becomes $0 + 1 = 1$.
2. We look for `currentSum - k` = $1 - 3 = -2$.
   * Is `-2` in our map? **No**.
3. Save `currentSum = 1` to the map.
   * Map is now: `{ 0: 1, 1: 1 }`
   * `total` = `0`

---

### **Step 2: i = 1 (num = 2)**
1. `currentSum` becomes $1 + 2 = 3$.
2. We look for `currentSum - k` = $3 - 3 = 0$.
   * Is `0` in our map? **Yes** (it has a count of `1`).
   * We add `1` to our `total`. (`total = 1`)
   * *This corresponds to the subarray `[1, 2]`.*
3. Save `currentSum = 3` to the map.
   * Map is now: `{ 0: 1, 1: 1, 3: 1 }`
   * `total` = `1`

---

### **Step 3: i = 2 (num = 3)**
1. `currentSum` becomes $3 + 3 = 6$.
2. We look for `currentSum - k` = $6 - 3 = 3$.
   * Is `3` in our map? **Yes** (it has a count of `1`).
   * We add `1` to our `total`. (`total = 2`)
   * *This corresponds to the subarray `[3]`.*
3. Save `currentSum = 6` to the map.
   * Map is now: `{ 0: 1, 1: 1, 3: 1, 6: 1 }`
   * `total` = `2`

---

## Final Result
The loop ends, and we return `total = 2`.
