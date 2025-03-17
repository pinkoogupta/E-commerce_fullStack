import React from 'react';
import { useSelector } from 'react-redux'; // Import useSelector
import Title from './Title';

const CartTotal = () => {
  // Access state from Redux
  const currency = useSelector((state) => state.shop.currency);
  const deliveryFee = useSelector((state) => state.shop.deliveryFee);
  const cartItems = useSelector((state) => state.shop.cartItems);
  const products = useSelector((state) => state.shop.products);

  // Calculate cart amount
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) continue; // Skip if product data is missing
  
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalAmount += itemInfo.price * cartItems[items][item];
        }
      }
    }
    return totalAmount;
  };
  

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency} {getCartAmount()}.00
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency} {deliveryFee}.00
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {currency} {getCartAmount() === 0 ? 0 : getCartAmount() + deliveryFee}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;