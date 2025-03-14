// index.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/db.js";
import userRoutes from "./src/routes/user.route.js";
import cors from "cors";
import cookiesParser from "cookie-parser";
import productRoutes from "./src/routes/product.route.js";
import cartRouter from "./src/routes/cart.route.js";
import orderRouter from "./src/routes/order.route.js";
import connectCloudinary from "./src/utils/cloudinary.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookiesParser());


app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/product',productRoutes);
  app.use('/api/v1/cart',cartRouter);
  app.use('/api/v1/order',orderRouter);

app.get('/',(req,res)=>{
  res.send("APIs are working");
})

connectDB()
  .then(() => {
    

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running at port: ${process.env.PORT || 3000}`);
    });
    app.on("error", (error) => {
      console.log("Error:", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!", err);
  });
  connectCloudinary();

  
  