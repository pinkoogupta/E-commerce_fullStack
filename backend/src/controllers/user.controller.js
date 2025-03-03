
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
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
      if (!email || !password) {
        return res.json({success:false,message: "Email and password are required"});
      }
      
      const user = await User.findOne({ email });
      if (!user || !(await user.isPasswordCorrect(password))) {
        return res.json({success:false,message: "Invalid email or password"});
      }
      
      const { token } = await generateTheToken(user._id);
      const loggedInUser = await User.findById(user._id).select("-password -token");
      
      return res.status(200).json({success:true,loggedInUser, token ,message: "User LoggedIn successfully"});
    } catch (error) {
      console.error("Error in loginUser:", error);
      return res.status(500).json({success:false,message:error.message});
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

export {registerUser,loginUser,loginAdmin};