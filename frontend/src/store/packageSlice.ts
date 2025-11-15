import { createSlice } from "@reduxjs/toolkit";

const packageSlice = createSlice({
  name: "packageReducer",
  initialState: {
    allPackageList: [],
  },
  reducers: {
    updatePackageList: (state, { payload }) => {
      return {
        ...state,
        allPackageList: payload,
      };
    },
  },
});

export const { updatePackageList } = packageSlice.actions;
export default packageSlice.reducer;
