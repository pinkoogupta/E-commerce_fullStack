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
    const { name, description, price, category, subCategory, sizes, BestSeller, stock } = req.body;

    // Extract images from request
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

    // Convert sizes and stock to proper format
    const parsedSizes = JSON.parse(sizes); // Ensure sizes is an array
    const parsedStock = JSON.parse(stock); // Ensure stock is an object

    // Validate stock object (ensuring it has valid size keys) and calculate totalStock
    let stockMap = {};
    let totalStock = 0;
    parsedSizes.forEach(size => {
      const stockValue = parsedStock[size] ? Number(parsedStock[size]) : 0; // Default 0 if not provided
      stockMap[size] = stockValue;
      totalStock += stockValue;
    });

    console.log({ name, description, price, category, subCategory, parsedSizes, BestSeller, stockMap, totalStock });
    console.log(imageUrl);

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: parsedSizes,
      BestSeller: BestSeller === "true" ? true : false,
      image: imageUrl,
      stock: stockMap,
      totalStock, // Add total stock count
      date: Date.now(),
    });

    await product.save();
    res.status(201).json({ success: true, message: "Product added successfully", product });

  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Error adding product", error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    console.log("Incoming Data:", req.body); // Debugging log

    const { productId, price, stock } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Ensure stock is correctly parsed
    const parsedStock = stock ? JSON.parse(JSON.stringify(stock)) : product.stock;
    console.log("Parsed Stock:", parsedStock); // Debugging log

    // Calculate totalStock
    let totalStock = Object.values(parsedStock).reduce((sum, value) => sum + Number(value), 0);

    // Update price, stock, and totalStock
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = parsedStock || product.stock;
    product.totalStock = totalStock;
    product.date = Date.now();

    await product.save();
    res.status(200).json({ success: true, message: "Product updated successfully", product });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product", error: error.message });
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

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params; // Get productId from URL params

    // Validate request body
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment are required" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Add the new review
    product.reviews.push({ rating: Number(rating), comment });

    // Recalculate average rating
    const totalRatings = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    product.averageRating = totalRatings / product.reviews.length;

    // Save updated product
    await product.save();

    res.status(201).json({ success: true, message: "Review added successfully", product });

  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Error adding review", error: error.message });
  }
};


  

export {addProduct, updateProduct, removeProduct,listProducts,singleProduct,addReview };