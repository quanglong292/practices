// ========================================================
// 📚 SLIDING WINDOW MAXIMUM — LeetCode #239 (Hard)
// ========================================================
// Given an array of integers and a window size k,
// return the maximum value in each sliding window.
//
// Window position                Max
// ---------------               -----
// [1  3  -1] -3  5  3  6  7       3
//  1 [3  -1  -3] 5  3  6  7       3
//  1  3 [-1  -3  5] 3  6  7       5
//  1  3  -1 [-3  5  3] 6  7       5
//  1  3  -1  -3 [5  3  6] 7       6
//  1  3  -1  -3  5 [3  6  7]      7
//
// Kết quả: [3, 3, 5, 5, 6, 7]
// ========================================================

// ─────────────────────────────────────────────────────────
// APPROACH 1: Brute Force — O(n * k)
// For each window, scan all k elements to find the max.
// Simple but slow for large inputs.
// ─────────────────────────────────────────────────────────
const maxSlidingWindowBrute = (arr, k) => {
  const result = [];

  for (let i = 0; i <= arr.length - k; i++) {
    let max = arr[i];
    for (let j = i + 1; j < i + k; j++) {
      if (arr[j] > max) {
        max = arr[j];
      }
    }
    result.push(max);
  }

  return result;
};

// ─────────────────────────────────────────────────────────
// APPROACH 2: Monotonic Deque — O(n) ⭐ Optimal
// Use a deque (double-ended queue) to keep track of
// indices of potential maximums.
//
// KEY INSIGHT: We maintain a decreasing deque.
//   - Front of deque = index of the current window max
//   - We remove from the back any index whose value
//     is ≤ the incoming element (they can never be max)
//   - We remove from the front if the index falls
//     outside the current window
//
// Think of it as: "Why keep a smaller candidate when
// a bigger one just arrived and will outlive you?"
// ─────────────────────────────────────────────────────────
const maxSlidingWindow = (arr, k) => {
  const result = [];
  const deque = []; // Stores INDICES, not values

  for (let i = 0; i < arr.length; i++) {
    // 1. Remove indices that are out of the window
    //    The window is [i - k + 1, i]
    if (deque.length && deque[0] < i - k + 1) {
      deque.shift();
    }

    // 2. Remove from back: any index whose value ≤ arr[i]
    //    Because arr[i] is newer AND bigger — those old
    //    values can never be the max while arr[i] exists
    while (deque.length && arr[deque[deque.length - 1]] <= arr[i]) {
      deque.pop();
    }

    // 3. Add current index to the deque
    deque.push(i);

    // 4. Once we've filled the first window (i >= k - 1),
    //    the front of the deque is always the window max
    if (i >= k - 1) {
      result.push(arr[deque[0]]);
    }
    debugger;
  }

  return result;
};

// ─────────────────────────────────────────────────────────
// BONUS: Maximum Sum Subarray of Size K — Classic Sliding Window
// ─────────────────────────────────────────────────────────
const maxSumSubarray = (arr, k) => {
  let currentSum = 0;
  let maxSum = -Infinity;

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];

    // Once we have a full window of size k
    if (i >= k - 1) {
      maxSum = Math.max(maxSum, currentSum);
      // Slide: remove the leftmost element of the window
      currentSum -= arr[i - k + 1];
    }
  }

  return maxSum;
};

// ─────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────
console.log("=== Sliding Window Maximum ===");
// console.log("Brute:", maxSlidingWindowBrute([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]
console.log("Deque:", maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]

// console.log("\n=== Edge Cases ===");
// console.log("Single element window:", maxSlidingWindow([1, 2, 3], 1)); // [1, 2, 3]
// console.log("Window = array:", maxSlidingWindow([1, 2, 3], 3)); // [3]
// console.log("Descending:", maxSlidingWindow([5, 4, 3, 2, 1], 3)); // [5, 4, 3]

// console.log("\n=== Max Sum Subarray of Size K ===");
// console.log("Max sum (k=3):", maxSumSubarray([1, 3, -1, -3, 5, 3, 6, 7], 3)); // 16
