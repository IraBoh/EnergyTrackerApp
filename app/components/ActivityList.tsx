import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

// Define the types for drain and boost activities
interface DrainActivity {
  _id: string;
  name: string;
  percentage: number;
}

interface BoostActivity {
  _id: string;
  name: string;
  percentage: number;
}

// Define the type for the activity object
interface contraProActivityObject {
  drainActivity?: DrainActivity;
  boostActivity?: BoostActivity;
}

// Update the props to include the activities array
interface ActivityListProps {
  contraProActivities: contraProActivityObject[];
}

const ActivityList: React.FC<ActivityListProps> = ({ contraProActivities }) => {
  const [activitiesState, setActivitiesState] = useState<contraProActivityObject[]>([]);

  // Function to calculate totals
  const calculateTotals = () => {
    let totalDrains = 0;
    let totalBoosts = 0;

    contraProActivities.forEach(activity => {
      if (activity.drainActivity) {
        totalDrains += activity.drainActivity.percentage;
      }
      if (activity.boostActivity) {
        totalBoosts += activity.boostActivity.percentage;
      }
    });

    const netEnergy = totalBoosts - totalDrains;

    return { totalDrains, totalBoosts, netEnergy };
  };

  const { totalDrains, totalBoosts, netEnergy } = calculateTotals();

  const renderItem = ({ item }: { item: contraProActivityObject }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.drainActivity?.name}</Text>
      <Text style={styles.cell}>{item.drainActivity?.percentage}%</Text>
      <Text style={styles.cell}>{item.boostActivity?.name}</Text>
      <Text style={styles.cell}>{item.boostActivity?.percentage}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Activity</Text>
        <Text style={styles.headerCell}>Drain %</Text>
        <Text style={styles.headerCell}>Positive Reflection</Text>
        <Text style={styles.headerCell}>Boost %</Text>
      </View>
      <FlatList
        data={contraProActivities}
        keyExtractor={(item) => item.drainActivity?._id || item.boostActivity?._id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.totalsContainer}>
        <Text style={styles.totalText}>Total Drains: {totalDrains}%</Text>
        <Text style={styles.totalText}>Total Boosts: {totalBoosts}%</Text>
        <Text style={styles.totalText}>Net Energy: {netEnergy}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    flexGrow: 1,
    minHeight: 300,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  listContainer: {
    paddingBottom: 50,
  },
  totalsContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginBottom: 0,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ActivityList;
