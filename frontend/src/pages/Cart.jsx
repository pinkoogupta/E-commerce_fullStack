import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [isStockAvailable, setIsStockAvailable] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      let stockAvailable = true;

      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            const product = products.find((p) => p._id === productId);
            const availableStock = product?.stock?.[size] || 0;

            if (cartItems[productId][size] > availableStock) {
              stockAvailable = false; // Only disable button if an item exceeds stock
            }

            tempData.push({
              _id: productId,
              size: size,
              quantity: cartItems[productId][size],
              availableStock: availableStock,
            });
          }
        }
      }

      setCartData(tempData);
      setIsStockAvailable(stockAvailable);
    }
  }, [cartItems, products]);

  const handleCheckout = () => {
    if (!isStockAvailable) {
      toast.error("Some items exceed available stock! Please adjust before proceeding.");
      return;
    }
    navigate('/place-order');
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item) => {
          const productData = products.find((product) => product._id === item._id);
          if (!productData) return null;

          return (
            <div
              key={item._id + item.size}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img className="w-16 sm:w-20" src={productData.image[0]} alt={productData.name} />
                <div>
                  <p className="text-sm sm:text-lg font-medium">{productData.name}</p>
                  <p className="text-xs text-gray-500">Size: {item.size}</p>
                  <p className="text-sm">
                    {currency}
                    {(productData.price * item.quantity).toFixed(2)}
                  </p>
                  {item.quantity > item.availableStock && (
                    <p className="text-xs text-red-500">
                      Only {item.availableStock} left in stock!
                    </p>
                  )}
                </div>
              </div>

              <input
                onChange={(e) =>
                  e.target.value === "" || e.target.value === "0"
                    ? null
                    : updateQuantity(item._id, item.size, Number(e.target.value))
                }
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                type="number"
                min={1}
                defaultValue={item.quantity}
              />
              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                src={assets.bin_icon}
                className="w-4 mr-4 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={handleCheckout}
              className={`text-sm my-8 px-8 py-3 ${
                isStockAvailable ? "bg-black text-white" : "bg-rose-400 cursor-not-allowed"
              }`}
              disabled={!isStockAvailable}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
