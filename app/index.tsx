// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Button, ScrollView, TouchableOpacity, Text, Animated, Alert, FlatList } from 'react-native';
import EnergyBar from './components/EnergyBar';
import ActivityButton from './components/ActivityButton';
import MotivationMessage from './components/MotivationMessage';
import InputField from './components/InputField';
import SettingsWidget from './components/SettingsWidget';
const { width, height } = Dimensions.get('window'); // Get screen dimensions
import ResourceCalendar from './components/ResourceCalendar';
import StatisticsGraph from './components/StatisticsGraph';
import ContraProInputForm from './components/ContraProInputForm';
import ActivityList from './components/ActivityList';
import ToggledActivityList from './components/ToggledActivityList';
import { ContraProActivityObject } from './components/ActivityList';


function App() {
  const [energy, setEnergy] = useState(0); // Renamed here
  const [drainActivity, setDrainActivity] = useState(''); // State for new activity input
  const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: boolean }>({}); // Track selected activities
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0]; // Initial position off-screen
  const [drainPercentage, setDrainPercentage] = useState('');
  const [editingActivity, setEditingActivity] = useState<{_id: string; name: string; percentage: number; originalName: string } | null>(null);
  const [drains, setDrains] = useState<{_id: string; name: string; percentage: number }[]>([]);
  const [boosts, setBoosts] = useState<{_id: string; name: string; percentage: number }[]>([]);
  const [boostActivity, setBoostActivity] = useState('');
  const [boostPercentage, setBoostPercentage] = useState('');
  const [contraProActivities, setContraProActivities] = useState<ContraProActivityObject[]>([]);
  const [isActivityListVisible, setActivityListVisible] = useState(true); // State for visibility
  const[refreshToggle, setRefreshToggle] = useState(false);
 

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

        // Update local state for energy
        setEnergy(newEnergyLevel);
        // Call the function to update the energy level in the database
        updateEnergyLevel(newEnergyLevel);

        // Optionally, toggle the selection state
        setSelectedActivities((prev) => ({
            ...prev,
            [activityId]: !prev[activityId], // Toggle selection
        }));

       /*  // Save selected activities to AsyncStorage
        saveSelectedActivitiesToAsyncStorage({
            ...selectedActivities,
            [activityId]: !selectedActivities[activityId], // Toggle selection
        });

        // Save sums after updating the state, only if there are selected activities
        handleResourcesDistributionData(); // Call to save updated sums */
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
    if (drainActivity.trim() === '' || drainPercentage.trim() === '') return; // Prevent adding empty activities
    const percentage = parseFloat(drainPercentage); // Parse the percentage as a number

    if (isNaN(percentage)) return; // Prevent adding if percentage is not a valid number

    const activityData = { name: drainActivity, percentage, type };

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
        setDrainActivity('');
        setDrainPercentage('');
    } catch (error) {
        console.error('Error adding activity:', error);
    }
  };


  const addDrainBoostActivity = async () => {
    // Validate inputs
    if (
        drainActivity.trim() === '' ||
        drainPercentage.trim() === '' ||
        boostActivity.trim() === '' ||
        boostPercentage.trim() === ''
    ) {
        return; // Prevent adding empty activities
    }

    const drainPercentageValue = parseFloat(drainPercentage);
    const boostPercentageValue = parseFloat(boostPercentage);

    if (isNaN(drainPercentageValue) || isNaN(boostPercentageValue)) {
        return; // Prevent adding if percentages are not valid numbers
    }

    // ✅ Create correctly structured activity data
    const activityData = {
        drainActivity: {
            name: drainActivity,
            percentage: drainPercentageValue,
            type: 'drain'
        },
        boostActivity: {
            name: boostActivity,
            percentage: boostPercentageValue,
            type: 'boost'
        }
    };

    try {
        const response = await fetch('http://192.168.1.138:5000/contra-pro-pair-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activityData),
        });

        if (!response.ok) {
            throw new Error('Failed to add activities FE');
        }

        const newActivitiesFromServer = await response.json();
        console.log('Add drainBoostActivity respon:', newActivitiesFromServer);

        setDrains((prev) => [...prev, newActivitiesFromServer.drain]);
        setBoosts((prev) => [...prev, newActivitiesFromServer.boost]);

        // Clear input fields
        setDrainActivity('');
        setDrainPercentage('');
        setBoostActivity('');
        setBoostPercentage('');
        fetchContraProActivities();
    } catch (error) {
        console.error('Error adding activities:', error);
    }
};


  const fetchContraProActivities = async () => {
    try {
        const response = await fetch('http://192.168.1.138:5000/contra-pro-pair-test');
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }
        const fetchedContraProActivities = await response.json();
        
        console.log('Fetched ContraProPairTest:', fetchedContraProActivities);
         setContraProActivities(fetchedContraProActivities); // Step 2: Update state with fetched data
    } catch (error) {
        console.error('Error fetching ContraProPairTest activities:', error);
    }
};


useEffect(() => {
  fetchContraProActivities(); // Fetch activities on component mount
}, []);

const deleteContraProActivity = async (activity: ContraProActivityObject) => {

if (!activity || !activity._id) {
  console.log("No valid activity to delete");
  return;
}
const id = activity._id;
console.log('ID:', id);
  if (!id) return;

  Alert.alert('Delete Activity', 'Are you sure you want to delete this activity?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.138:5000/contra-pro-pair-test/${id}`, {
               method: 'DELETE',
             });
            if (!response.ok) {
              throw new Error('Failed to delete activity');
      
            } 
            Alert.alert('Deleted', 'Activity successfully deleted');

    // Update the local state to remove the deleted activity
   /*  setContraProActivities(prevActivities => 
      prevActivities.filter(item => 
        item.drainActivity?._id !== id && item.boostActivity?._id !== id
      )
    ); */
    // Filter by the top-level object _id
    setContraProActivities(prevActivities =>
      prevActivities.filter(item => item._id !== id)
    );


    console.log('Activity deleted successfully');
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
  }
  }
  ]
);
};

  const clearFilters = () => {
    setSelectedActivities({}); // Clear selected activities
  };

  // Function to reorder activities based on selection
  const getOrderedDrains = () => {
    console.log('Drains:', drains);
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

  const calculateSumDrainedGave = () => {
    const sumPercentDrains = drains
        .filter(activity => selectedActivities[activity._id]) // Only include selected activities
        .reduce((total, activity) => total + activity.percentage, 0);

    const sumPercentBoost = boosts
        .filter(activity => selectedActivities[activity._id]) // Only include selected activities
        .reduce((total, activity) => total + activity.percentage, 0);

    return { sumPercentDrains, sumPercentBoost };
  };

  // Get top 8 draining and boosting activities
  const topDrains = drains
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  const topBoosts = boosts
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  const baseHeight = 40; // Base height for visibility

  const saveResourcesDistribution = async (drained: number, gave: number  ) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    try {
        const response = await fetch('http://192.168.1.138:5000/resources-distribution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: today, drained, gave }),
        });

        if (!response.ok) {
            throw new Error('Failed to save resources distribution data');
        }

        const data = await response.json();
        console.log('Resources distribution data saved:', data);
    } catch (error) {
        console.error('Error saving resources distribution:', error);
    }
  };

  const handleResourcesDistributionData = () => {
    const { sumPercentDrains, sumPercentBoost } = calculateSumDrainedGave();
    saveResourcesDistribution(sumPercentDrains, sumPercentBoost);
  };

  // useEffect to save data whenever energy or selectedActivities change
  useEffect(() => {
    // Only save sums when selected activities change
    handleResourcesDistributionData(); 
  }, [selectedActivities]); // Trigger effect only when selectedActivities change

  

  const toggleActivityList = () => {
    setActivityListVisible(prev => !prev); // Toggle visibility
  };

  const triggerRefresh = () => {
    setRefreshToggle(prev => !prev);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.containerInstructions}>
      <Text style={styles.header}>YOUR BOOSTING AND DRAINING ACTIVITIES</Text>
    <Text style={styles.instructionText}>
        Start writing down everything that drains your energy lately and everything that gives you good energy and resources.
    </Text>
    <Text style={styles.instructionText}>
        Take a moment to think about the activities, people, and situations that impact your energy levels. Understanding these factors can help you make better choices and create a more balanced and fulfilling life.
    </Text>
    </View>
    {/* Horizontal line */}
    <View style={styles.separator} />
        <View style={styles.sections}>
          <View style={styles.column}>
            <Text style={[styles.header, styles.drainedEnergy]}>Drained Energy</Text>
         {/*   //Getordered drains */}
           
          </View>
          <View style={styles.column}>
            <Text style={[styles.header, styles.gaveEnergy]}>Gave Energy</Text>
          {/*  //Getordered boosts */}
          </View>
        </View>
                 {/* Horizontal line */}
               <View style={styles.separator} />
           
               {/* Input field for new activity */}
        <View style={styles.inputContainer}>
        <Text style={styles.header}>ADD NEW ACTIVITY</Text>
          <InputField
            newActivity={drainActivity}
            setNewActivity={setDrainActivity}
            activityPercentage={drainPercentage}
            setActivityPercentage={setDrainPercentage}
            addActivity={addActivity}
          />
        </View>
               {/* Horizontal line */}
               <View style={styles.separator} />
          <Text style={styles.header}>YOUR RESOURCES DISTRIBUTION FOR TODAY</Text>
         <Text style={styles.balanceText}>✨ The columns below will show you how your resources are divided. For better long-term health, keep the columns equal or focus on activities that boost the green column!</Text>
              
         {/* Display Total Percentages */}
         <View style={styles.columnContainer}>
          
          <View style={[styles.columnSum, styles.drainedColumn, { height: `${Math.min(calculateSumDrainedGave().sumPercentDrains, 100)}%` }]}>
            <Text style={styles.columnText}>Total Drained: {calculateSumDrainedGave().sumPercentDrains}%</Text>
          </View>
          <View style={[styles.columnSum, styles.gaveColumn, { height: `${Math.min(calculateSumDrainedGave().sumPercentBoost, 100)}%` }]}>
            <Text style={styles.columnText}>Total Gave: {calculateSumDrainedGave().sumPercentBoost}%</Text>
          </View>
      
        </View>
         {/* Conditional Message */}
         {calculateSumDrainedGave().sumPercentBoost > calculateSumDrainedGave().sumPercentDrains ? (
              <Text style={styles.congratulationsText}>
                  😌 Today you made more of the things that gave you energy than what drained you. You can be proud of yourself!
              </Text>
          ) : calculateSumDrainedGave().sumPercentBoost < calculateSumDrainedGave().sumPercentDrains ? (
            <Text style={styles.warningText}>
              😔 Today you made more of the things that drained you than what gave you energy. Do not give up, make something small but nice for yourself today.
            </Text>
          ): null}
          
         {/* Horizontal line */}
         <View style={styles.separator} />
         <View style={styles.energyContainer}>
         <Text style={styles.header}>YOUR ENERGY LEVEL</Text>
        <Text> ✅ Reflection of Your Lifestyle and Choices </Text>
         <EnergyBar energy= {energy} />
          <MotivationMessage energy={energy} />

        
        </View>
        {/* Horizontal line */}
        <View style={styles.separator} />
        {/* Clear Filters button */}
        <View style={styles.inputContainer}>
        <Text style={styles.header}>Clear Filters</Text>
          <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>New Day ♻️</Text>
          </TouchableOpacity>
        </View>
     
        <View style={styles.separator} />
      <View>
      <ScrollView style={styles.containerBars}>
            <Text style={styles.header}>TOP DRAINING ACTIVITIES</Text>
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
          <Text style={styles.header}>TOP BOOSTING ACTIVITIES</Text>
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
            {/* <View style={styles.spacer} /> */}
            <View style={styles.separator} />
            <Text style={styles.header}>COMPARISON OF YOUR RESOURCES DISTRIBUTION OVER THE TIME</Text>
            <StatisticsGraph />
            <View style={styles.separator} />
            <Text style={styles.header}>YOUR RESOURCES DISTRIBUTION CALENDAR</Text>
            <Text>✅ <Text style={styles.greenText}>GREEN:</Text> These are your good days where you maintained a balanced energy level. Keep up the great work!</Text>
            <Text>🔻 <Text style={styles.redText}>RED:</Text> These are challenging days where you may have felt drained. Reflect on what you can do differently to improve your balance.</Text>
            <ResourceCalendar />
            <View style={styles.separator} />
               <ContraProInputForm 
               drainActivity={drainActivity}
               setDrainActivity={setDrainActivity}
               drainPercentage={drainPercentage}
               setDrainPercentage={setDrainPercentage}
               addDrainBoostActivity={addDrainBoostActivity}
               boostActivity={boostActivity}
               setBoostActivity={setBoostActivity}
               boostPercentage={boostPercentage}
               setBoostPercentage={setBoostPercentage}
            
               />
              
               {/* Horizontal line */}
               <View style={styles.separator} />
            <ActivityList 
            contraProActivities={contraProActivities}
            deleteContraProActivity={deleteContraProActivity}
            triggerRefresh={triggerRefresh}
            />
            <ToggledActivityList
            refreshToggle={refreshToggle}
            />
           
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
    //backgroundColor: '#f9f9f9', // Gainsboro background for visibility
    padding: 10, // Padding around the text
    borderRadius: 5, // Rounded corners
    marginTop: 20, // Space above the text
    textAlign: 'center', // Center the text
 
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
congratulationsText: {
  marginTop: 10,
  fontSize: 16, // Font size
    color: 'black', // Text color
    //backgroundColor: '#f9f9f9', // Gainsboro background for visibility
    padding: 10, // Padding around the text
    borderRadius: 5, // Rounded corners
  
    textAlign: 'center', // Center the text
},
warningText: {
  marginTop: 10,
  fontSize: 16, // Font size
    color: 'black', // Text color
    padding: 10, // Padding around the text
    borderRadius: 5, // Rounded corners
  
    textAlign: 'center', // Center the text
},
containerInstructions: {
  padding: 20,
  alignItems: 'center',
},
instructionText: {
  fontSize: 16,
  color: '#333', // Dark gray for better readability
  textAlign: 'center',
  marginBottom: 20, // Space between the instruction text and the energy columns
},
greenText: {
  color: 'green',
},
redText: {
  color: 'red',
},
activityListButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
},
});

export default App;

