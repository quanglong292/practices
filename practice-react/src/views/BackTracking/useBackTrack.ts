// Bài toán 1: Sinh xâu nhị phân có độ dài
// Yêu cầu: Cho $N = 3$, hãy in ra tất cả các chuỗi gồm $N$ ký tự, chỉ chứa '0' và '1' (Kết quả: 000, 001, 010, 011, 100, 101, 110, 111).Tư duy: Mảng kết quả cần có $N$ vị trí. Tại mỗi vị trí, b luôn luôn có đúng 2 lựa chọn: điền '0' hoặc điền '1'.

const generateBinaryStrings = (n: number) => {
    const results: string[] = [];
    const currentStr: string[] = [];

    const backtrack = () => {
        // 1. Điểm dừng: Mảng tạm đã đủ N ký tự
        if (currentStr.length === n) {
            results.push(currentStr.join(''));
            return;
        }

        // 2. Vòng lặp các lựa chọn: Chỉ có '0' và '1'
        for (const char of ['0', '1']) {
            currentStr.push(char); // CHỌN: Gắn ký tự vào mảng tạm
            backtrack();           // ĐI TIẾP: Gọi đệ quy để điền vị trí tiếp theo
            currentStr.pop();      // QUAY LUI: Rút ký tự vừa điền ra để nhường chỗ cho ký tự kia
        }
    };

    backtrack();
    return results;
};

// Run steps hand code:
// bt1 -> [0]
// bt2 -> [0, 0]
// bt3 -> rs -> bt2 -> pop -> [0]
// bt2 -> loop 2 -> [0, 1]
// bt3.2 -> rs -> end bt3.2 -> bt2 -> pop -> [0] -> end loop -> end
// bt1 -> pop -> [] -> bt1.loop 2 -> [_, 1]
// bt2.2 -> push -> [1, 0]
// bt3.3 -> rs -> end bt3.3 -> bt2.2 -> pop -> [1]
// bt2.2 -> loop 2 -> push -> [1, 1]
// bt3.4 -> rs -> end bt3.4 -> bt2.2 -> pop -> [1] -> end loop bt2.2
// bt1 -> pop -> [] -> end loop bt1
// end function

console.log(generateBinaryStrings(5));