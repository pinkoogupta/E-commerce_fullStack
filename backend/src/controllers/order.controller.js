import {Order} from "../models/order.model.js";


// placing the order


const placeOrder=async (req,res) => {
    
     try {
        const {userId,items,amount,address}=req.body;
        const orderData={
            userId,
            items,
            amount,
            address,
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
         try {
             const orders=await Order.find({});
               res.json({success:true,orders});
             
         } catch (error) {
            console.log(error);
        res.json({success:false,message:error.message});
         }
}

// for frontend 
const userOrders=async(req,res)=>{
   try {
      const {userId}= req.body;
      
      const orders=await Order.find({userId});
      res.json({success:true,orders});

   } catch (error) {
      console.log(error);
      res.json({suucess:false,message:error.message});
   }


}

const updateStatus=async(req,res)=>{
          try {
            const {orderId, status} =req.body;

            await Order.findByIdAndUpdate(orderId,{status})
            res.json({success:true,message:'Status Updated'});
          } catch (error) {
            console.log(error);
      res.json({suucess:false,message:error.message});
          }
}

export {placeOrder,  placeOrderStripe , placeOrderRazorpay, allOrders ,userOrders ,updateStatus};
