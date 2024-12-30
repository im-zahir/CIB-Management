import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Button, Portal, Modal, SegmentedButtons, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type ReportsScreenProps = NativeStackScreenProps<any, 'Reports'>;

export function ReportsScreen({ navigation }: ReportsScreenProps) {
  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [category, setCategory] = useState('all');

  // Get data from Redux store
  const revenues = useSelector(state => state.revenue.revenues);
  const expenses = useSelector(state => state.expense.expenses);
  const employees = useSelector(state => state.employee.employees);
  const productions = useSelector(state => state.production.productions);

  const generateHTML = (data: any[]) => {
    let html = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
          <p>From: ${startDate.toLocaleDateString()} To: ${endDate.toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
    `;

    // Add headers based on report type
    switch (reportType) {
      case 'revenue':
        html += '<th>Date</th><th>Product</th><th>Amount</th><th>Status</th>';
        break;
      case 'expense':
        html += '<th>Date</th><th>Category</th><th>Amount</th><th>Description</th>';
        break;
      case 'employee':
        html += '<th>Name</th><th>Designation</th><th>Salary</th><th>Joining Date</th>';
        break;
      case 'production':
        html += '<th>Date</th><th>Product</th><th>Quantity</th>';
        break;
    }

    html += '</tr></thead><tbody>';

    // Add data rows
    data.forEach(item => {
      html += '<tr>';
      switch (reportType) {
        case 'revenue':
          html += `
            <td>${item.date}</td>
            <td>${item.product}</td>
            <td>$${item.amount}</td>
            <td>${item.status}</td>
          `;
          break;
        case 'expense':
          html += `
            <td>${item.date}</td>
            <td>${item.category}</td>
            <td>$${item.amount}</td>
            <td>${item.description}</td>
          `;
          break;
        case 'employee':
          html += `
            <td>${item.name}</td>
            <td>${item.designation}</td>
            <td>$${item.salary}</td>
            <td>${item.joiningDate}</td>
          `;
          break;
        case 'production':
          html += `
            <td>${item.date}</td>
            <td>${item.product}</td>
            <td>${item.quantity}</td>
          `;
          break;
      }
      html += '</tr>';
    });

    html += '</tbody></table></body></html>';
    return html;
  };

  const getFilteredData = () => {
    const start = startDate.getTime();
    const end = endDate.getTime();

    switch (reportType) {
      case 'revenue':
        return revenues.filter(item => {
          const itemDate = new Date(item.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      case 'expense':
        return expenses.filter(item => {
          const itemDate = new Date(item.date).getTime();
          return itemDate >= start && itemDate <= end &&
                 (category === 'all' || item.category === category);
        });
      case 'employee':
        return employees;
      case 'production':
        return productions.filter(item => {
          const itemDate = new Date(item.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      default:
        return [];
    }
  };

  const generatePDF = async () => {
    try {
      const filteredData = getFilteredData();
      const html = generateHTML(filteredData);
      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const generateExcel = async () => {
    try {
      const filteredData = getFilteredData();
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      const fileName = `${reportType}_report_${new Date().getTime()}.xlsx`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      await shareAsync(filePath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        UTI: 'com.microsoft.excel.xlsx'
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Generate Reports</Title>
            
            <SegmentedButtons
              value={reportType}
              onValueChange={setReportType}
              buttons={[
                { value: 'revenue', label: 'Revenue' },
                { value: 'expense', label: 'Expense' },
                { value: 'employee', label: 'Employee' },
                { value: 'production', label: 'Production' },
              ]}
              style={styles.segmentedButtons}
            />

            <Button
              mode="outlined"
              onPress={() => setFilterModalVisible(true)}
              style={styles.filterButton}
            >
              Set Filters
            </Button>

            <View style={styles.exportButtons}>
              <Button
                mode="contained"
                onPress={generatePDF}
                style={styles.exportButton}
              >
                Export as PDF
              </Button>
              
              <Button
                mode="contained"
                onPress={generateExcel}
                style={styles.exportButton}
              >
                Export as Excel
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Set Filters</Title>

          <Button
            mode="outlined"
            onPress={() => setShowStartDatePicker(true)}
            style={styles.dateButton}
          >
            Start Date: {startDate.toLocaleDateString()}
          </Button>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              onChange={(event, date) => {
                setShowStartDatePicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}

          <Button
            mode="outlined"
            onPress={() => setShowEndDatePicker(true)}
            style={styles.dateButton}
          >
            End Date: {endDate.toLocaleDateString()}
          </Button>

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              onChange={(event, date) => {
                setShowEndDatePicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}

          {reportType === 'expense' && (
            <TextInput
              label="Category"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              style={styles.input}
            />
          )}

          <Button
            mode="contained"
            onPress={() => setFilterModalVisible(false)}
            style={styles.applyButton}
          >
            Apply Filters
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  segmentedButtons: {
    marginVertical: 10,
  },
  filterButton: {
    marginVertical: 10,
  },
  exportButtons: {
    marginTop: 20,
  },
  exportButton: {
    marginVertical: 5,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  dateButton: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  applyButton: {
    marginTop: 10,
  },
});
