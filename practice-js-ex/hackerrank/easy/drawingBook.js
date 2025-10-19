function pageCount(n, p) {
  // Write your code here
  let fromStart = 0;
  let fromEnd = 0;

  if (p === 1) return 0;

  for (let i = 0; i < n; i++) {
    const elementFromStart = i;
    const elementFromEnd = n - i;
    const turnCount = (i / 2) === 0.5 && !(n % 2) ? 1 : Math.floor(i / 2);

    console.log({ elementFromStart, elementFromEnd });

    if (elementFromStart === p) fromStart = turnCount;
    if (elementFromEnd === p) fromEnd = turnCount;
  }

  //   console.log({from});

  //   console.log("Return: ", fromStart < fromEnd ? fromStart : fromEnd);

  return fromStart < fromEnd ? fromStart : fromEnd;
  return { fromStart, fromEnd };
}

console.log("PageCount3", pageCount(5, 3));
console.log("PageCount", pageCount(6, 2));
console.log("PageCount2", pageCount(5, 4));
console.log("PageCount2", pageCount(6, 5));
console.log("PageCount2", pageCount(2, 1));
