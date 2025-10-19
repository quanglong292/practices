console.log("asd");
function getMinCores(start, end) {
  // Write your code here
  let cores = 0;
  let count = [];
  const process = [...start, ...end];
  process.forEach((i, idx) => {
    process.forEach((j, jdx) => {
      if (i === j) cores += 1;
    });
    count.push(cores);
    cores = 0;
  });
  return Math.max(...count);
}

console.log(getMinCores());
