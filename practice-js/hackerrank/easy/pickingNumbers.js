// function pickingNumbers(a) {
//   let max = 0;
//   let newArr = [];
//   // Write your code here
//   for (let i = 0; i < a.length; i++) {
//     const element = a[i];
//     let currentMax = 0;
//     let currentArrLog = []

//     for (let j = i; j < a.length; j++) {
//       const element2 = a[j];
//       const diff = element - element2;

//       if (diff === 0 || diff === -1 || diff === 1) {
//         // console.log({ element, element2 });
//         currentMax += 1;
//         currentArrLog.push(element2);
//       }
//     }

//     if (currentMax > max) {
//         max = currentMax;
//         newArr = currentArrLog
//     }
//   }

//   return max
// }

// function pickingNumbers(a) {
//   let counts = new Array(100).fill(0);
//   console.log('debug 1: ', counts);
//   for (let num of a) {
//     counts[num]++;
//   }
//   console.log('debug 2: ', counts);
//   let maxCount = 0;
//   for (let i = 1; i < 99; i++) {
//     maxCount = Math.max(maxCount, counts[i] + counts[i + 1]);
//   }
//   console.log('debug 3: ', maxCount);
//   return maxCount;
// }

// console.log(pickingNumbers([1, 1, 2, 2, 4, 4, 5, 5, 5]));
// -> [1,1,2,2] [4,4,5,5,5]
// -> [4, 3, 3]
// -> [4, 3, 3] [6, 5] [5] [3, 3] [3] [1]
// console.log(pickingNumbers([1, 2, 2, 3, 1, 2]));
// -> [1, 2, 2, 1, 2] [2, 2, 3, 2] [2, 3, 2] [3, 2] [1, 2]

const pickingNumbers = (arr) => {
  const counts = Array(100).fill(0);
  // Đếm tần số của các số
  for (const number of arr) {
    counts[number]++;
  }
  console.log(counts);
  let maxCount = 0;
  for (let i = 1; i < 99; i++) {
    // Đếm sự liên tục nào lớn nhất thì lấy số đó
    // Vì sự liên tục nó đã được sắp theo index nên sẽ ko cần tính tới chuyện +-1 
    maxCount = Math.max(maxCount, counts[i] + counts[i + 1]);
    console.log({
      maxCount,
      i: counts[i],
      i1: counts[i + 1],
      result: counts[i] + counts[i + 1],
    });
  }

  return maxCount;
};
console.log(pickingNumbers([1, 2, 2, 3, 1, 2, 3, 3, 3, 4, 4, 1, 2]));
// console.log(pickingNumbers([4, 6, 5, 3, 3, 1])); 
