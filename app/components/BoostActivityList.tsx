import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';

interface BoostOnlyActivity {
  _id: string;
  boostActivity: {
    name: string;
    percentage: number;
  };
}

interface BoostActivityListProps{
    refreshBoostList: boolean;
}

const BoostActivityList: React.FC<BoostActivityListProps> = ({refreshBoostList}) => {
  const [boostActivities, setBoostActivities] = useState<BoostOnlyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoostActivities = async () => {
      try {
        const response = await fetch('http://192.168.1.138:5000/saved-todays-only-boost');
        const data = await response.json();
        console.log('Boost Activities:', data);
        setBoostActivities(data);
      } catch (error) {
        console.error('Error fetching boost activities:', error);
        Alert.alert('Error', 'Could not load today\'s boost activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoostActivities();
  }, [refreshBoostList]);

  const totalBoost = boostActivities.reduce((sum, activity) => sum + (activity.boostActivity?.percentage || 0), 0);

  const renderItem = ({ item }: { item: BoostOnlyActivity }) => (
    <View style={styles.card}>
      <Text style={styles.activityName}>{item.boostActivity.name}</Text>
      <Text style={[styles.percentText, styles.boost]}>
        +{item.boostActivity.percentage}%
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌟 Today's Boosting Activities</Text>
      <Text style={styles.subtitle}>Total Boost: {totalBoost}%</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={boostActivities}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
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
  activityName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  percentText: {
    fontSize: 15,
    fontWeight: '500',
  },
  boost: {
    color: '#5CB85C',
  },
});

export default BoostActivityList;

