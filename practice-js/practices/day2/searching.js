// ========================================================
// 📚 SEARCHING ALGORITHMS — Day 2 Practice
// ========================================================

// ─────────────────────────────────────────────────────────
// 1. BINARY SEARCH — O(log n)
// ─────────────────────────────────────────────────────────
// Requirement: Array MUST be sorted.
//
// KEY INSIGHT: Each comparison eliminates HALF the array.
//   - If target < mid → search left half
//   - If target > mid → search right half
//   - If target = mid → found it!
//
// Comparison with Linear Search:
//   Array size 1,000,000 elements:
//   - Linear Search: up to 1,000,000 comparisons
//   - Binary Search: up to 20 comparisons (log₂ 1,000,000 ≈ 20)
// ─────────────────────────────────────────────────────────
const binarySearch = (arr, target) => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid; // Found!
    if (arr[mid] < target) left = mid + 1; // Go right
    else right = mid - 1; // Go left
  }

  return -1; // Not found
};

// ─────────────────────────────────────────────────────────
// 2. BINARY SEARCH — Recursive Version
// ─────────────────────────────────────────────────────────
const binarySearchRecursive = (arr, target, left = 0, right = arr.length - 1) => {
  if (left > right) return -1;

  const mid = Math.floor((left + right) / 2);

  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, right);
  return binarySearchRecursive(arr, target, left, mid - 1);
};

// ─────────────────────────────────────────────────────────
// 3. FIND FIRST & LAST POSITION — LeetCode #34 (Medium)
// ─────────────────────────────────────────────────────────
// Given a sorted array with duplicates, find the first
// and last index of a target value.
//
// Example: [1, 2, 2, 2, 3, 4], target=2 → [1, 3]
//
// KEY INSIGHT: Use two binary searches
//   - One biased LEFT (finds first occurrence)
//   - One biased RIGHT (finds last occurrence)
// ─────────────────────────────────────────────────────────
const searchRange = (arr, target) => {
  const findFirst = () => {
    let left = 0,
      right = arr.length - 1,
      result = -1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] === target) {
        result = mid; // Found one, but keep searching LEFT
        right = mid - 1;
      } else if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    return result;
  };

  const findLast = () => {
    let left = 0,
      right = arr.length - 1,
      result = -1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] === target) {
        result = mid; // Found one, but keep searching RIGHT
        left = mid + 1;
      } else if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    return result;
  };

  return [findFirst(), findLast()];
};

// ─────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────
const sorted = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

console.log("=== Binary Search ===");
console.log("Find 7:", binarySearch(sorted, 7)); // 3
console.log("Find 1:", binarySearch(sorted, 1)); // 0
console.log("Find 19:", binarySearch(sorted, 19)); // 9
console.log("Find 6:", binarySearch(sorted, 6)); // -1

console.log("\n=== Recursive Binary Search ===");
console.log("Find 13:", binarySearchRecursive(sorted, 13)); // 6
console.log("Find 99:", binarySearchRecursive(sorted, 99)); // -1

console.log("\n=== Search Range (First & Last Position) ===");
console.log("Find 2 in [1,2,2,2,3,4]:", searchRange([1, 2, 2, 2, 3, 4], 2));
// [1, 3]
console.log("Find 5 in [1,2,2,2,3,4]:", searchRange([1, 2, 2, 2, 3, 4], 5));
// [-1, -1]
