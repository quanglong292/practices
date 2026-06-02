# Kỹ thuật Hai Con Trỏ (Two Pointer Technique)

Chào mừng bạn đến với bài học về **Two Pointer** (Kỹ thuật hai con trỏ) - một trong những *algorithmic pattern* (mẫu thuật toán) phổ biến và cực kỳ tối ưu trong lập trình để xử lý các bài toán trên *array* (mảng) hoặc *linked list* (danh sách liên kết).

---

## 1. WHAT - Kỹ thuật Two Pointer là gì?

**Two Pointer** là kỹ thuật sử dụng hai biến chạy (gọi là *pointers* hoặc con trỏ) để lưu trữ các giá trị *index* (chỉ số) của các phần tử trong một *data structure* (cấu trúc dữ liệu), thường gặp nhất là *array* (mảng).

Hai con trỏ này sẽ di chuyển qua mảng theo một quy luật hoặc hướng đi nhất định để tìm ra đáp án thỏa mãn điều kiện đề bài mà không cần phải duyệt lặp lồng nhau vô ích.

Các hướng di chuyển phổ biến:
1. **Đối đầu (Opposite direction)**: Một con trỏ bắt đầu từ đầu mảng (`left`), một con trỏ xuất phát từ cuối mảng (`right`). Chúng di chuyển tiến lại gần nhau cho đến khi gặp nhau hoặc thỏa mãn điều kiện dừng. (Thường áp dụng trên *sorted array* - mảng đã được sắp xếp).
2. **Cùng chiều (Same direction / Fast & Slow)**: Hai con trỏ xuất phát cùng một đầu nhưng di chuyển với tốc độ khác nhau (ví dụ: con trỏ nhanh nhảy 2 bước, con trỏ chậm nhảy 1 bước). Thường dùng để tìm điểm giữa hoặc phát hiện chu kỳ (*cycle detection*) trong *linked list*.

---

## 2. WHY - Tại sao nên dùng Two Pointer?

### Tránh vòng lặp lồng nhau (Avoid Nested Loops)
Thông thường, để tìm cặp phần tử thỏa mãn điều kiện, ta hay dùng cách tiếp cận thô sơ nhất - **Brute Force** - sử dụng hai vòng lặp `for` lồng nhau:
- **Time Complexity** (Độ phức tạp thời gian): $O(n^2)$ - cực kỳ chậm khi mảng có kích thước lớn.
- **Space Complexity** (Độ phức tạp không gian): $O(1)$.

Khi áp dụng **Two Pointer**:
- Ta chỉ duyệt mảng đúng một lần duy nhất bằng cách dịch chuyển khôn ngoan con trỏ `left` hoặc `right`.
- **Time Complexity**: $O(n)$ - tối ưu hơn rất nhiều!
- **Space Complexity**: $O(1)$ - cực kỳ tiết kiệm bộ nhớ vì chỉ sử dụng thêm hai biến chỉ số đơn giản.

---

## 3. HOW - Hoạt động như thế nào? (Real-World Analogy)

### Ví dụ đời thực (Real-world Example):
> Hãy tưởng tượng bạn và một người bạn đang đứng ở hai đầu của một hàng cân gồm các thùng hàng đã được sắp xếp theo cân nặng từ nhẹ nhất đến nặng nhất (*sorted list*). 
> 
> Nhiệm vụ của cả hai là **tìm ra đúng 2 thùng hàng** có tổng cân nặng bằng đúng **100 kg** (đây là *target*).
> 
> - Bạn đứng ở đầu trái (`left` - thùng nhẹ nhất, ví dụ: 10kg).
> - Người bạn đứng ở đầu phải (`right` - thùng nặng nhất, ví dụ: 110kg).
> 
> Cả hai cùng kiểm tra tổng cân nặng hiện tại: `10kg + 110kg = 120kg`.
> - **120kg > 100kg** (Tổng quá lớn!): Vì mảng đã được sắp xếp, nên để giảm tổng cân nặng xuống, người bạn ở bên phải bắt buộc phải bước lui vào trong một bước để chọn thùng hàng nhẹ hơn một chút (ví dụ: thùng 85kg).
> 
> Lần kiểm tra tiếp theo: `10kg + 85kg = 95kg`.
> - **95kg < 100kg** (Tổng quá nhỏ!): Để tăng tổng cân nặng lên, bạn ở bên trái bắt buộc phải bước tới một bước sang phải để chọn thùng nặng hơn một chút (ví dụ: thùng 15kg).
> 
> Cứ tiếp tục như vậy cho đến khi tìm được cặp thùng có tổng bằng đúng 100kg, hoặc hai người chạm nhau (không tìm thấy).

---

## 4. Minh họa bằng Code: Bài toán Two Sum II

Cho một mảng số nguyên `numbers` đã được sắp xếp tăng dần (*sorted array in ascending order*) và một số nguyên `target`. Hãy tìm hai số sao cho tổng của chúng bằng `target`.

### Cách viết Code cơ bản và tường minh (Dễ đọc):

```javascript
function twoSumSorted(numbers, target) {
  // 1. Khởi tạo con trỏ left ở đầu mảng (chỉ số 0)
  let leftIndex = 0;
  
  // 2. Khởi tạo con trỏ right ở cuối mảng (chỉ số độ dài mảng - 1)
  let rightIndex = numbers.length - 1;

  // 3. Vòng lặp chạy khi hai con trỏ chưa giao nhau
  while (leftIndex < rightIndex) {
    const currentSum = numbers[leftIndex] + numbers[rightIndex];

    // Điều kiện 1: Tổng bằng target -> Tìm thấy đáp án!
    const isSumEqualToTarget = (currentSum === target);
    if (isSumEqualToTarget) {
      // Trả về chỉ số (thường là 1-based index theo đề bài LeetCode)
      const firstIndexResult = leftIndex + 1;
      const secondIndexResult = rightIndex + 1;
      return [firstIndexResult, secondIndexResult];
    }

    // Điều kiện 2: Tổng nhỏ hơn target -> Cần số lớn hơn -> Tăng leftIndex
    const isSumLessThanTarget = (currentSum < target);
    if (isSumLessThanTarget) {
      leftIndex = leftIndex + 1;
    } 
    
    // Điều kiện 3: Tổng lớn hơn target -> Cần số nhỏ hơn -> Giảm rightIndex
    const isSumGreaterThanTarget = (currentSum > target);
    if (isSumGreaterThanTarget) {
      rightIndex = rightIndex - 1;
    }
  }

  // Nếu không tìm thấy cặp nào thỏa mãn
  return [];
}
```

---

## 5. Bài tập rèn luyện (Exercise)

Để rèn luyện tư duy, bạn hãy thử tự giải bài toán sau:

### Bài toán: Kiểm Tra Chuỗi Đối Xứng (Valid Palindrome)
> Cho một chuỗi `s` chỉ chứa các ký tự chữ và số. Hãy kiểm tra xem chuỗi đó có đối xứng hay không (đọc xuôi hay đọc ngược đều giống nhau, bỏ qua hoa thường).
> 
> *Ví dụ:* 
> - Input: `s = "raceacar"` -> Output: `false` (vì chữ 'a' và 'c' ở giữa không khớp).
> - Input: `s = "aba"` -> Output: `true`.

**Gợi ý sử dụng Two Pointer**:
- Khởi tạo `leftIndex = 0` và `rightIndex = s.length - 1`.
- Chạy vòng lặp so sánh ký tự tại `s[leftIndex]` và `s[rightIndex]`.
- Nếu có bất cứ ký tự nào khác nhau -> Trả về `false`.
- Nếu giống nhau -> Tăng `leftIndex` lên 1, giảm `rightIndex` đi 1 và tiếp tục kiểm tra.
- Nếu vòng lặp kết thúc mà không phát hiện sự khác biệt -> Trả về `true`.
