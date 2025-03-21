import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useSelector((state) => state.shop);
  const [orderData, setOrderData] = useState([]);
  const [reviews, setReviews] = useState({});
  const [submittingReview, setSubmittingReview] = useState({});

  const loadOrderData = async () => {
    try {
      if (!token) return;
      const response = await axios.post(
        `${backendUrl}/api/v1/order/userorders`,
        { userId: token },
        { headers: { token } }
      );

      if (response.data.success) {
        const allOrdersItem = response.data.orders.flatMap(order => 
          order.items.map(item => ({
            ...item,
            orderId: order._id,
            status: order.status,
            payment: order.payment,
            paymentMethod: order.paymentMethod,
            date: order.date,
          }))
        );
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders.");
    }
  };

  useEffect(() => {
    if (token) loadOrderData();
  }, [token]);

  const handleReviewSubmit = async (e, productId) => {
    e.preventDefault();
    const review = reviews[productId];

    if (!review || !review.rating) {
      toast.error("Please select a rating before submitting the review.");
      return;
    }

    try {
      setSubmittingReview(prev => ({ ...prev, [productId]: true }));

      const response = await axios.patch(
        `${backendUrl}/api/v1/product/addReview/${productId}`,
        { rating: review.rating, comment: review.comment },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Review submitted successfully!");
        setReviews(prev => ({ ...prev, [productId]: { rating: 0, comment: "" } }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleStarClick = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-yellow-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div className="space-y-6">
        {orderData.map((item, index) => (
          <div key={`${item.orderId}-${index}`} className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-6 text-sm">
              <img className="w-16 sm:w-20 object-cover" src={item.image} alt={item.name} />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currency}{item.price}</p>
                  <p>Qty: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                  <p>Color: {item.color}</p>
                </div>
                <p className="mt-1">Date: <span className="text-gray-400">{new Date(item.date).toLocaleDateString()}</span></p>
                <p className="mt-1">Payment: <span className="text-gray-400">{item.paymentMethod}</span></p>
                <p className="mt-1">Order ID: <span className="text-gray-400">{item.orderId}</span></p>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              <button 
                onClick={loadOrderData} 
                className="border border-gray-300 px-4 py-2 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
              >
                Track Order
              </button>
            </div>

            {item.status === "Delivered" && (
              <div className="mt-4 w-full md:w-auto">
                <p className="font-medium text-gray-700 mb-2">Leave a Review</p>
                <form onSubmit={(e) => handleReviewSubmit(e, item.productId)} className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-2xl cursor-pointer transition-colors ${
                          reviews[item.productId]?.rating >= star ? "text-yellow-500" : "text-gray-300"
                        }`}
                        onClick={() => handleStarClick(item.productId, star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={reviews[item.productId]?.comment || ""}
                    onChange={(e) => setReviews(prev => ({
                      ...prev,
                      [item.productId]: { ...prev[item.productId], comment: e.target.value }
                    }))}
                    placeholder="Write your review..."
                    className="border border-gray-300 p-2 rounded-md w-full min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className={`w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium
                      hover:bg-blue-700 transition-colors ${
                        submittingReview[item.productId] ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    disabled={submittingReview[item.productId]}
                  >
                    {submittingReview[item.productId] ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}

        {orderData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;