import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { setCartItems } from "../redux/features/shopSlice";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, cartItems, products, deliveryFee, backendUrl } = useSelector((state) => state.shop);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Format cart items according to the new structure
      const formattedCartItems = {};
      for (const productId in cartItems) {
        formattedCartItems[productId] = {};
        for (const item in cartItems[productId]) {
          if (cartItems[productId][item] > 0) {
            const [size, color] = item.split('-');
            formattedCartItems[productId][`${size}-${color}`] = cartItems[productId][item];
          }
        }
      }

      const orderData = {
        userId: token, // Assuming token contains user ID
        address: formData,
        paymentMethod: method.toUpperCase()
      };

      let response;
      switch (method) {
        case "cod":
          response = await axios.post(
            `${backendUrl}/api/v1/order/place`,
            orderData,
            { headers: { token } }
          );

          break;
        default:
          throw new Error("Invalid payment method");
      }

      if (response.data.success) {
        // dispatch(setCartItems({})); // Clear cart
        console.log(response.data);
        navigate("/orders");
        toast.success("Order placed successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} type="text" placeholder="First Name" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
          <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} type="text" placeholder="Last Name" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        </div>
        <input required onChange={onChangeHandler} name="email" value={formData.email} type="email" placeholder="Enter Email" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        <input required onChange={onChangeHandler} name="street" value={formData.street} type="text" placeholder="Street" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="city" value={formData.city} type="text" placeholder="City" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
          <input required onChange={onChangeHandler} name="state" value={formData.state} type="text" placeholder="State" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        </div>
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="zipcode" value={formData.zipcode} type="number" placeholder="Zipcode" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
          <input required onChange={onChangeHandler} name="country" value={formData.country} type="text" placeholder="Country" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        </div>
        <input required onChange={onChangeHandler} name="phone" value={formData.phone} type="number" placeholder="Phone" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
      </div>

      {/* Right side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod("stripe")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-400" : ""}`}></p>
              <img src={assets.stripe_logo} className="h-5 mx-4" alt="Stripe" />
            </div>
            <div onClick={() => setMethod("razorpay")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "razorpay" ? "bg-green-400" : ""}`}></p>
              <img src={assets.razorpay_logo} className="h-5 mx-4" alt="Razorpay" />
            </div>
            <div onClick={() => setMethod("cod")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-400" : ""}`}></p>
              <p className="text-gray-500 text-sm font-medium">CASH ON DELIVERY</p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button type="submit" className="bg-black text-white px-16 py-3 text-sm">PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;