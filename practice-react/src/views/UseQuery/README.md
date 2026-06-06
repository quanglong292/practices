# Cơ chế Re-validation của TanStack Query (SWR - Stale-While-Revalidate)

Tài liệu này giải thích chi tiết về cơ chế **re-validation** (xác thực lại dữ liệu) của thư viện **TanStack Query** (trước đây là React Query). Đây là một trong những tính năng cốt lõi giúp cải thiện trải nghiệm người dùng (**User Experience**) một cách vượt trội.

---

## 1. WHAT: Cơ chế Re-validation là gì?

**Re-validation** là hành động tự động hoặc chủ động tải lại dữ liệu (**refetching**) từ máy chủ (**server**) để cập nhật vào **cache** (bộ nhớ đệm) nhằm đảm bảo rằng dữ liệu hiển thị trên giao diện người dùng (**UI**) luôn mới nhất.

Cơ chế này hoạt động dựa trên chiến lược **SWR (Stale-While-Revalidate)**:
*   **Stale (Cũ/Hết hạn)**: Khi một ứng dụng yêu cầu dữ liệu, nếu dữ liệu đã tồn tại trong bộ nhớ đệm (**cache**), TanStack Query sẽ trả về dữ liệu đó ngay lập tức (dù dữ liệu đó có thể đã cũ) để giao diện hiển thị không bị trễ hay xuất hiện màn hình tải (**loading spinner**).
*   **Revalidate (Xác thực lại)**: Đồng thời, một yêu cầu mạng (**network request**) sẽ được gửi ngầm (**background fetch**) để lấy dữ liệu mới nhất từ **API server**.
*   **Update**: Khi dữ liệu mới về, TanStack Query sẽ cập nhật dữ liệu trong **cache** và kích hoạt quá trình **re-rendering** (vẽ lại giao diện) để hiển thị thông tin mới nhất.

---

## 2. WHY: Tại sao cần Re-validation?

Nếu không có cơ chế **SWR** và **re-validation**, lập trình viên thường có hai lựa chọn kém tối ưu:
1.  **Luôn hiển thị trạng thái tải (Loading State)**: Mỗi khi người dùng chuyển trang hoặc mở lại màn hình, chúng ta phải xóa dữ liệu cũ và hiển thị spinner để đợi gọi API mới. Việc này tạo cảm giác ứng dụng bị chậm và đơ.
2.  **Chỉ lấy dữ liệu một lần (Static Cache)**: Lưu dữ liệu vào một biến toàn cục (như Redux hoặc React Context) và không bao giờ tải lại trừ khi người dùng bấm nút tải lại (F5). Điều này khiến người dùng dễ nhìn thấy dữ liệu cũ, không khớp với thực tế trên máy chủ.

**Lợi ích của Re-validation:**
*   **Instant UI (Giao diện tức thì)**: Người dùng nhìn thấy dữ liệu ngay lập tức mà không phải chờ đợi.
*   **Eventually Consistent (Nhất quán sau cùng)**: Đảm bảo dữ liệu ngầm tự động đồng bộ hóa với server mà không cần người dùng thao tác thủ công.
*   **Smart Bandwidth (Tối ưu băng thông)**: Bằng cách định cấu hình thời gian sống của dữ liệu (**staleTime**), chúng ta tránh được việc gọi API trùng lặp trong thời gian ngắn.

---

## 3. HOW: TanStack Query áp dụng Re-validation như thế nào?

TanStack Query quản lý dữ liệu thông qua các trạng thái sống sau của Cache Entry:
*   `fresh` (Mới): Dữ liệu vừa được lấy về và vẫn nằm trong khoảng thời gian `staleTime`. Trong trạng thái này, nếu có yêu cầu lấy dữ liệu, TanStack Query sẽ dùng thẳng dữ liệu trong **cache** mà **KHÔNG** gọi API ngầm.
*   `stale` (Cũ): Dữ liệu đã vượt quá thời gian `staleTime` nhưng vẫn nằm trong bộ nhớ đệm. Yêu cầu lấy dữ liệu sẽ nhận được dữ liệu cũ lập tức, đồng thời **KÍCH HOẠT** một luồng xác thực lại ngầm (**background refetch**).

### Các Trực Giác Kích Hoạt Re-validation (Revalidation Triggers)
TanStack Query không chỉ re-validate khi component mount, mà còn hỗ trợ tự động xác thực lại trong các trường hợp cực kỳ hữu ích:

1.  **On Mount (`refetchOnMount`)**: Khi một component sử dụng `useQuery` bắt đầu hiển thị trên giao diện (**mount**), nếu dữ liệu đã `stale`, nó sẽ tự động được re-validate.
2.  **Window Focus (`refetchOnWindowFocus`)**: Khi người dùng chuyển tab trình duyệt khác hoặc dùng ứng dụng khác rồi quay lại tab chứa ứng dụng của bạn, TanStack Query sẽ tự động re-validate ngầm để đảm bảo dữ liệu mới nhất nếu dữ liệu đã `stale`.
3.  **Network Reconnect (`refetchOnReconnect`)**: Khi thiết bị mất mạng rồi có mạng trở lại, hệ thống sẽ gọi lại các API đang bị `stale`.
4.  **Interval Polling (`refetchInterval`)**: Tự động re-validate định kỳ sau mỗi `X` mili-giây (rất hữu ích cho các bảng điều khiển thời gian thực - **real-time dashboards**).

---

## 4. Ví dụ thực tế (Real-world Analogy)

Hãy tưởng tượng bạn đi ăn tại một nhà hàng buffet cao cấp:
*   **Cache**: Là quầy thức ăn đã được nấu sẵn và bày ra khay.
*   **staleTime**: Là thời gian món ăn giữ được vị ngon nhất kể từ lúc bưng ra (ví dụ: 5 phút).
*   **Fresh**: Trong vòng 5 phút đầu tiên, khách hàng lấy món ăn từ khay (**cache**) và đầu bếp không cần nấu lại món đó.
*   **Stale**: Sau 5 phút, món ăn trên khay vẫn ăn được nhưng đã nguội bớt.
*   **SWR (Stale-While-Revalidate)**:
    1. Khách hàng tới quầy vẫn lấy phần ăn có sẵn trên khay để ăn trước (**Stale data** - không phải chờ đợi).
    2. Đồng thời, phục vụ bàn thông báo cho đầu bếp nấu một phần ăn mới tinh bưng ra thay thế (**Revalidate ngầm**).
    3. Khi đĩa thức ăn mới nóng hổi được bày lên quầy, khách hàng tiếp theo hoặc khách hàng cũ sẽ được thưởng thức hương vị tươi ngon nhất (**Update & Re-render**).

---

## 5. Thiết kế mã nguồn Custom `useQuery`

Trong file [useQuery.ts](file:///c:/Users/Le.Quang.Long/Desktop/practices/practice-react/src/views/UseQuery/useQuery.ts), chúng ta sẽ tự xây dựng một phiên bản rút gọn của `useQuery` để minh họa trọn vẹn cách thức hoạt động này:

1.  **Global Cache Store**: Một đối tượng toàn cục nằm ngoài vòng đời của React component để giữ dữ liệu giữa các lần chuyển trang và giữa các component khác nhau.
2.  **Observer Pattern**: Cơ chế đăng ký (**subscription**) giúp thông báo cho tất cả các React hooks đang sử dụng chung một `queryKey` biết khi nào dữ liệu trong cache thay đổi để kích hoạt **re-rendering**.
3.  **Time checking**: Kiểm tra điều kiện `updatedAt` để xác định dữ liệu là `fresh` hay `stale`.
4.  **Window Focus Event Listener**: Lắng nghe sự kiện `focus` của trình duyệt để tự động re-validate dữ liệu cũ.
