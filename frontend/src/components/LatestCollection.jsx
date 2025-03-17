import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Title from './Title';
import ProductItem from './ProductItem';
import {fetchProducts } from "../redux/features/shopSlice";

const LatestCollection = () => {
    const [latestProduct, setLatestProduct] = useState([]);
    const products = useSelector((state) => state.shop.products); // Corrected path
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchProducts()); // Fetch products on component mount
      }, [dispatch]);
    
    useEffect(() => {
        if (products && products.length > 0) {
            setLatestProduct(products.slice(0, 10)); // Only slice if products exist
        }
    }, [products]);

    return (
        <div className='my-10'>
            <div className='text-center py-8 text-3xl'>
                <Title text1={"LATEST"} text2={"COLLECTIONS"} />
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                    Lorem ipsum is a simple dummy paragraph of the container jsnndoi alokak owimma ljoijce
                </p>
            </div>

            {/* Rendering items */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 gap-y-6'>
                {latestProduct.map((item, index) => (
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                ))}
            </div>
        </div>
    );
};

export default LatestCollection;