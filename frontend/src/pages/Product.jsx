import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import RelatedProducts from "../components/RelatedProducts";
import { addToCart, fetchProducts } from "../redux/features/shopSlice"; // Import the addToCart action

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Access state from Redux store
  const { products, cartItems, currency, token } = useSelector((state) => state.shop);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [selectedStockWarning, setSelectedStockWarning] = useState(null);
  const [disabledSizes, setDisabledSizes] = useState({});
  const [buttonText, setButtonText] = useState("ADD TO CART");

  useEffect(() => {
    dispatch(fetchProducts()); // Fetch products on component mount
  }, [dispatch]);

  // Fetch product data based on productId
  useEffect(() => {
    const fetchProductData = () => {
      const foundProduct = products.find((item) => item._id === productId);
      if (foundProduct) {
        setProductData(foundProduct);
        setImage(foundProduct.image[0]);
      } else {
        setProductData(null);
      }
    };

    fetchProductData();
  }, [productId, products]);

  if (!productData) {
    return <div className="opacity-0">Loading...</div>;
  }

  // Handle size selection
  const handleSizeSelect = (selectedSize) => {
    setSize(selectedSize);

    // Check if the selected size is already in the cart
    if (cartItems?.[productData._id]?.[selectedSize]) {
      setButtonText("GO TO CART"); // If in cart, set to "GO TO CART"
    } else {
      setButtonText("ADD TO CART"); // If not in cart, set to "ADD TO CART"
    }

    // Show stock warning if applicable
    if (productData.stock?.[selectedSize] < 10 && productData.stock[selectedSize] > 0) {
      setSelectedStockWarning(
        `Only ${productData.stock[selectedSize]} left in size ${selectedSize}!`
      );
    } else {
      setSelectedStockWarning(null);
    }
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    // If the item is already in the cart for the selected size, navigate to the cart page
    if (cartItems?.[productData._id]?.[size]) {
      navigate("/cart");
    } else {
      // Dispatch the addToCart action
      dispatch(addToCart({ itemId: productData._id, size, token }));
      setButtonText("GO TO CART");
    }
  };

  // Check if the product is out of stock
  const isOutOfStock = Object.values(productData.stock || {}).every(
    (qty) => qty === 0
  );

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnail Images - increased height */}
          <div className="flex flex-row sm:flex-col overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:justify-start sm:w-[19.7%] w-full">
            {productData.image.map((item, index) => (
              <div 
                key={index} 
                className="w-[24%] sm:w-full h-28 sm:h-32 sm:mb-3 flex-shrink-0 cursor-pointer"
              >
                <img
                  src={item}
                  className="w-full h-full object-cover"
                  alt={`Product Image ${index + 1}`}
                  onClick={() => setImage(item)}
                />
              </div>
            ))}
          </div>
          {/* Main Image - increased height */}
          <div className="w-full sm:w-[80%] h-auto sm:h-[600px]">
            <img
              src={image}
              className="w-full h-full object-contain"
              alt="Main Product Image"
            />
          </div>
        </div>
  
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center mt-2 gap-1">
            {[...Array(Math.floor(productData.averageRating || 0))].map(
              (_, i) => (
                <img key={i} src={assets.star_icon} className="w-3 5" />
              )
            )}
            {[...Array(5 - Math.floor(productData.averageRating || 0))].map(
              (_, i) => (
                <img key={i} src={assets.star_dull_icon} className="w-3 5" />
              )
            )}
            <p className="pl-2">{productData.reviews.length} Reviews</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency} {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-[4/5]">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-6">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSizeSelect(item)}
                  disabled={productData.stock[item] === 0}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500 bg-gray-200" : ""
                  } ${
                    productData.stock[item] === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {selectedStockWarning && (
            <div className="mt-4 text-sm text-red-500">
              {selectedStockWarning}
            </div>
          )}
          {isOutOfStock ? (
            <p className="text-red-500 font-bold mt-4 ml-1">Out of Stock</p>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700 mt-4 mr-4"
              disabled={!size || disabledSizes[size]}
            >
              {buttonText}
            </button>
          )}
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product</p>
            <p>Cash on Delivery is available for this product</p>
            <p>Easy return and exchange policy is available</p>
          </div>
        </div>
      </div>
  
      {/* Reviews Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        {productData.reviews.length > 0 ? (
          <div className="mt-4 space-y-4">
            {productData.reviews.map((review, index) => (
              <div key={index} className="border p-3 rounded-md">
                <div className="flex items-center gap-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <img key={i} src={assets.star_icon} className="w-3 5" />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <img
                      key={i}
                      src={assets.star_dull_icon}
                      className="w-3 5"
                    />
                  ))}
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">No reviews yet.</p>
        )}
      </div>
  
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;