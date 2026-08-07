// Sliding Window Maximum (LeetCode #239 - Hard)
// nums = number[]
// k = number
// Find max number in `k` range, each step it will sliding window.

/**
 * Optimized O(N) solution using Monotonic Deque
 *
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
const findMaxofKWindow = (nums, k) => {
  const resultMaximums = [];
  const queue = [];

  for (let i = 0; i < nums.length; i++) {
    const currentNumber = nums[i];
    const windowStartBoundaryIndex = i - k + 1;

    if (queue.length > 0) {
      const oldestIndexInDeque = queue[0];
      if (oldestIndexInDeque < windowStartBoundaryIndex) {
        queue.shift();
      }
    }

    // 2. Maintain Monotonic Decreasing order by popping smaller elements from back of Deque
    while (queue.length > 0) {
      const lastIndexInDeque = queue[queue.length - 1];
      const lastValueInDeque = nums[lastIndexInDeque];

      if (lastValueInDeque <= currentNumber) {
        queue.pop();
      } else {
        break;
      }
    }

    // 3. Push current index into back of Deque
    queue.push(i);
    console.log({ queue });

    // 4. Record maximum value when window size reaches k elements
    if (i >= k - 1) {
      const maxIndexInCurrentWindow = monotonicDequeIndices[0];
      const maxValueInCurrentWindow = nums[maxIndexInCurrentWindow];
      resultMaximums.push(maxValueInCurrentWindow);
    }

    debugger;
  }

  return resultMaximums;
};

// Test Execution
const numbers = [1, 3, -1, -3, 5, 3, 6, 7];
const k = 3;
const result = findMaxofKWindow(numbers, k);

console.log("Input Numbers:", numbers);
console.log("Window Size K:", k);
console.log("Sliding Window Maximum Result:", result);

debugger;
