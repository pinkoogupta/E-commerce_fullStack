import mongoose from "mongoose";

const electronicsSchema = new mongoose.Schema(
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
      default: "Electronics",
    },
    subCategory: {
      type: String,
      required: [true, "Product subcategory is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
    },
    model: {
      type: String,
      required: [true, "Model is required"],
    },
    specifications: {
      processor: { type: String },
      ram: { type: String },
      storage: { type: String },
      screenSize: { type: String },
      batteryLife: { type: String },
      connectivity: { type: [String] }, // e.g., ["WiFi", "Bluetooth"]
    },
    warranty: {
      type: String, // e.g., "1 Year"
      required: true,
    },
    stock: [
      {
        color: {
          type: String,
          required: [true, "Color is required"],
        },
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

export const Electronics = mongoose.model("Electronics", electronicsSchema);
