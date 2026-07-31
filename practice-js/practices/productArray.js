// `nums` length = n (n >= 2)
// return `answers` array when each element is product of all items except `answers[i]`
// Input: nums = [1, 2, 3, 4]
// Output: [24, 12, 8, 6]
// Explain:
// answer[0] = 2 * 3 * 4 = 24
// answer[1] = 1 * 3 * 4 = 12
// answer[2] = 1 * 2 * 4 = 8
// answer[3] = 1 * 2 * 3 = 6

// [1] - 2 * 3 * 4
// [2] -

const productArray = (nums) => {
  let products = [];

  for (let i = 0; i < nums.length; i++) {
    let product = 1;

    for (let j = 0; j < nums.length; j++) {
      const nj = nums[j];

      if (i !== j) {
        product *= nj;
      }

      if (j === nums.length - 1) products.push(product);
    }
  }

  return products;
};

/**
 * @param {number[]} nums
 * @return {number[]}
 */
const productExceptSelf = function (nums) {
  const n = nums.length;
  const res = new Array(n).fill(1);

  // Lượt 1: Tính tích các phần tử bên trái
  let leftProduct = 1;
  for (let i = 0; i < n; i++) {
    res[i] = leftProduct;
    leftProduct *= nums[i];
  }

  debugger;

  // Lượt 2: Tính tích các phần tử bên phải và nhân trực tiếp vào res
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= rightProduct; // res[i] lúc này đang chứa tích bên trái
    rightProduct *= nums[i]; // Cộng dồn tích bên phải cho bước lùi tiếp theo
  }

  debugger;

  return res;
};

productExceptSelf([1, 2, 3, 4]);

debugger;
