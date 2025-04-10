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
      console.error("Invalid input for drain activity.");
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
      console.error("Invalid input for boost activity.");
    }
  };

  const updateDrainActivity = (id: string, name: string, percentage: string) => {
    setDrainActivities((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, name, percentage: parseFloat(percentage) }
          : item
      )
    );
  };

  const updateBoostActivity = (id: string, name: string, percentage: string) => {
    setBoostActivities((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, name, percentage: parseFloat(percentage) }
          : item
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Section for Drains */}
      <View style={styles.drainSection}>
        <Text style={styles.header}>Default Drains Activities</Text>
        
        <Text style={styles.label}>Activity Name</Text>
        <TextInput
          placeholder="Enter activity name"
          value={newDrainActivity}
          onChangeText={setNewDrainActivity}
          style={styles.input}
        />
        
        <Text style={styles.label}>Percentage</Text>
        <TextInput
          placeholder="Enter percentage"
          value={newDrainPercentage}
          onChangeText={setNewDrainPercentage}
          style={styles.input}
          keyboardType="numeric"
        />
        
        <TouchableOpacity onPress={addDrainActivity} style={styles.iconButton}>
          <Text style={styles.iconText}>🪫</Text>
        </TouchableOpacity>

        {/* Render Drain Activities List using map */}
        {drainActivities.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text>{item.name}: 🔻 - {item.percentage}%</Text>
          </View>
        ))}
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Bottom Section for Boosts */}
      <View style={styles.boostSection}>
        <Text style={styles.header}>Default Boost Activities</Text>
        
        <Text style={styles.label}>Activity Name</Text>
        <TextInput
          placeholder="Enter activity name"
          value={newBoostActivity}
          onChangeText={setNewBoostActivity}
          style={styles.input}
        />
        
        <Text style={styles.label}>Percentage</Text>
        <TextInput
          placeholder="Enter percentage"
          value={newBoostPercentage}
          onChangeText={setNewBoostPercentage}
          style={styles.input}
          keyboardType="numeric"
        />
        
        <TouchableOpacity onPress={addBoostActivity} style={styles.iconButton}>
          <Text style={styles.iconText}>🔋</Text>
        </TouchableOpacity>

        {/* Render Boost Activities List using map */}
        {boostActivities.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text>{item.name}: ✨ +{item.percentage}%</Text>
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
    marginBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 40,
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
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 5,
    marginTop: 5,
  },
});

export default SettingsWidget;












