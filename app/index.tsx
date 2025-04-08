// app/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import EnergyBar from './components/EnergyBar';
import ActivityButton from './components/ActivityButton';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const drains = ['Work', 'Overthinking', 'Sickness', 'Sitting', 'No break'];
const boosts = ['Walk 5 km', '9 Hours Sleep', 'Break every 45 minutes', 'Healthy Food', 'Laughing'];

export default function App() {
  const [energy, setEnergy] = useState(75); // Initial energy level

  const energyChange = 10; // Fixed energy change for each activity

  const handleActivity = (type: 'drain' | 'boost') => {
    // Adjust energy level based on activity type
    if (type === 'drain') {
      setEnergy((prev) => Math.max(0, prev - energyChange)); // Decrease energy
    } else if (type === 'boost') {
      setEnergy((prev) => Math.min(100, prev + energyChange)); // Increase energy
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.energyContainer}>
        <EnergyBar energy={energy} />
      </View>

      <View style={styles.sections}>
        <View style={styles.column}>
          <Text style={styles.header}>Drained Energy</Text>
          {drains.map((item) => (
            <ActivityButton
              key={item}
              label={item}
              onPress={() => handleActivity('drain')} // Adjust energy on button press
              borderColor="#ccc" // Default border color
            />
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Gave Energy</Text>
          {boosts.map((item) => (
            <ActivityButton
              key={item}
              label={item}
              onPress={() => handleActivity('boost')} // Adjust energy on button press
              borderColor="#ccc" // Default border color
            />
          ))}
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



