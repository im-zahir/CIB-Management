import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  TextInput, 
  Button, 
  DataTable, 
  FAB, 
  Portal, 
  Modal, 
  Text,
  IconButton,
  Card,
  Title,
  SegmentedButtons
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@context/theme';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import {
  ProductionRecord,
  addRecord,
  updateRecord,
  deleteRecord,
} from '@store/production/productionSlice';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export function ProductionScreen() {
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | null>(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [chartType, setChartType] = useState('bar');

  const { theme } = useTheme();
  const dispatch = useDispatch();
  const records = useSelector((state: RootState) => state.production.records);

  const showModal = () => {
    setVisible(true);
    setSelectedRecord(null);
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
    setBatchNumber('');
    setSupervisor('');
    setNotes('');
  };

  const handleSubmit = () => {
    if (!product || !quantity || !batchNumber || !supervisor) {
      alert('Please fill in all required fields');
      return;
    }

    const record: ProductionRecord = {
      id: selectedRecord?.id || Date.now(),
      date: format(date, 'yyyy-MM-dd'),
      product,
      quantity: parseInt(quantity),
      batchNumber,
      supervisor,
      notes,
      status: 'completed'
    };

    if (selectedRecord) {
      dispatch(updateRecord(record));
    } else {
      dispatch(addRecord(record));
    }

    hideModal();
  };

  const handleEdit = (record: ProductionRecord) => {
    setSelectedRecord(record);
    setDate(new Date(record.date));
    setProduct(record.product);
    setQuantity(record.quantity.toString());
    setBatchNumber(record.batchNumber);
    setSupervisor(record.supervisor);
    setNotes(record.notes || '');
    setVisible(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      dispatch(deleteRecord(id));
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
          return records
            .filter(r => r.date === date)
            .reduce((sum, r) => sum + r.quantity, 0);
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
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Total Production</Title>
              <Text variant="headlineMedium">
                {records.reduce((sum, r) => sum + r.quantity, 0)} units
              </Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Today's Production</Title>
              <Text variant="headlineMedium">
                {records
                  .filter(r => r.date === format(new Date(), 'yyyy-MM-dd'))
                  .reduce((sum, r) => sum + r.quantity, 0)} units
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Chart Section */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Production Trend</Title>
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
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
              />
            ) : (
              <LineChart
                data={getChartData()}
                width={screenWidth - 48}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
              />
            )}
          </Card.Content>
        </Card>

        {/* Production Records Table */}
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Date</DataTable.Title>
              <DataTable.Title>Product</DataTable.Title>
              <DataTable.Title numeric>Quantity</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {records
              .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
              .map((record) => (
                <DataTable.Row key={record.id}>
                  <DataTable.Cell>{format(new Date(record.date), 'MM/dd/yyyy')}</DataTable.Cell>
                  <DataTable.Cell>{record.product}</DataTable.Cell>
                  <DataTable.Cell numeric>{record.quantity}</DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEdit(record)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDelete(record.id)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(records.length / itemsPerPage)}
              onPageChange={page => setPage(page)}
              label={`${page + 1} of ${Math.ceil(records.length / itemsPerPage)}`}
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
          <Title>{selectedRecord ? 'Edit Production Record' : 'Add Production Record'}</Title>

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
            label="Batch Number"
            value={batchNumber}
            onChangeText={setBatchNumber}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Supervisor"
            value={supervisor}
            onChangeText={setSupervisor}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            {selectedRecord ? 'Update' : 'Add'} Record
          </Button>
        </Modal>
      </Portal>

      {/* FAB for adding new record */}
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
