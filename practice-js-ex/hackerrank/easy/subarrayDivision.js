const ex1 = [2, 2, 1, 3, 2];
const ex2 = [1, 2, 1, 3, 2];
const ex3 = [2, 5, 1, 3, 4, 4, 3, 5, 1, 1, 2, 1, 4, 1, 3, 3, 4, 2, 1]; // => 3

function birthday(s, d, m) {
  const segmentLength = m - 1;
  let count = 0;

  for (let i = 0; i < s.length; i++) {
    const element = s[i];
    let totalSquares = element;
    if (element === d && m === 1) count += 1;
    else {
      for (let j = i; j < i + segmentLength; j++) {
        const el2 = s[j + 1];

        totalSquares += el2;
      }

      console.log({ totalSquares });

      if (totalSquares === d) count += 1;
      totalSquares = element;
    }
  }

  return count;
}

console.log(birthday(ex3, 18, 7));
