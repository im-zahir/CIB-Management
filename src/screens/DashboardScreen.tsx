import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Card, Title, Text, Button, Surface } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

const screenWidth = Dimensions.get('window').width;

export function DashboardScreen() {
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43],
      color: () => Colors.primary,
      strokeWidth: 2
    }],
  };

  const expenseData = [
    {
      name: 'Raw Materials',
      population: 45,
      color: Colors.chart.blue,
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Salaries',
      population: 30,
      color: Colors.chart.purple,
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Utilities',
      population: 25,
      color: Colors.chart.orange,
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12,
    },
  ];

  const MetricCard = ({ title, value, icon, color, trend }) => (
    <Surface style={[styles.metricCard, { elevation: 1 }]}>
      <View style={styles.metricHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={[styles.trendText, { color: trend >= 0 ? Colors.success : Colors.error }]}>
          {trend >= 0 ? '+' : ''}{trend}%
        </Text>
      </View>
      <Title style={styles.metricValue}>{value}</Title>
      <Text style={styles.metricTitle}>{title}</Text>
    </Surface>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Revenue"
          value="$150,000"
          icon="cash-multiple"
          color={Colors.primary}
          trend={12}
        />
        <MetricCard
          title="Total Expenses"
          value="$80,000"
          icon="cash-minus"
          color={Colors.warning}
          trend={-5}
        />
        <MetricCard
          title="Net Profit"
          value="$70,000"
          icon="chart-line"
          color={Colors.success}
          trend={8}
        />
        <MetricCard
          title="Outstanding"
          value="$15,000"
          icon="clock-outline"
          color={Colors.error}
          trend={-2}
        />
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Title style={styles.chartTitle}>Revenue Trends</Title>
            <MaterialCommunityIcons name="trending-up" size={24} color={Colors.primary} />
          </View>
          <LineChart
            data={revenueData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: Colors.surface,
              backgroundGradientFrom: Colors.surface,
              backgroundGradientTo: Colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => Colors.primary,
              labelColor: () => Colors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: Colors.surface,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Title style={styles.chartTitle}>Expense Breakdown</Title>
            <MaterialCommunityIcons name="chart-pie" size={24} color={Colors.secondary} />
          </View>
          <PieChart
            data={expenseData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              color: (opacity = 1) => Colors.textPrimary,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
          />
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        <Button
          mode="contained"
          style={styles.actionButton}
          icon="plus-circle-outline"
          onPress={() => router.push('/(tabs)/production')}
        >
          Add Production
        </Button>
        <Button
          mode="contained"
          style={styles.actionButton}
          icon="cash-plus"
          onPress={() => router.push('/(tabs)/revenue')}
        >
          Add Revenue
        </Button>
        <Button
          mode="contained"
          style={styles.actionButton}
          icon="cash-minus"
          onPress={() => router.push('/(tabs)/expenses')}
        >
          Add Expense
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  metricCard: {
    width: (screenWidth - 48) / 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    elevation: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  quickActions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
});
