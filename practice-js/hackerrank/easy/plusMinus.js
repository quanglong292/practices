const ex1 = [2, -1, 5, 6, 0, -3];
const ex2 = [4, 0, -2, -9, -7, 1];
const ex3 = [-4, 3, -9, 0, 4, 1];

const findRatio = (arr) => {
  if (!arr.length) return [];
  let posi = 0;
  let nega = 0;
  let zero = 0;
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    const element = arr[i];

    if (!element) zero += 1;
    else element < 0 ? (nega += 1) : (posi += 1);
  }

  return [
    Number(posi / n).toFixed(6),
    Number(nega / n).toFixed(6),
    Number(zero / n).toFixed(6),
  ];
};

console.log({ findRatio: findRatio(ex3) });
