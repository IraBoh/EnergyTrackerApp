import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [loading, setLoading] = useState(false);

  // Load previously selected activities from AsyncStorage
  useEffect(() => {
    const loadSelectedActivities = async () => {
      try {
        const saved = await AsyncStorage.getItem('selectedActivities');
        if (saved) {
          setSelectedActivities(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load saved selections', error);
      }
    };
    loadSelectedActivities();
  }, []);

  const handleToggle = async (item: ContraProActivityObject) => {
    const id = item.drainActivity?._id || item.boostActivity?._id;
    if (!id) return;

    setLoading(true);

    const isSelected = selectedActivities.includes(id);
    const newSelected = isSelected
      ? selectedActivities.filter(existingId => existingId !== id)
      : [...selectedActivities, id];

    setSelectedActivities(newSelected);

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('selectedActivities', JSON.stringify(newSelected));

      if (!isSelected) {
        // POST to backend
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
        // DELETE from backend
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
      setLoading(false);
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
        <Text style={styles.cardDetail}>Positive aspect: {item.boostActivity?.name ?? '-'}</Text>
        <Text style={styles.cardDetail}>Boost: {item.boostActivity?.percentage ?? '-'}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>✨ YOUR CUSTOM ACTIVITIES</Text>
      <Text style={styles.sectionSubtext}>Add activities to your current plan by toggling the switch.</Text>
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
