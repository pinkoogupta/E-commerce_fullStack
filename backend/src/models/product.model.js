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
      type: [String],
      required: [true, "Product sizes are required"],
    },
    stock: {
      type: Map,
      of: Number,
      required: true,
      default: {},
    },
    totalStock: {
      type: Number,
      required: true,
      default: 0,
    },
    BestSeller: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Number,
    },
    reviews: [
      {
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required:true
        },
        comment: {
          type: String
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
