import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ResetPassword = () => {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null); // Track token validity

  // ✅ Verify Token First (Before Showing Form)
  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await axios.get(`${backendUrl}/api/v1/user/verifyPassword/${token}`);
        setIsValidToken(true); // Token is valid
      } catch (error) {
        setIsValidToken(false);
        toast.error(error.response?.data?.message || "Invalid or expired token.");
      }
    }
    verifyToken();
  }, [backendUrl, token]);

  // ✅ Handle Password Reset
  async function handleResetPassword(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/v1/user/resetPassword/${token}`, { newPassword });
      toast.success(response.data.message);
      navigate("/"); // Redirect to login after success
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    }
    setLoading(false);
  }

  // ✅ Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="flex flex-col items-center mt-20">
        <h2 className="text-2xl font-semibold text-red-600">Invalid or Expired Token</h2>
        <p>Please request a new password reset link.</p>
      </div>
    );
  }

  // ✅ Show loading state while verifying token
  if (isValidToken === null) {
    return (
      <div className="flex flex-col items-center mt-20">
        <h2 className="text-2xl font-semibold">Verifying Token...</h2>
      </div>
    );
  }

  // ✅ Show Reset Password Form
  return (
    <div className="flex flex-col items-center mt-20">
      <h2 className="text-2xl font-semibold">Set New Password</h2>
      <form onSubmit={handleResetPassword} className="flex flex-col gap-4 w-[90%] sm:max-w-96 mt-4">
        <input
          type="password"
          placeholder="New Password"
          className="w-full px-3 py-2 border"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-black text-white px-4 py-2" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
