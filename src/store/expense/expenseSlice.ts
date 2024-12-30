import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  attachments?: string[];
}

interface ExpenseState {
  records: ExpenseRecord[];
  isLoading: boolean;
  error: string | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
    category: string | null;
    status: string | null;
  };
  statistics: {
    totalExpenses: number;
    pendingExpenses: number;
    completedExpenses: number;
    byCategory: Record<string, number>;
  };
}

const initialState: ExpenseState = {
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
    totalExpenses: 0,
    pendingExpenses: 0,
    completedExpenses: 0,
    byCategory: {},
  },
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addRecord: (state, action: PayloadAction<ExpenseRecord>) => {
      state.records.unshift(action.payload);
      updateStatistics(state);
    },
    updateRecord: (state, action: PayloadAction<ExpenseRecord>) => {
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
    setFilters: (state, action: PayloadAction<Partial<ExpenseState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addAttachment: (state, action: PayloadAction<{ id: string; attachment: string }>) => {
      const record = state.records.find(r => r.id === action.payload.id);
      if (record) {
        if (!record.attachments) {
          record.attachments = [];
        }
        record.attachments.push(action.payload.attachment);
      }
    },
    removeAttachment: (state, action: PayloadAction<{ id: string; attachment: string }>) => {
      const record = state.records.find(r => r.id === action.payload.id);
      if (record && record.attachments) {
        record.attachments = record.attachments.filter(a => a !== action.payload.attachment);
      }
    },
  },
});

// Helper function to update statistics
function updateStatistics(state: ExpenseState) {
  state.statistics.totalExpenses = state.records.reduce((sum, record) => sum + record.amount, 0);
  state.statistics.pendingExpenses = state.records
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  state.statistics.completedExpenses = state.records
    .filter(record => record.status === 'completed')
    .reduce((sum, record) => sum + record.amount, 0);
  
  // Update expenses by category
  state.statistics.byCategory = state.records.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + record.amount;
    return acc;
  }, {} as Record<string, number>);
}

export const {
  setLoading,
  setError,
  addRecord,
  updateRecord,
  deleteRecord,
  setFilters,
  clearFilters,
  addAttachment,
  removeAttachment,
} = expenseSlice.actions;

export default expenseSlice.reducer;
