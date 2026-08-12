// Bài toán: Subarray Sum Equals K
// Cho một mảng số nguyên nums và một số nguyên k. Hãy trả về tổng số lượng các subarray (mảng con liên tiếp) có tổng đúng bằng k.

// Ví dụ 1:
// nums = [1, 1, 1], k = 2
// Output: 2 (Các mảng con là [1, 1] ở đầu và [1, 1] ở cuối).

// Ví dụ 2:
// nums = [1, 2, 3], k = 3
// Output: 2 (Các mảng con là [1, 2] và [3]).

const totalSubMaxK = (nums, k) => {
  let total = 0;
  let currentSum = 0;

  // Hash map to store the frequencies of prefix sums
  // Initialize with {0: 1} to account for subarrays starting from index 0
  const prefixSums = new Map();
  prefixSums.set(0, 1);

  for (let i = 0; i < nums.length; i++) {
    currentSum += nums[i];

    // Check if there is a prefix sum that we can subtract to get k
    if (prefixSums.has(currentSum - k)) {
      total += prefixSums.get(currentSum - k);
    }

    // Add the current prefix sum to the map
    prefixSums.set(currentSum, (prefixSums.get(currentSum) || 0) + 1);
  }

  return total;
};

const myTotoalSubMaxK = (nums, k) => {
  let total = 0;
  let hash = new Map();
  hash.set(0, 1);
  let currentSum = 0;

  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];

    currentSum += n;

    if (hash.has(currentSum - k)) {
      total += hash.get(currentSum - k);
    }

    hash.set(currentSum, (hash.get(currentSum) || 0) + 1);
  }

  return total;
};

const testCases = [
  { nums: [1, 1, 1], k: 2 },
  { nums: [1, 2, 3], k: 3 },
  { nums: [1, 2, 3, -3, 1, 1, 1, 4, 2, -3], k: 3 },
  { nums: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], k: 0 },
  { nums: [1, -1, 1, -1, 1, -1, 1, -1], k: 0 },
  { nums: [10, 2, -2, -20, 10], k: -10 },
  { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 15 },
  { nums: Array(100).fill(1), k: 50 },
  { nums: [-1, -1, -1, -1, -1], k: -3 },
];
testCases.forEach((tc, idx) => {
  const result = myTotoalSubMaxK(tc.nums, tc.k);
  // console.log(`Test Case ${idx + 1}:`);
  // console.log(`  nums: ${JSON.stringify(tc.nums)}`);
  // console.log(`  k: ${tc.k}`);
  console.log(`  Expected Output: ${result}`);
});

debugger;
