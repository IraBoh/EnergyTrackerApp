import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

// Define the type for drain and boost activities
type Activity = {
  id: string;
  name: string;
  percentage: number;
};

const SettingsWidget: React.FC = () => {
  const [drainActivities, setDrainActivities] = useState<Activity[]>([]);
  const [newDrainActivity, setNewDrainActivity] = useState('');
  const [newDrainPercentage, setNewDrainPercentage] = useState('');
  const [boostActivities, setBoostActivities] = useState<Activity[]>([]);
  const [newBoostActivity, setNewBoostActivity] = useState('');
  const [newBoostPercentage, setNewBoostPercentage] = useState('');

  const addDrainActivity = () => {
    const percentage = parseFloat(newDrainPercentage);
    if (newDrainActivity && !isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setDrainActivities((prev) => [
        ...prev,
        { id: Date.now().toString(), name: newDrainActivity, percentage: percentage },
      ]);
      setNewDrainActivity('');
      setNewDrainPercentage('');
    } else {
      console.error("Invalid input: Please enter a valid activity and percentage.");
    }
  };

  const addBoostActivity = () => {
    const percentage = parseFloat(newBoostPercentage);
    if (newBoostActivity && !isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setBoostActivities((prev) => [
        ...prev,
        { id: Date.now().toString(), name: newBoostActivity, percentage: percentage },
      ]);
      setNewBoostActivity('');
      setNewBoostPercentage('');
    } else {
      console.error("Invalid input: Please enter a valid activity and percentage.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Section for Drains */}
      <View style={styles.drainSection}>
        <Text style={styles.header}>Preferred Activities</Text>
        <Text style={styles.header}>Drains</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Activity Name"
            value={newDrainActivity}
            onChangeText={setNewDrainActivity}
            style={[styles.input, styles.activityInput]}
          />
          <TextInput
            placeholder="%%"
            value={newDrainPercentage}
            onChangeText={setNewDrainPercentage}
            style={[styles.input, styles.percentageInput]}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <TouchableOpacity onPress={addDrainActivity} style={styles.iconButton}>
          <Text style={styles.iconText}>🪫</Text>
        </TouchableOpacity>

        {/* Render Drain Activities List using map */}
        {drainActivities.map((item) => (
          <View key={item.id} style={[styles.listItem, styles.drainItem]}>
            <Text style={styles.listText}>{item.name}: {item.percentage}%</Text>
          </View>
        ))}
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Bottom Section for Boosts */}
      <View style={styles.boostSection}>
        <Text style={styles.header}>Preferred Activities</Text>
        <Text style={styles.header}>Boosts</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Activity Name"
            value={newBoostActivity}
            onChangeText={setNewBoostActivity}
            style={[styles.input, styles.activityInput]}
          />
          <TextInput
            placeholder="%%"
            value={newBoostPercentage}
            onChangeText={setNewBoostPercentage}
            style={[styles.input, styles.percentageInput]}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <TouchableOpacity onPress={addBoostActivity} style={styles.iconButton}>
          <Text style={styles.iconText}>🔋</Text>
        </TouchableOpacity>

        {/* Render Boost Activities List using map */}
        {boostActivities.map((item) => (
          <View key={item.id} style={[styles.listItem, styles.boostItem]}>
            <Text style={styles.listText}>🔋 {item.name}: {item.percentage}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  drainSection: {
    marginBottom: 10,
  },
  boostSection: {
    marginTop: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityInput: {
    flex: 2,
    marginRight: 10,
  },
  percentageInput: {
    width: 60,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  iconButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  iconText: {
    fontSize: 30,
  },
  listItem: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  drainItem: {
    borderColor: 'red',
    borderWidth: 2,
  },
  boostItem: {
    borderColor: 'green',
    borderWidth: 2,
  },
  listText: {
    fontSize: 18,
  },
});

export default SettingsWidget;












