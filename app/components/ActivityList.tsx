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
  const [loading, setLoading] = useState(false); // Loading state

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

    setLoading(true); // Start loading

    const isSelected = selectedActivities.includes(id);
    const newSelected = isSelected
      ? selectedActivities.filter(existingId => existingId !== id)
      : [...selectedActivities, id];

    setSelectedActivities(newSelected);

    try {
      if (!isSelected) {
        const response = await fetch('http://192.168.1.138:5000/todays-activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (!response.ok) throw new Error('Failed to save activity');

        const data = await response.json();
        const savedId = data.activity._id;
        setActivityIdMap(prev => ({ ...prev, [id]: savedId }));

        Alert.alert('Success', data.message);
      } else {
        const savedId = activityIdMap[id];
        if (!savedId) {
          Alert.alert('Error', 'Activity not found');
          return;
        }

        const response = await fetch(`http://192.168.1.138:5000/todays-activities/${savedId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete activity');

        const data = await response.json();
        Alert.alert('Success', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const renderItem = ({ item }: { item: ContraProActivityObject }) => {
    const id = item.drainActivity?._id || item.boostActivity?._id || '';
    const isSelected = selectedActivities.includes(id);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {item.drainActivity?.name || item.boostActivity?.name || 'Unnamed Activity'}
          </Text>
          <Switch value={isSelected} onValueChange={() => handleToggle(item)} />
        </View>
        <Text style={styles.cardDetail}>Drain: {item.drainActivity?.percentage ?? '-'}%</Text>
        <Text style={styles.cardDetail}>Positive aspect: {item.boostActivity?.name}</Text>
        <Text style={styles.cardDetail}>Boost: {item.boostActivity?.percentage ?? '-'}% </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.sectionTitle}>✨ YOUR CUSTOM ACTIVITIES </Text>
      <Text style={styles.sectionSubtext}>Add activities to your current plan by clicking the "Select" button.</Text>
      <Text style={styles.sectionSubtext}>We'll analyze them to determine their impact on your well-being.</Text>

      <FlatList
        data={contraProActivities}
        keyExtractor={(item) =>
          item.drainActivity?._id || item.boostActivity?._id || Math.random().toString()
        }
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtext: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDetail: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
});

export default ActivityList;
