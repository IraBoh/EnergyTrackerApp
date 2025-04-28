import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface MotivationMessageProps {
    energy: number;
}

const MotivationMessage: React.FC<MotivationMessageProps> = ({ energy }) => {
    let message: string;
    if (energy <= 0) {
        message = "❗Warning: You've pushed yourself too hard with activities that drain your energy. If this continues, you risk feeling severely unwell or even facing a breakdown. It's crucial to take immediate action and allow yourself time to recover, or you may find yourself struggling for days.";
    } else if (energy <= 30) {
        message = "⚠️ You are in the dangerous zone now. You need to stop doing the activities that drain your energy and do something for yourself! Choose something from the right column or add a new thing and do it today⚠️ for your own good!";
    } else if (energy <= 60) {
        message = "You are in the zone that still gives you recourses to do the have to things. But remember to plan and do the activities today that give you energy!";
    } else {
        message = "Great job! Keep up the good energy!";
    }

    return <Text style={styles.motivationalMessage}>{message}</Text>;
};

const styles = StyleSheet.create({
    motivationalMessage: {
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
});

export default MotivationMessage;