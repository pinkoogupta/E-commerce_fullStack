import { useEffect, useState } from "react";
import { useSelector, useDispatch  } from "react-redux"; // Import useSelector from Redux
import Title from "./Title";
import ProductItem from "./ProductItem";
import {fetchProducts } from "../redux/features/shopSlice"; 




const BestSeller = () => {
  const products = useSelector((state) => state.shop.products); // Get products from Redux store
  const [bestSeller, setBestSeller] = useState([]);
  
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchProducts()); // Fetch products on component mount
  }, [dispatch]);


  useEffect(() => {
    console.log("Products:", products);

    if (Array.isArray(products) && products.length > 0) {
      const sortedProducts = [...products].sort((a, b) => {
        if (a.BestSeller && !b.BestSeller) return -1;
        if (!a.BestSeller && b.BestSeller) return 1;
        return 0;
      });

      const topBestSellers = sortedProducts.slice(0, 5);
      setBestSeller(topBestSellers);
    } else {
      setBestSeller([]);
    }
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"BEST"} text2={"SELLER"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          There is no one who loves pain itself, who seeks after it and wants to
          have it, simply because it is pain...
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 gap-y-6">
        {bestSeller.map((item, index) => (
          <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
