import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import productionReducer from './production/productionSlice';
import revenueReducer from './revenue/revenueSlice';
import expenseReducer from './expense/expenseSlice';
import employeeReducer from './employee/employeeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    production: productionReducer,
    revenue: revenueReducer,
    expense: expenseReducer,
    employee: employeeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
