// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Button, ScrollView, TouchableOpacity, Text, Animated } from 'react-native';
import EnergyBar from './components/EnergyBar';
import ActivityButton from './components/ActivityButton';
import MotivationMessage from './components/MotivationMessage';
import InputField from './components/InputField';
import SettingsWidget from './components/SettingsWidget';
const { width, height } = Dimensions.get('window'); // Get screen dimensions

function App() {
  const [energy, setEnergy] = useState(0); // Renamed here
  const [newActivity, setNewActivity] = useState(''); // State for new activity input
  const [drains, setDrains] = useState<{ name: string; percentage: number }[]>([
    { name: 'Work', percentage: 35 }, // Example percentage
    { name: 'Sickness', percentage: 7 },
    { name: 'Sitting', percentage: 10 },
    { name: 'Bad Weather', percentage: 7 },
    { name: 'Support to friend', percentage: 5 },
    { name: 'No break', percentage: 10 },

  ]);
  const [boosts, setBoosts] = useState<{ name: string; percentage: number }[]>([
    { name: 'Walk 5 km', percentage: 20 },
    { name: '9 Hours Sleep', percentage: 25 },
    { name: 'Break every 45 minutes', percentage: 15 },
    { name: 'Healthy Food', percentage: 15 },
    { name: 'Laughing', percentage: 10 },
    { name: 'Drinking water', percentage: 5 },
  ]);
  const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: boolean }>({}); // Track selected activities
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0]; // Initial position off-screen
  const [activityPercentage, setActivityPercentage] = useState('');
  const [editingActivity, setEditingActivity] = useState<{ name: string; percentage: number; originalName: string } | null>(null);

  const energyChange = 10; // Fixed energy change for each activity

  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const response = await fetch('http://192.168.1.138:5000/current-energy-level')
        console.log(response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEnergy(data.currentEnergyLevel); // Updated to use setEnergy
      } catch (error) {

        console.error('Error fetching energy level:', error);
      }
    };

    fetchEnergy();
  }, []);

  const updateEnergyLevel = async (newLevel: number) => {
    try {
        const response = await fetch('http://192.168.1.138:5000/current-energy-level', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentEnergyLevel: newLevel }), // Ensure this matches the backend
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setEnergy(data.currentEnergyLevel); // Update the state with the new level
    } catch (error) {
        console.error('Error updating energy level:', error);
    }
  };

  const handleActivity = (type: 'drain' | 'boost', activity: string) => {
    // Allow selection only if the activity is not already selected
    if (selectedActivities[activity]) return;

    // Find the activity in the respective array
    const activityItem = type === 'drain' 
        ? drains.find(item => item.name === activity) 
        : boosts.find(item => item.name === activity);

    if (activityItem) {
        const energyChange = activityItem.percentage; // Get the percentage for the activity
        let newEnergyLevel: number; // Declare newEnergyLevel as a number
        
        // Calculate new energy level based on activity type
        if (type === 'drain') {
          newEnergyLevel = Math.max(0, energy - energyChange); // Decrease energy
        } else if (type === 'boost') {
            newEnergyLevel = Math.min(100, energy + energyChange); // Increase energy
        } else {
            newEnergyLevel = energy; // Default to current energy if type is not recognized
        }

         // Update local state
         setEnergy(newEnergyLevel);
        // Call the function to update the energy level in the database
        updateEnergyLevel(newEnergyLevel);

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

  const deleteActivity = (type: 'drain' | 'boost', activityName: string) => {
    if (type === 'drain') {
        setDrains((prev) => prev.filter(item => item.name !== activityName)); // Remove drain activity
    } else if (type === 'boost') {
        setBoosts((prev) => prev.filter(item => item.name !== activityName)); // Remove boost activity
    }
  };

  const editActivity = (type: 'drain' | 'boost', activityName: string) => {
    const activityItem = type === 'drain' 
        ? drains.find(item => item.name === activityName) 
        : boosts.find(item => item.name === activityName);

    console.log('Editing Activity Item:', activityItem); // Log the retrieved item

    if (activityItem) {
        setEditingActivity({ 
            ...activityItem, 
            originalName: activityItem.name // Store the original name
        });
    }
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
                <View key={item.name} style={styles.activityItem}>
                    <ActivityButton
                        label={`${item.name}:🔻- ${item.percentage}%`}
                        onPress={() => handleActivity('drain', item.name)}
                        borderColor={selectedActivities[item.name] ? 'red' : '#ccc'}
                        
                    />
                    <TouchableOpacity onPress={() => editActivity('drain', item.name)}>
                        <Text style={{ color: 'blue' }}>📝</Text> {/* Pen icon */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteActivity('drain', item.name)}>
                        <Text style={{ color: 'red' }}>🗑️</Text> {/* Garbage icon */}
                    </TouchableOpacity>
                </View>
            ))}
          </View>
          <View style={styles.column}>
            <Text style={styles.header}>Gave Energy</Text>
            {getOrderedBoosts().map((item) => (
                <View key={item.name} style={styles.activityItem}>
                    <ActivityButton
                        label={`${item.name}:+ ${item.percentage}%`}
                        onPress={() => handleActivity('boost', item.name)}
                        borderColor={selectedActivities[item.name] ? 'green' : '#ccc'}
                    />
                    <TouchableOpacity onPress={() => editActivity('boost', item.name)}>
                        <Text style={{ color: 'blue' }}>📝</Text> {/* Edit icon */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteActivity('boost', item.name)}>
                        <Text style={{ color: 'red' }}>🗑️</Text> {/* Delete icon */}
                    </TouchableOpacity>
                </View>
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

      {editingActivity && (
        <View style={styles.editingContainer}>
            <TextInput
                value={editingActivity.name}
                onChangeText={(text) => setEditingActivity({ ...editingActivity, name: text })}
                style={styles.input}
            />
            <TextInput
                value={String(editingActivity.percentage)} // Convert to string for TextInput
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => {
                    // Check if the input is empty or not a valid number
                    const parsedValue = parseFloat(text);
                    if (!isNaN(parsedValue) || text === '') {
                        setEditingActivity({ 
                            ...editingActivity, 
                            percentage: text === '' ? 0 : parsedValue // Set to 0 if empty
                        });
                    }
                }}
                style={styles.input} // Add your input styles here
            />
            <Button title="Save" onPress={() => {
                console.log('Editing Activity Before Save:', editingActivity); // Log the current editing activity

                if (editingActivity) {
                    const originalName = editingActivity.originalName; // Access the original name
                    const newName = editingActivity.name; // Access the new name
                    const isDrain = drains.some(d => d.name === originalName);
                    
                    if (isDrain) {
                        setDrains((prev) => {
                            const updatedDrains = prev.map(d => 
                                d.name === originalName ? { ...editingActivity, name: newName } : d // Update the drain
                            );
                            console.log('Updated Drains:', updatedDrains); // Log the updated drains
                            return updatedDrains;
                        });
                    } else {
                        setBoosts((prev) => {
                            const updatedBoosts = prev.map(b => 
                                b.name === originalName ? { ...editingActivity, name: newName } : b // Update the boost
                            );
                            console.log('Updated Boosts:', updatedBoosts); // Log the updated boosts
                            return updatedBoosts;
                        });
                    }
                }
                setEditingActivity(null); // Clear editing state
            }} />
        </View>
      )}
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
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align text and button
    alignItems: 'center', // Center vertically
    marginVertical: 5, // Space between items
  },
  editingContainer: {
    padding: 20, // Add padding for the container
    backgroundColor: '#fff', // Background color
    borderRadius: 5, // Rounded corners
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    marginBottom: 20, // Space below the editing section
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10, // Space between inputs
  },
});

export default App;

