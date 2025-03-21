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
    stock: [
      {
        size: {
          type: String,
          required: [true, "Size is required"],
        },
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


// Middleware to generate SKU before saving
productSchema.pre("save", function (next) {
  this.totalStock = this.stock.reduce((sum, item) => sum + item.quantity, 0);

  // Generate SKU for each stock entry if not provided
  this.stock.forEach((item) => {
    if (!item.sku) {
      item.sku = generateSKU(this.name, item.size, item.color);
    }
  });

  next();
});

export const Product = mongoose.model("Product", productSchema);
