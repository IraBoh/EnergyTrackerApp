import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface MotivationMessageProps {
    energy: number;
}

const MotivationMessage: React.FC<MotivationMessageProps> = ({ energy }) => {
    let message: string;

    if (energy <= 30) {
        message = "Take a break or you will be drained!";
    } else if (energy <= 60) {
        message = "Remember to do smth for yourself!";
    } else {
        message = "Great job! Keep up the good energy!";
    }

    return <Text style={styles.motivationalMessage}>{message}</Text>;
};

const styles = StyleSheet.create({
    motivationalMessage: {
        color: 'black', // Text color
        fontWeight: 'bold', // Bold text
        fontSize: 14,
        marginBottom: 4, // Space between message and energy bar
        textAlign: 'center', // Center the text
        zIndex: 1, // Ensure the message is above other elements
        position: 'relative', // Ensure it is positioned correctly
    },
});

export default MotivationMessage;