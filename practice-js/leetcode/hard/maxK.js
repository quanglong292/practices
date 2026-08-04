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
  const monotonicDequeIndices = [];

  for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
    debugger;

    const currentNumber = nums[currentIndex];
    const windowStartBoundaryIndex = currentIndex - k + 1;

    // 1. Remove expired index out of current window bounds from front of Deque
    if (monotonicDequeIndices.length > 0) {
      const oldestIndexInDeque = monotonicDequeIndices[0];
      if (oldestIndexInDeque < windowStartBoundaryIndex) {
        monotonicDequeIndices.shift();
      }
    }

    // 2. Maintain Monotonic Decreasing order by popping smaller elements from back of Deque
    while (monotonicDequeIndices.length > 0) {
      const lastIndexInDeque =
        monotonicDequeIndices[monotonicDequeIndices.length - 1];
      const lastValueInDeque = nums[lastIndexInDeque];

      if (lastValueInDeque <= currentNumber) {
        monotonicDequeIndices.pop();
      } else {
        break;
      }
    }

    // 3. Push current index into back of Deque
    monotonicDequeIndices.push(currentIndex);

    // 4. Record maximum value when window size reaches k elements
    if (currentIndex >= k - 1) {
      const maxIndexInCurrentWindow = monotonicDequeIndices[0];
      const maxValueInCurrentWindow = nums[maxIndexInCurrentWindow];
      resultMaximums.push(maxValueInCurrentWindow);
    }
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
