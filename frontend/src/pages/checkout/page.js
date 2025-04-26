import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Footer from "../../components/Footer";
import SubMenu from "../../components/SubMenu";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import shippingRules from "../../data/shipping_rules.json";
import { useRegion } from "../../context/RegionContext";
import { formatCurrency } from "../../utils/formatCurrency";

import axios from "axios";

// Calculate shipping fee from rules
function calculateShippingFee(address) {
  const { country, city, district, zipcode } = address || {};

  // Log for debugging
  console.log("Calculating shipping fee for address:", {
    country,
    city,
    district,
    zipcode,
  });

  const rule = shippingRules.find((r) => r.country === country);
  if (!rule) {
    console.log("No shipping rule found for country:", country);
    return 500;
  }

  if (rule.regions) {
    const region = rule.regions.find((r) => r.city === city);
    if (region) {
      if (region.flatFee) {
        console.log(`Found flat fee ${region.flatFee} for city:`, city);
        return region.flatFee;
      }
      if (region.urbanDistricts?.includes(district)) {
        const fee = region.urbanFee ?? rule.defaultFee;
        console.log(`Found urban fee ${fee} for district:`, district);
        return fee;
      }
      const fee = region.suburbanFee ?? rule.defaultFee;
      console.log(`Found suburban fee ${fee} for region:`, region);
      return fee;
    }
  }

  if (rule.zipFees?.[zipcode]) {
    console.log(`Found zip fee ${rule.zipFees[zipcode]} for zipcode:`, zipcode);
    return rule.zipFees[zipcode];
  }

  console.log(`Using default fee ${rule.defaultFee} for country:`, country);
  return rule.defaultFee;
}

function CheckoutItem({ product, formatCurrency }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <img
        src={`${product.url}/100`}
        alt={product.title}
        className="w-[100px] h-[100px] object-cover rounded-lg"
      />
      <div>
        <div className="font-semibold">{product.title}</div>
        <div className="text-sm text-gray-500">{product.description}</div>
        <div className="font-bold mt-2">
          {formatCurrency(product.price * product.quantity)}
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addressDetails, setAddressDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  }, []);
  const [selectedMethod, setSelectedMethod] = useState("cod"); // Default là COD
  const [showPaypalPopup, setShowPaypalPopup] = useState(false);

  const [shippingFee, setShippingFee] = useState(0); // phí giao hàng
  const [shipmentCode, setShipmentCode] = useState(null); // mã vận đơn
  const [selectedAddress, setSelectedAddress] = useState(null); // địa chỉ đã chọn
  const effectiveAddress = selectedAddress || addressDetails;
  const { currencyMeta, exchangeRate } = useRegion();
  const convertPrice = (amountInUSD) => amountInUSD * exchangeRate;
  const displayPrice = (valueInUSD) => {
    const valueInMajorUnits = valueInUSD / 100;
    const converted = convertPrice(valueInMajorUnits);
    return formatCurrency(converted, currencyMeta.code, currencyMeta.symbol);
  };

  // Hàm lấy dữ liệu từ API
  const fetchCartItems = async () => {
    if (!currentUser) {
      console.log("No current user, setting empty cart");
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching cart for user:", currentUser.id);
      const cartResponse = await fetch(
        `http://localhost:9999/shoppingCart?userId=${currentUser.id}`
      );
      if (!cartResponse.ok) {
        throw new Error(`Failed to fetch cart: ${cartResponse.status}`);
      }
      const cartData = await cartResponse.json();
      console.log("Cart data:", cartData);

      if (!cartData || cartData.length === 0) {
        console.log("No cart data found");
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      // Lấy chi tiết sản phẩm cho từng mục trong giỏ hàng
      const itemsWithDetails = await Promise.all(
        cartData.flatMap((cartItem) =>
          cartItem.productId.map(async (product) => {
            console.log(`Fetching product with id: ${product.idProduct}`);
            const productResponse = await fetch(
              `http://localhost:9999/products?id=${product.idProduct}`
            );
            if (!productResponse.ok) {
              console.warn(
                `Failed to fetch product with id ${product.idProduct}: ${productResponse.status}`
              );
              return null;
            }
            const productData = await productResponse.json();
            console.log(
              `Product data for id ${product.idProduct}:`,
              productData
            );

            // Xử lý cả trường hợp API trả về mảng hoặc object
            let productInfo = Array.isArray(productData)
              ? productData[0]
              : productData;
            if (productInfo) {
              return {
                ...productInfo,
                quantity: parseInt(product.quantity),
                idProduct: product.idProduct,
                cartItemId: cartItem.id,
              };
            }
            console.warn(`No product data found for id ${product.idProduct}`);
            return null;
          })
        )
      );

      const filteredItems = itemsWithDetails.filter((item) => item !== null);
      console.log("Filtered cart items:", filteredItems);
      if (filteredItems.length === 0) {
        console.warn(
          "No valid products found in cart. Check if products exist in the database or if the API response format is correct."
        );
      }
      setCartItems(filteredItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy thông tin địa chỉ từ API
  const fetchAddressDetails = async () => {
    if (!currentUser) return;

    try {
      console.log("Fetching address for user:", currentUser.id);
      const userResponse = await fetch(
        `http://localhost:9999/user?id=${currentUser.id}`
      );
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user: ${userResponse.status}`);
      }
      const userData = await userResponse.json();
      console.log("User data:", userData);
      const user = userData.find((user) => user.id === currentUser.id);
      if (user) {
        const fullAddress = {
          fullName: user.fullname,
          phone: user.phone,
          street: user.address.street,
          district: user.address.district,
          ward: user.address.ward,
          city: user.address.city,
          state: user.address.state,
          country: user.address.country,
          zipcode: user.address.zipcode,
        };
        setAddressDetails(fullAddress);

        // Calculate shipping fee for the address
        const calculatedFee = calculateShippingFee(fullAddress);
        console.log(
          "Calculated shipping fee from address details:",
          calculatedFee
        );
        setShippingFee(calculatedFee);
      } else {
        console.warn("User not found");
        setAddressDetails({
          name: "N/A",
          address: "N/A",
          zipcode: "N/A",
          city: "N/A",
          country: "N/A",
        });
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressDetails({
        name: "N/A",
        address: "N/A",
        zipcode: "N/A",
        city: "N/A",
        country: "N/A",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCartItems(), fetchAddressDetails()]);

      const stored = localStorage.getItem("selectedAddress");
      if (stored) {
        try {
          const addr = JSON.parse(stored);
          setSelectedAddress(addr);
          const calculatedFee = calculateShippingFee(addr);
          console.log(
            "Calculated shipping fee from selected address:",
            calculatedFee
          );
          setShippingFee(calculatedFee);
        } catch (e) {
          console.error("Lỗi khi parse địa chỉ đã chọn:", e);
        } finally {
          localStorage.removeItem("selectedAddress");
        }
      }
    };
    fetchData();
  }, [currentUser]);

  // Compute the current shipping fee whenever effectiveAddress changes
  useEffect(() => {
    if (effectiveAddress) {
      const calculatedFee = calculateShippingFee(effectiveAddress);
      console.log("Calculated shipping fee on address change:", calculatedFee);
      setShippingFee(calculatedFee);
    }
  }, [effectiveAddress]);

  // Tính tổng tiền
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handlePayment = async (isSimulated = false) => {
    if (!currentUser) {
      alert("Please login to checkout");
      navigate("/auth");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!effectiveAddress) {
      alert("Please select a shipping address");
      return;
    }

    if (selectedMethod === "paypal" && !isSimulated) {
      setShowPaypalPopup(true); // chỉ mở popup nếu chưa xác nhận
      return;
    }

    // Make sure shipping fee is calculated correctly
    const currentShippingFee = calculateShippingFee(effectiveAddress);
    console.log("Current shipping fee before payment:", currentShippingFee);

    const orderId = "ORD" + Math.floor(100 + Math.random() * 900);
    const orderData = {
      order_id: orderId,
      user_id: currentUser.id,
      order_date: new Date().toISOString(),
      total_amount: parseFloat((getCartTotal() / 100).toFixed(2)),
      status: selectedMethod === "cod" ? "processing" : "paid",
      payment_method: selectedMethod,
      shipping_fee: currentShippingFee, // Add shipping fee to order

      items: cartItems.map((item) => ({
        product_name: item.title,
        quantity: item.quantity,
        price: parseFloat((item.price / 100).toFixed(2)),
      })),
    };

    try {
      await fetch("http://localhost:9999/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const updatedOrderIds = [...(currentUser.order_id || []), orderId];
      await fetch(`http://localhost:9999/user/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: updatedOrderIds }),
      });

      const cartRes = await fetch(
        `http://localhost:9999/shoppingCart?userId=${currentUser.id}`
      );
      const cartData = await cartRes.json();
      for (let cart of cartData) {
        await fetch(`http://localhost:9999/shoppingCart/${cart.id}`, {
          method: "DELETE",
        });
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...currentUser, order_id: updatedOrderIds })
      );

      const newShipmentCode =
        "SHIP" + Math.floor(100000 + Math.random() * 900000);
      setShipmentCode(newShipmentCode);

      // Create shipping record with the correct shipping fee
      await axios.post("http://localhost:9999/shipping", {
        shipmentCode: newShipmentCode,
        userId: currentUser.id,
        orderId,
        address: {
          fullName: effectiveAddress.fullName || effectiveAddress.name,
          phone: effectiveAddress.phone,
          street: effectiveAddress.street,
          ward: effectiveAddress.ward,
          district: effectiveAddress.district,
          city: effectiveAddress.city,
          state: effectiveAddress.state,
          country: effectiveAddress.country,
          zipcode: effectiveAddress.zipcode,
        },
        shippingFee: currentShippingFee, // Use the calculated fee here
        status: "processing",
        createdAt: new Date().toISOString(),
      });

      navigate("/success", {
        state: {
          cartItems: cartItems,
          addressDetails: effectiveAddress,
          orderTotal: getCartTotal(),
          shippingFee: currentShippingFee, // Pass the correct fee
          shipmentCode: newShipmentCode,
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Đã xảy ra lỗi khi thanh toán.");
    }
  };

  if (!currentUser) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="text-center py-20">
          Please{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-blue-500 hover:underline"
          >
            login
          </button>{" "}
          to proceed to checkout
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div id="CheckoutPage" className="mt-4 max-w-[1100px] mx-auto">
          <div className="text-2xl font-bold mt-4 mb-4">Checkout</div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="relative flex items-baseline gap-4 justify-between mx-auto w-full">
              <div className="w-[65%]">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-xl font-semibold mb-2">
                    Shipping Address
                  </div>
                  <div>
                    <a
                      href="/address?selectMode=true"
                      className="text-blue-500 text-sm underline"
                    >
                      Choose another address
                    </a>

                    {effectiveAddress ? (
                      <ul className="text-sm mt-2">
                        <li>
                          <strong>Name:</strong>{" "}
                          {effectiveAddress.fullName || effectiveAddress.name}
                        </li>
                        <li>
                          <strong>Phone:</strong> {effectiveAddress.phone}
                        </li>
                        <li>
                          <strong>Address:</strong>{" "}
                          {[
                            effectiveAddress.street,
                            effectiveAddress.city,
                            effectiveAddress.state,
                            effectiveAddress.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </li>
                        <li>
                          <strong>Zip:</strong> {effectiveAddress.zipcode}
                        </li>
                      </ul>
                    ) : (
                      <div className="text-sm mt-2 text-red-500">
                        No shipping address available!
                      </div>
                    )}
                  </div>
                </div>

                <div id="Items" className="bg-white rounded-lg mt-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-4">No items in cart</div>
                  ) : (
                    cartItems.map((product) => (
                      <CheckoutItem
                        key={`${product.cartItemId}-${product.idProduct}`}
                        product={product}
                        formatCurrency={displayPrice}
                      />
                    ))
                  )}
                </div>
              </div>

              <div
                id="PlaceOrder"
                className="relative -top-[6px] w-[35%] border rounded-lg"
              >
                <div className="p-4">
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <div>
                      Items (
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                    </div>
                    <div>{displayPrice(getCartTotal())}</div>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>Shipping:</div>
                    <div>{displayPrice(shippingFee)}</div>
                  </div>

                  <div className="border-t" />

                  <div className="flex items-center justify-between my-4">
                    <div className="font-semibold">Order total</div>
                    <div className="text-2xl font-semibold">
                      {displayPrice(getCartTotal() + shippingFee)}
                    </div>
                  </div>

                  <div className="border border-gray-500 p-2 rounded-sm mb-4">
                    <div className="text-gray-500 text-center mb-2 font-semibold">
                      Choose Payment Method
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={selectedMethod === "cod"}
                          onChange={() => setSelectedMethod("cod")}
                        />
                        <span>Cash on Delivery (COD)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          checked={selectedMethod === "paypal"}
                          onChange={() => setSelectedMethod("paypal")}
                        />
                        <span>PayPal</span>
                      </label>
                    </div>
                  </div>

                  <button
                    className="mt-4 bg-blue-600 text-lg w-full text-white font-semibold p-3 rounded-full hover:bg-blue-700"
                    onClick={() => {
                      if (selectedMethod === "paypal") {
                        setShowPaypalPopup(true);
                      } else {
                        handlePayment();
                      }
                    }}
                  >
                    Confirm and pay
                  </button>
                </div>

                <div className="flex items-center p-4 justify-center gap-2 border-t">
                  <img width={50} src="/images/logo.svg" alt="Logo" />
                  <div className="font-light mb-2 mt-2">
                    MONEY BACK GUARANTEE
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPaypalPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-[400px] w-full">
                <div className="text-lg font-semibold mb-4">
                  PayPal Checkout
                </div>
                <PayPalScriptProvider
                  options={{
                    "client-id": "test", // 👉 Dùng sandbox client ID (có thể thay bằng ID thật)
                    currency: currencyMeta.code,
                  }}
                >
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "blue",
                      shape: "rect",
                      label: "paypal",
                    }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: (
                                convertPrice(getCartTotal() + shippingFee) / 100
                              ).toFixed(2),
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then((details) => {
                        alert(
                          `Transaction completed by ${details.payer.name.given_name}`
                        );
                        setShowPaypalPopup(false);
                        handlePayment(true);
                      });
                    }}
                    onCancel={() => {
                      setShowPaypalPopup(false);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>
          )}
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </>
  );
}
