import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface MarkedDate {
    marked: boolean;
    dotColor: string;
    gave: number;
    drained: number;
    difference?: number; // Optional property for the difference
}

// Function to load selected activities from the database
const loadSelectedActivities = async (date: string) => {
    try {
        const response = await fetch(`http://192.168.1.138:5000/selected-activity/${date}`);
        const selectedActivities = await response.json();
        return selectedActivities ? selectedActivities.activities : [];
    } catch (error) {
        console.error('Error loading selected activities:', error);
        return [];
    }
};

// Function to load the sums of drained and boosted activities
const loadActivitySums = async (date: string) => {
    try {
        const response = await fetch(`http://192.168.1.138:5000/selected-activity/sum/${date}`);
        const data = await response.json();
        return data.status === 'success' ? data.data : { drainSum: 0, boostSum: 0 };
    } catch (error) {
        console.error('Error loading activity sums:', error);
        return { drainSum: 0, boostSum: 0 };
    }
};

const ResourceCalendar = () => {
    const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkedDate }>({}); // Define the type for markedDates
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [totals, setTotals] = useState({ drainSum: 0, boostSum: 0 }); // State for totals

    const fetchData = async () => {
        try {
            const response = await fetch('http://192.168.1.138:5000/resources-distribution'); // Replace with your actual endpoint
            const data = await response.json();
            
            // Transform data into the format required by the calendar
            const formattedData: { [key: string]: MarkedDate } = {};
            data.forEach((item: { date: string; drained: number; gave: number }) => {
                const difference = item.gave - item.drained; // Calculate the difference
                formattedData[item.date] = {
                    marked: true,
                    gave: item.gave,
                    drained: item.drained,
                    dotColor: difference > 0 ? 'green' : 'red', // Customize the dot color based on the difference
                    difference: difference, // Store the difference
                };
            });
            setMarkedDates(formattedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData(); // Call fetchData when the component mounts
    }, []);

    // Function to handle day press
    const onDayPress = async (day: { dateString: string }) => {
        const date = day.dateString; // Assuming day.dateString is the format you need
        setCurrentDate(date); // Update the current date state

        // Fetch selected activities for the pressed day
        const activities = await loadSelectedActivities(date);
        setSelectedActivities(activities); // Update the state with fetched activities

        // Fetch the sums for the pressed day
        const sums = await loadActivitySums(date);
        setTotals(sums); // Update the state with fetched sums

        // Log the selected activities and sums for the pressed day
        console.log('Selected Activities for', date, activities);
        console.log('Totals:', sums);
    };

    // Separate activities into drained and boosted
    const drainedActivities = selectedActivities.filter((activity: { type: string }) => activity.type === 'drain');
    const boostedActivities = selectedActivities.filter((activity: { type: string }) => activity.type === 'boost');

    // Sort activities by percentage from highest to lowest
    const sortedDrainedActivities = drainedActivities.sort((a: { percentage: number }, b: { percentage: number }) => b.percentage - a.percentage);
    const sortedBoostedActivities = boostedActivities.sort((a: { percentage: number }, b: { percentage: number }) => b.percentage - a.percentage);

    // Custom render function for each day
    const renderDay = (date: { day: number; dateString: string }) => {
        const markedDate = markedDates[date.dateString];
        return (
            <View style={styles.dayContainer}>
                <Text>{date.day}</Text>
                {markedDate && (
                    <Text style={styles.differenceText}>
                        {markedDate.difference! < 0 ? markedDate.difference : `+${markedDate.difference}`}
                    </Text>
                )}
            </View>
        );
    };

    const updateValues = async (date: string, newDrained: number, newGave: number) => {
        try {
            // Update the values in the database
            await fetch('http://192.168.1.138:5000/resources-distribution', { // Adjusted URL to match the endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date, drained: newDrained, gave: newGave }), // Include date in the request body
            });

            // After updating, fetch the latest data
            fetchData(); // Call the function to refresh the data
        } catch (error) {
            console.error('Error updating values:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Calendar
                markedDates={markedDates}
                onDayPress={onDayPress}
                //renderDay={renderDay} // Use the custom render function
            />
            <Text style={styles.title}>Selected Activities for {currentDate}</Text>
            <View style={styles.columns}>
                <View style={styles.column}>
                    <Text style={[styles.columnTitle, styles.drainedText]}>Drained:</Text>
                    {sortedDrainedActivities.map((activity: { _id: string; name: string; percentage: number }) => (
                        <Text key={activity._id} style={styles.text}>
                            {activity.name} - {activity.percentage}%
                        </Text>
                    ))}
                    <Text style={styles.total}>Total Drained: {totals.drainSum}%</Text>
                </View>
                <View style={styles.column}>
                    <Text style={[styles.columnTitle, styles.boostedText]}>Boosted:</Text>
                    {sortedBoostedActivities.map((activity: { _id: string; name: string; percentage: number }) => (
                        <Text key={activity._id} style={styles.text}>
                            {activity.name} + {activity.percentage}%
                        </Text>
                    ))}
                    <Text style={styles.total}>Total Boosted: {totals.boostSum}%</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginBottom: 200,
    },
    dayContainer: {
        alignItems: 'center',
        justifyContent: 'center', // Center the content
        height: 50, // Set a height to ensure visibility
    },
    differenceText: {
        color: 'black', // Customize the text color
        fontSize: 12, // Adjust font size for better visibility
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    columns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    column: {
        flex: 1,
        marginRight: 10,

    },
    columnTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    drainedText: {
        color: 'red',
    },
    boostedText: {
        color: 'green',
    },
    text: {
        color: 'black',
        fontSize: 15,
    },
    total: {
        fontWeight: 'bold',
        marginTop: 10,
    },
});

export default ResourceCalendar;
