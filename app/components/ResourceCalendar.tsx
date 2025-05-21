import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface MarkedDate {
    marked: boolean;
    dotColor: string;
}

interface ActivityPair {
    _id: string;
    drainActivity: { name: string; percentage: number };
    boostActivity: { name: string; percentage: number };
}
const ResourceCalendar = () => {
    const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkedDate }>({});
    const [selectedActivities, setSelectedActivities] = useState<ActivityPair[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

const getRecentDates = (days: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  
  useEffect(() => {
    const preloadMarkedDates = async () => {
      const dates = getRecentDates(365); // look back 30 days
      const marks: { [key: string]: MarkedDate } = {};
  
      for (const date of dates) {
        const activities = await loadSavedActivities(date);
  
        if (activities.length > 0) {
          let drain = 0;
          let boost = 0;
  
          activities.forEach((a: ActivityPair) => {
            if (a.drainActivity) drain += a.drainActivity.percentage;
            if (a.boostActivity) boost += a.boostActivity.percentage;
          });
  
          const net = boost - drain;
  
          marks[date] = {
            marked: true,
            dotColor: net > 0 ? 'green' : 'orange',
          };
        }
      }
      console.log("marks", marks);
  
      setMarkedDates(marks);
    };
  
    preloadMarkedDates();
  }, []);
  


// Load saved activities (with drainActivity and boostActivity)
const loadSavedActivities = async (date: string) => {
    try {
        const response = await fetch(`http://192.168.1.138:5000/saved-todays-activities/${date}`);
        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        } else if (Array.isArray(data.activities)) {
            return data.activities;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error loading saved activities:', error);
        return [];
    }
};

    const onDayPress = async (day: { dateString: string }) => {
        const date = day.dateString;
        setCurrentDate(date);

        const activities = await loadSavedActivities(date);
        setSelectedActivities(activities);


    };
    const calculateTotals = () => {
        let totalDrains = 0;
        let totalBoosts = 0;
    
        selectedActivities.forEach(activity => {
          if (activity.drainActivity) totalDrains += activity.drainActivity.percentage;
          if (activity.boostActivity) totalBoosts += activity.boostActivity.percentage;
        });
    
        return {
          totalDrains,
          totalBoosts,
          netEnergy: totalBoosts - totalDrains,
        };
      };
    
      const { totalDrains, totalBoosts, netEnergy } = calculateTotals();

    useEffect(() => {
        setMarkedDates(markedDates);
    }, [markedDates]);

  

    return (
        <View style={styles.container}>
            <Calendar markedDates={markedDates} onDayPress={onDayPress} />

            <Text style={styles.title}>Activities for {currentDate}</Text>

<View style={styles.rowHeader}>
  <Text style={[styles.headerCell, styles.drainedText]}>Drain Activity</Text>
  <Text style={[styles.headerCell, styles.boostedText]}>Boost Activity</Text>
</View>

{selectedActivities.map((pair) => (
  <View key={pair._id} style={styles.row}>
    <Text style={styles.cell}>
      {pair.drainActivity.name} - {pair.drainActivity.percentage}%
    </Text>
    <Text style={styles.cell}>
      {pair.boostActivity.name} + {pair.boostActivity.percentage}%
    </Text>
  </View>
))}

<View style={styles.row}>
  <Text style={[styles.totalCell, styles.drainedText]}>
    Total Drained: {totalDrains}%
  </Text>
  <Text style={[styles.totalCell, styles.boostedText]}>
    Total Boosted: {totalBoosts}%
  </Text>
  <Text style={[styles.totalCell]}>| Net: {netEnergy}% </Text>
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

    rowHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginTop: 10,
        paddingBottom: 5,
      },
      
      headerCell: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 16,
      },
      
      row: {
        flexDirection: 'row',
        paddingVertical: 4,
      },
      
      cell: {
        flex: 1,
        fontSize: 15,
        color: 'black',
      },
      
      totalCell: {
        flex: 1,
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 10,
      }
      
});

export default ResourceCalendar;
