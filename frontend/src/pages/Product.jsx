import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import RelatedProducts from "../components/RelatedProducts";
import { addToCart, fetchProducts } from "../redux/features/shopSlice";
import { 
  Star, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Clock, 
  TruckIcon, 
  RefreshCw 
} from "lucide-react";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products, cartItems, currency, token } = useSelector((state) => state.shop);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [selectedStockWarning, setSelectedStockWarning] = useState(null);
  const [buttonText, setButtonText] = useState("ADD TO CART");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const fetchProductData = () => {
      const foundProduct = products.find((item) => item._id === productId);
      if (foundProduct) {
        setProductData(foundProduct);
        setImage(foundProduct.image[0]);
        setActiveImageIndex(0);
        
        // Get unique colors from stock
        const uniqueColors = [...new Set(foundProduct.stock.map(item => item.color))];
        if (uniqueColors.length > 0) {
          setColor(uniqueColors[0]); // Set first color as default
          
          // Update available sizes for the selected color
          const sizesForColor = foundProduct.stock
            .filter(item => item.color === uniqueColors[0])
            .map(item => ({
              size: item.size,
              quantity: item.quantity
            }));
          setAvailableSizes(sizesForColor);
        }
      } else {
        setProductData(null);
      }
    };

    fetchProductData();
  }, [productId, products]);

  useEffect(() => {
    if (productData && color) {
      // Update available sizes when color changes
      const sizesForColor = productData.stock
        .filter(item => item.color === color)
        .map(item => ({
          size: item.size,
          quantity: item.quantity
        }));
      setAvailableSizes(sizesForColor);
      setSize(""); // Reset size when color changes
      setButtonText("ADD TO CART");
      setSelectedStockWarning(null);
    }
  }, [color, productData]);

  useEffect(() => {
    // Update button text based on cart state
    if (productData && size && color) {
      const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;
      const isInCart = cartItems?.[productData._id]?.variants?.[variantKey];
      setButtonText(isInCart ? "GO TO CART" : "ADD TO CART");
    }
  }, [cartItems, productData, size, color]);

  if (!productData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleColorSelect = (selectedColor) => {
    setColor(selectedColor);
    
    // Find and set the first image that matches the selected color
    const colorImageIndex = productData.image.findIndex(img => 
      img.includes(selectedColor.toLowerCase())
    );
    
    if (colorImageIndex !== -1) {
      setImage(productData.image[colorImageIndex]);
      setActiveImageIndex(colorImageIndex);
    }
  };

  const handleSizeSelect = (selectedSize) => {
    setSize(selectedSize);

    // Check if the selected color and size combination is in cart
    const variantKey = `${selectedSize.toUpperCase()}-${color.toUpperCase()}`;
    if (cartItems?.[productData._id]?.variants?.[variantKey]) {
      setButtonText("GO TO CART");
    } else {
      setButtonText("ADD TO CART");
    }

    // Show stock warning for the selected color and size
    const selectedStockItem = productData.stock.find(
      item => item.color === color && item.size === selectedSize
    );
    
    if (selectedStockItem && selectedStockItem.quantity < 10 && selectedStockItem.quantity > 0) {
      setSelectedStockWarning(
        `Only ${selectedStockItem.quantity} left in ${color} - size ${selectedSize}!`
      );
    } else {
      setSelectedStockWarning(null);
    }
  };

  const handleAddToCart = () => {
    if (!size || !color) {
      toast.error("Please select both size and color");
      return;
    }

    const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;
    if (cartItems?.[productData._id]?.variants?.[variantKey]) {
      navigate("/cart");
    } else {
      dispatch(addToCart({ 
        itemId: productData._id, 
        size, 
        color,
        token 
      }));
    }
  };

  const handleImageChange = (index) => {
    setImage(productData.image[index]);
    setActiveImageIndex(index);
  };

  // Check if the product is out of stock for all colors and sizes
  const isOutOfStock = productData.stock.every((item) => item.quantity === 0);

  // Get unique colors from stock
  const availableColors = [...new Set(productData.stock.map(item => item.color))];

  // Generate color styles for buttons
  const getColorStyle = (colorName) => {
    const colorMap = {
      "Black": "bg-black text-white",
      "White": "bg-white text-black border-gray-300",
      "Red": "bg-red-500 text-white",
      "Blue": "bg-blue-500 text-white",
      "Green": "bg-green-500 text-white",
      "Yellow": "bg-yellow-400 text-black",
      "Purple": "bg-purple-500 text-white",
      "Pink": "bg-pink-400 text-white",
      "Gray": "bg-gray-500 text-white",
      "Brown": "bg-amber-800 text-white",
      "Orange": "bg-orange-500 text-white",
    };
    
    return colorMap[colorName] || "bg-gray-200 text-black";
  };

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images Section */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex flex-row sm:flex-col overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:justify-start sm:w-[19.7%] w-full scrollbar-hide">
            {productData.image.map((item, index) => (
              <div 
                key={index} 
                className={`w-[24%] sm:w-full h-28 sm:h-32 sm:mb-3 flex-shrink-0 cursor-pointer relative rounded-md overflow-hidden transition-all duration-300 ${
                  activeImageIndex === index ? "ring-2 ring-blue-500" : "hover:opacity-80"
                }`}
              >
                <img
                  src={item}
                  className="w-full h-full object-cover"
                  alt={`Product Image ${index + 1}`}
                  onClick={() => handleImageChange(index)}
                />
              </div>
            ))}
          </div>
          <div className="w-full sm:w-[80%] h-auto sm:h-[600px] rounded-lg overflow-hidden relative group">
            <img
              src={image}
              className="w-full h-full object-contain"
              alt="Main Product Image"
            />
            {productData.image.length > 1 && (
              <>
                <button 
                  onClick={() => handleImageChange(
                    activeImageIndex === 0 ? productData.image.length - 1 : activeImageIndex - 1
                  )}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => handleImageChange(
                    activeImageIndex === productData.image.length - 1 ? 0 : activeImageIndex + 1
                  )}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
  
        {/* Product Details Section */}
        <div className="flex-1">
          <h1 className="font-bold text-2xl md:text-3xl">{productData.name}</h1>
          <div className="flex items-center mt-3 gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < Math.floor(productData.averageRating || 0) 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300"} 
              />
            ))}
            <p className="pl-2 text-sm text-gray-600">
              {productData.averageRating?.toFixed(1) || "0.0"} ({productData.reviews.length} Reviews)
            </p>
          </div>
          
          <div className="mt-5 bg-gray-50 px-4 py-3 rounded-md inline-block">
            <p className="text-3xl font-semibold">
              {currency} {productData.price.toLocaleString()}
            </p>
          </div>
          
          <p className="mt-6 text-gray-700 md:w-[90%] leading-relaxed">
            {productData.description}
          </p>

          {/* Color Selection */}
          <div className="flex flex-col gap-4 mt-8">
            <p className="font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500"></span>
              Select Color
            </p>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((itemColor, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(itemColor)}
                  className={`py-2 px-4 rounded-full text-sm transition-all ${
                    getColorStyle(itemColor)
                  } ${
                    itemColor === color 
                      ? "ring-2 ring-offset-2 ring-gray-400" 
                      : "hover:shadow-md"
                  }`}
                >
                  {itemColor}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="flex flex-col gap-4 mt-8">
            <p className="font-medium flex items-center gap-2">
              <span className="w-1 h-4 bg-black"></span>
              Select Size
            </p>
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSizeSelect(item.size)}
                  disabled={item.quantity === 0}
                  className={`border py-2 px-5 rounded-md bg-white transition-all ${
                    item.size === size 
                      ? "border-black font-medium shadow-md" 
                      : "border-gray-300 hover:border-gray-400"
                  } ${
                    item.quantity === 0
                      ? "opacity-40 cursor-not-allowed line-through"
                      : ""
                  }`}
                >
                  {item.size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Warning */}
          {selectedStockWarning && (
            <div className="mt-4 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md flex items-center">
              <Clock size={16} className="mr-2" />
              {selectedStockWarning}
            </div>
          )}
          
          {/* Add to Cart or Out of Stock */}
          {isOutOfStock ? (
            <div className="mt-6 text-red-500 font-bold bg-red-50 py-3 px-4 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Out of Stock
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`mt-6 px-8 py-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                !size || !color
                ? "bg-gray-400 text-white cursor-not-allowed" 
                : buttonText === "GO TO CART" 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              disabled={!size || !color}
            >
              {buttonText === "GO TO CART" ? <ShoppingCart size={18} /> : <ShoppingBag size={18} />}
              {buttonText}
            </button>
          )}
          
          <hr className="mt-8 sm:w-4/5" />
          
          {/* Product Features */}
          <div className="text-sm text-gray-600 mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-full bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p>100% Original Product</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-full bg-gray-100">
                <TruckIcon size={16} />
              </div>
              <p>Cash on Delivery available</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-full bg-gray-100">
                <RefreshCw size={16} />
              </div>
              <p>Easy return and exchange policy</p>
            </div>
          </div>
        </div>
      </div>
  
      {/* Reviews Section */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star size={18} fill="currentColor" /> 
          Customer Reviews ({productData.reviews.length})
        </h2>
        
        {productData.reviews.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {productData.reviews.map((review, index) => (
              <div key={index} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < review.rating 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300"} 
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{review.comment}</p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    {review.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  {review.user?.name || "Anonymous User"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-gray-500 bg-gray-50 p-6 rounded-lg text-center">
            <Star size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
  
      {/* Related Products Section */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;