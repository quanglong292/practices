const ex1 = { s: 7, t: 11, a: 5, b: 15, apples: [-2, 2, 1], oranges: [5, -6] };

const findFruitFallIntoTheHouse = (s, t, a, b, apples, oranges) => {
  // apple >= s || apple <= t
  const trees = [apples, oranges];
  let countApple = 0;
  let countOrange = 0;

  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];

    for (let j = 0; j < tree.length; j++) {
      const fruitFallPosition = tree[j];

      if (!i) {
        const positionFromTree = a + fruitFallPosition;
        countApple += positionFromTree >= s && positionFromTree <= t ? 1 : 0;
      } else {
        const positionFromTree = b + fruitFallPosition;
        countOrange += positionFromTree >= s && positionFromTree <= t ? 1 : 0;
      }
    }
  }

  console.log(countApple);
  console.log(countOrange);
};

findFruitFallIntoTheHouse(7, 11, 5, 15, [-2, 2, 1], [5, -6]);
