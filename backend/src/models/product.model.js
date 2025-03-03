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
        required: true
      },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
   subCategory: {
      type: String,
      required: [true, "Product category is required"],
    },
    sizes: {
      type: Array,
      required: [true, "Product category is required"],
    },
    BestSeller: {
      type: Boolean
    },
    date:{
      type:Number
    }
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
