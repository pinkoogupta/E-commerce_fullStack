import React from 'react';
import { useSelector } from 'react-redux';
import { selectCartAmount } from '../redux/features/shopSlice';
import Title from './Title';

const CartTotal = () => {
  // Access state from Redux using selectors
  const currency = useSelector((state) => state.shop.currency);
  const deliveryFee = useSelector((state) => state.shop.deliveryFee);
  const cartAmount = useSelector(selectCartAmount);

  // Calculate total including delivery fee
  const total = cartAmount === 0 ? 0 : cartAmount + deliveryFee;

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency} {cartAmount.toFixed(2)}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency} {deliveryFee.toFixed(2)}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {currency} {total.toFixed(2)}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;