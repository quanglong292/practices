# Tài Liệu Hướng Dẫn: Custom useQuery Hook với Dependency List

Tài liệu này giải thích chi tiết về kiến trúc, lý do và cách hiện thực hóa một custom hook `useQuery(fn, deps)` quản lý trạng thái của một **Promise** dựa trên danh sách phụ thuộc (**dependency list**), giúp đồng bộ hóa dữ liệu với sự thay đổi của React component state.

---

## 1. WHAT: Hook này làm gì?

Hook `useQuery(fn, deps)` là một giải pháp đóng gói (**encapsulation**) vòng đời của một tác vụ bất đồng bộ (**asynchronous task / Promise**).
Hook nhận vào:
*   `fn`: Một hàm bất đồng bộ trả về một **Promise** (ví dụ: gọi API).
*   `deps`: Một mảng các giá trị phụ thuộc (mặc định là `[]`), tương tự như đối số thứ hai của `useEffect`.

Nó trả về một trạng thái gồm 3 trường hợp chính tương ứng với trạng thái của Promise:
1.  **Pending (Đang chờ)**: `{ status: 'loading' }` - Khi Promise đang chạy.
2.  **Fulfilled (Thành công)**: `{ status: 'success', data }` - Khi Promise giải quyết thành công và trả về dữ liệu.
3.  **Rejected (Thất bại)**: `{ status: 'error', error }` - Khi Promise bị lỗi.

---

## 2. WHY: Tại sao cần giải pháp này?

### Tránh lặp lại Boilerplate Code
Trong các ứng dụng React thông thường, mỗi khi tải dữ liệu từ API bạn phải viết rất nhiều dòng code lặp đi lặp lại:
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
useEffect(() => { ... }, [param]);
```
Hook `useQuery` giúp gom tất cả logic cồng kềnh này vào một nơi, tái sử dụng ở mọi component cực kỳ nhanh chóng.

### Tránh Lỗi Đua Tốc Độ (Race Conditions)
Nếu người dùng thay đổi tham số `param` liên tục (ví dụ: chuyển trang hoặc gõ tìm kiếm cực nhanh), nhiều yêu cầu mạng (**network requests**) sẽ được gửi đi song song.
Vì tốc độ mạng không ổn định, phản hồi của yêu cầu cũ có thể chạy chậm hơn và đè lên dữ liệu mới nhất (gọi là **race condition**).
Hook này cần sử dụng một cơ chế dọn dẹp (**cleanup**) để đảm bảo chỉ kết quả của yêu cầu cuối cùng được cập nhật vào màn hình.

---

## 3. HOW: Cơ chế hoạt động của Hook

Để hiện thực hóa hook này, chúng ta cần:
1.  **React `useState`**: Để nắm giữ trạng thái hiện tại (`loading`, `success`, `error`).
2.  **React `useEffect`**: Lắng nghe mảng `deps`. Khi một phần tử trong `deps` thay đổi, `useEffect` tự động chạy lại, đưa trạng thái về `loading` và kích hoạt hàm `fn` mới.
3.  **Hủy kết quả lỗi thời (Cleanup Flag)**: Sử dụng một biến cờ hiệu (`isRequestCancelled`) để đánh dấu xem request đó còn hiệu lực hay không. Khi component unmount hoặc `deps` tiếp tục thay đổi, ta gán biến này bằng `true` để bỏ qua việc cập nhật state từ Promise cũ.

---

## 4. Ví dụ thực tế (Real-world Analogy)

Hãy tưởng tượng bạn là một khách hàng gọi điện cho cửa hàng giao trà sữa:
*   **Dependencies (`deps`)**: Là loại trà sữa bạn đặt (ví dụ: ban đầu là `Trà sữa Trân châu`).
*   **Hành động gọi món (`fn`)**: Shipper bắt đầu đi mua trà sữa cho bạn.
*   **Change Dependencies**: Bạn sực nhớ ra mình thích uống `Trà sữa Matcha` hơn, thế là bạn gọi lại cho cửa hàng đổi món (**deps thay đổi**).
*   **Race Condition & Cleanup Flag**:
    *   Shipper 1 (mua Trà sữa Trân châu) đang đi trên đường.
    *   Cửa hàng báo cho bạn biết món mới đang được Shipper 2 đi mua.
    *   Khi bạn đổi món, đơn hàng 1 coi như bị hủy bỏ (**isRequestCancelled = true**).
    *   Dù Shipper 1 có giao Trà sữa Trân châu đến trước, bạn cũng không nhận món đó nữa (**ignore result**). Bạn chỉ nhận đúng cốc Trà sữa Matcha từ Shipper 2 giao tới (**Success state**).
