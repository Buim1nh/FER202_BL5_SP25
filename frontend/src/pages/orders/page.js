import { useState, useEffect, useMemo } from "react";
import { Truck } from "lucide-react";

import Footer from "../../components/Footer";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import { formatCurrency } from "../../utils/formatCurrency";
import { useRegion } from "../../context/RegionContext";
import RatingForm from "../../components/RatingForm";

export default function Orders() {
  const { currencyMeta, exchangeRate } = useRegion();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [showRating, setShowRating] = useState(null);

  const currentUser = useMemo(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  }, []);

  // Load dữ liệu
  useEffect(() => {
    fetch("http://localhost:9999/orders?status=shipped")
      .then((res) => res.json())
      .then(setOrders);

    fetch("http://localhost:9999/products")
      .then((res) => res.json())
      .then(setProducts);

    refreshUserRatings();
  }, [currentUser?.id]);

  const refreshUserRatings = () => {
    if (currentUser?.id) {
      fetch(`http://localhost:9999/ratings?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then(setUserRatings);
    }
  };

  const hasRated = (productId) => {
    return userRatings.some((r) => r.productId === productId);
  };

  const findProductByName = (name) => {
    return products.find((p) => p.title === name);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <TopMenu />
      <MainHeader />
      <SubMenu />

      <div id="OrdersPage" className="mt-6 px-4">
        <div className="bg-white w-full p-6 rounded-lg shadow-md">
          <div className="flex items-center text-2xl font-semibold text-gray-800 mb-6">
            <Truck className="text-green-500 mr-3" size={32} />
            Your Shipped Orders
          </div>

          {orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              You have no shipped orders.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="border-t border-gray-200 pt-6 mt-6 space-y-4 text-sm text-gray-700"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <span className="font-semibold">Order ID:</span>{" "}
                    {order.order_id}
                  </div>
                  <div>
                    <span className="font-semibold">Order Date:</span>{" "}
                    {formatDate(order.order_date)}
                  </div>
                  <div>
                    <span className="font-semibold">Total:</span>{" "}
                    {formatCurrency(
                      order.total_amount * exchangeRate,
                      currencyMeta.code,
                      currencyMeta.symbol
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {order.items.map((item, index) => {
                    const product = findProductByName(item.product_name);
                    const productId = product?.id;
                    const image =
                      product?.url || "https://via.placeholder.com/150";

                    return (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-start"
                      >
                        <a
                          href={productId ? `/product/${productId}` : "#"}
                          className="hover:underline text-blue-600 font-medium text-sm mb-2"
                        >
                          <img
                            className="w-full max-w-[150px] rounded mb-2"
                            src={`${image}/150`}
                            alt={item.product_name}
                          />
                          {item.product_name}
                        </a>

                        {!hasRated(productId) ? (
                          <div className="w-full">
                            <button
                              onClick={() =>
                                setShowRating((prev) =>
                                  prev === `${order.id}-${index}`
                                    ? null
                                    : `${order.id}-${index}`
                                )
                              }
                              className="text-sm bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-center"
                            >
                              {showRating === `${order.id}-${index}`
                                ? "Cancel"
                                : "Rate"}
                            </button>

                            {showRating === `${order.id}-${index}` && (
                              <div className="mt-3 w-full">
                                <RatingForm
                                  productId={productId}
                                  orderId={order.id}
                                  onSubmitted={() => {
                                    refreshUserRatings();
                                    setShowRating(null);
                                  }}
                                  onCancel={() => setShowRating(null)}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-gray-500 italic">
                            You have already rated this product.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
