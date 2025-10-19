/**
 * Implement a function in JavaScript that takes an array of integers as input
 * and returns the largest difference between any two numbers in the array.
 * For example, given the input array [2, 7, 9, 5, 1, 3, 5],
 * the function should return 8, as the largest difference is between 1 and 9.
 */

const largestRange = (array) => {
  let largest = 0;
  let max = 0;

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (item > max) max = item;
    if (i == array.length - 1) largest = max - 1;
  }

  return largest;
};

console.log(largestRange([2, 7, 9, 5, 1, 3, 5]));
