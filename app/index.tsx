// app/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Button, ScrollView, TouchableOpacity, Text, Animated } from 'react-native';
import EnergyBar from './components/EnergyBar';
import ActivityButton from './components/ActivityButton';
import MotivationMessage from './components/MotivationMessage';
import InputField from './components/InputField';
import SettingsWidget from './components/SettingsWidget';
const { width, height } = Dimensions.get('window'); // Get screen dimensions

function App() {
  const [energy, setEnergy] = useState(75); // Initial energy level
  const [newActivity, setNewActivity] = useState(''); // State for new activity input
  const [drains, setDrains] = useState<{ name: string; percentage: number }[]>([
    { name: 'Work', percentage: 10 }, // Example percentage
    { name: 'Overthinking', percentage: 15 },
    { name: 'Sickness', percentage: 20 },
    { name: 'Sitting', percentage: 5 },
    { name: 'No break', percentage: 10 },
  ]);
  const [boosts, setBoosts] = useState<{ name: string; percentage: number }[]>([
    { name: 'Walk 5 km', percentage: 20 },
    { name: '9 Hours Sleep', percentage: 25 },
    { name: 'Break every 45 minutes', percentage: 15 },
    { name: 'Healthy Food', percentage: 30 },
    { name: 'Laughing', percentage: 10 },
  ]);
  const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: boolean }>({}); // Track selected activities
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0]; // Initial position off-screen
  const [activityPercentage, setActivityPercentage] = useState('');

  const energyChange = 10; // Fixed energy change for each activity

  const handleActivity = (type: 'drain' | 'boost', activity: string) => {
    // Allow selection only if the activity is not already selected
    if (selectedActivities[activity]) return;

    // Find the activity in the respective array
    const activityItem = type === 'drain' 
        ? drains.find(item => item.name === activity) 
        : boosts.find(item => item.name === activity);

    if (activityItem) {
        const energyChange = activityItem.percentage; // Get the percentage for the activity

        if (type === 'drain') {
            setEnergy((prev) => Math.max(0, prev - energyChange)); // Decrease energy
        } else if (type === 'boost') {
            setEnergy((prev) => Math.min(100, prev + energyChange)); // Increase energy
        }

        // Optionally, toggle the selection state
        setSelectedActivities((prev) => ({
            ...prev,
            [activity]: !prev[activity], // Toggle selection
        }));
    }
  };

  const addActivity = (type: 'drain' | 'boost') => {
    if (newActivity.trim() === '' || activityPercentage.trim() === '') return; // Prevent adding empty activities
    const percentage = parseFloat(activityPercentage); // Parse the percentage as a number

    if (isNaN(percentage)) return; // Prevent adding if percentage is not a valid number

    if (type === 'drain') {
      setDrains((prev) => [...prev, { name: newActivity, percentage }]); // Add new drain activity
    } else if (type === 'boost') {
      setBoosts((prev) => [...prev, { name: newActivity, percentage }]); // Add new boost activity
    }
    
    setNewActivity(''); // Clear input field after adding
    setActivityPercentage(''); // Clear percentage input field after adding
  };

  const clearFilters = () => {
    setSelectedActivities({}); // Clear selected activities
  };

  // Function to reorder activities based on selection
  const getOrderedDrains = () => {
    const selected = drains.filter(item => selectedActivities[item.name]);
    const unselected = drains.filter(item => !selectedActivities[item.name]);
    return [...selected, ...unselected];
  };

  const getOrderedBoosts = () => {
    const selected = boosts.filter(item => selectedActivities[item.name]);
    const unselected = boosts.filter(item => !selectedActivities[item.name]);
    return [...selected, ...unselected];
  };

  const toggleSettings = () => {
    setIsSettingsVisible((prev) => !prev);
    Animated.timing(slideAnim, {
      toValue: isSettingsVisible ? -300 : 0, // Slide in/out
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.energyContainer}>
          <MotivationMessage energy={energy} />
          <EnergyBar energy={energy} />
        </View>
        <View style={styles.sections}>
          <View style={styles.column}>
            <Text style={styles.header}>Drained Energy</Text>
            {getOrderedDrains().map((item) => (
              <ActivityButton
                key={item.name}
                label={`${item.name}: 🔻 - ${item.percentage}%`}
                onPress={() => handleActivity('drain', item.name)}
                borderColor={selectedActivities[item.name] ? 'red' : '#ccc'}
              />
            ))}
          </View>
          <View style={styles.column}>
            <Text style={styles.header}>Gave Energy</Text>
            {getOrderedBoosts().map((item) => (
              <ActivityButton
                key={item.name}
                label={`${item.name}: + ${item.percentage}%`}
                onPress={() => handleActivity('boost', item.name)}
                borderColor={selectedActivities[item.name] ? 'green' : '#ccc'}
              />
            ))}
          </View>
        </View>
        {/* Clear Filters button */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>New Day ♻️</Text>
          </TouchableOpacity>
        </View>
        {/* Horizontal line */}
        <View style={styles.separator} />
        {/* Input field for new activity */}
        <View style={styles.inputContainer}>
          <InputField
            newActivity={newActivity}
            setNewActivity={setNewActivity}
            activityPercentage={activityPercentage}
            setActivityPercentage={setActivityPercentage}
            addActivity={addActivity}
          />
        </View>
      </ScrollView>

      {/* Render the SettingsWidget outside the ScrollView */}
      <Animated.View style={[styles.settingsWidget, { transform: [{ translateX: slideAnim }] }]}>
        {isSettingsVisible && <SettingsWidget />}
      </Animated.View>

      {/* Button to toggle settings visibility */}
      <TouchableOpacity onPress={toggleSettings} style={styles.settingsButton}>
        <Text style={styles.iconText}>✨</Text> {/* Use the gear emoji for settings */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 100,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 20, // Position it at the bottom
    left: 20, // Position it on the left
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  iconText: {
    fontSize: 25, // Adjust size of the emojis
  },
  settingsWidget: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300, // Width of the settings widget
    height: '100%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderColor: '#ccc',
    zIndex: 0,
    padding: 20,
  },
  energyContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sections: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  column: {
    alignItems: 'center',
    padding: 0,
    borderRadius: 8,
    width: 150, // Set a fixed width for consistency
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    width: '80%', // Adjust width as needed
    alignSelf: 'center',
    marginVertical: 10, // Space above and below the line
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: 10, // Reduced space above input field
    marginBottom: 80,
  },
  clearFiltersButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;

