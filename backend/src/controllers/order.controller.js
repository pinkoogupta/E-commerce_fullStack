import {Order} from "../models/order.model.js";


// placing the order


const placeOrder=async (req,res) => {
    
     try {
        const {userId,items,amount,address}=req.body;
        const orderData={
            userId,
            items,
            amount,
            paymentMethod:"COD",
            payment:false,
            date:Date.now()
        }
        const newOrder=new Order(orderData);
        await newOrder.save();
        await Order.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"order Placed"});

     } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
     }

}
const placeOrderStripe=async (req,res) => {
    
}
const placeOrderRazorpay=async (req,res) => {
    
}

const allOrders =async(req,res)=>{

}

// for frontend 
const userOrders=async(req,res)=>{

}

const updateStatus=(req,res)=>{

}

export {placeOrder,  placeOrderStripe , placeOrderRazorpay, allOrders ,userOrders ,updateStatus};