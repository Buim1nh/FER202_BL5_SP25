import React from "react";

const Messages = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Tin nhắn</h2>
      <p className="text-gray-600 mb-6">
        Đây là hộp thư eBay, nơi bạn nhận và gửi tin nhắn với người mua, người bán hoặc hỗ trợ từ eBay.
      </p>

      {/* Inbox */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Hộp thư đến</h3>
        <p className="text-gray-500 mb-2">
          Nhận tin nhắn về đơn hàng, thông báo giảm giá, phản hồi từ người bán/mua.
        </p>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span className="flex-1">Người mua A: Máy ảnh Canon còn không?</span>
            <span className="text-gray-400 text-sm">2 giờ trước</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="flex-1">eBay: Giảm giá 20% cho đơn hàng tiếp theo!</span>
            <span className="text-gray-400 text-sm">1 ngày trước</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="flex-1">Người bán B: Cảm ơn bạn đã mua hàng!</span>
            <span className="text-gray-400 text-sm">3 ngày trước</span>
          </li>
        </ul>
        <a href="#" className="text-blue-500 text-sm mt-2 inline-block">
          Xem tất cả tin nhắn trong hộp thư đến
        </a>
      </div>

      {/* Sent Messages */}
      <div className="border rounded p-4">
        <h3 className="text-md font-semibold mb-2">Tin nhắn đã gửi</h3>
        <p className="text-gray-500 mb-2">
          Xem lại các tin nhắn bạn đã gửi.
        </p>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span className="flex-1">Gửi Người mua A: Vâng, máy ảnh còn nhé!</span>
            <span className="text-gray-400 text-sm">1 giờ trước</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="flex-1">Gửi Hỗ trợ eBay: Tôi cần giúp đỡ về thanh toán.</span>
            <span className="text-gray-400 text-sm">2 ngày trước</span>
          </li>
        </ul>
        <a href="#" className="text-blue-500 text-sm mt-2 inline-block">
          Xem tất cả tin nhắn đã gửi
        </a>
      </div>
    </div>
  );
};

export default Messages;