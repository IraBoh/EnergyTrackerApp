// app/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TextInput, Button } from 'react-native';
import EnergyBar from './components/EnergyBar';
import ActivityButton from './components/ActivityButton';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function App() {
  const [energy, setEnergy] = useState(75); // Initial energy level
  const [newActivity, setNewActivity] = useState(''); // State for new activity input
  const [drains, setDrains] = useState(['Work', 'Overthinking', 'Sickness', 'Sitting', 'No break']); // Initial drains
  const [boosts, setBoosts] = useState(['Walk 5 km', '9 Hours Sleep', 'Break every 45 minutes', 'Healthy Food', 'Laughing']); // Initial boosts
  const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: boolean }>({}); // Track selected activities

  const energyChange = 10; // Fixed energy change for each activity

  const handleActivity = (type: 'drain' | 'boost', activity: string) => {
    if (type === 'drain') {
      setEnergy((prev) => Math.max(0, prev - energyChange)); // Decrease energy
    } else if (type === 'boost') {
      setEnergy((prev) => Math.min(100, prev + energyChange)); // Increase energy
    }

    // Toggle the selected state of the activity
    setSelectedActivities((prev) => ({
      ...prev,
      [activity]: !prev[activity], // Toggle selection
    }));
  };

  const addActivity = (type: 'drain' | 'boost') => {
    if (newActivity.trim() === '') return; // Prevent adding empty activities
    if (type === 'drain') {
      setDrains((prev) => [...prev, newActivity]); // Add new drain activity
    } else if (type === 'boost') {
      setBoosts((prev) => [...prev, newActivity]); // Add new boost activity
    }
    setNewActivity(''); // Clear input field after adding
  };

  // Function to reorder activities based on selection
  const getOrderedDrains = () => {
    const selected = drains.filter(item => selectedActivities[item]);
    const unselected = drains.filter(item => !selectedActivities[item]);
    return [...selected, ...unselected];
  };

  const getOrderedBoosts = () => {
    const selected = boosts.filter(item => selectedActivities[item]);
    const unselected = boosts.filter(item => !selectedActivities[item]);
    return [...selected, ...unselected];
  };

  return (
    <View style={styles.container}>
      <View style={styles.energyContainer}>
        <EnergyBar energy={energy} />
      </View>

      <View style={styles.sections}>
        <View style={styles.column}>
          <Text style={styles.header}>Drained Energy</Text>
          {getOrderedDrains().map((item) => (
            <ActivityButton
              key={item}
              label={item}
              onPress={() => handleActivity('drain', item)} // Adjust energy on button press
              borderColor={selectedActivities[item] ? 'red' : '#ccc'} // Highlight selected button
            />
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Gave Energy</Text>
          {getOrderedBoosts().map((item) => (
            <ActivityButton
              key={item}
              label={item}
              onPress={() => handleActivity('boost', item)} // Adjust energy on button press
              borderColor={selectedActivities[item] ? 'green' : '#ccc'} // Highlight selected button
            />
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new activity"
          value={newActivity}
          onChangeText={setNewActivity}
        />
        <View style={styles.buttonContainer}>
          <Button title="Add Drain" onPress={() => addActivity('drain')} />
          <Button title="Add Boost" onPress={() => addActivity('boost')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90, // Adjusted padding for top
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  energyContainer: {
    marginBottom: 20, // Space between energy bar and buttons
    alignItems: 'center',
  },
  energyLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: 20, // Space above input field
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10, // Space between input and buttons
    width: 200, // Adjust width as needed
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 150, // Adjust width to bring buttons closer together
  },
  sections: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  column: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    width: 150, // Set a fixed width for consistency
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
});



