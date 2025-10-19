const mean = (array) =>
  array.length
    ? array.reduce((prev, cur) => prev + cur, 0) / array.length
    : NaN;

const meanRaw = (arr) => {
  const length = arr.length;

  if (!length) return NaN;

  let sum = 0;
  for (let i = 0; i < length; i++) {
    const itm = arr[i];
    sum += itm;
  }

  return sum / length;
};
console.log("Mean ---");
console.log(mean([0]));
