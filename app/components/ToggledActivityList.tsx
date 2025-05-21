import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  _id: string;
  drainActivity?: DrainActivity;
  boostActivity?: BoostActivity;
}

interface ToggledActivityListProps {
  refreshToggle: boolean;   
}

const ToggledActivityList: React.FC<ToggledActivityListProps> = ({ refreshToggle }) => {
  const [toggledActivities, setToggledActivities] = useState<ContraProActivityObject[]>([]);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchToggledActivities = async () => {
      try {
        const response = await fetch('http://192.168.1.138:5000/todays-activities/');
        const data = await response.json();
        setToggledActivities(data);
      } catch (error) {
        console.error('Error fetching toggled activities:', error);
        Alert.alert('Error', 'Failed to fetch toggled activities');
      }
    };

    fetchToggledActivities();
  }, [refreshToggle]);

  const markAsDone = (id: string) => {
    setCompletedActivities((prev) =>
      prev.includes(id) ? prev.filter(existingId => existingId !== id) : [...prev, id]
    );
  };

  const onClear = () => {
    setToggledActivities([]);
  };

  const calculateTotals = () => {
    let totalDrains = 0;
    let totalBoosts = 0;

    toggledActivities.forEach(activity => {
      if (activity.drainActivity) totalDrains += activity.drainActivity.percentage;
      if (activity.boostActivity) totalBoosts += activity.boostActivity.percentage;
    });

    return {
      totalDrains,
      totalBoosts,
      netEnergy: totalBoosts - totalDrains,
    };
  };

  const { totalDrains, totalBoosts, netEnergy } = calculateTotals();

  const renderItem = ({ item }: { item: ContraProActivityObject }) => {
    const isCompleted = completedActivities.includes(item._id);
    return (
      <TouchableOpacity
        onPress={() => markAsDone(item._id)}
        style={[styles.card, isCompleted && styles.cardCompleted]}
      >
        <Text style={styles.activityName}>
          {item.drainActivity?.name || 'Unnamed Activity'}
        </Text>
        <Text>
          {item.boostActivity?.name && (
            <Text>
              Positive Aspect: {item.boostActivity.name}
            </Text>
          )}
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.percentText, styles.drain]}>
            -{item.drainActivity?.percentage ?? 0}%
          </Text>
          <Text style={[styles.percentText, styles.boost]}>
            +{item.boostActivity?.percentage ?? 0}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const sortedActivities = [...toggledActivities].sort((a, b) => {
    const aCompleted = completedActivities.includes(a._id);
    const bCompleted = completedActivities.includes(b._id);
    return aCompleted === bCompleted ? 0 : aCompleted ? 1 : -1;
  });

  const handleSave = async (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setLoading(true);
    try {
      // Save the activities to the database for a specific date
      await fetch('http://192.168.1.138:5000/saved-todays-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          activities: sortedActivities,
        }),
      });
      Alert.alert('Success', `Saved plan for ${formattedDate}. You can now view it in the Resource Calendar.`);

      // Clear today's activities
      const clearResponse = await fetch('http://192.168.1.138:5000/todays-activities/all', {
        method: 'DELETE', // Assuming you want to delete today's activities
        headers: { 'Content-Type': 'application/json' },
      });

      if (!clearResponse.ok) {
        throw new Error(`Failed to clear today's activities: ${clearResponse.status}`);
      }

      onClear(); // Clear the current list
    } catch (err) {
      Alert.alert('Error', 'Could not save plan or clear activities.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Today's Activities</Text>
      <Text style={styles.subtitle}>
        Drain: {totalDrains}% | Boost: {totalBoosts}% | Net: {netEnergy}% 
      </Text>
      <Text style={[styles.tip, { color: netEnergy < 0 ? 'red' : 'green' }]}>
        {netEnergy < 0 ? '⚠️ Add more boosting activities!' : '✅ Looks like a balanced day!'}
      </Text>
      <FlatList
        data={sortedActivities}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.saveButton}
          activeOpacity={0.7}
          accessibilityLabel="Save this plan for a date"
        >
          <Text style={styles.saveButtonText}>📅 Save This Plan for a Date</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event: any, date: any) => {
              if (event.type === 'dismissed') {
                setShowPicker(false);
                return;
              }
              setShowPicker(false);
              if (date) {
                setSelectedDate(date);
                handleSave(date);
              }
            }}
          />
        )}
      </View>
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
    marginBottom: 4,
  },
  tip: {
    fontSize: 15,
    fontWeight: '500',
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
  cardCompleted: {
    backgroundColor: '#E0F9E0',
  },
  activityName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
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
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ToggledActivityList;

