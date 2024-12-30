import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RevenueRecord {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface RevenueState {
  records: RevenueRecord[];
  isLoading: boolean;
  error: string | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
    category: string | null;
    status: string | null;
  };
  statistics: {
    totalRevenue: number;
    pendingRevenue: number;
    completedRevenue: number;
  };
}

const initialState: RevenueState = {
  records: [],
  isLoading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    category: null,
    status: null,
  },
  statistics: {
    totalRevenue: 0,
    pendingRevenue: 0,
    completedRevenue: 0,
  },
};

const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addRecord: (state, action: PayloadAction<RevenueRecord>) => {
      state.records.unshift(action.payload);
      updateStatistics(state);
    },
    updateRecord: (state, action: PayloadAction<RevenueRecord>) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
        updateStatistics(state);
      }
    },
    deleteRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(record => record.id !== action.payload);
      updateStatistics(state);
    },
    setFilters: (state, action: PayloadAction<Partial<RevenueState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

// Helper function to update statistics
function updateStatistics(state: RevenueState) {
  state.statistics.totalRevenue = state.records.reduce((sum, record) => sum + record.amount, 0);
  state.statistics.pendingRevenue = state.records
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  state.statistics.completedRevenue = state.records
    .filter(record => record.status === 'completed')
    .reduce((sum, record) => sum + record.amount, 0);
}

export const {
  setLoading,
  setError,
  addRecord,
  updateRecord,
  deleteRecord,
  setFilters,
  clearFilters,
} = revenueSlice.actions;

export default revenueSlice.reducer;
