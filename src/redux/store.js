import { configureStore } from "@reduxjs/toolkit";
import studentReducer from "./slices/studentSlice";

export const store = configureStore({
    reducer: {
        students: studentReducer,
    },
});
