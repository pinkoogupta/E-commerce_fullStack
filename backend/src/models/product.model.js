import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    image: {
      type: Array, 
      required: true,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    subCategory: {
      type: String,
      required: [true, "Product subcategory is required"],
    },
    sizes: {
      type: [String], // List of available sizes (e.g., ["S", "M", "L", "XL"])
      required: [true, "Product sizes are required"],
    },
    stock: {
      type: Map, // Store stock count per size
      of: Number,
      required: true,
      default: {},
    },
    totalStock: {
      type: Number, // Sum of all stock quantities
      required: true,
      default: 0,
    },
    BestSeller: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
