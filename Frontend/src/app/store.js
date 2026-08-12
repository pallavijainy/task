import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/authApi";
import { attendanceApi } from "../features/attendance/attendanceApi";
import { overtimeApi } from "../features/overtime/overtimeApi";
import { userApi } from "../features/user/userApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    [authApi.reducerPath]: authApi.reducer,

    [attendanceApi.reducerPath]: attendanceApi.reducer,

    [overtimeApi.reducerPath]: overtimeApi.reducer,

    [userApi.reducerPath]: userApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(attendanceApi.middleware)
      .concat(overtimeApi.middleware)
      .concat(userApi.middleware),
});
