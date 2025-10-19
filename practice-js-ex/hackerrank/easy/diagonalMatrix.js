const matrix2 = [
  [11, 2, 4],
  [4, 5, 6],
  [10, 8, -12],
];
const matrix3 = [
  [-1, 1, -7, -8],
  [-10, -8, -5, -2],
  [0, 9, 7, -1],
  [4, 4, -2, 1],
];

function diagonalDifference(arr) {
  let left = 0;
  let right = 0;
  for (let i = 0; i < arr.length; i++) {
    const matrixLine = arr[i];
    left += matrixLine[i];
    right += matrixLine[arr.length - i - 1];
  }

  return right > left ? right - left : left - right;
}

console.log({ matrix: diagonalDifference(matrix3) });
