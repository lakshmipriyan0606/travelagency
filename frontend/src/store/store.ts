import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import packageSlice from './packageSlice'

export const store = configureStore({
  reducer: {
    auth,
    packageList: packageSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
