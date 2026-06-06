# Hướng Dẫn Học Thuật Toán: Binary Search (Tìm Kiếm Nhị Phân)

Chào mừng bạn đến với hướng dẫn chi tiết về **Binary Search**! Tài liệu này được thiết kế để giải thích cặn kẽ khái niệm cốt lõi theo phương pháp trực quan và dễ hiểu nhất.

---

## 1. WHAT: Binary Search Là Gì?

**Binary Search** (Tìm kiếm nhị phân) là một **algorithm** (thuật toán) tìm kiếm cực kỳ hiệu quả hoạt động trên một **sorted array** (mảng đã được sắp xếp theo thứ tự tăng dần hoặc giảm dần). 

Thay vì kiểm tra từng phần tử từ đầu đến cuối như **Linear Search** (Tìm kiếm tuyến tính), **Binary Search** liên tục chia đôi khoảng tìm kiếm. Tại mỗi bước, thuật toán so sánh **target value** (giá trị cần tìm) với phần tử ở chính giữa (**mid value**):
- Nếu **target value** bằng **mid value**, chúng ta đã tìm thấy phần tử và trả về **index** (chỉ số) của nó.
- Nếu **target value** nhỏ hơn **mid value**, chúng ta thu hẹp **search space** (không gian tìm kiếm) về nửa bên trái.
- Nếu **target value** lớn hơn **mid value**, chúng ta thu hẹp **search space** về nửa bên phải.

Quá trình này lặp lại cho đến khi tìm thấy phần tử hoặc **search space** trở nên rỗng (tức là không tìm thấy).

---

## 2. WHY: Tại Sao Nên Dùng Binary Search?

### Vấn Đề Với Linear Search ($O(N)$)
Giả sử bạn có một danh bạ điện thoại chứa **1 triệu** cái tên đã được sắp xếp theo bảng chữ cái. Nếu bạn dùng **Linear Search** để tìm tên "Zack", bạn sẽ phải duyệt qua từng người một từ đầu danh sách. Trong trường hợp xấu nhất, bạn phải thực hiện **1.000.000 lần so sánh**.

### Sức Mạnh Của Binary Search ($O(\log N)$)
Nếu áp dụng **Binary Search**:
- Lần 1: Chia đôi mảng, loại bỏ 500.000 tên.
- Lần 2: Chia đôi tiếp, loại bỏ 250.000 tên.
- Lần 3: Chia đôi tiếp, loại bỏ 125.000 tên.
- ...
- Chỉ sau tối đa **20 lần so sánh**, bạn chắc chắn sẽ tìm ra tên cần tìm hoặc biết được tên đó không tồn tại!

### So Sánh Chi Tiết:
| Tiêu chí | Linear Search (Tìm kiếm tuyến tính) | Binary Search (Tìm kiếm nhị phân) |
| :--- | :--- | :--- |
| **Yêu cầu dữ liệu** | Không cần sắp xếp | **Bắt buộc** phải là **sorted array** |
| **Time Complexity** | $O(N)$ (Tuyến tính - Tăng dần theo số phần tử) | $O(\log N)$ (Logarithmic - Cực kỳ nhanh với dữ liệu lớn) |
| **Space Complexity**| $O(1)$ (Không dùng thêm bộ nhớ) | $O(1)$ (Dành cho bản duyệt lặp - iterative) |

---

## 3. HOW: Thuật Toán Hoạt Động Như Thế Nào?

Để thực hiện **Binary Search**, chúng ta duy trì hai chỉ số giới hạn phạm vi tìm kiếm hiện tại, thường được gọi là:
- `lowIndex`: Chỉ số bắt đầu của **search space** (ban đầu là `0`).
- `highIndex`: Chỉ số kết thúc của **search space** (ban đầu là `array.length - 1`).

### Các Bước Thực Hiện Chi Tiết:

1. **Kiểm tra tính hợp lệ**: Khi `lowIndex <= highIndex`, điều này nghĩa là **search space** vẫn còn phần tử để tìm kiếm. Nếu `lowIndex > highIndex`, thuật toán kết thúc và trả về `-1` (không tìm thấy).
2. **Tính toán vị trí giữa**:
   $$\text{midIndex} = \lfloor \frac{\text{lowIndex} + \text{highIndex}}{2} \rfloor$$
3. **So sánh**:
   - Nếu `array[midIndex] === target`: Trả về `midIndex` (**Success**).
   - Nếu `target < array[midIndex]`: Giá trị cần tìm nằm ở nửa bên trái. Cập nhật giới hạn bên phải:
     $$\text{highIndex} = \text{midIndex} - 1$$
   - Nếu `target > array[midIndex]`: Giá trị cần tìm nằm ở nửa bên phải. Cập nhật giới hạn bên trái:
     $$\text{lowIndex} = \text{midIndex} + 1$$
4. **Lặp lại** từ Bước 1.

---

## 4. Ví Dụ Thực Tế (Real-World Example)

Hãy tưởng tượng bạn đang tìm trang **120** trong một cuốn sách dày **300** trang. Bạn sẽ làm thế nào?

1. Bạn sẽ mở ngẫu nhiên cuốn sách ở khoảng giữa, ví dụ trang **150** (**midIndex**).
2. Bạn so sánh: trang mục tiêu của bạn là **120** (**target**), nhỏ hơn **150** (**midValue**).
3. Vì sách đã được đánh số trang tăng dần (**sorted**), bạn biết chắc chắn trang **120** không thể nằm từ trang 150 đến 300. Bạn **loại bỏ hoàn toàn nửa sau** của cuốn sách.
4. Giờ đây, phạm vi tìm kiếm của bạn là từ trang **1** đến trang **149** (`highIndex = midIndex - 1`).
5. Bạn mở tiếp trang ở giữa phạm vi mới này, ví dụ trang **75**.
6. So sánh: **120 > 75**, bạn biết trang **120** phải nằm từ trang 76 đến 149. Bạn **loại bỏ nửa trước** (`lowIndex = midIndex + 1`).
7. Bạn lặp lại hành động này cho đến khi mở trúng trang **120**!

Đây chính xác là cách **Binary Search** vận hành trong máy tính. Trực quan hóa và code chi tiết của thuật toán này đã được cài đặt đầy đủ trong visualizer đi kèm!
