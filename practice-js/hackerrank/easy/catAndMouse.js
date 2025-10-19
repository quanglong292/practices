// Complete the catAndMouse function below.
function catAndMouse(x, y, z) {
  const a = Math.sign(x - z) !== -1 ? x - z : (x - z) * -1;
  const b = Math.sign(y - z) !== -1 ? y - z : (y - z) * -1;

  if (a === b) {
    console.log("Mouse C");
    return "Mouse C"
  }
  console.log(a < b ? "Cat A" : "Cat B");
  return a < b ? "Cat A" : "Cat B"
}

console.log("catAndMouse: ", catAndMouse(2, 5, 4));
console.log("catAndMouse1: ", catAndMouse(1, 2, 3));
console.log("catAndMouse2: ", catAndMouse(1, 3, 2));
