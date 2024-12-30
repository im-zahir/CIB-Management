import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Card, Title, TextInput, Button, DataTable, Portal, Modal, SegmentedButtons, Text } from 'react-native-paper';
import { PieChart, LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;

const EXPENSE_CATEGORIES = [
  'Raw Materials',
  'Salaries',
  'Utilities',
  'Rent',
  'Transportation',
  'Others',
];

// Sample revenue data
const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20000, 45000, 28000, 80000, 99000, 43000],
      color: (opacity = 1) => Colors.primary,
      strokeWidth: 2,
    },
    {
      data: [15000, 35000, 25000, 70000, 85000, 40000], // Expenses line
      color: (opacity = 1) => Colors.secondary,
      strokeWidth: 2,
    }
  ],
  legend: ['Revenue', 'Expenses']
};

export function ExpenseScreen({ navigation }) {
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState('Raw Materials');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sample expense data
  const [expenseData, setExpenseData] = useState([
    { id: 1, date: '2024-01-01', category: 'Raw Materials', description: 'Monthly stock', amount: 3000, status: '' },
    { id: 2, date: '2024-01-02', category: 'Salaries', description: 'Staff salaries', amount: 5000, status: '' },
    { id: 3, date: '2024-01-03', category: 'Utilities', description: 'Electricity bill', amount: 1000, status: '' },
  ]);

  // Calculate data for pie chart
  const calculateChartData = () => {
    const categoryTotals = {};
    expenseData.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const chartColors = [
      Colors.primary,
      Colors.secondary,
      Colors.accent,
      Colors.success,
      Colors.info,
      Colors.warning
    ];

    return Object.entries(categoryTotals).map(([name, amount], index) => ({
      name,
      amount,
      color: chartColors[index % chartColors.length],
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12,
    }));
  };

  const handleAdd = () => {
    const newExpense = {
      id: Date.now(),
      date: date.toISOString().split('T')[0],
      category,
      description,
      amount: parseFloat(amount),
      status: '',
    };
    setExpenseData([newExpense, ...expenseData]);
    setVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setDate(new Date());
    setCategory('Raw Materials');
    setDescription('');
    setAmount('');
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const getTotalExpenses = () => {
    return expenseData.reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalRevenue = () => {
    return revenueData.datasets[0].data[revenueData.datasets[0].data.length - 1];
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.summaryContainer}>
          <Card style={[styles.summaryCard, { flex: 1, marginRight: 8 }]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Revenue</Text>
              <Text style={[styles.summaryAmount, { color: Colors.success }]}>
                ${getTotalRevenue().toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, { flex: 1, marginLeft: 8 }]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryAmount, { color: Colors.error }]}>
                ${getTotalExpenses().toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Revenue vs Expenses</Title>
            <LineChart
              data={revenueData}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                backgroundColor: Colors.surface,
                backgroundGradientFrom: Colors.surface,
                backgroundGradientTo: Colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => Colors.textPrimary,
                labelColor: (opacity = 1) => Colors.textSecondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: Colors.surface
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Expense Breakdown</Title>
            <PieChart
              data={calculateChartData()}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                color: (opacity = 1) => Colors.textPrimary,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          onPress={() => setVisible(true)}
          style={styles.addButton}
          icon="plus"
          buttonColor={Colors.primary}
        >
          Add Expense Record
        </Button>

        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title textStyle={styles.tableHeaderText}>Date</DataTable.Title>
              <DataTable.Title textStyle={styles.tableHeaderText}>Category</DataTable.Title>
              <DataTable.Title numeric textStyle={styles.tableHeaderText}>Amount</DataTable.Title>
            </DataTable.Header>

            {expenseData.map((item) => (
              <DataTable.Row key={item.id}>
                <DataTable.Cell>{item.date}</DataTable.Cell>
                <DataTable.Cell>{item.category}</DataTable.Cell>
                <DataTable.Cell numeric>${item.amount.toLocaleString()}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card>
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Add Expense Record</Title>
          
          <Button 
            onPress={() => setShowDatePicker(true)} 
            mode="outlined" 
            style={styles.input}
            icon="calendar"
            textColor={Colors.primary}
          >
            {date.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              onChange={onDateChange}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            />
          )}

          <SegmentedButtons
            value={category}
            onValueChange={setCategory}
            buttons={EXPENSE_CATEGORIES.map(cat => ({
              value: cat,
              label: cat,
            }))}
            style={styles.segmentedButtons}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            activeOutlineColor={Colors.primary}
          />

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            activeOutlineColor={Colors.primary}
          />

          <View style={styles.buttonContainer}>
            <Button 
              onPress={() => setVisible(false)} 
              style={styles.button}
              mode="outlined"
              textColor={Colors.primary}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleAdd} 
              style={styles.button}
              buttonColor={Colors.primary}
              disabled={!description || !amount}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 12,
    backgroundColor: Colors.surface,
    elevation: Platform.select({
      android: 2,
      default: 0
    }),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    marginVertical: 16,
    borderRadius: 8,
  },
  chartCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    elevation: Platform.select({
      android: 2,
      default: 0
    }),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  chartTitle: {
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  tableCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    elevation: Platform.select({
      android: 2,
      default: 0
    }),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  tableHeader: {
    backgroundColor: Colors.surfaceVariant,
  },
  tableHeaderText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  modal: {
    backgroundColor: Colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    elevation: Platform.select({
      android: 5,
      default: 0
    }),
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  input: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
});
