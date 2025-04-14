Nhóm 4: Hệ thống thanh toán & giao hàng (System Integration)
Yêu cầu tổng hợp:

--- Bùi Vũ Tiến + Hà Viet Hiếu
•	Module thanh toán mô phỏng (PayPal, COD)
•	Tính phí giao hàng dựa theo khu vực (giả lập logic đơn giản)
•	Kết nối API vận chuyển (giả lập): tạo mã vận đơn, cập nhật trạng thái giao hàng
•	🧱 Module thanh toán và vận chuyển phải có thể plug-in dễ dàng (microservice/hook)
•	🔐 Kết nối các API thanh toán giả lập phải được kiểm tra auth token & secured key
•	⚡ Tốc độ xác nhận thanh toán không quá 2 giây
--- Bùi Tuấn Minh
•	Gửi email xác nhận thanh toán thành công
•	Gửi email khi trạng thái đơn hàng thay đổi (giao hàng thành công, thất bại)
---
•	Tự động huỷ đơn hàng quá thời gian chờ thanh toán
•	Tính tổng tiền đơn hàng: giá sản phẩm, số lượng, phí vận chuyển, mã giảm giá

--- bỏ
•	🐞 Log chi tiết transaction ID và lỗi giao tiếp giữa các module
•	🔁 Hệ thống retry nếu kết nối với API vận chuyển thất bại
