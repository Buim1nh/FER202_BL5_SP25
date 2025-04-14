"use client"
import { useNavigate } from "react-router-dom"
import {
  FaShoppingBag,
  FaHistory,
  FaStore,
  FaRegBookmark,
  FaSearch,
  FaRegEye,
  FaRegHeart,
  FaTag,
  FaArrowRight,
  FaCheckCircle,
  FaRegClock,
  FaMoneyBillWave,
} from "react-icons/fa"

const Activity = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">Hoạt động của tôi</h1>
          <p className="text-gray-600 mt-1">Theo dõi các hoạt động mua và bán hàng của bạn tại một nơi</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <FaShoppingBag size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Đơn hàng đã mua</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <FaStore size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Sản phẩm đang bán</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <FaMoneyBillWave size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-semibold text-gray-900">$1,320.00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase History */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center">
                  <FaHistory className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Lịch sử mua hàng</h2>
                </div>
                <button
                  onClick={() => navigate("/order-history")}
                  className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium"
                >
                  Xem tất cả <FaArrowRight className="ml-1" size={12} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                        <FaShoppingBag className="text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Tai nghe Bluetooth Sony</h3>
                        <p className="text-sm text-gray-500">Đã nhận: 15/03/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$89.99</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" size={10} /> Hoàn thành
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                        <FaShoppingBag className="text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Bàn phím cơ Logitech</h3>
                        <p className="text-sm text-gray-500">Đang giao: 22/03/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$129.99</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaRegClock className="mr-1" size={10} /> Đang giao
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mt-4">
                  Xem lại các đơn hàng đã mua và theo dõi trạng thái giao hàng.
                </p>
              </div>
            </div>

            {/* Selling */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center">
                  <FaStore className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Bán hàng</h2>
                </div>
                <button
                  onClick={() => navigate("/sellerProduct")}
                  className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium"
                >
                  Quản lý sản phẩm <FaArrowRight className="ml-1" size={12} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-blue-700">Đang bán</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        1
                      </span>
                    </div>
                    <ul className="space-y-2">
                      <li className="p-2 bg-white rounded border border-blue-100">
                        <p className="font-medium">Máy ảnh Canon EOS</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-blue-600 font-semibold">$450.00</span>
                          <span className="text-xs text-gray-500">Còn 3 ngày</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-green-700">Đã bán</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        1
                      </span>
                    </div>
                    <ul className="space-y-2">
                      <li className="p-2 bg-white rounded border border-green-100">
                        <p className="font-medium">Áo khoác da</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-green-600 font-semibold">$120.00</span>
                          <span className="text-xs text-gray-500">20/03/2025</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-red-700">Chưa thanh toán</h3>
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        1
                      </span>
                    </div>
                    <ul className="space-y-2">
                      <li className="p-2 bg-white rounded border border-red-100">
                        <p className="font-medium">Đồng hồ thông minh</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-red-600 font-semibold">$200.00</span>
                          <span className="text-xs text-red-500">Chưa thanh toán</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Tổng doanh thu</h3>
                    <p className="text-sm text-gray-500">Tháng này</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">$570.00</p>
                    <button
                      onClick={() => navigate("/totalSell")}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Get more out of My eBay Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Tận dụng tối đa tài khoản</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Đây là không gian của bạn. Theo dõi các mặt hàng quan trọng nhất đối với bạn.
                </p>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-500 mr-3">
                      <FaSearch size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Tìm ưu đãi dành cho bạn</p>
                      <a href="#" className="text-blue-500 text-sm hover:underline">
                        Tìm hiểu thêm
                      </a>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-purple-100 rounded-full text-purple-500 mr-3">
                      <FaRegEye size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Theo dõi sản phẩm yêu thích</p>
                      <a href="#" className="text-blue-500 text-sm hover:underline">
                        Tìm hiểu thêm
                      </a>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-red-100 rounded-full text-red-500 mr-3">
                      <FaRegHeart size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Lưu người bán & tìm kiếm</p>
                      <a href="#" className="text-blue-500 text-sm hover:underline">
                        Tìm hiểu thêm
                      </a>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-green-100 rounded-full text-green-500 mr-3">
                      <FaTag size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Đăng bán sản phẩm</p>
                      <a href="#" className="text-blue-500 text-sm hover:underline">
                        Tìm hiểu thêm
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Watchlist */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center">
                  <FaRegBookmark className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Danh sách theo dõi</h2>
                </div>
                <a href="#" className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium">
                  Xem tất cả <FaArrowRight className="ml-1" size={12} />
                </a>
              </div>
              <div className="p-6">
                <ul className="divide-y divide-gray-200">
                  <li className="py-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Laptop Dell XPS 13</p>
                      <span className="text-blue-600 font-semibold">$1,200.00</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Đấu giá</span>
                      <span className="text-sm text-gray-500">Còn 5 ngày</span>
                    </div>
                  </li>
                  <li className="py-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Giày thể thao Nike</p>
                      <span className="text-blue-600 font-semibold">$80.00</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Mua ngay</span>
                      <span className="text-sm text-gray-500">Còn 2 ngày</span>
                    </div>
                  </li>
                </ul>
                <p className="text-gray-500 text-sm mt-4">
                  Lưu trữ các sản phẩm bạn quan tâm để theo dõi giá và thời gian.
                </p>
              </div>
            </div>

            {/* Saved Searches */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center">
                  <FaSearch className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Tìm kiếm đã lưu</h2>
                </div>
                <a href="#" className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium">
                  Xem tất cả <FaArrowRight className="ml-1" size={12} />
                </a>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaSearch className="text-gray-400 mr-2" size={14} />
                        <p className="font-medium">"Điện thoại Samsung"</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        10 mới
                      </span>
                    </div>
                  </li>
                  <li className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaSearch className="text-gray-400 mr-2" size={14} />
                        <p className="font-medium">"Máy chơi game PS5"</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        3 mới
                      </span>
                    </div>
                  </li>
                </ul>
                <p className="text-gray-500 text-sm mt-4">Lưu lại các tìm kiếm sản phẩm để dễ dàng kiểm tra sau này.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Activity

