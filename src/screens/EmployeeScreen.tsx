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
  SegmentedButtons,
  Avatar
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@context/theme';
import { format } from 'date-fns';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';

const screenWidth = Dimensions.get('window').width;

type Employee = {
  id: number;
  name: string;
  position: string;
  department: string;
  joiningDate: string;
  salary: number;
  status: 'active' | 'on-leave' | 'terminated';
  contact: string;
  email: string;
};

const EMPLOYEE_STATUSES = ['active', 'on-leave', 'terminated'] as const;
const DEPARTMENTS = ['Production', 'Sales', 'Marketing', 'HR', 'Finance'] as const;
const POSITIONS = ['Manager', 'Supervisor', 'Staff', 'Operator', 'Assistant'] as const;

export function EmployeeScreen() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState<typeof POSITIONS[number]>('Staff');
  const [department, setDepartment] = useState<typeof DEPARTMENTS[number]>('Production');
  const [joiningDate, setJoiningDate] = useState(new Date());
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<typeof EMPLOYEE_STATUSES[number]>('active');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [chartType, setChartType] = useState('bar');

  const { theme } = useTheme();
  const dispatch = useDispatch();
  // TODO: Replace with actual Redux state
  const [employees, setEmployees] = useState<Employee[]>([
    { 
      id: 1, 
      name: 'John Doe', 
      position: 'Manager', 
      department: 'Production',
      joiningDate: '2024-01-01', 
      salary: 50000,
      status: 'active',
      contact: '+1234567890',
      email: 'john@example.com'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      position: 'Supervisor', 
      department: 'Sales',
      joiningDate: '2024-01-02', 
      salary: 40000,
      status: 'on-leave',
      contact: '+1234567891',
      email: 'jane@example.com'
    },
  ]);

  const showModal = () => {
    setVisible(true);
    setSelectedEmployee(null);
    resetForm();
  };

  const hideModal = () => {
    setVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPosition('Staff');
    setDepartment('Production');
    setJoiningDate(new Date());
    setSalary('');
    setStatus('active');
    setContact('');
    setEmail('');
  };

  const handleSubmit = () => {
    if (!name || !salary || !contact || !email) {
      alert('Please fill in all required fields');
      return;
    }

    const employee: Employee = {
      id: selectedEmployee?.id || Date.now(),
      name,
      position,
      department,
      joiningDate: format(joiningDate, 'yyyy-MM-dd'),
      salary: parseFloat(salary),
      status,
      contact,
      email,
    };

    if (selectedEmployee) {
      setEmployees(employees.map(e => e.id === employee.id ? employee : e));
    } else {
      setEmployees([employee, ...employees]);
    }

    hideModal();
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setName(employee.name);
    setPosition(employee.position as typeof POSITIONS[number]);
    setDepartment(employee.department as typeof DEPARTMENTS[number]);
    setJoiningDate(new Date(employee.joiningDate));
    setSalary(employee.salary.toString());
    setStatus(employee.status);
    setContact(employee.contact);
    setEmail(employee.email);
    setVisible(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  // Calculate chart data for salary distribution by department
  const getChartData = () => {
    const departmentTotals = DEPARTMENTS.map(dept => {
      return employees
        .filter(e => e.department === dept && e.status === 'active')
        .reduce((sum, e) => sum + e.salary, 0);
    });

    return {
      labels: DEPARTMENTS.map(dept => dept.substring(0, 3)),
      datasets: [{
        data: departmentTotals
      }]
    };
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

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return '#2ecc71';
      case 'on-leave':
        return '#f1c40f';
      case 'terminated':
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
              <Title>Total Employees</Title>
              <Text variant="headlineMedium">
                {employees.filter(e => e.status === 'active').length}
              </Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Total Salary</Title>
              <Text variant="headlineMedium">
                ${employees
                  .filter(e => e.status === 'active')
                  .reduce((sum, e) => sum + e.salary, 0)
                  .toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Chart Section */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Salary Distribution by Department</Title>
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
            <Title style={styles.chartTitle}>Employee Status</Title>
            {EMPLOYEE_STATUSES.map(status => {
              const count = employees.filter(e => e.status === status).length;
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
                  <Text variant="bodyLarge">{count}</Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Employee Records Table */}
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Position</DataTable.Title>
              <DataTable.Title>Department</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {employees
              .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
              .map((employee) => (
                <DataTable.Row key={employee.id}>
                  <DataTable.Cell>
                    <View style={styles.nameCell}>
                      <Avatar.Text 
                        size={24} 
                        label={employee.name.split(' ').map(n => n[0]).join('')} 
                      />
                      <Text style={styles.nameText}>{employee.name}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell>{employee.position}</DataTable.Cell>
                  <DataTable.Cell>{employee.department}</DataTable.Cell>
                  <DataTable.Cell>
                    <Text style={{ color: getStatusColor(employee.status), textTransform: 'capitalize' }}>
                      {employee.status}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEdit(employee)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDelete(employee.id)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(employees.length / itemsPerPage)}
              onPageChange={page => setPage(page)}
              label={`${page + 1} of ${Math.ceil(employees.length / itemsPerPage)}`}
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
          <Title>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</Title>

          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <SegmentedButtons
            value={position}
            onValueChange={value => setPosition(value as typeof POSITIONS[number])}
            buttons={POSITIONS.map(pos => ({
              value: pos,
              label: pos,
              style: { flex: 1 }
            }))}
            style={styles.segmentedButtons}
          />

          <SegmentedButtons
            value={department}
            onValueChange={value => setDepartment(value as typeof DEPARTMENTS[number])}
            buttons={DEPARTMENTS.map(dept => ({
              value: dept,
              label: dept,
              style: { flex: 1 }
            }))}
            style={styles.segmentedButtons}
          />

          <TextInput
            label="Joining Date"
            value={format(joiningDate, 'yyyy-MM-dd')}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
            onPressIn={() => setShowDatePicker(true)}
            editable={false}
          />

          {showDatePicker && (
            <DateTimePicker
              value={joiningDate}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setJoiningDate(selectedDate);
                }
              }}
            />
          )}

          <TextInput
            label="Salary"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
          />

          <TextInput
            label="Contact"
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            mode="outlined"
            style={styles.input}
          />

          <SegmentedButtons
            value={status}
            onValueChange={value => setStatus(value as typeof EMPLOYEE_STATUSES[number])}
            buttons={EMPLOYEE_STATUSES.map(s => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
              style: { flex: 1 }
            }))}
            style={styles.segmentedButtons}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            {selectedEmployee ? 'Update' : 'Add'} Employee
          </Button>
        </Modal>
      </Portal>

      {/* FAB for adding new employee */}
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
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    marginLeft: 8,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  segmentedButtons: {
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
