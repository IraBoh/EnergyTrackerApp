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

const ResourceCalendar = () => {
    const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkedDate }>({}); // Define the type for markedDates

    useEffect(() => {
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

        fetchData();
    }, []);

    const onDayPress = (day: { dateString: string }) => {
        const date = day.dateString;
        const markedDate = markedDates[date];
        if (markedDate) {
            const displayDifference = markedDate.difference! < 0 
                ? markedDate.difference 
                : `+${markedDate.difference}`; // Format the difference
            Alert.alert(`Date: ${date}`, `Boosted: ${markedDate.gave} Drained: ${markedDate.drained} Difference: ${displayDifference}`);
        } else {
            Alert.alert(`No data for ${date}`);
        }
    };

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

    return (
        <View style={styles.container}>
            <Calendar
                markedDates={markedDates}
                onDayPress={onDayPress}
                //renderDay={renderDay} // Use the custom render function
            />
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
});

export default ResourceCalendar;
