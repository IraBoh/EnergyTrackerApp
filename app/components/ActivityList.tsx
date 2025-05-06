import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface ContraProActivityObject {
  drainActivity?: DrainActivity;
  boostActivity?: BoostActivity;
}

interface ActivityListProps {
  contraProActivities: ContraProActivityObject[];
}

const ActivityList: React.FC<ActivityListProps> = ({ contraProActivities }) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activityIdMap, setActivityIdMap] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

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
      await AsyncStorage.setItem('selectedActivities', JSON.stringify(newSelected));

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
        <View style={styles.infoRow}>
          <Text style={[styles.percentText, styles.drain]}>
            -{item.drainActivity?.percentage ?? 0}%
          </Text>
          <Text style={[styles.percentText, styles.boost]}>
            +{item.boostActivity?.percentage ?? 0}%
          </Text>
        </View>
        {item.boostActivity?.name && (
          <Text style={styles.tip}>Positive Aspect: {item.boostActivity.name}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Your Custom Activities</Text>
      <Text style={styles.subtitle}>
        Toggle activities to include them in your daily plan.
      </Text>
      <FlatList
        data={contraProActivities}
        keyExtractor={(item) =>
          item.drainActivity?._id || item.boostActivity?._id || Math.random().toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F7FA',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentText: {
    fontSize: 15,
    fontWeight: '500',
  },
  drain: {
    color: '#D9534F',
  },
  boost: {
    color: '#5CB85C',
  },
  tip: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});

export default ActivityList;

