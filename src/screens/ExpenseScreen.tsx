import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { 
  Card, 
  Title, 
  TextInput, 
  Button, 
  DataTable, 
  Portal, 
  Modal, 
  Text,
  FAB,
  IconButton,
  SegmentedButtons 
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@context/theme';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type Expense = {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  status: string;
};

const EXPENSE_CATEGORIES = [
  'Raw Materials',
  'Salaries',
  'Utilities',
  'Rent',
  'Transportation',
  'Others',
];

export function ExpenseScreen() {
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('Raw Materials');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [chartType, setChartType] = useState('bar');

  const { theme } = useTheme();
  const dispatch = useDispatch();
  // TODO: Replace with actual Redux state
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, date: '2024-01-01', category: 'Raw Materials', description: 'Monthly stock', amount: 3000, status: 'paid' },
    { id: 2, date: '2024-01-02', category: 'Salaries', description: 'Staff salaries', amount: 5000, status: 'paid' },
    { id: 3, date: '2024-01-03', category: 'Utilities', description: 'Electricity bill', amount: 1000, status: 'pending' },
  ]);

  const showModal = () => {
    setVisible(true);
    setSelectedExpense(null);
    resetForm();
  };

  const hideModal = () => {
    setVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setDate(new Date());
    setCategory('Raw Materials');
    setDescription('');
    setAmount('');
  };

  const handleSubmit = () => {
    if (!category || !amount) {
      alert('Please fill in all required fields');
      return;
    }

    const expense: Expense = {
      id: selectedExpense?.id || Date.now(),
      date: format(date, 'yyyy-MM-dd'),
      category,
      amount: parseFloat(amount),
      description,
      status: 'pending',
    };

    if (selectedExpense) {
      setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
    } else {
      setExpenses([expense, ...expenses]);
    }

    hideModal();
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDate(new Date(expense.date));
    setCategory(expense.category);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setVisible(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Calculate chart data
  const getChartData = () => {
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    const data = {
      labels: lastSevenDays.map(date => format(new Date(date), 'MM/dd')),
      datasets: [{
        data: lastSevenDays.map(date => {
          return expenses
            .filter(e => e.date === date)
            .reduce((sum, e) => sum + e.amount, 0);
        })
      }]
    };

    return data;
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 66, 66, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  const getCategoryTotal = (category: string) => {
    return expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Total Expenses</Title>
              <Text variant="headlineMedium">
                ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Today's Expenses</Title>
              <Text variant="headlineMedium">
                ${expenses
                  .filter(e => e.date === format(new Date(), 'yyyy-MM-dd'))
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Chart Section */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Expense Trend</Title>
            <SegmentedButtons
              value={chartType}
              onValueChange={setChartType}
              buttons={[
                { value: 'bar', label: 'Bar' },
                { value: 'line', label: 'Line' }
              ]}
              style={styles.chartToggle}
            />
            {chartType === 'bar' ? (
              <BarChart
                data={getChartData()}
                width={screenWidth - 48}
                height={220}
                yAxisLabel="$"
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.chart}
              />
            ) : (
              <LineChart
                data={getChartData()}
                width={screenWidth - 48}
                height={220}
                yAxisLabel="$"
                chartConfig={chartConfig}
                style={styles.chart}
              />
            )}
          </Card.Content>
        </Card>

        {/* Category Breakdown */}
        <Card style={styles.categoryCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Category Breakdown</Title>
            {EXPENSE_CATEGORIES.map(category => (
              <View key={category} style={styles.categoryRow}>
                <Text variant="bodyLarge">{category}</Text>
                <Text variant="bodyLarge">${getCategoryTotal(category).toLocaleString()}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Expense Records Table */}
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Date</DataTable.Title>
              <DataTable.Title>Category</DataTable.Title>
              <DataTable.Title numeric>Amount</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {expenses
              .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
              .map((expense) => (
                <DataTable.Row key={expense.id}>
                  <DataTable.Cell>{format(new Date(expense.date), 'MM/dd/yyyy')}</DataTable.Cell>
                  <DataTable.Cell>{expense.category}</DataTable.Cell>
                  <DataTable.Cell numeric>${expense.amount.toLocaleString()}</DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEdit(expense)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDelete(expense.id)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(expenses.length / itemsPerPage)}
              onPageChange={page => setPage(page)}
              label={`${page + 1} of ${Math.ceil(expenses.length / itemsPerPage)}`}
            />
          </DataTable>
        </Card>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Title>{selectedExpense ? 'Edit Expense' : 'Add Expense'}</Title>

          <TextInput
            label="Date"
            value={format(date, 'yyyy-MM-dd')}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
            onPressIn={() => setShowDatePicker(true)}
            editable={false}
          />

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}

          <TextInput
            label="Category"
            value={category}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon 
                icon="menu-down" 
                onPress={() => {
                  // TODO: Add category selection modal or dropdown
                }}
              />
            }
          />

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            {selectedExpense ? 'Update' : 'Add'} Expense
          </Button>
        </Modal>
      </Portal>

      {/* FAB for adding new expense */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={showModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  chartCard: {
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 16,
  },
  chartTitle: {
    marginBottom: 8,
  },
  chartToggle: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCard: {
    marginBottom: 16,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
