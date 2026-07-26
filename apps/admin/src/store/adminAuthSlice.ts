import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminUser {
    id: string;
    user: {
        name: string;
        email: string;
        exp: number;
    };
    role: string;
    isLoggedIn: boolean;
}

const initialState: AdminUser = {
    id: '',
    user: {
        name: '',
        email: '',
        exp: 0,
    },
    role: '',
    isLoggedIn: false,
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        setAdminUser(state, action: PayloadAction<AdminUser>) {
            return action.payload;
        },
        logoutAdminUser() {
            return initialState;
        },
    },
});

export const { setAdminUser, logoutAdminUser } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
