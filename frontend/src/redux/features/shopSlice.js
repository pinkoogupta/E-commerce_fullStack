import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../../config/config";

// Async Thunks for API Calls
export const fetchProducts = createAsyncThunk(
  "shop/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/product/list`);
      if (response.data.success) {
        return response.data.products;
      } else {
        toast.error(response.data.message);
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getUserCart = createAsyncThunk(
  "shop/getUserCart",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/v1/cart/get`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        return response.data.cartData;
      } else {
        toast.error(response.data.message);
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "shop/addToCart",
  async ({ itemId, size, color, token }, { rejectWithValue }) => {
    if (!size) {
      toast.error("Select Product Size");
      return rejectWithValue("Select Product Size");
    }
    if (!color) {
      toast.error("Select Product Color");
      return rejectWithValue("Select Product Color");
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/v1/cart/add`,
        { itemId, size, color },
        { headers: { token } }
      );
      toast.success(response.data.message);
      return { itemId, size, color };
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteFromCart = createAsyncThunk(
  "shop/deleteFromCart",
  async ({ itemId, size, color, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/v1/cart/delete`,
        { 
          headers: { token },
          data: { itemId, size, color }
        }
      );
      toast.success(response.data.message);
      return { itemId, size, color };
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "shop/updateCartQuantity",
  async ({ itemId, size, color, quantity, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/v1/cart/update`,
        { itemId, size, color, quantity },
        { headers: { token } }
      );
      toast.success(response.data.message);
      return { itemId, size, color, quantity };
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Redux Slice
const shopSlice = createSlice({
  name: "shop",
  initialState: {
    currency: "$",
    deliveryFee: 10,
    search: "",
    showSearch: false,
    cartItems: {},
    products: [],
    token: localStorage.getItem("token") || "",
    loading: false,
    backendUrl: backendUrl,
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setShowSearch: (state, action) => {
      state.showSearch = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      })

      // Get User Cart
      .addCase(getUserCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      })
      .addCase(getUserCart.rejected, (state) => {
        state.loading = false;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const { itemId, size, color } = action.payload;
        if (!state.cartItems[itemId]) {
          state.cartItems[itemId] = {
            productDetails: state.products.find(p => p._id === itemId),
            variants: {}
          };
        }
        const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;
        if (!state.cartItems[itemId].variants) {
          state.cartItems[itemId].variants = {};
        }
        if (!state.cartItems[itemId].variants[variantKey]) {
          state.cartItems[itemId].variants[variantKey] = {
            size: size.toUpperCase(),
            color: color.toUpperCase(),
            quantity: 1
          };
        } else {
          state.cartItems[itemId].variants[variantKey].quantity += 1;
        }
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.loading = false;
      })

      // Delete from Cart
      .addCase(deleteFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFromCart.fulfilled, (state, action) => {
        const { itemId, size, color } = action.payload;
        if (state.cartItems[itemId]) {
          const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;
          delete state.cartItems[itemId].variants[variantKey];
          if (Object.keys(state.cartItems[itemId].variants).length === 0) {
            delete state.cartItems[itemId];
          }
        }
        state.loading = false;
      })
      .addCase(deleteFromCart.rejected, (state) => {
        state.loading = false;
      })

      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const { itemId, size, color, quantity } = action.payload;
        if (state.cartItems[itemId]) {
          const variantKey = `${size.toUpperCase()}-${color.toUpperCase()}`;
          if (quantity <= 0) {
            delete state.cartItems[itemId].variants[variantKey];
            if (Object.keys(state.cartItems[itemId].variants).length === 0) {
              delete state.cartItems[itemId];
            }
          } else {
            if (!state.cartItems[itemId].variants) {
              state.cartItems[itemId].variants = {};
            }
            state.cartItems[itemId].variants[variantKey] = {
              size: size.toUpperCase(),
              color: color.toUpperCase(),
              quantity
            };
          }
        }
        state.loading = false;
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.loading = false;
      });
  },
});

// Selectors
export const selectCartCount = (state) => {
  let totalCount = 0;
  Object.values(state.shop.cartItems).forEach(item => {
    Object.values(item.variants || {}).forEach(variant => {
      totalCount += variant.quantity;
    });
  });
  return totalCount;
};

export const selectCartAmount = (state) => {
  let totalAmount = 0;
  Object.entries(state.shop.cartItems).forEach(([_, item]) => {
    const price = item.productDetails?.price || 0;
    Object.values(item.variants || {}).forEach(variant => {
      totalAmount += price * variant.quantity;
    });
  });
  return totalAmount;
};

// Export Actions and Reducer
export const { setSearch, setShowSearch, setToken, setCartItems } = shopSlice.actions;
export default shopSlice.reducer;