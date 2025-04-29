// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Button, ScrollView, TouchableOpacity, Text, Animated, Alert } from 'react-native';
import EnergyBar from './components/EnergyBar';
import ActivityButton from './components/ActivityButton';
import MotivationMessage from './components/MotivationMessage';
import InputField from './components/InputField';
import SettingsWidget from './components/SettingsWidget';
const { width, height } = Dimensions.get('window'); // Get screen dimensions

function App() {
  const [energy, setEnergy] = useState(0); // Renamed here
  const [newActivity, setNewActivity] = useState(''); // State for new activity input
  const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: boolean }>({}); // Track selected activities
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0]; // Initial position off-screen
  const [activityPercentage, setActivityPercentage] = useState('');
  const [editingActivity, setEditingActivity] = useState<{_id: string; name: string; percentage: number; originalName: string } | null>(null);
  const [drains, setDrains] = useState<{_id: string; name: string; percentage: number }[]>([]);
  const [boosts, setBoosts] = useState<{_id: string; name: string; percentage: number }[]>([]);
  

 

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
  

  const handleActivity = (type: 'drain' | 'boost', activityId: string) => {
    // Allow selection only if the activity is not already selected
    if (selectedActivities[activityId]) return;

    // Find the activity in the respective array
    const activityItem = type === 'drain' 
        ? drains.find(item => item._id === activityId) 
        : boosts.find(item => item._id === activityId);

    if (activityItem) {
        const energyChange = activityItem.percentage; // Get the percentage for the activity
        let newEnergyLevel: number; // Declare newEnergyLevel as a number
        
        // Calculate new energy level based on activity type
        if (type === 'drain') {
          newEnergyLevel = energy - energyChange; // Allow negative values
        } else if (type === 'boost') {
            newEnergyLevel = energy + energyChange; // Allow values above 100
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
            [activityId]: !prev[activityId], // Toggle selection
        }));
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://192.168.1.138:5000/activities');
      const activities = await response.json();
      console.log('Fetched Activities:', activities.filter((activity: { type: string }) => activity.type === 'drain'));
      const drains = activities.filter((activity: { type: string }) => activity.type === 'drain');
      const boosts = activities.filter((activity: { type: string }) => activity.type === 'boost');
      setDrains(drains);
      setBoosts(boosts);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const addActivity = async (type: 'drain' | 'boost') => {
    if (newActivity.trim() === '' || activityPercentage.trim() === '') return; // Prevent adding empty activities
    const percentage = parseFloat(activityPercentage); // Parse the percentage as a number

    if (isNaN(percentage)) return; // Prevent adding if percentage is not a valid number

    const activityData = { name: newActivity, percentage, type };

    try {
        const response = await fetch('http://192.168.1.138:5000/activities/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activityData),
        });

        if (!response.ok) {
            throw new Error('Failed to add activity');
        }

        const newActivityFromServer = await response.json();

        // Update local state with the new activity
        if (type === 'drain') {
            setDrains((prev) => [...prev, newActivityFromServer.data]);
        } else if (type === 'boost') {
            setBoosts((prev) => [...prev, newActivityFromServer.data]);
        }

        // Clear input fields after adding
        setNewActivity('');
        setActivityPercentage('');
    } catch (error) {
        console.error('Error adding activity:', error);
    }
  };

  const clearFilters = () => {
    setSelectedActivities({}); // Clear selected activities
  };

  // Function to reorder activities based on selection
  const getOrderedDrains = () => {
    const selected = drains.filter(item => selectedActivities[item._id]);
    const unselected = drains.filter(item => !selectedActivities[item._id]);
    return [...selected, ...unselected];
  };

  const getOrderedBoosts = () => {
    const selected = boosts.filter(item => selectedActivities[item._id]);
    const unselected = boosts.filter(item => !selectedActivities[item._id]);
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

  const deleteActivity = (type: 'drain' | 'boost', activityId: string) => {
    // Show confirmation dialog
    Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this activity? It will be deleted and you will have to add it next time manually.",
        [
            {
                text: "Cancel",
                style: "cancel", // Cancel button
            },
            {
                text: "Delete",
                onPress: async () => {
                    // Proceed with deletion if confirmed
                    if (type === 'drain') {
                        setDrains((prev) => prev.filter(item => item._id !== activityId)); // Remove drain activity
                    } else if (type === 'boost') {
                        setBoosts((prev) => prev.filter(item => item._id !== activityId)); // Remove boost activity
                    }
                    try {
                        const response = await fetch(`http://192.168.1.138:5000/activities/${activityId}`, {
                            method: 'DELETE',
                        });
                        if (response.status === 204) {
                            console.log('Activity deleted successfully');
                        } else {
                            const errorData = await response.json();
                            console.error('Error deleting activity:', errorData);
                        }
                    } catch (error) {
                        console.error('Error deleting activity:', error);
                    }
                },
                style: "destructive", // Style for the delete button
            },
        ],
        { cancelable: true } // Allow canceling the alert
    );
  };

  const editActivity = (type: 'drain' | 'boost', activityId: string) => {
    console.log('Editing Activity ID:', activityId); // Log the ID being passed

    const activityItem = type === 'drain' 
        ? drains.find(item => item._id === activityId) 
        : boosts.find(item => item._id === activityId);

    console.log('Editing Activity Item:', activityItem?._id); // Log the retrieved item

    if (!activityItem) {
        console.error('Activity item not found:', activityId);
        return; // Exit if the item is not found
    }

    // Set the editing state, including the _id
    setEditingActivity({ 
        ...activityItem, 
        originalName: activityItem.name,
    });
  };

  const updateActivity = async () => {
    console.log('Editing Activity Before Save:', editingActivity); // Log the current editing activity

    if (editingActivity) {
        const originalId = editingActivity._id; // Get the unique ID of the activity being edited
        const newName = editingActivity.name; // Access the new name
        const newPercentage = editingActivity.percentage; // Access the new percentage
        const isDrain = drains.some(d => d._id === originalId); // Check if it's a drain using ID
        
        // Update local state
        if (isDrain) {
            setDrains((prev) => {
                const updatedDrains = prev.map(d => 
                    d._id === originalId ? { ...editingActivity } : d // Update only the specific drain by ID
                );
                console.log('Updated Drains:', updatedDrains); // Log the updated drains
                return updatedDrains;
            });
        } else {
            setBoosts((prev) => {
                const updatedBoosts = prev.map(b => 
                    b._id === originalId ? { ...editingActivity } : b // Update only the specific boost by ID
                );
                console.log('Updated Boosts:', updatedBoosts); // Log the updated boosts
                return updatedBoosts;
            });
        }

        // Call the function to update the database using the unique ID
        try {
            const response = await fetch(`http://192.168.1.138:5000/activities/${originalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newName, // Send the updated name
                    percentage: newPercentage, // Send the updated percentage
                    type: isDrain ? 'drain' : 'boost' // Send the type based on the original activity
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update activity');
            }

            const data = await response.json();
            console.log('Activity updated successfully:', data);
        } catch (error) {
            console.error('Error updating activity:', error);
        }
    }
    setEditingActivity(null); // Clear editing state
  };

  // Calculate total percentages based on selected activities
  const sumPercentDrains = drains
    .filter(activity => selectedActivities[activity._id]) // Only include selected activities
    .reduce((total, activity) => total + activity.percentage, 0);//Understand why reduce is used here

  const sumPercentBoost = boosts
    .filter(activity => selectedActivities[activity._id]) // Only include selected activities
    .reduce((total, activity) => total + activity.percentage, 0);

  // Get top 8 draining and boosting activities
  const topDrains = drains
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  const topBoosts = boosts
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  const baseHeight = 40; // Base height for visibility

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.energyContainer}>
          <MotivationMessage energy={energy} />
          <EnergyBar energy={energy} />
        </View>
        <View style={styles.sections}>
          <View style={styles.column}>
            <Text style={[styles.header, styles.drainedEnergy]}>Drained Energy</Text>
            {getOrderedDrains().map((item) => (
                <View key={item._id} style={styles.activityItem}>
                    <ActivityButton
                        label={`${item.name}:🔻- ${item.percentage}%`}
                        onPress={() => handleActivity('drain', item._id)}
                        borderColor={selectedActivities[item._id] ? 'red' : '#ccc'}
                        
                    />
                    <TouchableOpacity onPress={() => editActivity('drain', item._id)}>
                        <Text style={{ color: 'blue' }}>📝</Text> {/* Pen icon */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteActivity('drain', item._id)}>
                        <Text style={{ color: 'red' }}>🗑️</Text> {/* Garbage icon */}
                    </TouchableOpacity>
                </View>
            ))}
          </View>
          <View style={styles.column}>
            <Text style={[styles.header, styles.gaveEnergy]}>Gave Energy</Text>
            {getOrderedBoosts().map((item) => (
                <View key={item._id} style={styles.activityItem}>
                    <ActivityButton
                        label={`${item.name}:+ ${item.percentage}%`}
                        onPress={() => handleActivity('boost', item._id)}
                        borderColor={selectedActivities[item._id] ? 'green' : '#ccc'}
                    />
                    <TouchableOpacity onPress={() => editActivity('boost', item._id)}>
                        <Text style={{ color: 'blue' }}>📝</Text> {/* Edit icon */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteActivity('boost', item._id)}>
                        <Text style={{ color: 'red' }}>🗑️</Text> {/* Delete icon */}
                    </TouchableOpacity>
                </View>
            ))}
          </View>
        </View>
               {/* Horizontal line */}
               <View style={styles.separator} />
          
          <Text style={styles.balanceText}>✨ Pay attention to how your resources are divided. For better long-term health, keep the columns equal or focus on activities that boost the green column!</Text>
              
         {/* Display Total Percentages */}
         <View style={styles.columnContainer}>
          
          <View style={[styles.columnSum, styles.drainedColumn, { height: `${Math.min(sumPercentDrains, 100)}%` }]}>
            <Text style={styles.columnText}>Total Drained: {sumPercentDrains}%</Text>
          </View>
          <View style={[styles.columnSum, styles.gaveColumn, { height: `${Math.min(sumPercentBoost, 100)}%` }]}>
            <Text style={styles.columnText}>Total Gave: {sumPercentBoost}%</Text>
          </View>
        </View>
         {/* Horizontal line */}
         <View style={styles.separator} />
         <View style={styles.energyContainer}>
          <MotivationMessage energy={energy} />
          <EnergyBar energy={energy} />
        </View>
        <View style={styles.separator} />
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
        <View style={styles.separator} />
      <View>

      <ScrollView style={styles.containerBars}>
            <Text style={styles.header}>Top Draining Activities</Text>
            <View style={styles.columnsContainer}>
                {topDrains.map(activity => (
                    <View key={activity._id} style={styles.columnTopActivities}>
                        <View style={[styles.energyFill, { 
                            height: baseHeight + activity.percentage, // Combine base height with the percentage
                            backgroundColor: 'red' 
                        }]} />
                        <Text style={styles.activityText}>{activity.name} ({activity.percentage}%)</Text>
                    </View>
                ))}
            </View>
            <View style={styles.separator} />
          <Text style={styles.header}>Top Boosting Activities</Text>
            <View style={styles.columnsContainer}>
                {topBoosts.map(activity => (
                    <View key={activity._id} style={styles.columnTopActivities}>
                        <View style={[styles.energyFill, { 
                            height: baseHeight + activity.percentage, // Combine base height with the percentage
                            backgroundColor: 'green' 
                        }]} />
                        <Text style={styles.activityText}>{activity.name} ({activity.percentage}%)</Text>
                    </View>
                ))}
            </View>

            {/* Add a spacer at the bottom */}
            <View style={styles.spacer} />
        </ScrollView>
        
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
            <Button title="Update" onPress={updateActivity} />
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
  drainedEnergy: {
    color: 'red', // Color for drained energy
  },
  gaveEnergy: {
    color: 'green', // Color for gave energy
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%', // Adjust width as needed
    alignSelf: 'center',
    marginVertical: 40, // Space above and below the line
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
  barContainer: {
    marginTop: 20,
  },
  
  columnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align columns to the bottom
    height: 200, // Set a fixed height for the container
    marginTop: 20,
},
columnSum: {
    width: '40%', // Set a width for the columns
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 5,
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
},
drainedColumn: {
    backgroundColor: 'red', // Color for drained energy
},
gaveColumn: {
    backgroundColor: 'green', // Color for gave energy
},
columnText: {
    color: 'white', // Text color for better visibility
    fontWeight: 'bold',
    

},
balanceText: {
    fontSize: 16, // Font size
    color: 'black', // Text color
    backgroundColor: '#f9f9f9', // Gainsboro background for visibility
    padding: 10, // Padding around the text
    borderRadius: 5, // Rounded corners
    marginTop: 20, // Space above the text
    textAlign: 'center', // Center the text
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
},
containerBars: {
  padding: 5,
},
columnsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
  
},
columnTopActivities: {
  width: '12%', // Adjust width to fit 8 columns
  alignItems: 'center',
  padding: 0, // Remove padding to reduce space
  
},
energyFill: {
  width: '100%', // Full width for the column
  shadowColor: '#000', // Shadow for depth
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5, // For Android shadow
  //minHeight: 30,
},
activityText: {
  textAlign: 'center',
  marginTop: 5,
},
spacer: {
  height: 100, // Space at the bottom of the ScrollView
},
});

export default App;

