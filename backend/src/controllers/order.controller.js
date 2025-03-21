import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";


const placeOrder = async (req, res) => {
    try {
        const { userId, address, paymentMethod = "COD" } = req.body;

        if (!userId || !address) {
            return res.status(400).json({
                success: false,
                message: "User ID and address are required"
            });
        }

        // Get user and cart data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const cartData = user.cartData || {};
        if (Object.keys(cartData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Calculate total amount and validate stock
        let totalAmount = 0;
        const orderItems = [];

        for (const [productId, variants] of Object.entries(cartData)) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({   success: false,message: `Product not found: ${productId}`
                });
            }

            for (const [variantKey, quantity] of Object.entries(variants)) {
                const [size, color] = variantKey.split('-');
                
                // Find stock item
                const stockItem = product.stock.find(
                    item => item.size === size && item.color === color
                );

                if (!stockItem || stockItem.quantity < quantity) {
                    return res.status(400).json({   success: false,
                        message: `Insufficient stock for ${product.name} (${size}, ${color})`});
                }

                // Update stock quantity
                stockItem.quantity -= quantity;

                // Add to order items
                orderItems.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    size,
                    color,
                    quantity,
                    image: product.image[0],
                    sku: stockItem.sku
                });

                totalAmount += product.price * quantity;
            }

            // Save updated stock
            await product.save();
        }

        // Create order
        const orderData = {
            userId,
            items: orderItems,
            amount: totalAmount,
            address,
            paymentMethod,
            payment: paymentMethod === "COD" ? false : true,
            status: paymentMethod === "COD" ? "Pending" : "Processing",
            date: Date.now()
        };

        const newOrder = new Order(orderData);
        await newOrder.save();

       
    //  data wil not clear affer order
    await User.findByIdAndUpdate(userId, { $set: { cartData: user.cartData } });


        res.status(200).json({
            success: true,
            message: "Order placed successfully",
            order: {
                orderId: newOrder._id,
                amount: totalAmount,
                status: newOrder.status
            }
        });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place Order with Stripe
const placeOrderStripe = async (req, res) => {
    
};

// Place Order with Razorpay
const placeOrderRazorpay = async (req, res) => {
   
};

// Get All Orders (Admin)
const allOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ date: -1 })
            .populate('userId', 'name email');

        res.status(200).json({
            success: true,
            orders: orders.map(order => ({
                ...order.toObject(),
                customerName: order.userId?.name,
                customerEmail: order.userId?.email
            }))
        });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User Orders
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const orders = await Order.find({ userId })
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Order Status (Admin)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: "Order ID and status are required"
            });
        }

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus
};