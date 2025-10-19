// [2, 6] [24, 36]
// Đếm các số int mà nó có thể là:
// 1. Bội của mảng 1
// 2. Ước của mảng 2

const findCommonDivisors = (a, b) => {
  const length = Math.max(...b);
  const min = Math.min(...a)
  const isStartAtZero = (a.length === 1 && min === 1) && b.length === 1
  const aLength = a.length;
  const bLength = b.length;
  const result = [];

  for (let i = (isStartAtZero ? 0 : 1); i < length; i++) {
    let multiple = [];
    let factors = [];

    for (let j = 0; j < aLength; j++) {
      const aEl = a[j];
      if (!(i % aEl)) multiple.push(aEl);
    }

    for (let k = 0; k < bLength; k++) {
      const bEl = b[k];
      if (!(bEl % i)) factors.push(bEl);
    }

    if (multiple.length === aLength && factors.length === bLength)
      result.push(i);

    multiple = [];
    factors = [];
  }

  return result;
};

console.log(findCommonDivisors([1], [72, 48]));
console.log(findCommonDivisors([1], [100]));
console.log(findCommonDivisors([2, 4], [16, 32, 96]));
