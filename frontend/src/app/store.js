import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "../redux/features/shopSlice";

export const store = configureStore({
  reducer: {
    shop: shopReducer,
  },
});
