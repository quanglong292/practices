// Given a positive integer num, determine the number of set bits (1s) present in the binary representation of the given number, commonly referred to as the Hamming weight.

// Input
// num: number: A positive integer
// Examples
// Input: num = 8
// Output: 1
// Explanation: The given number in binary (1000) has a total of one set bit
// Input: num = 9
// Output: 2
// Explanation: The given number in binary (1001) has a total of two set bit
// Input: num = 123
// Output: 6
// Explanation: The given number in binary (1111011) has a total of six set bit
// Constraints
// 1 <= num <= 2^31 - 1

const biSearch = (num: number): number => {
  let count = 0;
  
  // Áp dụng thuật toán Brian Kernighan cực kỳ tối ưu:
  // Mỗi bước n & (n - 1) sẽ xóa đi bit 1 nằm ở vị trí ngoài cùng bên phải.
  // Số lần lặp sẽ chính bằng số lượng bit 1 thực tế của num.
  let n = num;
  while (n > 0) {
    n = n & (n - 1);
    count++;
  }
  
  return count;
}