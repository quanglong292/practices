function solution(A) {
  if (!A?.length) return 1;
  let returnVal = 1;

  A.sort((a, b) => a - b);

  for (let i = 0; i < A.length; i++) {
    const el = A[i];
    const isInt = Number.isInteger(el);

    if (isInt && el === returnVal) {
      returnVal += 1;
    }
  }    

  return returnVal;
}
