const ex1 = [4, 4, 2, 3];
const ex2 = [3, 2, 1, 3];

const mostDupplicate = (arr = ex1) => {
  if (!arr.length) return 0;
  let total = 0;

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    let currentMax = 0;

    for (let j = 0; j < arr.length; j++) {
      const el2 = arr[j];

      if (element === el2) currentMax += 1;
    }

    if (currentMax > total) total = currentMax;
    currentMax = 0;
  }

  return total;
};

console.log(mostDupplicate(ex2));
