import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import Footer from "../../components/Footer";
import { FileText } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import { formatCurrency } from "../../utils/formatCurrency";
import { useRegion } from "../../context/RegionContext";

export default function OrderHistory() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  }, []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productMap, setProductMap] = useState({});
  const [shipmentMap, setShipmentMap] = useState({});
  const [orderConfirmations, setOrderConfirmations] = useState([]);
  const { currencyMeta, exchangeRate } = useRegion();

  const [confirmPopupOrderId, setConfirmPopupOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(`http://localhost:9999/orders?user_id=${currentUser.id}`);
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

        const confirmationRes = await fetch("http://localhost:9999/orderConfirmations");
        const confirmationData = await confirmationRes.json();

        // Auto insert missing confirmations
        for (const order of data) {
          const alreadyConfirmed = confirmationData.find(c => c.order_id === order.order_id);
          if (!alreadyConfirmed) {
            await fetch(`http://localhost:9999/orderConfirmations`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: order.order_id,
                confirmed: false,
              }),
            });
          }
        }

        // Reload lại confirmations sau khi thêm
        const updatedConfirmations = await fetch("http://localhost:9999/orderConfirmations");
        const updatedConfirmationData = await updatedConfirmations.json();
        setOrderConfirmations(updatedConfirmationData);

      } catch (error) {
        console.error("Failed to fetch orders, products, shipping, or confirmations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const handleConfirm = async (order_id) => {
    try {
      const confirmation = orderConfirmations.find(c => c.order_id === order_id);
      if (!confirmation) {
        console.error("Confirmation record not found for order_id:", order_id);
        return;
      }

      const res = await fetch(`http://localhost:9999/orderConfirmations/${confirmation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmed: true }),
      });

      if (!res.ok) {
        console.error("Failed to update confirmation status.");
        return;
      }

      setOrderConfirmations((prev) =>
        prev.map((c) =>
          c.id === confirmation.id ? { ...c, confirmed: true } : c
        )
      );
      setConfirmPopupOrderId(null);
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

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

                  {shipment ? (
                    <div className="text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-semibold">Receiver:</span>{" "}
                        {shipment.address.fullName}
                      </div>
                      <div>
                        <span className="font-semibold">Shipping to:</span>{" "}
                        {shipment.address.street}, {shipment.address.city},{" "}
                        {shipment.address.state}, {shipment.address.country}
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

                  <div className="mt-4 border-t pt-4 text-sm text-gray-700">
                    <div className="mb-3">
                      Status:{" "}
                      <span className="font-medium text-blue-600">
                        {order.status === "canceled" ? (
                          <span className="text-red-500">Canceled</span>
                        ) : (
                          <span>{order.status}</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-end font-semibold mb-2">
                      Total:{" "}
                      <span className="ml-1">
                        {formatCurrency(
                          (order.total_amount +
                            (shipment?.shippingFee ?? 0) / 100) *
                            exchangeRate,
                          currencyMeta.code,
                          currencyMeta.symbol
                        )}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      {(() => {
                        const confirmation = orderConfirmations.find(
                          (c) => c.order_id === order.order_id
                        );
                        if (!confirmation || confirmation.confirmed) {
                          return null;
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => setConfirmPopupOrderId(order.order_id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full shadow hover:shadow-lg transition-all duration-300"
                          >
                            Xác nhận đã nhận hàng
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmPopupOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Xác nhận đơn hàng</h2>
            <p className="mb-6">Bạn có chắc chắn đã nhận được đơn hàng này không?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmPopupOrderId(null)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleConfirm(confirmPopupOrderId)}
                className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
