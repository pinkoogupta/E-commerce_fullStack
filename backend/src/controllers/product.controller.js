import { Product } from "../models/product.model.js";
import { v2 as cloudinary } from "cloudinary";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";


function* skuGenerator(start = 100000000) {
  let counter = start;
  while (true) {
    yield counter.toString(36).toUpperCase().padStart(8, '0');
    counter++;
  }
}

// Create a generator instance
const skuGen = skuGenerator();

const generateSKU = (productName, size, color) => {
  const shortName = productName.substring(0, 3).toUpperCase();
  const shortSize = size.toUpperCase();
  const shortColor = color.toUpperCase();

  // Get the next unique ID from the generator
  const uniqueID = skuGen.next().value;

  return `${shortName}-${shortSize}-${shortColor}-${uniqueID}`;
};

// **Add a Product**
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, BestSeller, stock } = req.body;

    // Extract images
    const images = ["image1", "image2", "image3", "image4"]
      .map((key) => req.files?.[key]?.[0])
      .filter(Boolean);

    const imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    // Parse stock array
    const parsedStock = JSON.parse(stock);

    // Transform stock data with SKU generation
    let transformedStock = parsedStock.map((item) => ({
      size: item.size.toUpperCase(),
      color: item.color.toUpperCase(),
      sku: item.sku || generateSKU(name, item.size, item.color),
      quantity: Number(item.quantity),
    }));

    // Calculate totalStock
    const totalStock = transformedStock.reduce((sum, item) => sum + item.quantity, 0);

    // Create product
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      BestSeller: BestSeller === "true",
      image: imageUrl,
      stock: transformedStock,
      totalStock,
      date: Date.now(),
    });

    await product.save();
    res.status(201).json({ success: true, message: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Error adding product", error: error.message });
  }
};

// ✏️ **Update a Product**
const updateProduct = async (req, res) => {
  try {
    const { productId, price, stock } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Ensure stock is an array
    let updatedStock = Array.isArray(stock) ? stock : product.stock;

    // Ensure SKUs exist
    updatedStock = updatedStock.map((item) => ({
      size: item.size.toUpperCase(),
      color: item.color.toUpperCase(),
      sku: item.sku || generateSKU(product.name, item.size, item.color),
      quantity: Number(item.quantity),
    }));

    // Calculate new totalStock
    const totalStock = updatedStock.reduce((sum, item) => sum + item.quantity, 0);

    // Update product
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = updatedStock;
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
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting product", error });
  }
};

//  **Get Single Product**
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//  **List All Products**
const listProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products) return res.status(404).json({ message: "Products not found" });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//  **Add Review to Product**
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating) {
      return res.status(400).json({ success: false, message: "Rating is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.reviews.push({ rating: Number(rating), comment });

    // Calculate new average rating
    const totalRatings = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    product.averageRating = totalRatings / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: "Review added successfully", product });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Error adding review", error: error.message });
  }
};

//  **Export Controllers**
export { addProduct, updateProduct, removeProduct, listProducts, singleProduct, addReview };





