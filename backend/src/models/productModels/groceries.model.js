import mongoose from "mongoose";

const groceriesSchema = new mongoose.Schema(
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
      required: true,
      default: "Groceries",
    },
    subCategory: {
      type: String,
      required: [true, "Product subcategory is required"],
    },
    brand: {
      type: String,
    },
    weight: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    organic: {
      type: Boolean,
      default: false,
    },
    stock: [
      {
        sku: {
          type: String,
          required: true,
          unique: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
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
          required: true,
        },
        comment: {
          type: String,
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

export const Groceries = mongoose.model("Groceries", groceriesSchema);
