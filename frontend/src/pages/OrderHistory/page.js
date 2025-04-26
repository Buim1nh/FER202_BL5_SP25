import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import Footer from "../../components/Footer";
import { FileText, X } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import { formatCurrency } from "../../utils/formatCurrency";
import { useRegion } from "../../context/RegionContext";

// Modal component for cancel confirmation
const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Cancel Order</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700">Are you sure you want to cancel this order?</p>
          <p className="text-sm text-gray-500 mt-2">Order ID: {orderId}</p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  }, []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrders, setCancellingOrders] = useState({});
  const [productMap, setProductMap] = useState({});
  const [shipmentMap, setShipmentMap] = useState({});
  const { currencyMeta, exchangeRate } = useRegion();
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const closeCancelModal = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleCancelOrder = async () => {
    const orderId = selectedOrderId;
    if (!orderId) return;
    
    setCancellingOrders(prev => ({ ...prev, [orderId]: true }));
    
    try {
      // First update UI immediately for better user experience
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: "canceled" } : order
        )
      );
      
      const orderRes = await fetch(`http://localhost:9999/orders/${orderId}`);
      if (!orderRes.ok) throw new Error("Failed to fetch order data");
      const orderData = await orderRes.json();
      
      const orderResponse = await fetch(`http://localhost:9999/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...orderData,
          status: "canceled"
        })
      });
      
      if (!orderResponse.ok) throw new Error("Failed to cancel order");
      
      // Update user record
      const userRes = await fetch(`http://localhost:9999/user/${currentUser.id}`);
      if (!userRes.ok) throw new Error("Failed to fetch user data");
      const userData = await userRes.json();
      
      const updatedOrderIds = userData.order_id.filter(id => id !== orderId);
      
      const userResponse = await fetch(`http://localhost:9999/user/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          order_id: updatedOrderIds
        })
      });
      
      if (!userResponse.ok) throw new Error("Failed to update user data");
      
      // Close modal and show success message
      closeCancelModal();
      
    } catch (error) {
      console.error("Error canceling order:", error);
      alert(`Failed to cancel order: ${error.message}`);
      
      // If there was an error, revert the UI change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: order.status === "canceled" ? "processing" : order.status } : order
        )
      );
    } finally {
      // Clear loading state for this order
      setCancellingOrders(prev => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      closeCancelModal();
    }
  };
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(
          `http://localhost:9999/orders?user_id=${currentUser.id}`
        );
        const data = await res.json();
        data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        setOrders(data);

        const productRes = await fetch("http://localhost:9999/products");
        const productData = await productRes.json();
        const map = {};
        productData.forEach((p) => {
          map[p.title] = p;
        });
        setProductMap(map);

        const shippingRes = await fetch("http://localhost:9999/shipping");
        const shippingData = await shippingRes.json();
        const shippingMap = {};
        shippingData.forEach((s) => {
          shippingMap[s.orderId] = s;
        });
        setShipmentMap(shippingMap);
      } catch (error) {
        console.error("Failed to fetch orders, products, or shipping:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        Please{" "}
        <span
          onClick={() => navigate("/auth")}
          className="text-blue-500 underline cursor-pointer"
        >
          login
        </span>{" "}
        to view order history.
      </div>
    );
  }

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <TopMenu />
      <MainHeader />
      <SubMenu />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={modalOpen}
        onClose={closeCancelModal}
        onConfirm={handleCancelOrder}
        orderId={selectedOrderId}
        isLoading={selectedOrderId ? cancellingOrders[selectedOrderId] : false}
      />

      <div className="my-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText size={24} /> Order History
        </h2>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-600">
            You have no past orders.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const shipment = shipmentMap[order.order_id];
              return (
                <div
                  key={order.order_id}
                  className="border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">
                      Order ID:{" "}
                      <span className="font-semibold">{order.order_id}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {moment(order.order_date).format("MMMM Do YYYY, h:mm A")}
                    </div>
                  </div>

                  {/* Địa chỉ giao hàng */}
                  {shipment ? (
                    <div className="text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-semibold">Receiver:</span>{" "}
                        {shipment.address.fullName}
                      </div>
                      <div>
                        <span className="font-semibold">Shipping to:</span>{" "}
                        {shipment.address.street}, {shipment.address.city},{" "}
                        {shipment.address.state}, {shipment.address.country}{" "}
                      </div>
                      <div>Phone: {shipment.address.phone}</div>
                      <div className="mt-1">
                        Shipment Code:{" "}
                        <span className="font-semibold">
                          {shipment.shipmentCode}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500 mb-4">
                      ⚠️ No shipment data found for this order.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {order.items.map((item, index) => {
                      const product = productMap[item.product_name];
                      return (
                        <div
                          key={index}
                          className="border p-3 rounded-md bg-gray-50 cursor-pointer hover:shadow"
                          onClick={() =>
                            product && navigate(`/product/${product.id}`)
                          }
                        >
                          {product?.url ? (
                            <img
                              src={`${product.url}/280`}
                              alt={item.product_name}
                              className="w-full h-36 object-cover rounded mb-2 opacity-90 hover:opacity-100 transition"
                            />
                          ) : (
                            <div className="w-full h-36 bg-gray-200 rounded mb-2"></div>
                          )}
                          <div className="font-semibold mb-1">
                            {item.product_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            Price:{" "}
                            {formatCurrency(
                              item.price * exchangeRate,
                              currencyMeta.code,
                              currencyMeta.symbol
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-4 border-t pt-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      Status:{" "}
                      <span className={`font-medium ${
                        order.status === "canceled" ? "text-red-500" : 
                        order.status === "delivered" ? "text-green-600" :
                        "text-blue-600"
                      }`}>
                        {order.status === "canceled" ? "Canceled" : 
                         order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.status !== "paid" && 
                       order.status !== "delivered" && 
                       order.status !== "canceled" && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openCancelModal(order.id);
                          }}
                          className="ml-2 px-3 py-1 text-white text-xs rounded transition bg-red-500 hover:bg-red-600"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                    <div>
                      Total:{" "}
                      <span className="font-semibold">
                        {formatCurrency(
                          (order.total_amount +
                            (shipment?.shippingFee ?? 0) / 100) *
                            exchangeRate,
                          currencyMeta.code,
                          currencyMeta.symbol
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}