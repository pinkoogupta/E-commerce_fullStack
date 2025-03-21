import express from 'express';
import {addToCart,updateCart,getUserCart,deleteFromCart} from "../controllers/cart.controller.js";
import {verifyJWT} from "../middlewares/userAuth.middleware.js";
const cartRouter=express.Router();

cartRouter.post('/get',verifyJWT,getUserCart);
cartRouter.post('/add',verifyJWT,addToCart);
cartRouter.post('/update',verifyJWT,updateCart);
cartRouter.delete('/delete',verifyJWT,deleteFromCart);


export default cartRouter;