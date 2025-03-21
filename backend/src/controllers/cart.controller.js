import { User } from "../models/user.model.js";
import { Product } from "../models/productModels/product.model.js";
import { verifyJWT } from "../middlewares/userAuth.middleware.js";

// Add product to Cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size, color } = req.body;

        if (!userId || !itemId || !size || !color) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID, item ID, size, and color are required" 
            });
        }

        // Validate user
        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Validate product - first try by _id, then by SKU if _id fails
        let product;
        try {
            product = await Product.findById(itemId);
        } catch (error) {
            // If itemId is not a valid ObjectId, try finding by SKU
            product = await Product.findOne({
                'stock.sku': itemId
            });
        }

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check stock availability for the selected size and color
        const stockItem = product.stock.find(
            (item) => item.size === size.toUpperCase() && item.color === color.toUpperCase()
        );

        if (!stockItem || stockItem.quantity === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Selected size and color combination is out of stock" 
            });
        }

        // Get or initialize cart data
        let cartData = userData.cartData || {};

        // Create a unique key for the size-color combination
        const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;

        // Update cart data
        if (cartData[product._id]) {
            if (cartData[product._id][variantKey]) {
                // Check if adding more exceeds available stock
                if (cartData[product._id][variantKey] + 1 > stockItem.quantity) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Not enough stock available" 
                    });
                }
                cartData[product._id][variantKey] += 1;
            } else {
                cartData[product._id][variantKey] = 1;
            }
        } else {
            cartData[product._id] = {};
            cartData[product._id][variantKey] = 1;
        }

        // Save updated cart data
        await User.findByIdAndUpdate(userId, { cartData });

        res.status(200).json({ 
            success: true, 
            message: "Added to Cart",
            cartData: cartData[product._id]
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Cart
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, color, quantity } = req.body;

        if (!userId || !itemId || !size || !color || quantity === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID, item ID, size, color, and quantity are required" 
            });
        }

        // Validate user
        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Validate product - first try by _id, then by SKU if _id fails
        let product;
        try {
            product = await Product.findById(itemId);
        } catch (error) {
            // If itemId is not a valid ObjectId, try finding by SKU
            product = await Product.findOne({
                'stock.sku': itemId
            });
        }

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check stock availability for the selected size and color
        const stockItem = product.stock.find(
            (item) => item.size === size.toUpperCase() && item.color === color.toUpperCase()
        );

        if (!stockItem || stockItem.quantity < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: "Not enough stock available" 
            });
        }

        // Get or initialize cart data
        let cartData = userData.cartData || {};

        // Create a unique key for the size-color combination
        const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;

        // Update cart data
        if (quantity <= 0) {
            // Remove the variant if quantity is 0 or negative
            if (cartData[product._id]) {
                delete cartData[product._id][variantKey];
                // Remove the product entirely if no variants remain
                if (Object.keys(cartData[product._id]).length === 0) {
                    delete cartData[product._id];
                }
            }
        } else {
            // Add or update the quantity
            if (!cartData[product._id]) {
                cartData[product._id] = {};
            }
            cartData[product._id][variantKey] = quantity;
        }

        // Save updated cart data
        await User.findByIdAndUpdate(userId, { cartData });

        res.status(200).json({ 
            success: true, 
            message: "Cart Updated",
            cartData: cartData[product._id] || {}
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete from Cart
const deleteFromCart = async (req, res) => {
    try {
        const { userId, itemId, size, color } = req.body;

        if (!userId || !itemId || !size || !color) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID, item ID, size, and color are required" 
            });
        }

        // Validate user
        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get cart data
        let cartData = userData.cartData || {};

        // Create a unique key for the size-color combination
        const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;

        // Check if the item exists in the cart
        if (!cartData[itemId] || !cartData[itemId][variantKey]) {
            return res.status(404).json({ 
                success: false, 
                message: "Item not found in cart" 
            });
        }

        // Remove the variant
        delete cartData[itemId][variantKey];

        // Remove the product entirely if no variants remain
        if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
        }

        // Save updated cart data
        await User.findByIdAndUpdate(userId, { cartData });

        res.status(200).json({ 
            success: true, 
            message: "Item removed from cart",
            cartData: cartData[itemId] || {}
        });
    } catch (error) {
        console.error("Error deleting from cart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user Cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required" 
            });
        }

        // Validate user
        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get cart data
        const cartData = userData.cartData || {};

        // Fetch product details for each item in cart
        const enrichedCartData = {};
        for (const [productId, variants] of Object.entries(cartData)) {
            let product;
            try {
                product = await Product.findById(productId);
            } catch (error) {
                // If productId is not a valid ObjectId, try finding by SKU
                product = await Product.findOne({
                    'stock.sku': productId
                });
            }

            if (product) {
                enrichedCartData[product._id] = {
                    productDetails: {
                        name: product.name,
                        price: product.price,
                        image: product.image[0], // First image as main image
                    },
                    variants: {},
                };

                // Add quantity and validate stock for each variant
                for (const [variantKey, quantity] of Object.entries(variants)) {
                    const [size, color] = variantKey.split('-');
                    const stockItem = product.stock.find(
                        (item) => item.size === size && item.color === color
                    );

                    enrichedCartData[product._id].variants[variantKey] = {
                        size,
                        color,
                        quantity,
                        inStock: stockItem ? stockItem.quantity >= quantity : false,
                        availableStock: stockItem ? stockItem.quantity : 0
                    };
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            cartData: enrichedCartData
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, deleteFromCart, getUserCart };