import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, name, price, image }) => {
  const { currency, products } = useContext(ShopContext);

 
  const product = products.find((item) => item._id === id);
  
 
  const stock = product?.stock || {}; 
  
  
  const allSizes = Object.values(stock);
  const isOutOfStock = allSizes.every(qty => qty === 0); 
  const isFewLeft = allSizes.some(qty => qty > 0 && qty < 10); 

  return (
    <Link to={`/product/${id}`} className='relative text-gray-700 cursor-pointer'>
      <div className='overflow-hidden relative'>
      
        <img
          className='hover:scale-110 ease-in-out duration-300'
          src={image?.[0] || 'default-image-path.jpg'} 
          alt={name}
        />

        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
        
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
        </div>
      </div>
      

      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  );
};

export default ProductItem;
