import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import SimilarProducts from "../../components/SimilarProducts";
import Footer from "../../components/Footer";
import { formatCurrency } from "../../utils/formatCurrency";
import { useRegion } from "../../context/RegionContext";
function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">
        Looks like you haven't added anything to your cart yet
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700"
      >
        Start Shopping
      </button>
    </div>
  );
}

function CartItem({
  product,
  cartItemId,
  onRemove,
  onUpdateQuantity,
  availableStock,
}) {
  const { currencyMeta, exchangeRate } = useRegion();
  return (
    <div className="flex items-center justify-between gap-4 border-b p-4">
      <div className="flex items-center gap-4">
        <img
          src={`${product.url}/100`}
          alt={product.title}
          className="w-[100px] h-[100px] object-cover rounded-lg"
        />
        <div>
          <div className="font-semibold">{product.title}</div>
          <div className="text-sm text-gray-500">{product.description}</div>
          <div className="font-bold mt-2">
            {formatCurrency(
              (product.price / 100) * exchangeRate,
              currencyMeta.code,
              currencyMeta.symbol
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() =>
                onUpdateQuantity(
                  cartItemId,
                  product.idProduct,
                  product.quantity - 1
                )
              }
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={product.quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span>{product.quantity}</span>
            <button
              onClick={() =>
                onUpdateQuantity(
                  cartItemId,
                  product.idProduct,
                  product.quantity + 1
                )
              }
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={product.quantity >= availableStock}
            >
              <Plus size={16} />
            </button>
          </div>
          {availableStock === 0 && (
            <div className="text-red-500 text-sm mt-1">Out of stock</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(cartItemId, product.idProduct)}
        className="text-blue-500 hover:text-blue-700"
      >
        Remove
      </button>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  }, []);
  const { currencyMeta, exchangeRate } = useRegion();
  
  // Add new state for coupon code functionality
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  
  // Function to handle coupon code application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setIsApplyingCoupon(true);
    setCouponError("");
    
    try {
      // Fetch coupon data from API
      const couponResponse = await fetch(`http://localhost:9999/coupons?id=${couponCode.toUpperCase()}`);
      const couponData = await couponResponse.json();
      
      if (couponData.length === 0) {
        setCouponError("Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        const coupon = couponData[0];
        if (coupon.status === 0) {
          setCouponError("This coupon has expired");
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
          setCouponError("");
        }
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  // Calculate discounted amount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    return (getCartTotal() * appliedCoupon.discount / 100);
  };
  
  // Calculate final total after discount
  const getFinalTotal = () => {
    return getCartTotal() - getDiscountAmount();
  };

  const fetchCartItems = async () => {
    if (!currentUser) {
      console.log("No current user, setting empty cart");
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Current user:", currentUser);
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

            let productInfo = Array.isArray(productData)
              ? productData[0]
              : productData;
            if (productInfo) {
              return {
                ...productInfo,
                quantity: parseInt(product.quantity),
                idProduct: product.idProduct,
                cartItemId: cartItem.id,
                availableStock: productInfo.quantity,
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
        console.warn("No valid products found in cart.");
      }
      setCartItems(filteredItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setIsLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!currentUser) {
      alert("Please login to add items to cart");
      navigate("/auth");
      return;
    }

    try {
      // Fetch product data to check stock
      const productResponse = await fetch(
        `http://localhost:9999/products?id=${productId}`
      );
      const productData = await productResponse.json();
      const productInfo = Array.isArray(productData)
        ? productData[0]
        : productData;
      if (!productInfo || productInfo.quantity <= 0) {
        alert("This product is out of stock!");
        return;
      }

      const cartResponse = await fetch(
        `http://localhost:9999/shoppingCart?userId=${currentUser.id}`
      );
      const cartData = await cartResponse.json();
      console.log("Cart data before adding:", cartData);

      let newCartQuantity = 1;
      if (cartData.length > 0) {
        const cartItem = cartData[0];
        const existingProduct = cartItem.productId.find(
          (p) => p.idProduct === productId
        );

        if (existingProduct) {
          const currentQty = parseInt(existingProduct.quantity);
          if (currentQty + 1 > productInfo.quantity) {
            alert("Cannot add more items; stock limit reached!");
            return;
          }
          newCartQuantity = currentQty + 1;
          const updatedProducts = cartItem.productId.map((p) =>
            p.idProduct === productId
              ? { ...p, quantity: newCartQuantity.toString() }
              : p
          );

          await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: updatedProducts }),
          });
        } else {
          await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: [
                ...cartItem.productId,
                { idProduct: productId, quantity: "1" },
              ],
            }),
          });
        }
      } else {
        await fetch(`http://localhost:9999/shoppingCart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            productId: [{ idProduct: productId, quantity: "1" }],
            dateAdded: new Date().toISOString(),
          }),
        });
      }

      // Update product stock
      const newStock = productInfo.quantity - 1;
      const stockResponse = await fetch(
        `http://localhost:9999/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newStock }),
        }
      );
      if (!stockResponse.ok) {
        throw new Error("Failed to update product stock");
      }

      await fetchCartItems();
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    }
  };

  const removeFromCart = async (cartItemId, productId) => {
    try {
      const cartResponse = await fetch(
        `http://localhost:9999/shoppingCart/${cartItemId}`
      );
      const cartItem = await cartResponse.json();

      const productToRemove = cartItem.productId.find(
        (p) => p.idProduct === productId
      );
      const quantityRemoved = parseInt(productToRemove.quantity);

      const updatedProducts = cartItem.productId.filter(
        (p) => p.idProduct !== productId
      );

      if (updatedProducts.length === 0) {
        await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
          method: "DELETE",
        });
      } else {
        await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: updatedProducts }),
        });
      }

      // Restore stock to products API
      const productResponse = await fetch(
        `http://localhost:9999/products?id=${productId}`
      );
      const productData = await productResponse.json();
      const productInfo = Array.isArray(productData)
        ? productData[0]
        : productData;
      const newStock = productInfo.quantity + quantityRemoved;

      const stockResponse = await fetch(
        `http://localhost:9999/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newStock }),
        }
      );
      if (!stockResponse.ok) {
        throw new Error("Failed to update product stock");
      }

      await fetchCartItems();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item from cart");
    }
  };

  const updateQuantity = async (cartItemId, productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // Fetch current product stock
      const productResponse = await fetch(
        `http://localhost:9999/products?id=${productId}`
      );
      const productData = await productResponse.json();
      const productInfo = Array.isArray(productData)
        ? productData[0]
        : productData;
      const currentStock = productInfo.quantity;

      // Fetch current cart quantity
      const cartResponse = await fetch(
        `http://localhost:9999/shoppingCart/${cartItemId}`
      );
      const cartItem = await cartResponse.json();
      const currentCartProduct = cartItem.productId.find(
        (p) => p.idProduct === productId
      );
      const currentCartQty = parseInt(currentCartProduct.quantity);

      // Calculate stock change
      const quantityDifference = newQuantity - currentCartQty;
      const newStock = currentStock - quantityDifference;

      if (newStock < 0) {
        alert("Cannot update quantity; insufficient stock!");
        return;
      }

      // Update cart
      const updatedProducts = cartItem.productId.map((p) =>
        p.idProduct === productId
          ? { ...p, quantity: newQuantity.toString() }
          : p
      );

      const cartUpdateResponse = await fetch(
        `http://localhost:9999/shoppingCart/${cartItemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: updatedProducts }),
        }
      );

      if (!cartUpdateResponse.ok) {
        throw new Error("Failed to update cart quantity");
      }

      // Update product stock
      const stockResponse = await fetch(
        `http://localhost:9999/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newStock }),
        }
      );

      if (!stockResponse.ok) {
        throw new Error("Failed to update product stock");
      }

      await fetchCartItems();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (!currentUser) {
      alert("Please login to checkout");
      navigate("/auth");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    // Pass coupon information to checkout page via navigation state
    navigate("/checkout", { 
      state: { 
        appliedCoupon: appliedCoupon,
        originalTotal: getCartTotal(),
        discountAmount: getDiscountAmount(),
        finalTotal: getFinalTotal()
      } 
    });
  };

  useEffect(() => {
    fetchCartItems();
  }, [currentUser]);

  const handleAddTestProduct = () => {
    addToCart("1");
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
          to view your cart
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      <div className="max-w-[1200px] mx-auto mb-8 min-h-[300px]">
        <div className="text-2xl font-bold my-4">Shopping cart</div>
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {cartItems.length === 0 ? (
                <EmptyCart />
              ) : (
                <div className="space-y-4">
                  {cartItems.map((product) => (
                    <CartItem
                      key={`${product.cartItemId}-${product.idProduct}`}
                      product={product}
                      cartItemId={product.cartItemId}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                      availableStock={product.availableStock}
                    />
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="md:col-span-1">
                <div className="bg-white p-4 border sticky top-4">
                  {/* Coupon Code Section */}
                  <div className="mb-4 border-b pb-4">
                    <div className="font-medium mb-2">Have a coupon?</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="border p-2 flex-grow rounded text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className={`px-3 py-2 rounded text-white text-sm ${
                          isApplyingCoupon ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {isApplyingCoupon ? "Applying..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <div className="text-xs text-red-500 mt-1">{couponError}</div>
                    )}
                    {appliedCoupon && (
                      <div className="mt-2 text-sm text-green-600 flex justify-between items-center">
                        <span>
                          Coupon applied: {appliedCoupon.name} ({appliedCoupon.discount}% off)
                        </span>
                        <button 
                          onClick={() => setAppliedCoupon(null)}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="flex items-center justify-center bg-blue-600 w-full text-white font-semibold p-3 rounded-full hover:bg-blue-700"
                  >
                    Go to checkout
                  </button>

                  <div className="flex items-center justify-between mt-4 text-sm mb-1">
                    <div>Items ({cartItems.length})</div>

                    <div>
                      {formatCurrency(
                        (getCartTotal() / 100) * exchangeRate,
                        currencyMeta.code,
                        currencyMeta.symbol
                      )}
                    </div>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between mt-2 text-sm text-green-600">
                      <div>Discount ({appliedCoupon.discount}%)</div>
                      <div>
                        -{formatCurrency(
                          (getDiscountAmount() / 100) * exchangeRate,
                          currencyMeta.code,
                          currencyMeta.symbol
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-b border-gray-300 mt-2" />

                  <div className="flex items-center justify-between mt-4 mb-1 text-lg font-semibold">
                    <div>Subtotal</div>
                    <div>
                      {formatCurrency(
                        (getFinalTotal() / 100) * exchangeRate,
                        currencyMeta.code,
                        currencyMeta.symbol
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12">
          <SimilarProducts />
        </div>
      </div>
      <Footer />
    </div>
  );
}
