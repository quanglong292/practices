/**
 * Calculates the Hamming Weight (number of set bits / 1s) of a 32-bit unsigned integer.
 * This implementation follows the basic bit shifting approach which is highly readable.
 *
 * @param {number} unsignedInteger - The 32-bit unsigned integer to calculate.
 * @returns {number} The count of set bits (1s) in the binary representation.
 */
function hammingWeight(unsignedInteger) {
  let countOfOneBits = 0;
  let remainingInteger = unsignedInteger;

  // We loop until all set bits are shifted out (remainingInteger becomes 0)
  while (remainingInteger !== 0) {
    // Check if the lowest/least significant bit is equal to 1
    const isLeastSignificantBitOne = (remainingInteger & 1) === 1;

    if (isLeastSignificantBitOne) {
      countOfOneBits = countOfOneBits + 1;
    }

    // Shift the integer to the right by 1 bit position.
    // We use the unsigned zero-fill right shift operator (>>>) to handle 32-bit
    // unsigned integers properly and prevent negative numbers in JavaScript.
    remainingInteger = remainingInteger >>> 1;
  }

  return countOfOneBits;
}

function hammingWeightBrianKernighan(unsignedInteger) {
  let countOfOneBits = 0;
  let remainingInteger = unsignedInteger;

  while (remainingInteger !== 0) {
    // Thực hiện phép toán triệt tiêu bit 1 ngoài cùng bên phải
    const integerAfterClearingLowestSetBit = remainingInteger & (remainingInteger - 1);
    
    // Lưu lại giá trị mới
    remainingInteger = integerAfterClearingLowestSetBit;
    
    // Tăng số lượng bit 1 đếm được
    countOfOneBits = countOfOneBits + 1;
  }

  return countOfOneBits;
}

// Example usage and verification
const sampleInputNumber = 11; // Binary representation is: 1011 (3 set bits)
const resultWeight = hammingWeight(sampleInputNumber);
console.log(`The Hamming Weight of ${sampleInputNumber} is: ${resultWeight}`);

module.exports = { hammingWeight };