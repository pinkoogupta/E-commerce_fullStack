import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";


const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestSeller } = req.body;

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    let imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

   

    console.log({ name, description, price, category, subCategory, sizes, bestSeller });
    console.log(imageUrl);
    const product = new Product({
      name, 
      description, 
      price:Number(price), 
      category,
       subCategory,
       sizes:JSON.parse(sizes),
       bestSeller:bestSeller==="true"?true:false,
       image:imageUrl,
       date:Date.now()
    });

    await product.save();
    res.status(201).json({success:true, message: "Product added successfully", product });

  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success:true,message: "Error adding product", error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    if (req.file) {
      const cloudinaryResponse = await cloudinary(req.file.path);
      if (cloudinaryResponse) {
        updateData.image = cloudinaryResponse.secure_url;
      }
    }
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({success:true, message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).json({success:false, message: "Error updating product", error });
  }
};

const removeProduct = async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.body.id);
      if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
      res.status(200).json({success:true, message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({success:false, message: "Error deleting product", error });
    }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    res.json({success:true,product});
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,error:error.message});
  }
}

const listProducts = async (req, res) => {
  try {
     const products=await Product.find({});
     if (!products) return res.status(404).json({ message: "Products not found" });
     res.status(200).json({success:true,products});
  } catch (error) {
   console.log(error);
   res.status(500).json({success:false,error:error.message});
  }

}
  

export {addProduct, updateProduct, removeProduct,listProducts,singleProduct };