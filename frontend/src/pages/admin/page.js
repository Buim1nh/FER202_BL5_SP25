"use client"

import { useState, useEffect } from "react"
import {
    FaUsers,
    FaShoppingBag,
    FaBoxOpen,
    FaList,
    FaShoppingCart,
    FaEdit,
    FaTrashAlt,
    FaBan,
    FaCheckCircle,
    FaEye,
    FaExclamationCircle,
    FaSearch,
    FaPlus,
    FaSignOutAlt,
} from "react-icons/fa"
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("users")
    const [users, setUsers] = useState([])
    const [orders, setOrders] = useState([])
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [sellerProducts, setSellerProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState({ show: false, action: null, id: null })
    const [showDetail, setShowDetail] = useState({ show: false, type: null, data: null })
    const [showAddEdit, setShowAddEdit] = useState({ show: false, type: null, data: null })
    const [currentPage, setCurrentPage] = useState(1) // Thêm state cho trang hiện tại
    const [showAddEditCategory, setShowAddEditCategory] = useState({ show: false, data: null });
    const itemsPerPage = 12 // Số dòng tối đa mỗi trang
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const usersResponse = await fetch("http://localhost:9999/user")
                const usersData = await usersResponse.json()
                setUsers(usersData)
                const ordersResponse = await fetch("http://localhost:9999/orders")
                const ordersData = await ordersResponse.json()
                setOrders(ordersData)
                const categoriesResponse = await fetch("http://localhost:9999/categories")
                const categoriesData = await categoriesResponse.json()
                setCategories(categoriesData)
                const productsResponse = await fetch("http://localhost:9999/products")
                const productsData = await productsResponse.json()
                setProducts(productsData)
                const sellerProductsResponse = await fetch("http://localhost:9999/sellerProduct")
                const sellerProductsData = await sellerProductsResponse.json()
                setSellerProducts(sellerProductsData)
                setLoading(false)
            } catch (err) {
                setError("Không thể tải dữ liệu từ server")
                setLoading(false)
                console.error("Lỗi khi fetch dữ liệu:", err)
            }
        }
        fetchData()
    }, [])

    const confirmAction = (action, id) => {
        setShowConfirm({ show: true, action, id });
    };

    const executeAction = () => {
        const { action, id } = showConfirm;
        if (action === "toggleUser") {
            const user = users.find(u => u.id === id);
            toggleUserStatus(id, user.action);
        } else if (action === "deleteProduct") {
            deleteProduct(id);
        } else if (action === "cancelOrder") {
            cancelOrder(id);
        } else if (action === "deleteUser") {
            deleteUser(id);
        } else if (action === "deleteCategory") {
            deleteCategory(id);
        }
        setShowConfirm({ show: false, action: null, id: null });
    };



    // Hàm xử lý thêm/sửa danh mục
    const addEditCategory = async (categoryData) => {
        try {
            if (categoryData.id) {
                // Sửa danh mục
                const response = await fetch(`http://localhost:9999/categories/${categoryData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoryData),
                });
                if (response.ok) {
                    setCategories(categories.map(cat => cat.id === categoryData.id ? categoryData : cat));
                } else {
                    setError("Không thể cập nhật danh mục");
                }
            } else {
                // Thêm danh mục mới
                const response = await fetch("http://localhost:9999/categories", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...categoryData, id: String(Date.now()) }),
                });
                if (response.ok) {
                    const newCategory = await response.json();
                    setCategories([...categories, newCategory]);
                } else {
                    setError("Không thể thêm danh mục");
                }
            }
            setShowAddEditCategory({ show: false, data: null });
        } catch (err) {
            setError("Lỗi khi xử lý danh mục");
            console.error(err);
        }
    };

    // Hàm xử lý xóa danh mục
    const deleteCategory = async (categoryId) => {
        try {
            const response = await fetch(`http://localhost:9999/categories/${categoryId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setCategories(categories.filter(cat => cat.id !== categoryId));
            } else {
                setError("Không thể xóa danh mục");
            }
        } catch (err) {
            setError("Lỗi khi xóa danh mục");
            console.error(err);
        }
    };

    // Hàm tính toán dữ liệu hiển thị cho trang hiện tại
    const paginateData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return data.slice(startIndex, endIndex)
    }

    // Hàm tính tổng số trang
    const getTotalPages = (data) => {
        return Math.ceil(data.length / itemsPerPage)
    }

    // Hàm xử lý chuyển trang
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    // Các hàm khác giữ nguyên...
    const handleLogout = () => {
        localStorage.removeItem('currentUser')
        navigate('/auth')
    }

    const toggleUserStatus = async (userId, currentAction) => {
        const newAction = currentAction === "unlock" ? "lock" : "unlock"
        try {
            const response = await fetch(`http://localhost:9999/user/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: newAction }),
            })
            if (response.ok) {
                setUsers(users.map(user => user.id === userId ? { ...user, action: newAction } : user))
            } else {
                setError("Không thể cập nhật trạng thái user")
            }
        } catch (err) {
            setError("Lỗi khi cập nhật trạng thái user")
            console.error(err)
        }
    }

    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:9999/user/${userId}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setUsers(users.filter(user => user.id !== userId))
            } else {
                setError("Không thể xóa tài khoản")
            }
        } catch (err) {
            setError("Lỗi khi xóa tài khoản")
            console.error(err)
        }
    }

    const addEditUser = async (userData) => {
        try {
            if (userData.id) {
                const response = await fetch(`http://localhost:9999/user/${userData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                })
                if (response.ok) {
                    setUsers(users.map(user => user.id === userData.id ? userData : user))
                } else {
                    setError("Không thể cập nhật tài khoản")
                }
            } else {
                const response = await fetch("http://localhost:9999/user", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...userData, id: String(Date.now()) }),
                })
                if (response.ok) {
                    const newUser = await response.json()
                    setUsers([...users, newUser])
                } else {
                    setError("Không thể thêm tài khoản")
                }
            }
            setShowAddEdit({ show: false, type: null, data: null })
        } catch (err) {
            setError("Lỗi khi xử lý tài khoản")
            console.error(err)
        }
    }

    const addEditProduct = async (productData) => {
        try {
            if (productData.id) {
                const response = await fetch(`http://localhost:9999/products/${productData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                })
                if (response.ok) {
                    setProducts(products.map(product => product.id === productData.id ? productData : product))
                } else {
                    setError("Không thể cập nhật sản phẩm")
                }
            } else {
                const response = await fetch("http://localhost:9999/products", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...productData, id: String(Date.now()) }),
                })
                if (response.ok) {
                    const newProduct = await response.json()
                    setProducts([...products, newProduct])
                } else {
                    setError("Không thể thêm sản phẩm")
                }
            }
            setShowAddEdit({ show: false, type: null, data: null })
        } catch (err) {
            setError("Lỗi khi xử lý sản phẩm")
            console.error(err)
        }
    }

    const deleteProduct = async (productId) => {
        try {
            const response = await fetch(`http://localhost:9999/products/${productId}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setProducts(products.filter(product => product.id !== productId))
            } else {
                setError("Không thể xóa sản phẩm")
            }
        } catch (err) {
            setError("Lỗi khi xóa sản phẩm")
            console.error(err)
        }
    }

    const editOrder = async (orderData) => {
        try {
            const response = await fetch(`http://localhost:9999/orders/${orderData.order_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            })
            if (response.ok) {
                setOrders(orders.map(order => order.order_id === orderData.order_id ? orderData : order))
            } else {
                setError("Không thể cập nhật đơn hàng")
            }
            setShowAddEdit({ show: false, type: null, data: null })
        } catch (err) {
            setError("Lỗi khi cập nhật đơn hàng")
            console.error(err)
        }
    }

    const cancelOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:9999/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "cancelled" }),
            })
            if (response.ok) {
                setOrders(orders.map(order => order.order_id === orderId ? { ...order, status: "cancelled" } : order))
            } else {
                setError("Không thể hủy đơn hàng")
            }
        } catch (err) {
            setError("Lỗi khi hủy đơn hàng")
            console.error(err)
        }
    }

   
    const showDetailModal = (type, id) => {
        if (type === "user") {
            const user = users.find(u => u.id === id)
            setShowDetail({ show: true, type, data: user })
        } else if (type === "product") {
            const product = products.find(p => p.id === id)
            setShowDetail({ show: true, type, data: product })
        } else if (type === "order") {
            const order = orders.find(o => o.order_id === id)
            setShowDetail({ show: true, type, data: order })
        }
    }

    const showAddEditModal = (type, data = null) => {
        setShowAddEdit({ show: true, type, data })
    }


    const filterData = (data, searchKey) => {
        if (!searchTerm) return data
        return data.filter((item) => {
            if (searchKey === "users") {
                return (
                    item.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
                )
            } else if (searchKey === "products") {
                return item.title?.toLowerCase().includes(searchTerm.toLowerCase())
            } else if (searchKey === "orders") {
                return item.order_id?.toString().includes(searchTerm)
            } else if (searchKey === "categories") {
                return item.name?.toLowerCase().includes(searchTerm.toLowerCase())
            } else if (searchKey === "sellerProducts") {
                const seller = users.find((user) => user.id === item.userId)
                return seller?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
            }
            return false
        })
    }

    const getOrderStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Hoàn thành</span>
            case "processing":
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Đang xử lý</span>
            case "cancelled":
                return <span className="px-2 py-1 bg-red-100 textかくred-800 rounded-full text-xs font-medium">Đã hủy</span>
            case "pending":
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Chờ xử lý</span>
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>
        }
    }

    const getProductStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Đang bán</span>
            case "inactive":
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Ngừng bán</span>
            case "out_of_stock":
                return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Hết hàng</span>
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>
        }
    }

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        )

    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
                    <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi kết nối</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar giữ nguyên */}
            <div className="md:hidden bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <div
                className={`${isMenuOpen ? "block" : "hidden"} md:block w-full md:w-64 bg-white shadow-md md:h-screen md:sticky md:top-0`}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
                    <ul className="space-y-2">
                        <li
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === "users" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                                }`}
                            onClick={() => { setActiveTab("users"); setCurrentPage(1) }}
                        >
                            <FaUsers className="w-5 h-5 mr-3" />
                            <span>Quản lý người dùng</span>
                        </li>
                        <li
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === "products" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                                }`}
                            onClick={() => { setActiveTab("products"); setCurrentPage(1) }}
                        >
                            <FaBoxOpen className="w-5 h-5 mr-3" />
                            <span>Quản lý sản phẩm</span>
                        </li>
                        <li
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === "orders" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                                }`}
                            onClick={() => { setActiveTab("orders"); setCurrentPage(1) }}
                        >
                            <FaShoppingBag className="w-5 h-5 mr-3" />
                            <span>Quản lý đơn hàng</span>
                        </li>
                        <li
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === "categories" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                                }`}
                            onClick={() => { setActiveTab("categories"); setCurrentPage(1) }}
                        >
                            <FaList className="w-5 h-5 mr-3" />
                            <span>Quản lý danh mục</span>
                        </li>
                        <li
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeTab === "sellerProducts" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                                }`}
                            onClick={() => { setActiveTab("sellerProducts"); setCurrentPage(1) }}
                        >
                            <FaShoppingCart className="w-5 h-5 mr-3" />
                            <span>Sản phẩm người bán</span>
                        </li>
                        {/* Nút Về trang chủ */}
  <li
    className="flex items-center p-3 rounded-lg cursor-pointer text-gray-700 hover:bg-gray-100 transition-colors"
    onClick={() => navigate('/')}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 mr-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
    <span>Về trang chủ</span>
  </li>
                        <li
                            className="flex items-center p-3 rounded-lg cursor-pointer text-red-700 hover:bg-red-100 transition-colors"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt className="w-5 h-5 mr-3" />
                            <span>Đăng xuất</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8">
                {/* Header giữ nguyên */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {activeTab === "users" && "Quản lý người dùng"}
                        {activeTab === "products" && "Quản lý sản phẩm"}
                        {activeTab === "orders" && "Quản lý đơn hàng"}
                        {activeTab === "categories" && "Quản lý danh mục"}
                        {activeTab === "sellerProducts" && "Quản lý sản phẩm người bán"}
                    </h1>
                    <p className="text-gray-600">
                        {activeTab === "users" && "Xem và quản lý tất cả người dùng trong hệ thống"}
                        {activeTab === "products" && "Xem và quản lý tất cả sản phẩm trong hệ thống"}
                        {activeTab === "orders" && "Xem và quản lý tất cả đơn hàng trong hệ thống"}
                        {activeTab === "categories" && "Xem và quản lý tất cả danh mục sản phẩm"}
                        {activeTab === "sellerProducts" && "Xem và quản lý sản phẩm của người bán"}
                    </p>
                </div>

                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FaSearch className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    {activeTab === "users" && (
                        <button
                            onClick={() => showAddEditModal("user")}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <FaPlus className="h-5 w-5 mr-2" />
                            Thêm tài khoản
                        </button>
                    )}
                    {activeTab === "products" && (
                        <button
                            onClick={() => showAddEditModal("product")}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <FaPlus className="h-5 w-5 mr-2" />
                            Thêm sản phẩm mới
                        </button>
                    )}
                    {activeTab === "categories" && (
                        <button
                            onClick={() => setShowAddEditCategory({ show: true, data: null })}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <FaPlus className="h-5 w-5 mr-2" />
                            Thêm danh mục mới
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {activeTab === "users" && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginateData(filterData(users, "users")).map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-500 font-medium">{user.fullname?.charAt(0) || "?"}</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.role === "admin" ? (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Admin</span>
                                                ) : user.role === "seller" ? (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Người bán</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Người dùng</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => confirmAction("toggleUser", user.id)}
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-md mr-2 ${user.action === "unlock"
                                                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                                                        : "bg-green-50 text-green-700 hover:bg-green-100"
                                                        }`}
                                                >
                                                    {user.action === "unlock" ? (
                                                        <>
                                                            <FaBan className="w-4 h-4 mr-1" />
                                                            <span>Khóa</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCheckCircle className="w-4 h-4 mr-1" />
                                                            <span>Mở khóa</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => showDetailModal("user", user.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 mr-2"
                                                >
                                                    <FaEye className="w-4 h-4 mr-1" />
                                                    <span>Chi tiết</span>
                                                </button>
                                                <button
                                                    onClick={() => showAddEditModal("user", user)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 mr-2"
                                                >
                                                    <FaEdit className="w-4 h-4 mr-1" />
                                                    <span>Sửa</span>
                                                </button>
                                                <button
                                                    onClick={() => confirmAction("deleteUser", user.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                                >
                                                    <FaTrashAlt className="w-4 h-4 mr-1" />
                                                    <span>Xóa</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filterData(users, "users").length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "products" && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginateData(filterData(products, "products")).map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {/* <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                        {product.url ? (
                                                            <img src={product.url} alt={product.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                                                <FaBoxOpen className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div> */}
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${product.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {categories.find((cat) => cat.id === String(product.categoryId))?.name || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getProductStatusBadge(product.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => showDetailModal("product", product.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 mr-2"
                                                >
                                                    <FaEye className="w-4 h-4 mr-1" />
                                                    <span>Chi tiết</span>
                                                </button>
                                                <button
                                                    onClick={() => showAddEditModal("product", product)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 mr-2"
                                                >
                                                    <FaEdit className="w-4 h-4 mr-1" />
                                                    <span>Sửa</span>
                                                </button>
                                                <button
                                                    onClick={() => confirmAction("deleteProduct", product.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                                >
                                                    <FaTrashAlt className="w-4 h-4 mr-1" />
                                                    <span>Xóa</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filterData(products, "products").length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đặt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginateData(filterData(orders, "orders")).map((order) => (
                                        <tr key={order.order_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.order_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {users.find((user) => user.id === order.user_id)?.fullname || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.total_amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getOrderStatusBadge(order.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.order_date).toLocaleDateString("vi-VN", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => showDetailModal("order", order.order_id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 mr-2"
                                                >
                                                    <FaEye className="w-4 h-4 mr-1" />
                                                    <span>Chi tiết</span>
                                                </button>
                                                <button
                                                    onClick={() => showAddEditModal("order", order)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 mr-2"
                                                >
                                                    <FaEdit className="w-4 h-4 mr-1" />
                                                    <span>Sửa</span>
                                                </button>
                                                {order.status !== "cancelled" && order.status !== "completed" && (
                                                    <button
                                                        onClick={() => confirmAction("cancelOrder", order.order_id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                                    >
                                                        <FaBan className="w-4 h-4 mr-1" />
                                                        <span>Hủy</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filterData(orders, "orders").length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "categories" && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginateData(filterData(categories, "categories")).map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setShowAddEditCategory({ show: true, data: category })}
                                                    className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 mr-2"
                                                >
                                                    <FaEdit className="w-4 h-4 mr-1" />
                                                    <span>Sửa</span>
                                                </button>
                                                <button
                                                    onClick={() => confirmAction("deleteCategory", category.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                                >
                                                    <FaTrashAlt className="w-4 h-4 mr-1" />
                                                    <span>Xóa</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filterData(categories, "categories").length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không tìm thấy danh mục nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "sellerProducts" && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người bán</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginateData(filterData(sellerProducts, "sellerProducts")).map((seller) => (
                                        <tr key={seller.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-500 font-medium">
                                                            {users.find((user) => user.id === seller.userId)?.fullname?.charAt(0) || "?"}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {users.find((user) => user.id === seller.userId)?.fullname || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    {seller.products.map((prod) => (
                                                        <div key={prod.idProduct} className="flex items-center">
                                                            <span className="text-sm text-gray-900 font-medium">
                                                                {products.find((p) => p.id === prod.idProduct)?.title || prod.idProduct}
                                                            </span>
                                                            <span className="ml-2">
                                                                {prod.status === "active" ? (
                                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Đang bán</span>
                                                                ) : (
                                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Ngừng bán</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
                                                    <FaEye className="w-4 h-4 mr-1" />
                                                    <span>Chi tiết</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filterData(sellerProducts, "sellerProducts").length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Không tìm thấy sản phẩm người bán nào</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Phân trang */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{" "}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, filterData(
                                activeTab === "users" ? users :
                                    activeTab === "products" ? products :
                                        activeTab === "orders" ? orders :
                                            activeTab === "categories" ? categories :
                                                sellerProducts,
                                activeTab
                            ).length)}
                        </span> trong số{" "}
                        <span className="font-medium">
                            {filterData(
                                activeTab === "users" ? users :
                                    activeTab === "products" ? products :
                                        activeTab === "orders" ? orders :
                                            activeTab === "categories" ? categories :
                                                sellerProducts,
                                activeTab
                            ).length}
                        </span>{" "}
                        kết quả
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        {Array.from({
                            length: getTotalPages(filterData(
                                activeTab === "users" ? users :
                                    activeTab === "products" ? products :
                                        activeTab === "orders" ? orders :
                                            activeTab === "categories" ? categories :
                                                sellerProducts,
                                activeTab
                            ))
                        }, (_, i) => i + 1).map((page) => (
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
                            disabled={currentPage === getTotalPages(filterData(
                                activeTab === "users" ? users :
                                    activeTab === "products" ? products :
                                        activeTab === "orders" ? orders :
                                            activeTab === "categories" ? categories :
                                                sellerProducts,
                                activeTab
                            ))}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Tiếp
                        </button>
                    </div>
                </div>

                {/* Các modal giữ nguyên */}
                {showConfirm.show && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                {showConfirm.action === "toggleUser" && "Xác nhận thay đổi trạng thái"}
                                {showConfirm.action === "deleteProduct" && "Xác nhận xóa sản phẩm"}
                                {showConfirm.action === "cancelOrder" && "Xác nhận hủy đơn hàng"}
                                {showConfirm.action === "deleteUser" && "Xác nhận xóa tài khoản"}
                                {showConfirm.action === "deleteCategory" && "Xác nhận xóa danh mục"}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn {showConfirm.action === "toggleUser" ? "thay đổi trạng thái user này" :
                                    showConfirm.action === "deleteProduct" ? "xóa sản phẩm này" :
                                        showConfirm.action === "cancelOrder" ? "hủy đơn hàng này" :
                                            showConfirm.action === "deleteUser" ? "xóa tài khoản này" :
                                                "xóa danh mục này"} không?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowConfirm({ show: false, action: null, id: null })}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={executeAction}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDetail.show && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                {showDetail.type === "user" && "Chi tiết người dùng"}
                                {showDetail.type === "product" && "Chi tiết sản phẩm"}
                                {showDetail.type === "order" && "Chi tiết đơn hàng"}
                            </h3>
                            {showDetail.type === "user" && showDetail.data && (
                                <div className="space-y-3">
                                    <p><span className="font-medium">ID:</span> {showDetail.data.id}</p>
                                    <p><span className="font-medium">Họ tên:</span> {showDetail.data.fullname}</p>
                                    <p><span className="font-medium">Email:</span> {showDetail.data.email}</p>
                                    <p><span className="font-medium">Vai trò:</span> {showDetail.data.role}</p>
                                    <p><span className="font-medium">Trạng thái:</span> {showDetail.data.action === "unlock" ? "Mở khóa" : "Khóa"}</p>
                                </div>
                            )}
                            {showDetail.type === "product" && showDetail.data && (
                                <div className="space-y-3">
                                    <p><span className="font-medium">ID:</span> {showDetail.data.id}</p>
                                    <p><span className="font-medium">Tên:</span> {showDetail.data.title}</p>
                                    <p><span className="font-medium">Mô tả:</span> {showDetail.data.description}</p>
                                    <p><span className="font-medium">Giá:</span> ${showDetail.data.price}</p>
                                    <p><span className="font-medium">Danh mục:</span> {categories.find(c => c.id === String(showDetail.data.categoryId))?.name || "N/A"}</p>
                                    <p><span className="font-medium">Trạng thái:</span> {showDetail.data.status}</p>
                                    <p><span className="font-medium">Số lượng:</span> {showDetail.data.quantity}</p>
                                    <p><span className="font-medium">URL ảnh:</span> {showDetail.data.url}</p>
                                </div>
                            )}
                            {showDetail.type === "order" && showDetail.data && (
                                <div className="space-y-3">
                                    <p><span className="font-medium">Mã đơn:</span> {showDetail.data.order_id}</p>
                                    <p><span className="font-medium">Người đặt:</span> {users.find(u => u.id === showDetail.data.user_id)?.fullname || "N/A"}</p>
                                    <p><span className="font-medium">Tổng tiền:</span> ${showDetail.data.total_amount}</p>
                                    <p><span className="font-medium">Trạng thái:</span> {showDetail.data.status}</p>
                                    <p><span className="font-medium">Ngày đặt:</span> {new Date(showDetail.data.order_date).toLocaleString("vi-VN")}</p>
                                    <p><span className="font-medium">Sản phẩm:</span></p>
                                    <ul className="list-disc pl-5">
                                        {showDetail.data.items.map(item => (
                                            <li key={item.product_name}>{item.product_name} (x{item.quantity}) - ${item.price}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowDetail({ show: false, type: null, data: null })}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showAddEdit.show && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                {showAddEdit.type === "user" && (showAddEdit.data ? "Sửa tài khoản" : "Thêm tài khoản mới")}
                                {showAddEdit.type === "product" && (showAddEdit.data ? "Sửa sản phẩm" : "Thêm sản phẩm mới")}
                                {showAddEdit.type === "order" && "Sửa đơn hàng"}
                            </h3>
                            {showAddEdit.type === "user" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        const formData = new FormData(e.target)
                                        const userData = {
                                            id: showAddEdit.data?.id || "",
                                            email: formData.get("email"),
                                            password: formData.get("password"),
                                            fullname: formData.get("fullname"),
                                            order_id: formData.get("order_id") ? formData.get("order_id").split(",") : [],
                                            address: {
                                                street: formData.get("street"),
                                                zipcode: formData.get("zipcode"),
                                                city: formData.get("city"),
                                                country: formData.get("country"),
                                            },
                                            role: formData.get("role"),
                                            action: formData.get("action"),
                                        }
                                        addEditUser(userData)
                                    }}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                defaultValue={showAddEdit.data?.email || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                            <input
                                                type="password"
                                                name="password"
                                                defaultValue={showAddEdit.data?.password || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                                            <input
                                                type="text"
                                                name="fullname"
                                                defaultValue={showAddEdit.data?.fullname || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Đơn hàng (phân cách bằng dấu phẩy)</label>
                                            <input
                                                type="text"
                                                name="order_id"
                                                defaultValue={showAddEdit.data?.order_id?.join(",") || ""}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Đường</label>
                                            <input
                                                type="text"
                                                name="street"
                                                defaultValue={showAddEdit.data?.address?.street || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mã bưu điện</label>
                                            <input
                                                type="text"
                                                name="zipcode"
                                                defaultValue={showAddEdit.data?.address?.zipcode || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Thành phố</label>
                                            <input
                                                type="text"
                                                name="city"
                                                defaultValue={showAddEdit.data?.address?.city || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quốc gia</label>
                                            <input
                                                type="text"
                                                name="country"
                                                defaultValue={showAddEdit.data?.address?.country || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                                            <select
                                                name="role"
                                                defaultValue={showAddEdit.data?.role || "user"}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            >
                                                <option value="user">Người dùng</option>
                                                <option value="seller">Người bán</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                            <select
                                                name="action"
                                                defaultValue={showAddEdit.data?.action || "unlock"}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            >
                                                <option value="unlock">Mở khóa</option>
                                                <option value="lock">Khóa</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddEdit({ show: false, type: null, data: null })}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            {showAddEdit.data ? "Cập nhật" : "Thêm"}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {showAddEdit.type === "product" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        const formData = new FormData(e.target)
                                        const productData = {
                                            id: showAddEdit.data?.id || "",
                                            title: formData.get("title"),
                                            description: formData.get("description"),
                                            price: Number(formData.get("price")),
                                            categoryId: Number(formData.get("categoryId")),
                                            status: formData.get("status"),
                                            quantity: Number(formData.get("quantity")),
                                            url: formData.get("url"),
                                        }
                                        addEditProduct(productData)
                                    }}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                            <input
                                                type="text"
                                                name="title"
                                                defaultValue={showAddEdit.data?.title || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                            <textarea
                                                name="description"
                                                defaultValue={showAddEdit.data?.description || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Giá</label>
                                            <input
                                                type="number"
                                                name="price"
                                                defaultValue={showAddEdit.data?.price || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                                            <select
                                                name="categoryId"
                                                defaultValue={showAddEdit.data?.categoryId || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            >
                                                <option value="">Chọn danh mục</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                            <select
                                                name="status"
                                                defaultValue={showAddEdit.data?.status || "available"}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            >
                                                <option value="available">Có sẵn</option>
                                                <option value="out_of_stock">Hết hàng</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                defaultValue={showAddEdit.data?.quantity || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">URL ảnh</label>
                                            <input
                                                type="text"
                                                name="url"
                                                defaultValue={showAddEdit.data?.url || ""}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddEdit({ show: false, type: null, data: null })}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            {showAddEdit.data ? "Cập nhật" : "Thêm"}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {showAddEdit.type === "order" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        const formData = new FormData(e.target)
                                        const orderData = {
                                            order_id: showAddEdit.data.order_id,
                                            user_id: showAddEdit.data.user_id,
                                            order_date: showAddEdit.data.order_date,
                                            total_amount: Number(formData.get("total_amount")),
                                            status: formData.get("status"),
                                            items: showAddEdit.data.items,
                                        }
                                        editOrder(orderData)
                                    }}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tổng tiền</label>
                                            <input
                                                type="number"
                                                name="total_amount"
                                                defaultValue={showAddEdit.data?.total_amount || ""}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                            <select
                                                name="status"
                                                defaultValue={showAddEdit.data?.status || ""}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            >
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="processing">Đang xử lý</option>
                                                <option value="shipped">Đã giao</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddEdit({ show: false, type: null, data: null })}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Cập nhật
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {showAddEditCategory.show && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {showAddEditCategory.data ? "Sửa danh mục" : "Thêm danh mục mới"}
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const categoryData = {
                                    id: showAddEditCategory.data?.id || "",
                                    name: formData.get("name"),
                                    description: formData.get("description"),
                                };
                                addEditCategory(categoryData);
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={showAddEditCategory.data?.name || ""}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                    <textarea
                                        name="description"
                                        defaultValue={showAddEditCategory.data?.description || ""}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddEditCategory({ show: false, data: null })}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    {showAddEditCategory.data ? "Cập nhật" : "Thêm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard