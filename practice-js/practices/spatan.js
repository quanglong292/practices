// ========================================================
// 📚 DAILY TEMPERATURES — LeetCode #739 (Medium)
// ========================================================
// You are given an array of integers temperatures where
// temperatures[i] represents the daily temperature on the ith day.
//
// Return an array result where result[i] is the number of days
// after the ith day before a warmer temperature appears.
// If no warmer day exists, set result[i] to 0.
//
// Example 1:
// Input:  temperatures = [30, 38, 30, 36, 35, 40, 28]
// Output:                 [1,  4,  1,  2,  1,  0,  0]
//
// Example 2:
// Input:  temperatures = [22, 21, 20]
// Output:                 [0,  0,  0]
//
// Constraints:
// 1 <= temperatures.length <= 1000
// 1 <= temperatures[i] <= 100
// ========================================================

// ─────────────────────────────────────────────────────────
// APPROACH 1: Brute Force — O(n²)
// For each day, look at every future day to find the
// first warmer temperature.
// ─────────────────────────────────────────────────────────
const dailyTempsBrute = (arr) => {
  const result = new Array(arr.length).fill(0);

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] > arr[i]) {
        result[i] = j - i;
        break; // Found the first warmer day, stop
      }
    }
  }

  return result;
};

// ─────────────────────────────────────────────────────────
// APPROACH 2: Monotonic Stack — O(n) ⭐ Optimal
//
// KEY INSIGHT: Use a stack that keeps INDICES of days
// in DECREASING temperature order.
//
// When we find a temperature warmer than the top of
// the stack, we've found the answer for that stacked day.
//
// Walk through [30, 38, 30, 36, 35, 40, 28]:
//   i=0: stack=[]        → push 0        stack=[0]
//   i=1: 38>30(stack[0]) → pop 0, ans[0]=1-0=1
//                        → push 1        stack=[1]
//   i=2: 30<38           → push 2        stack=[1,2]
//   i=3: 36>30(stack[2]) → pop 2, ans[2]=3-2=1
//        36<38(stack[1]) → push 3        stack=[1,3]
//   i=4: 35<36           → push 4        stack=[1,3,4]
//   i=5: 40>35(stack[4]) → pop 4, ans[4]=5-4=1
//        40>36(stack[3]) → pop 3, ans[3]=5-3=2
//        40>38(stack[1]) → pop 1, ans[1]=5-1=4
//                        → push 5        stack=[5]
//   i=6: 28<40           → push 6        stack=[5,6]
//   Remaining in stack → no warmer day → ans stays 0
//
// Result: [1, 4, 1, 2, 1, 0, 0] ✅
// ─────────────────────────────────────────────────────────
const dailyTemps = (arr) => {
  const result = new Array(arr.length).fill(0);
  const stack = []; // Stores INDICES (not values)

  for (let i = 0; i < arr.length; i++) {
    // While current temp is warmer than the temp at
    // the top of the stack, we found the answer for
    // that day in the stack
    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {
      const prevDay = stack.pop();
      result[prevDay] = i - prevDay;
    }

    // Push current day's index onto the stack
    stack.push(i);
  }

  // Days remaining in the stack never found a warmer day
  // → result[i] stays 0 (already initialized)
  return result;
};

// ─────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────
console.log("=== Daily Temperatures ===");
console.log("Brute:", dailyTempsBrute([30, 38, 30, 36, 35, 40, 28]));
// [1, 4, 1, 2, 1, 0, 0]
console.log("Stack:", dailyTemps([30, 38, 30, 36, 35, 40, 28]));
// [1, 4, 1, 2, 1, 0, 0]

console.log("\n=== Edge Cases ===");
console.log("Descending:", dailyTemps([22, 21, 20]));
// [0, 0, 0]
console.log("Ascending:", dailyTemps([20, 21, 22]));
// [1, 1, 0]
console.log("Same temps:", dailyTemps([30, 30, 30]));
// [0, 0, 0]
