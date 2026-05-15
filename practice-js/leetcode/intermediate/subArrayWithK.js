// ========================================================
// 📚 SUBARRAY SUM EQUALS K — LeetCode #560 (Medium)
// ========================================================
// Given an array of integers and an integer k, return the
// total number of subarrays whose sum equals k.
//
// KEY INSIGHT: Prefix Sum + HashMap
//
// If prefixSum[j] - prefixSum[i] = k, then the subarray
// from index i+1 to j sums to k.
//
// So for each index j, we ask:
//   "How many previous prefix sums equal (currentSum - k)?"
//
// We store prefix sum frequencies in a HashMap.
//
// IMPORTANT: Initialize map with {0: 1} because a prefix
// sum that exactly equals k means the subarray from
// index 0 to current index is a valid answer.
// ========================================================

const findSubK = (arr, k) => {
  let total = 0;
  let currentSum = 0;
  const prefixMap = new Map();

  // Base case: a prefix sum of 0 has occurred once
  // (before the array starts)
  prefixMap.set(0, 1);

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];

    // How many times have we seen (currentSum - k)?
    // Each occurrence represents a valid subarray ending here
    const gap = currentSum - k;

    if (prefixMap.has(gap)) {
      total += prefixMap.get(gap);
    }

    // Record current prefix sum
    prefixMap.set(currentSum, (prefixMap.get(currentSum) || 0) + 1);
  }

  return total;
};

// ─────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────
console.log("=== Subarray Sum Equals K ===");
console.log({
  case1: findSubK([1, 1, 1], 2),              // 2 → [1,1] at idx 0-1, [1,1] at idx 1-2
  case2: findSubK([1, 2, 3], 3),              // 2 → [1,2] and [3]
  case3: findSubK([1, 3, -1, -3, 5, 3, 6, 7], 3), // check
  case4: findSubK([-1, 2, 1, 4, 3, 5, -2, -3], 7), // fixed: was missing comma (5-2 → 5, -2)
});
