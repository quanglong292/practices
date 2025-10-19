const first = (n = 6) => {
  for (let i = n - 1; i >= 0; i--) {
    let returnStr = "";

    for (let j = 0; j < n; j++) {
    //   console.log({ i, j });
      returnStr += j < i ? " " : "#";
    }
    console.log(returnStr);
    returnStr = "";
  }
};

console.log(first());
