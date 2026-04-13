const findSubK = (arr, k) => {
  let total = 0;
  let currentSum = 0;

  let past = new Map();

  for (let i = 0; i < arr.length; i++) {
    const profit = arr[i];

    currentSum += profit;
    let gap = currentSum - k;

    if (past.has(gap)) {
      total++;
    }

    past.set(gap, (past.get(gap) || 0) + 1);
  }

  return total;
};

console.log({
  case1: findSubK([-1, 2, 1, 4, 3, 5 - 2, -3], 7),
});

