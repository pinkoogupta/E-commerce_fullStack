import { Router } from "express";
import {
    addProduct,
    updateProduct,
    removeProduct,
    listProducts,
    singleProduct
} from '../controllers/product.controller.js'; 
import upload from '../middlewares/multer.middleware.js';
import  AdminVerifyJWT  from '../middlewares/adminAuth.middleware.js';

const productRoutes = Router();

// Product management routes
productRoutes.post("/addProduct",AdminVerifyJWT,upload.fields([
    {name:'image1',maxCount:1},
    {name:'image2',maxCount:2},
    {name:'image3',maxCount:3},
    {name:'image4',maxCount:4}]), addProduct); 

// productRoutes.post("/single",singleProduct);
productRoutes.post("/remove",AdminVerifyJWT, removeProduct); 
productRoutes.get("/list",listProducts);
productRoutes.get("/singleProduct",AdminVerifyJWT,singleProduct);

export default productRoutes;

