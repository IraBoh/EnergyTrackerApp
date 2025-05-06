import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert } from 'react-native';

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
interface ContraProActivityObject {
  drainActivity?: DrainActivity;
  boostActivity?: BoostActivity;
}

// Props
interface ActivityListProps {
  contraProActivities: ContraProActivityObject[];
}

const ActivityList: React.FC<ActivityListProps> = ({ contraProActivities }) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activityIdMap, setActivityIdMap] = useState<{ [key: string]: string }>({});


  const calculateTotals = () => {
    let totalDrains = 0;
    let totalBoosts = 0;

    contraProActivities.forEach((activity) => {
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

  const handleToggle = async (item: ContraProActivityObject) => {
    const id = item.drainActivity?._id || item.boostActivity?._id;
    if (!id) return;

  
    const isSelected = selectedActivities.includes(id);
    const newSelected = isSelected
        ? selectedActivities.filter(existingId => existingId !== id)
        : [...selectedActivities, id];

    setSelectedActivities(newSelected);

    if (!isSelected) {
        // If the item is being toggled on, save it
        try {
            const response = await fetch('http://192.168.1.138:5000/todays-activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });

            if (!response.ok) throw new Error('Failed to save activity');

            const data = await response.json();
            console.log('data', data);
            const savedId = data.activity._id;
            setActivityIdMap(prev => ({ ...prev, [id]: savedId }));
        

            Alert.alert('Success', data.message);
        } catch (error) {
            console.error('Error saving activity:', error);
            Alert.alert('Error', 'Failed to save activity');
        }
    } else {
      const savedId = activityIdMap[id]; // get the saved _id for this activity

      console.log('Deleting activity:', id);

      if (!savedId) {
        Alert.alert('Error', 'Activity not found');
        return;
      }

      // If the item is being toggled off, delete it
      try {
          const response = await fetch(`http://192.168.1.138:5000/todays-activities/${savedId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete activity ');

            const data = await response.json();
            Alert.alert('Success', data.message);
        } catch (error) {
            console.error('Error deleting activity:', error);
            Alert.alert('Error', 'Failed to delete activity FE');
        }
    }
  };

  const renderItem = ({ item }: { item: ContraProActivityObject }) => {
    const id = item.drainActivity?._id || item.boostActivity?._id || '';
    const isSelected = selectedActivities.includes(id);

   

    return (
      <View style={styles.row}>
        <Switch value={isSelected} onValueChange={() => handleToggle(item)} />
        <Text style={styles.cell}>{item.drainActivity?.name || '-'}</Text>
        <Text style={styles.cell}>{item.drainActivity?.percentage ?? '-'}%</Text>
        <Text style={styles.cell}>{item.boostActivity?.name || '-'}</Text>
        <Text style={styles.cell}>{item.boostActivity?.percentage ?? '-'}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Toggle</Text>
        <Text style={styles.headerCell}>Activity</Text>
        <Text style={styles.headerCell}>Drain %</Text>
        <Text style={styles.headerCell}>Positive Reflection</Text>
        <Text style={styles.headerCell}>Boost %</Text>
      </View>
      <FlatList
        data={contraProActivities}
        keyExtractor={(item) =>
          item.drainActivity?._id || item.boostActivity?._id || Math.random().toString()
        }
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
    alignItems: 'center',
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
