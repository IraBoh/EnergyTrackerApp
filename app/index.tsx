// app/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Button, ScrollView, TouchableOpacity, Text } from 'react-native';
import EnergyBar from './components/EnergyBar';
import ActivityButton from './components/ActivityButton';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

function App() {
  const [energy, setEnergy] = useState(75); // Initial energy level
  const [newActivity, setNewActivity] = useState(''); // State for new activity input
  const [drains, setDrains] = useState(['Work', 'Overthinking', 'Sickness', 'Sitting', 'No break']); // Initial drains
  const [boosts, setBoosts] = useState(['Walk 5 km', '9 Hours Sleep', 'Break every 45 minutes', 'Healthy Food', 'Laughing']); // Initial boosts
  const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: boolean }>({}); // Track selected activities

  const energyChange = 10; // Fixed energy change for each activity

  const handleActivity = (type: 'drain' | 'boost', activity: string) => {
    // Allow selection only if the activity is not already selected
    if (selectedActivities[activity]) return;

    if (type === 'drain') {
      setEnergy((prev) => Math.max(0, prev - energyChange)); // Decrease energy
    } else if (type === 'boost') {
      setEnergy((prev) => Math.min(100, prev + energyChange)); // Increase energy
    }

    // Mark the activity as selected
    setSelectedActivities((prev) => ({
      ...prev,
      [activity]: true, // Set selection to true
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

  const clearFilters = () => {
    setSelectedActivities({}); // Clear selected activities
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
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.energyContainer}>
          <EnergyBar energy={energy} />
        </View>

        <View style={styles.sections}>
          <View style={styles.column}>
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

        {/* Clear Filters button */}
        <View style={styles.inputContainer}>
          <Button title="Clear Filters" onPress={clearFilters} color="grey" />
        </View>

        {/* Horizontal line */}
        <View style={styles.separator} />

        {/* Input field for new activity */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter new activity"
            value={newActivity}
            onChangeText={setNewActivity}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => addActivity('drain')} style={styles.iconButton}>
              <Text style={styles.iconText}>🪫</Text> {/* Battery emoji for drain */}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addActivity('boost')} style={styles.iconButton}>
              <Text style={styles.iconText}>🔋</Text> {/* Battery emoji for boost */}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1, // Allow the ScrollView to take full height
  },
  container: {
    flexGrow: 1, // Allow the container to grow
    paddingTop: 90, // Adjusted padding for top
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  energyContainer: {
    marginBottom: 0, // Reduced space between energy bar and buttons
    alignItems: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: 10, // Reduced space above input field
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
  iconButton: {
    padding: 10, // Add padding around the icon
  },
  iconText: {
    fontSize: 30, // Adjust size of the emoji
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
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    width: '80%', // Adjust width as needed
    alignSelf: 'center',
    marginVertical: 10, // Space above and below the line
  },
});

export default App;

