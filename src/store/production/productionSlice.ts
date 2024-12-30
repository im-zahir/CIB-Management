import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProductionRecord {
  id: string;
  date: string;
  product: string;
  quantity: number;
  batchNumber: string;
  supervisor: string;
  notes?: string;
}

interface ProductionState {
  records: ProductionRecord[];
  isLoading: boolean;
  error: string | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
    product: string | null;
  };
}

const initialState: ProductionState = {
  records: [],
  isLoading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    product: null,
  },
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addRecord: (state, action: PayloadAction<ProductionRecord>) => {
      state.records.unshift(action.payload);
    },
    updateRecord: (state, action: PayloadAction<ProductionRecord>) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    deleteRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(record => record.id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<ProductionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setLoading,
  setError,
  addRecord,
  updateRecord,
  deleteRecord,
  setFilters,
  clearFilters,
} = productionSlice.actions;

export default productionSlice.reducer;
