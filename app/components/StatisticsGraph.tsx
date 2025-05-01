import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, ScrollView, Text } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';

const StatisticsGraph = () => {
    const [data, setData] = useState<any | null>(null); // Define the type for data
    const [view, setView] = useState('month'); // Default view

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://192.168.1.138:5000/resources-distribution'); // Replace with your actual endpoint
                const fetchedData = await response.json();

                // Sort the fetched data by date
                fetchedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                const processedData = processData(fetchedData);
                setData(processedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [view]);

    const processData = (fetchedData: any) => {
        const labels: string[] = [];
        const data: number[][] = []; // each bar = [drained, boosted]

        fetchedData.forEach((item: any) => {
            const dateParts = item.date.split('-'); // Split the date string
            const day = dateParts[2]; // Extract the day
            const month = new Date(item.date).toLocaleString('default', { month: 'long' }); // Get the full month name
            labels.push(`${day} ${month}`); // Combine day and month
            data.push([item.drained, item.gave]); // Push drained and gave values as an array
        });

        return {
            labels,
            data,
            legend: ['Drained', 'Boosted'], // Optional legend
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Month: {new Date().toLocaleString('default', { month: 'long' })}</Text>
            <Text style={styles.title}>Year: {new Date().getFullYear()}</Text>
            <ScrollView horizontal>
                {data && ( // Ensure data is not null before rendering
                    <StackedBarChart
                        data={{
                            labels: data.labels,
                            data: data.data,
                            legend: data.legend, // Optional legend
                            barColors: ['#ff4d4d', '#4dff4d'], // Define colors for the bars
                        }}
                        width={400} // Adjust width as needed
                        height={300}
                        yAxisLabel=""
                        hideLegend={false}
                        yAxisSuffix="%"
                        chartConfig={{
                            backgroundColor: '#ffffff', // Change to white for a brighter background
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0, // Optional
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black for labels
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black for labels
                            style: {
                                borderRadius: 16,
                            },
                            barPercentage: 1,
                        
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff', // Change to white for a brighter background
        marginLeft: 20,
        marginRight: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
});

export default StatisticsGraph;
