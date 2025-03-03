import { User } from "../models/user.model.js";
import {verifyJWT} from "../middlewares/userAuth.middleware.js";
// Add product to Cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;

        const userData = await User.findById(userId);
        if(!userData)
        {
            res.json({success:false,message:"user not found"});
        }
        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) { 
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {}; 
            cartData[itemId][size] = 1;
        }

        await User.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added to Cart" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Cart
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        const userData = await User.findById(userId);
        if(!userData)
            {
                res.json({success:false,message:"user not found"});
            }
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity;
        await User.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Cart Updated" });  
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user Cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;

        const userData = await User.findById(userId);
        if(!userData)
            {
                res.json({success:false,message:"user not found"});
            }
        let cartData = await userData.cartData;

        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart };
