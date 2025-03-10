import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const ProductItem = ({ id, name, price, image, selectedSizes = [] }) => {
  const { currency, products } = useContext(ShopContext);

  // Find the product in the context
  const product = products.find((item) => item._id === id);
  const stock = product?.stock || {};
  const averageRating = product?.averageRating || 0;
  const reviewsCount = product?.reviews?.length || 0;

  // Get all stock quantities
  const allSizesStock = Object.values(stock);

  // Check general stock availability (when no size filter is applied)
  const isOutOfStock = allSizesStock.every(qty => qty === 0);
  const isFewLeft = allSizesStock.some(qty => qty > 0 && qty < 10);

  // If size filter is applied, check stock only for selected sizes
  let filteredStock = selectedSizes.length > 0
    ? selectedSizes.map(size => stock[size] || 0)
    : allSizesStock;

  const isFilteredOutOfStock = filteredStock.every(qty => qty === 0);
  const isFilteredFewLeft = filteredStock.some(qty => qty > 0 && qty < 10);

  return (
    <Link to={`/product/${id}`} className='relative text-gray-700 cursor-pointer'>
      {/* Image Container with Fixed Dimensions */}
      <div className='overflow-hidden relative h-64 w-full'> {/* Fixed height and width */}
        <img
          className='w-full h-full object-cover hover:scale-110 ease-in-out duration-300'
          src={image?.[0] || 'default-image-path.jpg'}
          alt={name}
        />

        {/* Badge Display Logic */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {selectedSizes.length > 0 ? (
            <>
              {isFilteredOutOfStock && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
              {isFilteredFewLeft && !isFilteredOutOfStock && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Few Stocks Left!
                </span>
              )}
            </>
          ) : (
            <>
              {isOutOfStock && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
              {isFewLeft && !isOutOfStock && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Few Stocks Left!
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Details */}
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <div className="flex justify-between items-center">
        <p className='text-sm font-medium'>{currency}{price}</p>
        {/* Rating Section */}
        <div className="flex items-center gap-1">
          {[...Array(Math.floor(averageRating || 0))].map((_, i) => (
            <img key={i} src={assets.star_icon} className="w-3 h-3" alt="Star" />
          ))}
          {[...Array(5 - Math.floor(averageRating || 0))].map((_, i) => (
            <img key={i} src={assets.star_dull_icon} className="w-3 h-3" alt="Dull Star" />
          ))}
          <p className="text-xs text-gray-500">({reviewsCount})</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;