# Hướng dẫn chi tiết: Sliding Window Maximum (LeetCode #239)

---

## 1. WHAT - Bài toán này là gì?

**Sliding Window Maximum** (Giá trị lớn nhất trong cửa sổ trượt) là bài toán cho một mảng số nguyên `numbersArray` và một số nguyên `windowSize` (kích thước cửa sổ $K$).

Cửa sổ trượt có kích thước $K$ sẽ di chuyển từ đầu mảng đến cuối mảng, mỗi lần nhích sang phải **1 vị trí**. Nhiệm vụ của bạn là tìm giá trị lớn nhất (**maximum value**) nằm trong cửa sổ tại mỗi bước di chuyển.

### Ví dụ minh họa:
```text
Input: numbersArray = [1, 3, -1, -3, 5, 3, 6, 7], windowSize = 3
Output: [3, 3, 5, 5, 6, 7]

Các vị trí cửa sổ (Window):               Giá trị Max thu được:
[1   3  -1] -3   5   3   6   7   =>        3
 1  [3  -1  -3]  5   3   6   7   =>        3
 1   3 [-1  -3   5]  3   6   7   =>        5
 1   3  -1 [-3   5   3]  6   7   =>        5
 1   3  -1  -3  [5   3   6]  7   =>        6
 1   3  -1  -3   5  [3   6   7]  =>        7
```

---

## 2. WHY - Tại sao bài toán này quan trọng trong Software Engineering?

### Ví dụ thực tế (Real-world Use Case):
1. **Hệ thống giám sát tài nguyên (Real-time System Monitoring):**
   Giả sử bạn đang xây dựng Dashboard theo dõi chỉ số **CPU Peak Usage** trong 5 phút gần nhất cho hệ thống Microservices. Dữ liệu CPU load đổ về liên tục từng giây (Streaming Data). Nếu hệ thống phải tính toán lại từ đầu sau mỗi giây, server sẽ bị quá tải.
2. **Rate Limiting & Anti-DDoS trong API Gateway:**
   Kỹ thuật **Sliding Window Counter / Log** giúp đếm số lượng requests tối đa trong cửa sổ thời gian trượt (rolling window) để chặn spam hoặc tấn công DDoS.
3. **Phân tích dữ liệu tài chính (Algorithmic Trading & Stock Charts):**
   Tính giá đỉnh (High) của chứng khoán trong các khung thời gian moving windows.

### Tại sao cách tiếp cận ban đầu (Naive Way) không đủ tốt?
Trong file `maxK.js`, bạn đã dựng khung vòng lặp dịch chuyển cửa sổ. Nếu dùng vòng lặp phụ để tìm `Math.max` trong mỗi cửa sổ:
- Thời gian chạy cho 1 cửa sổ: $O(K)$.
- Số lượng cửa sổ: $N - K + 1$.
- **Tổng độ phức tạp thời gian (Time Complexity):** $O(N \cdot K)$.
- Khi mảng có $N = 100,000$ và $K = 50,000$, số phép tính sẽ lên tới $5 \times 10^9$ (vượt ngưỡng thực thi 1 giây của Node.js/V8 Engine).

Để ứng dụng trong môi trường **Real-time Performance**, chúng ta cần giải pháp tối ưu **$O(N)$ Time Complexity**.

---

## 3. HOW - Phương pháp giải chi tiết (Từ Naive đến Optimal)

---

### Cách 1: Naive Approach (Vét cạn $O(N \cdot K)$)

#### Ý tưởng:
Dùng một vòng lặp chính để duyệt qua từng vị trí bắt đầu của cửa sổ, và một vòng lặp phụ quét $K$ phần tử bên trong cửa sổ đó để tìm `max`.

#### Code minh họa (Naive):
```javascript
const maxSlidingWindowNaive = (numbersArray, windowSize) => {
  const resultMaximums = [];
  const totalElements = numbersArray.length;

  for (let windowStartIndex = 0; windowStartIndex <= totalElements - windowSize; windowStartIndex++) {
    let currentMaximumValue = numbersArray[windowStartIndex];

    // Vòng lặp phụ quét qua K phần tử trong window
    for (let offset = 1; offset < windowSize; offset++) {
      const currentElementValue = numbersArray[windowStartIndex + offset];
      if (currentElementValue > currentMaximumValue) {
        currentMaximumValue = currentElementValue;
      }
    }

    resultMaximums.push(currentMaximumValue);
  }

  return resultMaximums;
};
```

---

### Cách 2: Optimal Approach ($O(N)$) dùng Monotonic Deque (Hàng đợi đơn điệu)

#### Tư duy đột phá (Key Intuition):
Hỏi: *Khi nào một phần tử cũ trong cửa sổ KHÔNG CÒN TÁC DỤNG nữa?*
1. **Nằm ngoài cửa sổ (Out of boundary):** Cửa sổ đã trượt qua khỏi chỉ số (`index`) của nó.
2. **Bị lấn áp bởi phần tử mới lớn hơn:** Nếu phần tử mới xuất hiện `numbersArray[i]` lớn hơn các phần tử đứng trước nó trong cửa sổ, thì các phần tử đứng trước **nhỏ hơn** sẽ KHÔNG BAO GIỜ có cơ hội trở thành `max` trong cửa sổ này lẫn các cửa sổ tương lai! -> **Ta có thể loại bỏ chúng ngay lập tức.**

#### Cấu trúc dữ liệu: Monotonic Decreasing Deque (Lưu chỉ số Index)
- Chúng ta dùng một **Deque** (Double-ended Queue - Hàng đợi 2 đầu) lưu **các chỉ số (indices)** của mảng.
- **Tính chất đơn điệu giảm:** Giá trị tương ứng với các chỉ số trong Deque luôn giảm dần từ đầu Deque (Front) đến cuối Deque (Back).
- **Phần tử ở đầu Deque (`deque[0]`)** luôn luôn là **chỉ số chứa giá trị lớn nhất (`Max Index`)** của cửa sổ hiện tại!

---

#### Chi tiết 4 bước thực hiện cho mỗi phần tử `currentIndex`:

1. **Loại bỏ phần tử hết hạn ở đầu Deque (Purge Expired Index from Front):**
   Nếu chỉ số ở đầu Deque `< currentIndex - windowSize + 1`, nghĩa là phần tử đó đã nằm ngoài cửa sổ trượt hiện tại -> Dùng `shift()` loại bỏ khỏi đầu Deque.

2. **Duy trì tính đơn điệu giảm từ cuối Deque (Maintain Monotonic Order from Back):**
   So sánh giá trị phần tử mới `currentNumber = numbersArray[currentIndex]` với giá trị ở cuối Deque `numbersArray[lastIndexInDeque]`.
   Chừng nào giá trị ở cuối Deque $\le$ `currentNumber`, loại bỏ index ở cuối Deque bằng `pop()`.

3. **Thêm `currentIndex` vào cuối Deque:**
   Sau khi đã dọn dẹp các phần tử nhỏ hơn, thêm `currentIndex` vào Deque bằng `push()`.

4. **Thu thập kết quả Max:**
   Khi cửa sổ đã trượt đủ $K$ phần tử (`currentIndex >= windowSize - 1`), phần tử ở đầu Deque `numbersArray[deque[0]]` chính là giá trị `Max` của cửa sổ hiện tại. Thêm nó vào mảng `resultMaximums`.

---

#### Code hoàn chỉnh (Optimized & Clean):

```javascript
/**
 * Tìm giá trị lớn nhất trong mỗi cửa sổ trượt kích thước K
 * Time Complexity: O(N) - Mỗi index được push và pop tối đa 1 lần vào Deque.
 * Space Complexity: O(K) - Deque lưu tối đa K chỉ số.
 *
 * @param {number[]} numbersArray - Mảng số nguyên đầu vào
 * @param {number} windowSize - Kích thước cửa sổ trượt
 * @returns {number[]} Mảng chứa các giá trị max của từng cửa sổ
 */
const findMaxofKWindow = (numbersArray, windowSize) => {
  const resultMaximums = [];
  const monotonicDequeIndices = [];

  for (let currentIndex = 0; currentIndex < numbersArray.length; currentIndex++) {
    const currentNumber = numbersArray[currentIndex];
    const windowStartBoundaryIndex = currentIndex - windowSize + 1;

    // Bước 1: Loại bỏ chỉ số đã vượt ra ngoài phía trái cửa sổ
    if (monotonicDequeIndices.length > 0) {
      const oldestIndexInDeque = monotonicDequeIndices[0];
      if (oldestIndexInDeque < windowStartBoundaryIndex) {
        monotonicDequeIndices.shift();
      }
    }

    // Bước 2: Loại bỏ tất cả các chỉ số có giá trị <= currentNumber ở cuối Deque
    while (monotonicDequeIndices.length > 0) {
      const lastIndexInDeque = monotonicDequeIndices[monotonicDequeIndices.length - 1];
      const lastValueInDeque = numbersArray[lastIndexInDeque];

      if (lastValueInDeque <= currentNumber) {
        monotonicDequeIndices.pop();
      } else {
        break;
      }
    }

    // Bước 3: Thêm chỉ số hiện tại vào cuối Deque
    monotonicDequeIndices.push(currentIndex);

    // Bước 4: Ghi nhận giá trị max khi cửa sổ đã trượt đủ K phần tử
    if (currentIndex >= windowSize - 1) {
      const maxIndexInCurrentWindow = monotonicDequeIndices[0];
      const maxValueInCurrentWindow = numbersArray[maxIndexInCurrentWindow];
      resultMaximums.push(maxValueInCurrentWindow);
    }
  }

  return resultMaximums;
};

// Testcase mẫu
const sampleNumbers = [1, 3, -1, -3, 5, 3, 6, 7];
const sampleK = 3;
console.log("Input:", sampleNumbers, "K =", sampleK);
console.log("Output:", findMaxofKWindow(sampleNumbers, sampleK));
// Kết quả mong đợi: [3, 3, 5, 5, 6, 7]
```

---

## 4. UI Visualization Tool (Công cụ trực quan hóa từng bước)

Để giúp bạn hình dung chuyển động của Cửa sổ trượt (Sliding Window) và Trạng thái của Deque song song với từng dòng code:

👉 **[Mở giao diện Trực quan hóa Visualizer UI](file:///c:/Users/Le.Quang.Long/Desktop/practices/practice-js/leetcode/hard/sliding_window_maximum_visualizer.html)**

Giao diện bao gồm:
- **Thiết kế ngang (Horizontal Layout):** Mảng đầu vào, cửa sổ làm việc, cấu trúc Deque và Code chạy song song.
- **Thanh điều khiển:** `Play`, `Pause`, `Previous Step`, `Next Step`, `Reset`.
- **Ghi chú thích từng bước (Step-by-step Notes):** Giải thích rõ code đang thực thi dòng nào và Deque biến đổi ra sao.
