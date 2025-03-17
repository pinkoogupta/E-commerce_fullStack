import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../../config/config"; // Import backendUrl

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
        toast.success(response.data.message);
        return response.data.cartData;
      }
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "shop/addToCart",
  async ({ itemId, size, token }, { rejectWithValue }) => {
    if (!size) {
      toast.error("Select Product Size");
      return rejectWithValue("Select Product Size");
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/v1/cart/add`,
        { itemId, size },
        { headers: { token } }
      );
      toast.success(response.data.message);
      return { itemId, size };
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "shop/updateCartQuantity",
  async ({ itemId, size, quantity, token }, { rejectWithValue }) => {
    try {
      await axios.post(
        `${backendUrl}/api/v1/cart/update`,
        { itemId, size, quantity },
        { headers: { token } }
      );
      return { itemId, size, quantity };
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
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
    backendUrl: backendUrl, // Add backendUrl to the initial state
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
      localStorage.setItem("token", action.payload); // Update localStorage
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
        const { itemId, size } = action.payload;
        if (!state.cartItems[itemId]) {
          state.cartItems[itemId] = {};
        }
        state.cartItems[itemId][size] = (state.cartItems[itemId][size] || 0) + 1;
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.loading = false;
      })

      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const { itemId, size, quantity } = action.payload;
        state.cartItems[itemId][size] = quantity;
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
  for (const items in state.shop.cartItems) {
    for (const item in state.shop.cartItems[items]) {
      if (state.shop.cartItems[items][item] > 0) {
        totalCount += state.shop.cartItems[items][item];
      }
    }
  }
  return totalCount;
};

export const selectCartAmount = (state) => {
  let totalAmount = 0;
  for (const items in state.shop.cartItems) {
    const itemInfo = state.shop.products.find(
      (product) => product._id === items
    );
    for (const item in state.shop.cartItems[items]) {
      if (state.shop.cartItems[items][item] > 0) {
        totalAmount += itemInfo.price * state.shop.cartItems[items][item];
      }
    }
  }
  return totalAmount;
};

// Export Actions and Reducer
export const { setSearch, setShowSearch, setToken, setCartItems } =
  shopSlice.actions;
export default shopSlice.reducer;