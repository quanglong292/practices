const ex1 = [1, 3, 5, 7, 9];
const ex2 = [1, 2, 3, 4, 5];

const miniMaxSum = (arr = ex1) => {
  if (!arr.length) return 0;

  let min = 0;
  let max = 0;

  for (let i = 0; i < arr.length; i++) {
    let total = 0;

    for (let j = 0; j < arr.length; j++) {
      const el2 = arr[j];

      if (j !== i) total += el2;
    }

    if (total < min || !min) min = total;
    if (total > max || !max) max = total;

    total = 0;
  }
  console.log(min, max);
  return [min, max];
};

console.log(miniMaxSum(ex1));
