import React, { useState, useEffect } from 'react';
import MainHeader from '../../components/MainHeader';
import { useNavigate } from 'react-router-dom';
import TopMenu from '../../components/TopMenu';
import SubMenu from '../../components/SubMenu';

const TotalSell = () => {
    const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({}); // State để mở rộng/thu gọn chi tiết

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (userData) setLoggedInUser(JSON.parse(userData));

        const [productsResponse, sellerResponse, ordersResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:9999/products'),
          fetch('http://localhost:9999/sellerProduct'),
          fetch('http://localhost:9999/orders'),
          fetch('http://localhost:9999/user'),
        ]);

        setProducts(await productsResponse.json());
        setSellerProducts(await sellerResponse.json());
        setOrders(await ordersResponse.json());
        setUsers(await usersResponse.json());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSellerProductIds = () => {
    if (!loggedInUser) return [];
    const userSeller = sellerProducts.find((seller) => seller.userId === loggedInUser.id);
    return userSeller?.products
      .filter((sp) => sp.status === 'Active' || sp.status === 'available')
      .map((sp) => sp.idProduct) || [];
  };

  const calculateRevenueAndCustomers = () => {
    if (!products.length || !sellerProducts.length || !orders.length || !users.length || !loggedInUser) {
      return { totalRevenue: 0, customers: [] };
    }

    const sellerProductIds = getSellerProductIds();
    if (!sellerProductIds.length) return { totalRevenue: 0, customers: [] };

    let totalRevenue = 0;
    const customers = new Set();

    users.forEach((user) => {
      user.order_id.forEach((orderId) => {
        const order = orders.find((o) => o.order_id === orderId);
        if (order) {
          order.items.forEach((item) => {
            const product = products.find((p) => p.title === item.product_name);
            if (product && sellerProductIds.includes(product.id)) {
              totalRevenue += item.price * item.quantity;
              customers.add(user.fullname);
            }
          });
        }
      });
    });

    return { totalRevenue, customers: Array.from(customers) };
  };

  const getRevenueItems = () => {
    if (!products.length || !sellerProducts.length || !orders.length || !users.length || !loggedInUser) return [];

    const sellerProductIds = getSellerProductIds();
    if (!sellerProductIds.length) return [];

    const rawItems = [];
    users.forEach((user) => {
      user.order_id.forEach((orderId) => {
        const order = orders.find((o) => o.order_id === orderId);
        if (order) {
          order.items.forEach((item) => {
            const product = products.find((p) => p.title === item.product_name);
            if (product && sellerProductIds.includes(product.id)) {
              rawItems.push({
                name: item.product_name,
                amount: item.price * item.quantity,
                quantity: item.quantity,
                customer: user.fullname,
                orderId: order.order_id,
                orderDate: order.order_date,
              });
            }
          });
        }
      });
    });

    rawItems.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate) || a.orderId.localeCompare(b.orderId));

    const productMap = new Map();
    rawItems.forEach((item) => {
      if (!productMap.has(item.name)) {
        productMap.set(item.name, {
          name: item.name,
          totalAmount: item.amount,
          totalQuantity: item.quantity,
          purchases: [{ ...item }],
        });
      } else {
        const existing = productMap.get(item.name);
        existing.totalAmount += item.amount;
        existing.totalQuantity += item.quantity;
        existing.purchases.push({ ...item });
      }
    });

    return Array.from(productMap.values());
  };

  const toggleItemExpansion = (itemName) => {
    setExpandedItems((prev) => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  if (loading) return <div className="text-center p-4">Loading data...</div>;

  if (!loggedInUser) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <TopMenu />
        <MainHeader />
        <SubMenu />
        <div className="mt-4 text-center p-6 bg-white border rounded-lg shadow-md">
          <p className="text-gray-600">Please log in to view your sales revenue.</p>
        </div>
      </div>
    );
  }

  const { totalRevenue, customers } = calculateRevenueAndCustomers();
  const revenueItems = getRevenueItems();

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <TopMenu />
      <MainHeader />
      <SubMenu />
      <div className="mt-4">
        <div className="bg-white border rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Sales Overview (Seller: {loggedInUser.fullname})
            </h3>
            <button
              onClick={() => navigate('/sellerProduct')} // Add navigation button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Quản lý sản phẩm
            </button>
          </div>

          {/* Tổng doanh thu và khách hàng */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Unique Customers</p>
              <p className="text-lg text-gray-700">
                {customers.length} ({customers.join(', ') || 'None'})
              </p>
            </div>
          </div>

          {/* Danh sách sản phẩm đã bán */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">Sold Items</h4>
            {revenueItems.length === 0 ? (
              <p className="text-gray-500">No items sold yet.</p>
            ) : (
              <div className="space-y-4">
                {revenueItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleItemExpansion(item.name)}
                    >
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600 font-semibold">${item.totalAmount.toFixed(2)}</span>
                        <span className="text-gray-500">Qty: {item.totalQuantity}</span>
                        <span className="text-blue-500">
                          {expandedItems[item.name] ? 'Hide Details' : 'Show Details'}
                        </span>
                      </div>
                    </div>
                    {expandedItems[item.name] && (
                      <div className="mt-3">
                        <table className="w-full text-sm text-gray-600">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Customer</th>
                              <th className="text-left py-2">Order ID</th>
                              <th className="text-left py-2">Date</th>
                              <th className="text-right py-2">Quantity</th>
                              <th className="text-right py-2">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.purchases.map((purchase, idx) => (
                              <tr key={idx} className="border-b last:border-b-0">
                                <td className="py-2">{purchase.customer}</td>
                                <td className="py-2">{purchase.orderId}</td>
                                <td className="py-2">
                                  {new Date(purchase.orderDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </td>
                                <td className="text-right py-2">{purchase.quantity}</td>
                                <td className="text-right py-2">${purchase.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <a href="#" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
            View Full Sales Report
          </a>
        </div>
      </div>
    </div>
  );
};

export default TotalSell;