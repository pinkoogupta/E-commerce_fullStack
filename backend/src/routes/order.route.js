import express from 'express'

import {placeOrder,  placeOrderStripe , placeOrderRazorpay, allOrders ,userOrders ,updateStatus} from '../controllers/order.controller.js';
import  AdminVerifyJWT  from '../middlewares/adminAuth.middleware.js';

import {verifyJWT} from '../middlewares/userAuth.middleware.js';

const orderRouter = express.Router();

// Admin Features
orderRouter.post('/list', AdminVerifyJWT, allOrders)
orderRouter.post('/status', AdminVerifyJWT, updateStatus)

// Payment Features
orderRouter.post('/place', verifyJWT, placeOrder)
orderRouter.post('/stripe', verifyJWT, placeOrderStripe)
orderRouter.post('/razorpay', verifyJWT, placeOrderRazorpay)

// User Feature
orderRouter.post('/userorders', verifyJWT, userOrders)

export default orderRouter;
