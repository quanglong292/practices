# Hamming Weight (Số lượng Bit 1)

Chào bạn! Hãy cùng tìm hiểu về bài toán **Hamming Weight** (còn được gọi là **Number of 1 Bits** hoặc **Popcount**). Đây là một bài toán rất nền tảng trong khoa học máy tính liên quan đến thao tác bit (bitwise manipulation).

---

## 1. WHAT (Hamming Weight là gì?)

**Hamming Weight** của một chuỗi nhị phân (binary string) hay một số nguyên là số lượng ký tự `1` (hoặc bit `1`) xuất hiện trong biểu diễn nhị phân của số đó.

**Ví dụ:**
- Số nguyên `11` dưới dạng nhị phân 32-bit (32-bit unsigned integer) được biểu diễn là:
  `00000000000000000000000000001011`
- Đếm số lượng bit `1` trong chuỗi trên: chúng ta thấy có **3** bit `1`.
- Do đó, **Hamming Weight** của `11` là **3**.

---

## 2. WHY (Tại sao bài toán này quan trọng?)

Thao tác đếm bit `1` trông có vẻ đơn giản nhưng lại cực kỳ quan trọng trong nhiều lĩnh vực thực tế:

1. **Truyền dẫn dữ liệu (Data Transmission & Error Control):**
   - Đo lường khoảng cách Hamming (Hamming Distance) giữa 2 thông điệp nhị phân. Hamming Distance giữa $A$ và $B$ bằng Hamming Weight của $A \oplus B$ (phép XOR). Nó giúp xác định số lượng bit bị lỗi/thay đổi khi truyền dữ liệu qua mạng.
2. **Mật mã học (Cryptography):**
   - Phân tích khóa bí mật dựa trên số lượng bit `1` được bật.
3. **Nén dữ liệu (Data Compression) & Cơ sở dữ liệu:**
   - Được sử dụng trong các cấu trúc dữ liệu như **Succinct Bit Vectors** để nén dữ liệu mà vẫn truy vấn cực nhanh (chỉ mất thời gian $O(1)$).
4. **Tối ưu hóa phần cứng (Hardware-level Optimization):**
   - Hầu hết các CPU hiện đại (x86, ARM) đều tích hợp sẵn lệnh hợp ngữ `POPCNT` (population count) để tính toán Hamming Weight chỉ trong **1 chu kỳ máy** (1 CPU cycle), cho thấy tầm quan trọng tối thượng của nó.

---

## 3. HOW (Làm thế nào để giải quyết?)

Chúng ta sẽ tiếp cận qua 2 phương pháp từ cơ bản đến tối ưu hóa cao độ:

### Phương pháp 1: Dịch bit tuần tự (Bit Shifting - Basic Approach)
Ý tưởng là chúng ta duyệt qua toàn bộ 32 bit của số nguyên. Tại mỗi bước, ta dùng phép toán bitwise AND `& 1` để kiểm tra xem bit ngoài cùng bên phải (Least Significant Bit - LSB) có phải là `1` hay không. Sau đó, ta dịch chuyển số đó sang phải 1 bit bằng toán tử `>>>` (logical right shift) để tiếp tục kiểm tra bit tiếp theo.

#### Mã nguồn dễ đọc (Readable Code)
```javascript
function hammingWeightBitShifting(unsignedInteger) {
  let countOfOneBits = 0;
  let remainingInteger = unsignedInteger;

  // Vì là số nguyên 32-bit, ta có thể lặp tối đa 32 lần
  while (remainingInteger !== 0) {
    // 1. Kiểm tra bit ngoài cùng bên phải có phải là 1 không
    const isLeastSignificantBitOne = (remainingInteger & 1) === 1;

    if (isLeastSignificantBitOne) {
      countOfOneBits = countOfOneBits + 1;
    }

    // 2. Dịch chuyển không dấu sang phải 1 bit (Logical Right Shift)
    // Dùng >>> thay vì >> để xử lý đúng cho cả các số nguyên không dấu 32-bit trong Javascript
    remainingInteger = remainingInteger >>> 1;
  }

  return countOfOneBits;
}
```

- **Time Complexity:** $O(k)$ với $k$ là số lượng bit của kiểu dữ liệu (tối đa 32 bước cho 32-bit integer).
- **Space Complexity:** $O(1)$ vì chỉ sử dụng các biến đếm và lưu trữ tạm thời.

---

### Phương pháp 2: Thuật toán Brian Kernighan (Brian Kernighan's Algorithm - Optimal Approach)
Khi một số nguyên có rất ít bit `1` (ví dụ số `1073741824` chỉ có đúng 1 bit `1` ở vị trí thứ 30), thuật toán dịch bit tuần tự ở trên vẫn phải chạy qua 30 vòng lặp dịch bit.
**Thuật toán Brian Kernighan** sinh ra để giải quyết vấn đề này. Ý tưởng cốt lõi: **Mỗi lần ta thực hiện phép toán `n = n & (n - 1)`, chúng ta sẽ xóa bỏ đi đúng một bit `1` nằm ở vị trí thấp nhất (least significant set bit).**

#### Giải thích cơ chế `n & (n - 1)`:
Giả sử $n = 12$ (nhị phân là `1100`):
1. $n - 1 = 11$ (nhị phân là `1011`). Bạn chú ý rằng việc trừ đi `1` đã đảo ngược tất cả các bit từ bit `1` ngoài cùng bên phải trở đi.
2. Thực hiện phép toán bitwise AND:
   ```
     1100  (n = 12)
   & 1011  (n - 1 = 11)
   ------
     1000  (n & (n - 1) = 8)
   ```
   **Kết quả:** Bit `1` ở vị trí thứ hai từ phải sang đã biến thành `0`! Ta chỉ cần tăng biến đếm thêm `1`.
3. Lặp lại với $n = 8$ (`1000`):
   - $n - 1 = 7$ (`0111`).
   - $n \& (n - 1) \rightarrow 1000 \& 0111 = 0000$ (tất cả bằng `0`).
   - Tăng biến đếm thêm `1`. Lúc này $n = 0$, vòng lặp dừng.
   - **Tổng số vòng lặp:** Chỉ đúng 2 lần lặp (bằng đúng số lượng bit `1` của số 12), thay vì phải lặp 4 lần như dịch bit.

#### Mã nguồn dễ đọc (Readable Code)
```javascript
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
```

- **Time Complexity:** $O(m)$ với $m$ là số lượng bit `1` thực tế của số nguyên. Trong trường hợp tốt nhất (best case), nếu số chỉ có một vài bit `1`, thuật toán chạy cực nhanh.
- **Space Complexity:** $O(1)$.

---

## 4. Real-world Example (Ví dụ ứng dụng thực tế)

Hãy tưởng tượng bạn đang xây dựng một hệ thống **kiểm tra tính toàn vẹn dữ liệu (Checksum)** cho gói tin gửi qua mạng.
Gói tin gửi đi: `10110100`
Gói tin nhận được: `10110111` (Bị nhiễu tín hiệu truyền dẫn làm thay đổi 2 bit cuối).

Để tự động phát hiện số lượng bit lỗi (còn gọi là **Hamming Distance**):
1. Ta thực hiện phép toán XOR giữa gói tin gốc và gói tin nhận được:
   `10110100 ^ 10110111 = 00000011`
2. Tính **Hamming Weight** của kết quả XOR này:
   - Số `00000011` có **2** bit `1`.
3. **Kết luận:** Hệ thống ngay lập tức nhận diện có **2 bit bị lỗi** trong quá trình truyền tải và yêu cầu gửi lại gói tin!

---

## 5. So sánh trực quan (Comparison Table)

| Tiêu chí | Dịch bit tuần tự (Bit Shifting) | Thuật toán Brian Kernighan |
| :--- | :--- | :--- |
| **Số vòng lặp** | Luôn bằng vị trí của bit `1` cao nhất (lên tới 32 lần). | **Bằng đúng số lượng bit `1` thực tế** (tối ưu nhất). |
| **Phép toán sử dụng** | Bitwise AND (`&`), Logical Shift (`>>>`). | Bitwise AND (`&`), Phép trừ (`-`). |
| **Độ dễ hiểu** | Trực quan, dễ hình dung với người mới bắt đầu. | Cần một chút suy luận toán học nhưng cực kỳ thanh lịch. |

Hãy mở visualizer của chúng tôi lên để bước từng dòng code chạy song song và quan sát sự thay đổi của từng bit trực quan nhé!
