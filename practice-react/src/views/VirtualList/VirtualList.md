# Tìm hiểu về Virtual List (Virtual Scroll / Windowing)

Tài liệu này giải thích chi tiết khái niệm **Virtual List** (danh sách ảo) - một kỹ thuật tối ưu hóa hiệu năng cực kỳ phổ biến trong lập trình web khi làm việc với danh sách dữ liệu lớn.

---

## 1. WHAT - Virtual List là gì?

**Virtual List** (hay còn gọi là **Windowing** hoặc **Virtual Scroll**) là một kỹ thuật render UI (giao diện người dùng) bằng cách chỉ render các phần tử thực sự hiển thị trong vùng nhìn thấy (**viewport**) của người dùng cùng với một vài phần tử đệm (**buffer** / **overscan**) ở phía trên và phía dưới để tránh hiện tượng khoảng trắng khi scroll nhanh.

Thay vì render hàng ngàn hoặc hàng triệu **DOM nodes** (thẻ HTML) lên trình duyệt, **Virtual List** giữ cho số lượng **DOM nodes** trong **DOM tree** luôn ở mức tối thiểu và cố định (ví dụ: chỉ render khoảng 20-30 phần tử tại một thời điểm bất kể danh sách có 100.000 phần tử).

---

## 2. WHY - Tại sao cần sử dụng Virtual List?

Khi chúng ta render một danh sách thông thường có kích thước rất lớn (ví dụ: 10.000 items):
- **Memory Consumption (Tiêu hao bộ nhớ):** Trình duyệt phải lưu trữ thông tin của hàng chục ngàn phần tử trong bộ nhớ, dẫn đến ngốn RAM.
- **Re-rendering Overhead (Quá tải khi render lại):** Mỗi khi trạng thái (**state**) của component hoặc list thay đổi, React sẽ phải đối chiếu và cập nhật một lượng cực lớn **DOM nodes**, gây ra hiện tượng giật, lag hệ thống (**UI freezing**).
- **Layout & Paint Performance:** Khi người dùng scroll hoặc tương tác, trình duyệt phải tính toán lại vị trí (**layout recalculation**) và vẽ lại (**repainting**) cho rất nhiều phần tử, khiến FPS (số khung hình trên giây) giảm mạnh.

### Ví dụ thực tế (Real-world Metaphor)
Hãy tưởng tượng bạn đang đọc một bức thư tay dài 10 mét qua một khung cửa sổ kính nhỏ có kích thước 30cm x 30cm:
- **Cách tiếp cận thông thường (Non-virtualized):** Bạn trải toàn bộ bức thư dài 10 mét ra sàn nhà. Dù bạn chỉ nhìn thấy 30cm tại một thời điểm qua cửa sổ, bạn vẫn phải dọn sạch cả căn phòng lớn để trải bức thư ra.
- **Cách tiếp cận Virtual List:** Bạn chỉ giữ phần bức thư dài 30cm ngay trước khung cửa sổ. Khi bạn kéo bức thư lên (scroll), bạn cuộn phần giấy cũ đi và đưa phần giấy mới vào đúng vị trí cửa sổ. Diện tích sàn cần dùng luôn luôn chỉ là 30cm.

---

## 3. HOW - Cách hoạt động và triển khai Virtual List như thế nào?

Để triển khai một **Virtual List** cơ bản (với các phần tử có chiều cao cố định - **fixed item height**), chúng ta cần thực hiện các bước sau:

### Cơ cấu cấu trúc DOM (DOM Structure)
Chúng ta cần 3 lớp phần tử HTML chính:
1. **Scroll Container (Outer Container):** Thẻ div bên ngoài cùng, có chiều cao cố định (`height`) và có thuộc tính `overflow-y: auto`. Thẻ này định nghĩa **viewport** của danh sách.
2. **Spacer/Scroll Runner (Inner Container):** Thẻ div bên trong, có chiều cao bằng tổng chiều cao của tất cả các phần tử trong danh sách (`totalHeight = itemCount * itemHeight`). Thẻ này không chứa phần tử thực tế mà chỉ để tạo thanh cuộn (**scrollbar**) có độ dài chính xác cho trình duyệt.
3. **Item Container (Visible Items Wrapper):** Thẻ div chứa các phần tử đang hiển thị thực tế. Để các phần tử nằm đúng vị trí của chúng khi cuộn, ta sử dụng **absolute positioning** (`position: absolute`) và đặt thuộc tính `top` cho từng item dựa trên chỉ số (**index**) của nó (`top = index * itemHeight`).

### Thuật toán tính toán chỉ số hiển thị
Khi có sự kiện cuộn (**scroll event**) xảy ra trên **Scroll Container**, ta lấy giá trị `scrollTop` (khoảng cách đã cuộn từ đỉnh):

1. **Scrolled Item Count (Số lượng item đã trôi qua):**
   $$\text{scrolledItemCount} = \lfloor \frac{\text{scrollTop}}{\text{itemHeight}} \rfloor$$

2. **Visible Item Count (Số lượng item hiển thị trong viewport):**
   $$\text{visibleItemCount} = \lceil \frac{\text{containerHeight}}{\text{itemHeight}} \rceil$$

3. **Start Index (Chỉ số bắt đầu của item cần render):**
   $$\text{startIndex} = \max(0, \text{scrolledItemCount} - \text{overscan})$$
   *(Lưu ý: Trừ đi **overscan** làm vùng đệm phía trên)*

4. **End Index (Chỉ số kết thúc của item cần render):**
   $$\text{endIndex} = \min(\text{itemCount} - 1, \text{scrolledItemCount} + \text{visibleItemCount} + \text{overscan})$$
   *(Lưu ý: Cộng thêm **overscan** làm vùng đệm phía dưới)*

5. **Render danh sách:**
   Chỉ lặp qua các phần tử từ `startIndex` đến `endIndex` để render lên màn hình. Thiết lập style cho mỗi item:
   ```css
   position: absolute;
   top: index * itemHeight;
   height: itemHeight;
   left: 0;
   right: 0;
   ```
