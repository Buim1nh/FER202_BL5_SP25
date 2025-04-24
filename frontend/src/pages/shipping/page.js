import { useEffect, useState } from "react";
import axios from "axios";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import Footer from "../../components/Footer";

export default function ShippingPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      fetchShipments(parsedUser.id);
    }
  }, []);

  const fetchShipments = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:9999/shipping?userId=${userId}`
      );
      setShipments(res.data);
    } catch (err) {
      console.error("Failed to fetch shipments", err);
    }
  };

  const updateStatus = async (shipment, type = "next") => {
    let nextStatus = shipment.status;

    if (type === "next") {
      if (shipment.status === "processing") nextStatus = "delivery";
      else if (shipment.status === "delivery") nextStatus = "shipped";
      else return;
    } else if (type === "cancel") {
      nextStatus = "canceled";
    }

    try {
      // Update shipping status
      await axios.patch(`http://localhost:9999/shipping/${shipment.id}`, {
        status: nextStatus,
      });

      // Update order status
      const res = await axios.get(
        `http://localhost:9999/orders?order_id=${shipment.orderId}`
      );
      const order = res.data?.[0];
      if (order) {
        await axios.patch(`http://localhost:9999/orders/${order.id}`, {
          status: nextStatus,
        });
      }

      await fetchShipments(currentUser.id);
    } catch (error) {
      console.error("Failed to update shipment and order status:", error);
    }
  };

  const formatStatus = (status) => {
    const map = {
      processing: "Processing",
      delivery: "In Delivery",
      shipped: "Shipped",
      canceled: "Canceled",
    };
    return map[status] || status;
  };

  return (
    <>
      <MainHeader />
      <TopMenu />
      <SubMenu />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Shipping History</h2>
        {shipments.length === 0 ? (
          <p className="text-gray-500">No shipping records available.</p>
        ) : (
          <table className="w-full table-auto mt-4 border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Shipment Code</th>
                <th className="p-2">Created At</th>
                <th className="p-2">Fee</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.shipmentCode}</td>
                  <td className="p-2">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2">
                    {(s.shippingFee / 100).toLocaleString()} GBP
                  </td>
                  <td className="p-2">{formatStatus(s.status)}</td>
                  <td className="p-2 flex gap-2">
                    {s.status !== "shipped" && s.status !== "canceled" && (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => updateStatus(s, "next")}
                        >
                          Update
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => updateStatus(s, "cancel")}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Footer />
    </>
  );
}
