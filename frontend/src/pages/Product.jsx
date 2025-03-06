import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState('');
  const [selectedStockWarning, setSelectedStockWarning] = useState(null);

  useEffect(() => {
    const fetchProductData = () => {
      const foundProduct = products.find(item => item._id === productId);
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

  const handleSizeSelect = (item) => {
    setSize(item);
    if (productData.stock?.[item] < 10 && productData.stock[item] > 0) {
      setSelectedStockWarning(`Only ${productData.stock[item]} left in size ${item}!`);
    } else {
      setSelectedStockWarning(null);
    }
  };

  const isOutOfStock = Object.values(productData.stock || {}).every(qty => qty === 0);

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex flex-col overflow-x-auto justify-between sm:overflow-x-scroll sm:justify-normal sm:w-[19.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt={`Product Image ${index + 1}`}
                onClick={() => setImage(item)}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} className="w-full h-auto" alt="Main Product Image" />
          </div>
        </div>

        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center mt-2 gap-1'>
            {[...Array(4)].map((_, i) => <img key={i} src={assets.star_icon} className='w-3 5' />)}
            <img src={assets.star_dull_icon} className='w-3 5' />
            <p className='pl-2'>{122}</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency} {productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-[4/5]'>{productData.description}</p>

          <div className='flex flex-col gap-4 my-6'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => handleSizeSelect(item)}
                  disabled={productData.stock[item] === 0}
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500 bg-gray-200' : ''} ${productData.stock[item] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Show stock warning only if a size is selected */}
          {selectedStockWarning && (
            <div className="mt-4 text-sm text-red-500">{selectedStockWarning}</div>
          )}

          {/* Show 'Out of Stock' if all sizes are out of stock, otherwise show 'Add to Cart' */}
          {isOutOfStock ? (
            <p className='text-red-500 font-bold mt-4'>Out of Stock</p>
          ) : (
            <button onClick={() => addToCart(productData._id, size)}
              className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>
              ADD TO CART
            </button>
          )}
          
          {/* Redirect to Cart Button */}
          <button onClick={() => navigate('/cart')}
            className='bg-blue-500 text-white px-8 py-3 text-sm mt-2 active:bg-blue-700'>
            Go to Cart
          </button>

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original Product</p>
            <p>Cash on Delivery is available for this product</p>
            <p>Easy return and exchange policy is available</p>
          </div>
        </div>
      </div>

      <div className='mt-20'>
        <div className='flex '>
          <p className='border px-5 py-3 text-sm'>Description</p>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
      </div>
      <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
        <p>There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain...</p>
        <p>There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain...</p>
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
};

export default Product;
