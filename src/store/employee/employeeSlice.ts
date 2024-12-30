import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'onLeave';
  role: 'admin' | 'manager' | 'employee';
}

interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  filters: {
    department: string | null;
    status: string | null;
    role: string | null;
  };
  statistics: {
    totalEmployees: number;
    activeEmployees: number;
    totalSalary: number;
    byDepartment: Record<string, number>;
  };
}

const initialState: EmployeeState = {
  employees: [],
  isLoading: false,
  error: null,
  filters: {
    department: null,
    status: null,
    role: null,
  },
  statistics: {
    totalEmployees: 0,
    activeEmployees: 0,
    totalSalary: 0,
    byDepartment: {},
  },
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
      updateStatistics(state);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
        updateStatistics(state);
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
      updateStatistics(state);
    },
    setEmployeeStatus: (state, action: PayloadAction<{ id: string; status: Employee['status'] }>) => {
      const employee = state.employees.find(emp => emp.id === action.payload.id);
      if (employee) {
        employee.status = action.payload.status;
        updateStatistics(state);
      }
    },
    setFilters: (state, action: PayloadAction<Partial<EmployeeState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateSalary: (state, action: PayloadAction<{ id: string; salary: number }>) => {
      const employee = state.employees.find(emp => emp.id === action.payload.id);
      if (employee) {
        employee.salary = action.payload.salary;
        updateStatistics(state);
      }
    },
  },
});

// Helper function to update statistics
function updateStatistics(state: EmployeeState) {
  state.statistics.totalEmployees = state.employees.length;
  state.statistics.activeEmployees = state.employees.filter(emp => emp.status === 'active').length;
  state.statistics.totalSalary = state.employees.reduce((sum, emp) => sum + emp.salary, 0);
  
  // Update employees by department
  state.statistics.byDepartment = state.employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export const {
  setLoading,
  setError,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setEmployeeStatus,
  setFilters,
  clearFilters,
  updateSalary,
} = employeeSlice.actions;

export default employeeSlice.reducer;
