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
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';

const screenWidth = Dimensions.get('window').width;

type Revenue = {
  id: number;
  date: string;
  product: string;
  quantity: number;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
};

const PAYMENT_STATUSES = ['paid', 'pending', 'overdue'] as const;

export function RevenueScreen() {
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<typeof PAYMENT_STATUSES[number]>('pending');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [chartType, setChartType] = useState('bar');

  const { theme } = useTheme();
  const dispatch = useDispatch();
  // TODO: Replace with actual Redux state
  const [revenues, setRevenues] = useState<Revenue[]>([
    { id: 1, date: '2024-01-01', product: 'Product A', quantity: 100, amount: 5000, status: 'paid' },
    { id: 2, date: '2024-01-02', product: 'Product B', quantity: 150, amount: 7500, status: 'pending' },
    { id: 3, date: '2024-01-03', product: 'Product C', quantity: 80, amount: 4000, status: 'overdue' },
  ]);

  const showModal = () => {
    setVisible(true);
    setSelectedRevenue(null);
    resetForm();
  };

  const hideModal = () => {
    setVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setDate(new Date());
    setProduct('');
    setQuantity('');
    setAmount('');
    setStatus('pending');
  };

  const handleSubmit = () => {
    if (!product || !quantity || !amount) {
      alert('Please fill in all required fields');
      return;
    }

    const revenue: Revenue = {
      id: selectedRevenue?.id || Date.now(),
      date: format(date, 'yyyy-MM-dd'),
      product,
      quantity: parseInt(quantity),
      amount: parseFloat(amount),
      status,
    };

    if (selectedRevenue) {
      setRevenues(revenues.map(r => r.id === revenue.id ? revenue : r));
    } else {
      setRevenues([revenue, ...revenues]);
    }

    hideModal();
  };

  const handleEdit = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setDate(new Date(revenue.date));
    setProduct(revenue.product);
    setQuantity(revenue.quantity.toString());
    setAmount(revenue.amount.toString());
    setStatus(revenue.status);
    setVisible(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this revenue record?')) {
      setRevenues(revenues.filter(r => r.id !== id));
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
          return revenues
            .filter(r => r.date === date)
            .reduce((sum, r) => sum + r.amount, 0);
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
    color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  const getStatusColor = (status: Revenue['status']) => {
    switch (status) {
      case 'paid':
        return '#2ecc71';
      case 'pending':
        return '#f1c40f';
      case 'overdue':
        return '#e74c3c';
      default:
        return theme.colors.text;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Total Revenue</Title>
              <Text variant="headlineMedium">
                ${revenues.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Today's Revenue</Title>
              <Text variant="headlineMedium">
                ${revenues
                  .filter(r => r.date === format(new Date(), 'yyyy-MM-dd'))
                  .reduce((sum, r) => sum + r.amount, 0)
                  .toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Chart Section */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Revenue Trend</Title>
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

        {/* Status Summary */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Payment Status</Title>
            {PAYMENT_STATUSES.map(status => {
              const total = revenues
                .filter(r => r.status === status)
                .reduce((sum, r) => sum + r.amount, 0);
              return (
                <View key={status} style={styles.statusRow}>
                  <View style={styles.statusLabelContainer}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(status) }
                      ]} 
                    />
                    <Text variant="bodyLarge" style={{ textTransform: 'capitalize' }}>
                      {status}
                    </Text>
                  </View>
                  <Text variant="bodyLarge">${total.toLocaleString()}</Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Revenue Records Table */}
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Date</DataTable.Title>
              <DataTable.Title>Product</DataTable.Title>
              <DataTable.Title numeric>Amount</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {revenues
              .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
              .map((revenue) => (
                <DataTable.Row key={revenue.id}>
                  <DataTable.Cell>{format(new Date(revenue.date), 'MM/dd/yyyy')}</DataTable.Cell>
                  <DataTable.Cell>{revenue.product}</DataTable.Cell>
                  <DataTable.Cell numeric>${revenue.amount.toLocaleString()}</DataTable.Cell>
                  <DataTable.Cell>
                    <Text style={{ color: getStatusColor(revenue.status), textTransform: 'capitalize' }}>
                      {revenue.status}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEdit(revenue)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDelete(revenue.id)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(revenues.length / itemsPerPage)}
              onPageChange={page => setPage(page)}
              label={`${page + 1} of ${Math.ceil(revenues.length / itemsPerPage)}`}
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
          <Title>{selectedRevenue ? 'Edit Revenue' : 'Add Revenue'}</Title>

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
            label="Product"
            value={product}
            onChangeText={setProduct}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
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

          <SegmentedButtons
            value={status}
            onValueChange={value => setStatus(value as typeof PAYMENT_STATUSES[number])}
            buttons={PAYMENT_STATUSES.map(s => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
              style: { flex: 1 }
            }))}
            style={styles.statusButtons}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            {selectedRevenue ? 'Update' : 'Add'} Revenue
          </Button>
        </Modal>
      </Portal>

      {/* FAB for adding new revenue */}
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
  statusCard: {
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
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
  statusButtons: {
    marginBottom: 16,
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
