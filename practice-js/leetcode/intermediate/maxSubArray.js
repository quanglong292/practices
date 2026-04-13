function maxSubArray(nums) {
  // Khởi tạo với phần tử đầu tiên
  let currentSum = nums[0];
  let maxSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];

    // Nếu currentSum âm, việc cộng dồn chỉ làm num nhỏ đi.
    // Khi đó, ta chọn bắt đầu lại từ num.
    currentSum = Math.max(num, currentSum + num);

    // Cập nhật kỷ lục tổng lớn nhất toàn cục
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

const nums = [-2, 1, -3, 4, -1, 2, -1, 2, -5, 4];
console.log(maxSubArray(nums)); // Output: 6
