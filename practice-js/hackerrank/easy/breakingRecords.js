/**
 *                                 Count
    Game  Score  Minimum  Maximum   Min Max
     0      12     12       12       0   0
     1      24     12       24       0   1
     2      10     10       24       1   1
     3      24     10       24       1   1
 */

const ex1 = [12, 24, 10, 24];
const ex2 = [10, 5, 20, 20, 4, 5, 2, 25, 1];
const ex3 = [3, 4, 21, 36, 10, 28, 35, 5, 24, 42];

const find = (array) => {
  let max = 0;
  let min = 0;
  let currentMax = 0;
  let currentMin = 0;

  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (!i) {
      currentMax = element;
      currentMin = element;
    } else {
      if (element < currentMin) {
        currentMin = element;
        min += 1;
      } else if (element > currentMax) {
        currentMax = element;
        max += 1;
      }
    }
  }

  return [max, min];
};

console.log(find(ex3));
