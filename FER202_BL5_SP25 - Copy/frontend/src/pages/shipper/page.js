"use client"

import { useState, useEffect } from "react"
import { FaList, FaTruck, FaEye, FaHandPaper } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'

const ShipperDashboard = () => {
    const [activeTab, setActiveTab] = useState("allOrders")
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showDetail, setShowDetail] = useState({ show: false, data: null })
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const navigate = useNavigate()
    const [shipperId, setShipperId] = useState(null)
    const [shipperName, setShipperName] = useState("")
    const [users, setUsers] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [orderConfirmations, setOrderConfirmations] = useState([]);

    // Lấy danh sách user (bao gồm shipper)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:9999/user");
                const data = await res.json();
                setUsers(data);
            } catch {
                setUsers([]);
            }
        };
        fetchUsers();
    }, []);

    // Hàm lấy tên shipper từ id
    const getShipperName = (shipperId) => {
        if (!shipperId) return "Chưa lấy";
        const shipper = users.find(u => u.id === shipperId);
        return shipper ? (shipper.fullname || shipper.email || shipper.id) : shipperId;
    };
    const getOrderConfirmation = (orderId) => {
        const confirmation = orderConfirmations.find(c => c.order_id === orderId);
        if (!confirmation) return "Chưa xác nhận";
        return confirmation.confirmation_status === "confirmed"
            ? "chưa xác nhận"
            : "Đã xác nhận";
    };
    

    // Hàm lấy tên người đặt từ user_id
    const getUserName = (userId) => {
        if (!userId) return "Không xác định";
        const user = users.find(u => u.id === userId);
        return user ? (user.fullname || user.email || user.id) : userId;
    };

    // Lấy id và tên shipper từ localStorage
    useEffect(() => {
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setShipperId(user.id);
                setShipperName(user.fullname || user.email || "Shipper");
            } catch {
                setShipperId(null);
                setShipperName("Shipper");
            }
        }
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                const res = await fetch("http://localhost:9999/orders")
                const data = await res.json()
                setOrders(data)
                setLoading(false)
            } catch (err) {
                setError("Không thể tải dữ liệu đơn hàng")
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])
    // Lấy xác nhận đơn hàng
    useEffect(() => {
        const fetchOrderConfirmations = async () => {
            try {
                const res = await fetch("http://localhost:9999/orderConfirmations");
                const data = await res.json();
                setOrderConfirmations(data);
            } catch (err) {
                console.error("Không thể tải dữ liệu xác nhận đơn hàng", err);
            }
        }
        fetchOrderConfirmations();
    }, []);

    const paginateData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return data.slice(startIndex, endIndex)
    }

    const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage)

    const handlePageChange = (page) => setCurrentPage(page)

    // Lọc đơn hàng của shipper hiện tại
    const myOrders = orders.filter(
        order => order.shipper_id === shipperId
    );
    // Bộ lọc trạng thái cho danh sách
    const filteredOrders = (activeTab === "allOrders"
        ? (filterStatus === "all" ? orders : orders.filter(order => order.status === filterStatus))
        : myOrders
    ).filter(order => {
        const userName = getUserName(order.user_id)?.toLowerCase() || "";
        const phone = order.phone?.toLowerCase() || "";
        const orderId = String(order.order_id || "").toLowerCase();
        const search = searchText.toLowerCase();
        return (
            userName.includes(search) ||
            phone.includes(search) ||
            orderId.includes(search)
        );
    });

    const handleTakeOrder = async (orderId) => {
        setLoading(true);
        // 1. Lấy order theo order_id
        const res = await fetch(`http://localhost:9999/orders?order_id=${orderId}`);
        const data = await res.json();
        if (!data[0]) {
            setError("Không tìm thấy đơn hàng");
            setLoading(false);
            return;
        }
        await fetch(`http://localhost:9999/orders/${data[0].id || data[0].order_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "shipped", shipper_id: shipperId }),
        });
        // ...fetch lại orders như cũ...
        const res2 = await fetch("http://localhost:9999/orders");
        const data2 = await res2.json();
        setOrders(data2);
        setLoading(false);
    };

    const handleDelivered = async (orderId) => {
        try {
            setLoading(true);
            // 1. Lấy order theo order_id
            const res = await fetch(`http://localhost:9999/orders?order_id=${orderId}`);
            const data = await res.json();
            if (!data[0]) {
                setError("Không tìm thấy đơn hàng");
                setLoading(false);
                return;
            }
            // PATCH qua id hoặc order_id
            await fetch(`http://localhost:9999/orders/${data[0].id || data[0].order_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "delivered" }),
            });
            // Cập nhật lại danh sách đơn hàng
            const res2 = await fetch("http://localhost:9999/orders");
            const data2 = await res2.json();
            setOrders(data2);
            setLoading(false);
        } catch (err) {
            setError("Không thể cập nhật đơn hàng");
            setLoading(false);
        }
    };

    const handleCancel = async (orderId) => {
        try {
            // 1. Lấy order theo order_id
            const res = await fetch(`http://localhost:9999/orders?order_id=${orderId}`);
            const data = await res.json();
            if (!data[0]) {
                setError("Không tìm thấy đơn hàng");
                setLoading(false);
                return;
            }
            // PATCH qua id hoặc order_id
            await fetch(`http://localhost:9999/orders/${data[0].id || data[0].order_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "failed" }),
            });
            const res2 = await fetch("http://localhost:9999/orders");
            const data2 = await res2.json();
            setOrders(data2);
            setLoading(false);
        } catch (err) {
            setError("Không thể hủy đơn hàng");
            setLoading(false);
        }
    };

    if (loading)
        return <div className="min-h-screen flex justify-center items-center">Đang tải dữ liệu...</div>
    if (error)
        return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white shadow-md md:h-screen md:sticky md:top-0 flex flex-col h-screen">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipper Panel</h2>
                    <ul className="space-y-2">
                        <li
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === "allOrders" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                            onClick={() => { setActiveTab("allOrders"); setShowDetail({ show: false, data: null }); setCurrentPage(1) }}
                        >
                            <FaList className="w-5 h-5 mr-3" />
                            <span>Tất cả đơn hàng</span>
                        </li>
                        <li
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === "myOrders" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                            onClick={() => { setActiveTab("myOrders"); setShowDetail({ show: false, data: null }); setCurrentPage(1) }}
                        >
                            <FaTruck className="w-5 h-5 mr-3" />
                            <span>Đơn hàng của tôi</span>
                        </li>
                    </ul>
                </div>
                {/* Thông tin shipper và nút logout */}
                <div className="p-6 border-t flex flex-col items-center mt-auto">
                    <div className="font-semibold text-gray-700 mb-2">{shipperName}</div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("currentUser");
                            localStorage.removeItem("currentUserId");
                            localStorage.removeItem("currentUserRole");
                            navigate("/auth");
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {activeTab === "allOrders" && "Tất cả đơn hàng"}
                        {activeTab === "myOrders" && "Đơn hàng của tôi"}
                    </h1>
                </div>
                {/* Search bar */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên khách, SĐT, mã đơn hàng..."
                        value={searchText}
                        onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                        className="border rounded px-3 py-1 text-sm w-72"
                    />
                </div>
                {/* Filter for all orders tab */}
                <div className="mb-4 flex items-center gap-2">
                    {activeTab === "allOrders" && (
                        <>
                            <span className="font-medium text-gray-700 mr-2">Trạng thái đơn hàng:</span>
                            <select
                                value={filterStatus}
                                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                <option value="all">Tất cả</option>
                                <option value="pending">Chờ nhận</option>
                                <option value="shipped">Đang giao</option>
                                <option value="delivered">Đã giao</option>
                                <option value="failed">Không thành công</option>
                            </select>
                        </>
                    )}
                </div>
                
                {!showDetail.show && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người đặt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipper</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xác nhận của khách hàng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">    
                                    {paginateData(filteredOrders).map((order) => (
                                        <tr key={order.order_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.order_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getUserName(order.user_id)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.total_amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {order.status === "pending" && (
                                                    <button className="px-3 py-1 rounded bg-gray-300 text-gray-700 cursor-not-allowed" disabled>
                                                        Chờ nhận
                                                    </button>
                                                )}
                                                {order.status === "shipped" && (
                                                    <button className="px-3 py-1 rounded bg-blue-400 text-white cursor-not-allowed" disabled>
                                                        Đang giao
                                                    </button>
                                                )}
                                                {order.status === "delivered" && (
                                                    <button className="px-3 py-1 rounded bg-green-500 text-white cursor-not-allowed" disabled>
                                                        Đã giao
                                                    </button>
                                                )}
                                                {order.status === "failed" && (
                                                    <button className="px-3 py-1 rounded bg-red-500 text-white cursor-not-allowed" disabled>
                                                        Không thành công
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{getShipperName(order.shipper_id) || "Chưa lấy"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{getOrderConfirmation(order.order_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setShowDetail({ show: true, data: order })}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                                                >
                                                    <FaEye className="w-4 h-4 mr-1" />
                                                    <span>Chi tiết</span>
                                                </button>
                                                {/* Nút lấy đơn cho đơn pending ở tab Tất cả đơn hàng */}
                                                {activeTab === "allOrders" && order.status === "pending" && (
                                                    <button
                                                        onClick={() => handleTakeOrder(order.order_id)}
                                                        className="inline-flex items-center px-3 py-1.5 ml-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                                                    >
                                                        <FaHandPaper className="w-4 h-4 mr-1" />
                                                        Lấy đơn
                                                    </button>
                                                )}
                                                {/* Nút đã giao cho đơn shipped ở tab Đơn hàng của tôi */}
                                                {activeTab === "myOrders" && order.status === "shipped" && (
                                                    <button
                                                        onClick={() => handleDelivered(order.order_id)}
                                                        className="inline-flex items-center px-3 py-1.5 ml-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100"
                                                    >
                                                        <FaHandPaper className="w-4 h-4 mr-1" />
                                                        Đã giao
                                                    </button>
                                                )}
                                                {/* Nút hủy đơn cho đơn pending ở tab Đơn hàng của tôi */}
                                                {activeTab === "myOrders" && order.status === "shipped" && (
                                                    <button
                                                        onClick={() => handleCancel(order.order_id)}
                                                        className="inline-flex items-center px-3 py-1.5 ml-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                                    >
                                                        <FaHandPaper className="w-4 h-4 mr-1" />
                                                        Giao không thành công
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(activeTab === "allOrders" ? orders : myOrders).length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                                </div>
                            )}
                        </div>
                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            {Array.from({ length: getTotalPages(activeTab === "allOrders" ? orders : myOrders) }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 border rounded-md text-sm ${currentPage === page
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "border-gray-300 text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === getTotalPages(activeTab === "allOrders" ? orders : myOrders)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Tiếp
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Detail */}
                {showDetail.show && showDetail.data && (
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 text-blue-700 text-center">
                            Đơn hàng #{showDetail.data.order_id}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Người đặt:</span>
                                <span className="text-gray-800">{showDetail.data.user_name || showDetail.data.user_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Tổng tiền:</span>
                                <span className="text-gray-800 font-semibold">${showDetail.data.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Trạng thái:</span>
                                <span>
                                    {showDetail.data.status === "pending" && (
                                        <span className="px-2 py-1 rounded bg-gray-300 text-gray-700 text-xs">Chờ nhận</span>
                                    )}
                                    {showDetail.data.status === "shipped" && (
                                        <span className="px-2 py-1 rounded bg-blue-400 text-white text-xs">Đang giao</span>
                                    )}
                                    {showDetail.data.status === "delivered" && (
                                        <span className="px-2 py-1 rounded bg-green-500 text-white text-xs">Đã giao</span>
                                    )}
                                    {showDetail.data.status === "failed" && (
                                        <span className="px-2 py-1 rounded bg-red-500 text-white text-xs">Không thành công</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Shipper:</span>
                                <span className="text-gray-800">{getShipperName(showDetail.data.shipper_id)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Ngày đặt:</span>
                                <span className="text-gray-800">{new Date(showDetail.data.order_date).toLocaleString("vi-VN")}</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="font-medium text-gray-600 mb-1">Sản phẩm:</div>
                            <ul className="list-disc pl-5 space-y-1">
                                {showDetail.data.items?.map(item => (
                                    <li key={item.product_name} className="text-gray-800">
                                        <span className="font-semibold">{item.product_name}</span> (x{item.quantity}) - ${item.price}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDetail({ show: false, data: null })}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ShipperDashboard