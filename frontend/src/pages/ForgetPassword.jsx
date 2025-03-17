import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { backendUrl, token } = useSelector((state) => state.shop); // Redux instead of context
  const [loading, setLoading] = useState(false);
  // console.log("Backend URL from config:", backendUrl);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/v1/user/forgetPassword`, { email });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h2 className="text-2xl font-semibold">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[90%] sm:max-w-96 mt-4">
        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="w-full px-3 py-2 border" placeholder="Enter your email" required />
        <button type="submit" className="bg-black text-white px-4 py-2" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgetPassword;
