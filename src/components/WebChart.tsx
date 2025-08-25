import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WebChartProps {
  data: number[];
  labels: string[];
  title?: string;
  height?: number;
  width?: number;
  color?: string;
}

const WebChart: React.FC<WebChartProps> = ({ 
  data, 
  labels, 
  title = 'Chart', 
  height = 200, 
  width = 300,
  color = '#4ECDC4'
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {data.map((value, index) => {
          const percentage = range > 0 ? ((value - minValue) / range) * 100 : 0;
          const barHeight = (percentage / 100) * (height - 80);
          
          return (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: Math.max(barHeight, 4), 
                    backgroundColor: color 
                  }
                ]} 
              />
              <Text style={styles.label}>{labels[index]}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
    color: '#666',
  },
});

export default WebChart;
