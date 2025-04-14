"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullname: '',
        street: '',
        zipcode: '',
        city: '',
        country: ''
    })
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (isLogin) {
            try {
                const response = await fetch('http://localhost:9999/user')
                const users = await response.json()
                const user = users.find(u => u.email === formData.email && u.password === formData.password)
                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user))
                    // Kiểm tra role của user
                    if (user.role === 'admin') {
                        navigate('/adminDashboard') // Điều hướng đến trang admin nếu role là admin
                    } else {
                        navigate('/') // Điều hướng về trang chính nếu không phải admin
                    }
                } else {
                    setError("Email hoặc mật khẩu không đúng")
                }
            } catch (err) {
                setError("Không thể kết nối tới server")
                console.error("Lỗi đăng nhập:", err)
            }
        } else {
            try {
                // Kiểm tra xem email đã tồn tại chưa
                const usersResponse = await fetch('http://localhost:9999/user')
                const users = await usersResponse.json()
                const existingUser = users.find(u => u.email === formData.email)
                if (existingUser) {
                    setError("Email đã tồn tại")
                    return
                }

                // Tạo đối tượng user mới theo định dạng yêu cầu
                const newUser = {
                    id: `user${Date.now()}`, // Tạo ID tạm thời dựa trên timestamp
                    email: formData.email,
                    password: formData.password,
                    fullname: formData.fullname,
                    order_id: [], // Khởi tạo mảng rỗng cho order_id
                    address: {
                        street: formData.street,
                        zipcode: formData.zipcode,
                        city: formData.city,
                        country: formData.country
                    },
                    role: 'seller', // Role mặc định là 'seller'
                    action: 'unlock' // Thêm thuộc tính action với giá trị 'unlock'
                }

                // Gửi POST request để đăng ký user
                const userResponse = await fetch('http://localhost:9999/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newUser)
                })

                if (!userResponse.ok) {
                    setError("Đăng ký thất bại")
                    return
                }

                const createdUser = await userResponse.json()

                // Tạo sellerProduct cho user mới
                const newSellerProduct = {
                    id: `sp${Date.now()}`, // Tạo ID tạm thời dựa trên timestamp
                    userId: createdUser.id,
                    products: [] // Khởi tạo mảng products rỗng
                }

                // Gửi POST request để tạo sellerProduct
                const sellerResponse = await fetch('http://localhost:9999/sellerProduct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newSellerProduct)
                })

                if (!sellerResponse.ok) {
                    setError("Tạo dữ liệu người bán thất bại")
                    return
                }

                // Lưu thông tin user vào localStorage và chuyển hướng
                localStorage.setItem('currentUser', JSON.stringify(createdUser))
                navigate('/')

            } catch (err) {
                setError("Không thể kết nối tới server")
                console.error("Lỗi đăng ký:", err)
            }
        }
    }

    // Hàm tự động điền tài khoản seller
    const fillSellerCredentials = () => {
        setFormData({
            ...formData,
            email: 'user1@gmail.com',
            password: '123123',
        });
        setIsLogin(true); // Chuyển sang tab đăng nhập
    };

    // Hàm tự động điền tài khoản admin
    const fillAdminCredentials = () => {
        setFormData({
            ...formData,
            email: 'user4@gmail.com',
            password: '123123',
        });
        setIsLogin(true); // Chuyển sang tab đăng nhập
    };

    return (
        <div id="AuthPage" className="w-full min-h-screen bg-white">
            <div className="w-full flex items-center justify-center p-5 border-b-gray-300">
                <a href="/" className="min-w-[170px]">
                    <img width="170" src="/images/logo.svg" alt="Logo" />
                </a>
            </div>

            <div className="w-full flex items-center justify-center p-5 border-b-gray-300">
                <div className="flex gap-4">
                    <button
                        className={`font-semibold ${isLogin ? "text-blue-600" : "text-gray-600"}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Đăng nhập
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        className={`font-semibold ${!isLogin ? "text-blue-600" : "text-gray-600"}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Đăng ký
                    </button>
                </div>
            </div>

            <div className="max-w-[400px] mx-auto px-2">
                {error && (
                    <div className="text-red-500 text-center my-2">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Họ và tên"
                                className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                value={formData.fullname}
                                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            placeholder="Địa chỉ Email"
                            className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Đường"
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Mã bưu điện"
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    value={formData.zipcode}
                                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Thành phố"
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Quốc gia"
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                    >
                        {isLogin ? "Đăng nhập" : "Đăng ký"}
                    </button>

                    {isLogin && (
                        <a href="/forgot-password" className="text-center text-blue-600 hover:underline text-sm">
                            Quên mật khẩu?
                        </a>
                    )}

                    {/* Hai nút mới để điền thông tin tài khoản */}
                    {isLogin && (
                        <div className="flex gap-4 justify-center mt-4">
                            <button
                                type="button"
                                onClick={fillSellerCredentials}
                                className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Tự Điền Seller
                            </button>
                            <button
                                type="button"
                                onClick={fillAdminCredentials}
                                className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                            >
                                Tự Điền Admin
                            </button>
                        </div>
                    )}

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 p-3 border rounded-md hover:bg-gray-50"
                        onClick={() => alert("Đăng nhập bằng Google")}
                    >
                        <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                        Tiếp tục với Google
                    </button>
                </form>
            </div>
        </div>
    )
}