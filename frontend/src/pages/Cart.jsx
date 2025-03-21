import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts, getUserCart, deleteFromCart, updateCartQuantity } from "../redux/features/shopSlice";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";
import { 
  Trash2, 
  ShoppingBag, 
  AlertTriangle, 
  ChevronRight, 
  MinusCircle, 
  PlusCircle,
  Package,
  X,
  Loader2
} from "lucide-react";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, currency, cartItems, token, loading } = useSelector((state) => state.shop);
  const [cartData, setCartData] = useState([]);
  const [isStockAvailable, setIsStockAvailable] = useState(true);
  const [quantities, setQuantities] = useState({});

  // Fetch products if not already loaded
  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Fetch user cart when the component mounts
  useEffect(() => {
    if (token) {
      dispatch(getUserCart(token));
    }
  }, [dispatch, token]);

  // Update cartData and stock availability whenever cartItems or products change
  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      let stockAvailable = true;
      const newQuantities = {};

      for (const productId in cartItems) {
        const product = products.find((p) => p._id === productId);
        if (!product) continue;

        const variants = cartItems[productId].variants || {};
        
        for (const variantKey in variants) {
          const [size, color] = variantKey.split('-');
          const quantity = variants[variantKey].quantity;
          
          // Store quantity in state for controlled inputs
          newQuantities[`${productId}-${variantKey}`] = quantity;

          if (quantity > 0) {
            // Find the stock item for the selected size and color
            const stockItem = product.stock.find(
              (item) => item.size === size && item.color === color
            );
            const availableStock = stockItem?.quantity || 0;

            // Check if the cart quantity exceeds available stock
            if (quantity > availableStock) {
              stockAvailable = false;
            }

            // Find product image that matches the color
            const colorImage = product.image.find(img => img.includes(color.toLowerCase())) || product.image[0];

            tempData.push({
              _id: productId,
              size,
              color,
              quantity,
              availableStock,
              productData: product,
              image: colorImage
            });
          }
        }
      }

      setCartData(tempData);
      setIsStockAvailable(stockAvailable);
      setQuantities(newQuantities);
    }
  }, [cartItems, products]);

  // Handle checkout
  const handleCheckout = () => {
    if (!isStockAvailable) {
      toast.error("Some items exceed available stock! Please adjust before proceeding.");
      return;
    }
    navigate("/place-order");
  };

  // Handle delete item
  const handleDeleteItem = (itemId, size, color) => {
    toast.promise(
      new Promise((resolve) => {
        dispatch(deleteFromCart({ itemId, size, color, token }));
        setTimeout(resolve, 300);
      }),
      {
        pending: "Removing item...",
        success: "Item removed from cart",
        error: "Failed to remove item"
      }
    );
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, size, color, newQuantity) => {
    if (newQuantity > 0) {
      const key = `${itemId}-${size}-${color}`;
      setQuantities({
        ...quantities,
        [key]: newQuantity
      });
      
      dispatch(
        updateCartQuantity({
          itemId,
          size,
          color,
          quantity: newQuantity,
          token,
        })
      );
    }
  };

  // Check if cart is empty
  const isCartEmpty = cartData.length === 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="border-t pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-2xl mb-6">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      
      {isCartEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-50 rounded-full p-6 mb-4">
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6 max-w-md">Looks like you haven't added any products to your cart yet.</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded-md flex items-center hover:bg-gray-800 transition-colors"
          >
            Continue Shopping <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 rounded-lg py-3 px-4 mb-6 hidden sm:grid grid-cols-[4fr_1fr_1fr_0.5fr] text-sm font-medium text-gray-500">
            <div>Product</div>
            <div className="text-center">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Remove</div>
          </div>
          
          <div className="mb-8 space-y-4">
            {cartData.map((item) => {
              const productData = item.productData;
              const variantKey = `${item.size}-${item.color}`;
              const itemKey = `${item._id}-${variantKey}`;
              const exceededStock = item.quantity > item.availableStock;

              return (
                <div
                  key={itemKey}
                  className={`p-4 rounded-lg border ${exceededStock ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'} 
                    transition-all duration-200 shadow-sm`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[4fr_1fr_1fr_0.5fr] gap-4 items-center">
                    {/* Product Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                        <img 
                          className="w-full h-full object-cover" 
                          src={item.image} 
                          alt={productData.name} 
                        />
                      </div>
                      <div>
                        <p 
                          className="font-medium text-gray-800 hover:text-blue-600 cursor-pointer" 
                          onClick={() => navigate(`/product/${item._id}`)}
                        >
                          {productData.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            Size: {item.size}
                          </span>
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: item.color.toLowerCase() === 'white' ? '#f9fafb' : 
                                              item.color.toLowerCase() === 'black' ? '#111' : 
                                              item.color.toLowerCase(),
                              color: ['white', 'yellow', 'beige'].includes(item.color.toLowerCase()) ? '#111' : '#fff',
                              border: item.color.toLowerCase() === 'white' ? '1px solid #e5e7eb' : 'none'
                            }}
                          >
                            {item.color}
                          </span>
                        </div>
                        {exceededStock && (
                          <div className="flex items-center mt-2 text-xs text-red-600">
                            <AlertTriangle size={14} className="mr-1" />
                            Only {item.availableStock} left in stock
                          </div>
                        )}
                        <div className="sm:hidden mt-2 flex justify-between items-center">
                          <p className="font-medium text-gray-900">
                            {currency} {productData.price.toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleDeleteItem(item._id, item.size, item.color)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price - Hidden on mobile */}
                    <div className="hidden sm:flex justify-center items-center">
                      <p className="font-medium">
                        {currency} {productData.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Quantity */}
                    <div className="flex justify-center items-center">
                      <div className="flex items-center border rounded-md overflow-hidden w-24">
                        <button
                          onClick={() => handleQuantityChange(
                            item._id, 
                            item.size, 
                            item.color, 
                            Math.max(1, item.quantity - 1)
                          )}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <MinusCircle size={16} />
                        </button>
                        <input
                          type="number"
                          value={quantities[itemKey] || item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                              handleQuantityChange(item._id, item.size, item.color, value);
                            }
                          }}
                          min="1"
                          className="w-10 text-center border-x py-1 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(
                            item._id, 
                            item.size, 
                            item.color, 
                            item.quantity + 1
                          )}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <PlusCircle size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Remove Button - Hidden on mobile */}
                    <div className="hidden sm:flex justify-center">
                      <button
                        onClick={() => handleDeleteItem(item._id, item.size, item.color)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 my-10">
            {/* Order Summary */}
            <div className="w-full md:w-1/2 lg:w-2/5 order-2 md:order-1">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Order Summary</h3>
                <CartTotal />
                
                {!isStockAvailable && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4 text-sm text-red-600 flex items-start">
                    <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                    <p>Some items exceed available stock. Please adjust quantities before checkout.</p>
                  </div>
                )}
                
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleCheckout}
                    className={`w-full py-3 px-4 rounded font-medium flex items-center justify-center ${
                      isStockAvailable 
                        ? "bg-black text-white hover:bg-gray-800" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isStockAvailable}
                  >
                    <Package size={18} className="mr-2" />
                    PROCEED TO CHECKOUT
                  </button>
                  
                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-3 px-4 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium flex items-center justify-center"
                  >
                    <X size={18} className="mr-2" />
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;