import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [reviews, setReviews] = useState({}); // Separate review state per product
  const [submittingReview, setSubmittingReview] = useState({}); // Tracks loading per product

  // Load Orders
  const loadOrderData = async () => {
    try {
      if (!token) return;
      const response = await axios.post(`${backendUrl}/api/v1/order/userorders`, {}, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);

        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders.");
    }
  };

  useEffect(() => {
    if (token) loadOrderData();
  }, [token]);

  // Handle Review Submission
  const handleReviewSubmit = async (e, productId) => {
    e.preventDefault();
    const review = reviews[productId];

    if (!review || !review.rating || !review.comment) {
      toast.error("Please fill all fields before submitting the review.");
      return;
    }

    try {
      setSubmittingReview((prev) => ({ ...prev, [productId]: true }));

      const response = await axios.patch(
        `${backendUrl}/api/v1/product/addReview/${productId}`,
        { rating: review.rating, comment: review.comment },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Review submitted successfully!");
        setReviews((prev) => ({ ...prev, [productId]: { rating: "", comment: "" } }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div key={index} className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-6 text-sm">
              <img className="w-16 sm:w-20" src={item.image[0]} alt={item.name} />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currency}{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span></p>
                <p className="mt-1">Payment: <span className="text-gray-400">{item.paymentMethod}</span></p>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className={`min-w-2 h-2 rounded-full ${item.status === "Delivered" ? "bg-green-500" : "bg-yellow-500"}`}></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              <button onClick={loadOrderData} className="border px-4 py-2 text-sm font-medium rounded-sm">Track Order</button>
            </div>

            {/* Review Section (Only if Delivered) */}
            {item.status === "Delivered" && (
              <div className="mt-4">
                <p className="font-medium text-gray-700">Leave a Review:</p>
                <form onSubmit={(e) => handleReviewSubmit(e, item._id)} className="mt-2 flex flex-col gap-2">
                  <select
                    value={reviews[item._id]?.rating || ""}
                    onChange={(e) => setReviews((prev) => ({
                      ...prev,
                      [item._id]: { ...prev[item._id], rating: e.target.value }
                    }))}
                    className="border p-2 rounded-md w-32"
                  >
                    <option value="">Select Rating</option>
                    <option value="1">⭐☆☆☆☆</option>
                    <option value="2">⭐⭐☆☆☆</option>
                    <option value="3">⭐⭐⭐☆☆</option>
                    <option value="4">⭐⭐⭐⭐☆</option>
                    <option value="5">⭐⭐⭐⭐⭐</option>
                  </select>
                  <textarea
                    value={reviews[item._id]?.comment || ""}
                    onChange={(e) => setReviews((prev) => ({
                      ...prev,
                      [item._id]: { ...prev[item._id], comment: e.target.value }
                    }))}
                    placeholder="Write your review..."
                    className="border p-2 rounded-md w-full"
                  />
                  <button
                    type="submit"
                    className={`bg-blue-600 text-white px-4 py-2 rounded-md text-sm ${submittingReview[item._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={submittingReview[item._id]}
                  >
                    {submittingReview[item._id] ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
