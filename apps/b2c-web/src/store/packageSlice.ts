import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1️⃣ Define type for each package
export interface PackageType {
  id: string;
  name: string;
  liked?: boolean;
}

// 2️⃣ Define state type
interface PackageState {
  allPackageList: PackageType[];
}

const initialState: PackageState = {
  allPackageList: [],
};

const packageSlice = createSlice({
  name: "packageReducer",
  initialState,
  reducers: {
    // 3️⃣ Add types to payload
    updatePackageList: (state, action: PayloadAction<PackageType[]>) => {
      state.allPackageList = action.payload;
    },

    updateLikePackageList: (state, action: PayloadAction<{ id: string; liked: boolean }>) => {
      state.allPackageList = state.allPackageList.map((pkg) =>
        pkg.id === action.payload.id ? { ...pkg, liked: action.payload.liked } : pkg
      );
    },
  },
});

export const { updatePackageList, updateLikePackageList } = packageSlice.actions;
export default packageSlice.reducer;
