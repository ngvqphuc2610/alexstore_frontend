# Kế hoạch Phát triển Kênh Người Bán (Seller Portal)

Dựa trên cấu trúc hiện tại của dự án `alexstore`, dưới đây là kế hoạch chi tiết các việc cần làm để hoàn thiện **Kênh Người Bán (Seller Portal)**. Kế hoạch này giúp seller quản lý gian hàng một cách toàn diện từ sản phẩm, đơn hàng, đến doanh thu.

---

## 1. Quản lý Tổng quan (Dashboard) - Ưu tiên: Cao
Cung cấp cái nhìn tổng quan về tình hình kinh doanh của gian hàng.
- [x] **Thống kê nhanh:** Hiển thị doanh thu, tổng số đơn hàng mới, tổng sản phẩm đang bán (Dữ liệu thực từ API).
- [ ] **Biểu đồ doanh thu:** Trực quan hóa doanh thu theo thời gian.
- [x] **Thông báo quan trọng:** Báo động sản phẩm sắp hết hàng (Low stock alerts) và hiển thị đơn hàng cần xử lý.
- [x] **Đơn hàng gần đây:** Danh sách đơn hàng mới nhất rớt vào hệ thống.

## 2. Quản lý Sản phẩm (Products) - Ưu tiên: Cao *(Đang thực hiện)*
Cho phép seller thêm, sửa, xóa và quản lý kho hàng.
- [x] **Danh sách sản phẩm:** Lấy dữ liệu và hiển thị danh sách sản phẩm của API.
- [x] **Xóa sản phẩm:** Tích hợp API xóa sản phẩm.
- [x] **Thêm sản phẩm mới:** Form thêm sản phẩm đầy đủ validation (react-hook-form + zod).
- [x] **Cập nhật sản phẩm:** Form chỉnh sửa thông tin sản phẩm đầy đủ.
- [x] **Quản lý Hình ảnh:** Chức năng upload ảnh, chọn ảnh đại diện (Primary Image), và xóa ảnh.

## 3. Quản lý Đơn hàng (Orders) - Ưu tiên: Cao
Nơi seller xử lý các đơn hàng được khách hàng đặt mua từ gian hàng của mình.
- [ ] **Danh sách đơn hàng:** Hiển thị các đơn hàng kèm trạng thái (Chờ xác nhận, Đang chuẩn bị, Đang giao, Đã giao, Đã hủy).
- [ ] **Chi tiết đơn hàng:** Xem thông tin sản phẩm khách đặt, địa chỉ giao hàng, phương thức thanh toán.
- [ ] **Cập nhật trạng thái đơn hàng:** 
  - Chuyển từ *Chờ xác nhận* -> *Đang xử lý* -> *Đang giao hàng*.
  - Hủy đơn hàng (nếu có lý do chính đáng hoặc hết hàng).
- [ ] **Lọc và tìm kiếm:** Tìm đơn hàng theo mã đơn, tên khách hàng hoặc ngày đặt.

## 4. Quản lý Doanh thu & Rút tiền (Withdrawal/Wallet) - Ưu tiên: Trung bình
Quản lý tiền bán được và yêu cầu rút tiền về tài khoản ngân hàng.
- [ ] **Số dư ví:** Hiển thị số dư hiện tại có thể rút và số tiền đang chờ đối soát.
- [ ] **Yêu cầu rút tiền:** Form tạo yêu cầu rút tiền (Nhập số tiền cần rút).
- [ ] **Lịch sử giao dịch/rút tiền:** Theo dõi trạng thái các lệnh rút tiền (Đang duyệt, Đã chuyển khoản, Từ chối).
- [ ] **Tài khoản ngân hàng:** Thiết lập thông tin thẻ/tài khoản ngân hàng để admin chuyển tiền.

## 5. Hồ sơ & Cài đặt Gian hàng (Profile/Settings) - Ưu tiên: Trung bình
Tùy chỉnh thông tin công khai của gian hàng.
- [ ] **Thông tin gian hàng:** Cập nhật tên Shop, Avatar/Logo, và mô tả ngắn (Bio) của gian hàng.
- [ ] **Địa chỉ lấy hàng:** Thiết lập số điện thoại và địa chỉ thực tế để đơn vị vận chuyển đến lấy hàng.
- [ ] **Chính sách riêng:** (Tùy chọn) Chính sách đổi trả hoặc giới thiệu của riêng shop.

## 6. Hỗ trợ & Phản hồi (Support/Reviews) - Ưu tiên: Thấp
- [ ] **Quản lý Đánh giá (Reviews):** Xem và phản hồi lại đánh giá của khách hàng về sản phẩm của mình.
- [ ] **Trung tâm hỗ trợ (Ticket System):** Gửi yêu cầu hỗ trợ đến Admin khi gặp vấn đề về rút tiền, tranh chấp đơn hàng, hoặc lỗi hệ thống.

---

### 🚀 Lộ trình Đề xuất để code tiếp:
1. Hoàn thiện toàn bộ chức năng **Thêm/Sửa/Xóa/Upload Ảnh** ở trang **Products**.
2. Xây dựng trang **Orders** để seller có thể bắt đầu mô phỏng quy trình xử lý đơn hàng.
3. Làm trang **Dashboard** để hiển thị số liệu thực tế dựa trên Products và Orders đã có.
4. Làm trang **Profile** và **Withdrawal** sau cùng để hoàn thiện nghiệp vụ.

Bạn muốn chúng ta bắt đầu implement tính năng nào tiếp theo trong danh sách này (ví dụ: Form thêm sản phẩm mới hay Trang danh sách đơn hàng)?
