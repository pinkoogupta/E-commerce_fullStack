import sendEmails from '../utils/sendEmail.js';
import crypto from 'crypto';
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";

const generateTheToken = async (userId) => {
    try {
      const user = await User.findById(userId);
      const token = user.generateToken();
      user.token = token;
      await user.save({ validateBeforeSave: false });
      return { token };
    } catch (error) {
      console.error("Error in generateTheToken:", error.message); 
      return { error: "Something went wrong while generating tokens" }; 
    }
};

const registerUser = async (req, res) => {
  try {
      const { name, email, password} = req.body;
      
      if (!name || !email || !password) {
          return res.json({success:false,message: "All fields are required"});
      }
      
      const existedUser = await User.findOne({ email });
      if (existedUser) {
          return res.json({success:false,message: "User with email already exists"});
      }
      
      const user = await User.create({ name, email, password });
      const createdUser = await User.findById(user._id).select("-password -token");
      const { token } = await generateTheToken(user._id);
      
      return res.status(201).json( {success:true,createdUser, token ,message: "User registered successfully"});
  } catch (error) {
      console.error("Error in registerUser:", error);
      return res.status(500).json({success:false,message:error.message});
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    
    const user = await User.findOne({ email }).select("+password"); // Ensure password is fetched
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // console.log("User stored password:", user.password);
    // console.log("Entered password:", password);

    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate token
    const { token } = await generateTheToken(user._id);

    // Remove sensitive data before sending response
    const loggedInUser = await User.findById(user._id).select("-password -token");

    return res.status(200).json({
      success: true,
      user: loggedInUser,
      token,
      message: "User logged in successfully",
    });

  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};




const loginAdmin = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email) {
          return res.json({success:false,message:"email is reuired"});
      }

    
      if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
        return res.json({success:false, message: "Unauthorized: Invalid admin credentials"});
      }

      const user = await User.findOne({ email });

      if (!user) {
          return res.json({success:false ,message: "Invalid admin credentials"});
      }

      const isPasswordValid = await user.isPasswordCorrect(password);

      if (!isPasswordValid) {
        return res.json({success:false ,message: "password incorrect or invalid user credentials"}); 
      }

      const token = jwt.sign(email+password, process.env.JWT_SECRET)

      const loggedInUser = await User.findById(user._id).select("-password -token");

      return res.status(200).json( {success:true,loggedInUser, token ,message: "Admin logged in successfully"});
  } catch (error) {
      console.error("Error in loginAdmin:", error);
      return res.status(500).json({success:false,message:error.message});
  }
};





const forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const tokenExpiry = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = tokenExpiry;

  await user.save(); // Save changes to MongoDB

  // ✅ FIXED: Correct frontend reset password page URL
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `You requested to reset your password. Click the link below:

${resetURL}

This link will expire in 15 minutes.`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    res.status(200).json({ success: true, message: "Reset email sent successfully" });
  } catch (error) {
    // Clean up if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(500).json({ success: false, message: "Failed to send email" });
  }
};



const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    res.status(200).json({
      success: true,
      message: "Token verified successfully. You can now reset your password.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    // Hash the provided token to match the stored one
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user with the matching reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with new password and remove reset token fields
    await User.findOneAndUpdate(
      { _id: user._id }, 
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default resetPassword;





export {registerUser,loginUser,loginAdmin,forgetPassword,verifyResetToken,resetPassword};