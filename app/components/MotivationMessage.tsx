import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface MotivationMessageProps {
    energy: number;
}

const MotivationMessage: React.FC<MotivationMessageProps> = ({ energy }) => {
    let message: string;

    if (energy <= 0) {
        message = "❗ Warning: Your energy level is critically low. It looks like you are pushing yourself too hard with activities that drain your energy. If this continues, you risk feeling severely unwell or even facing a breakdown. Please take a break and do something for yourself from the right column. Consider adding a new activity today, and if you're unsure, ask your friends or family for ideas.";
    } else if (energy <= 40) {
        message = `😌 You have ${energy}% energy. You're starting to engage in activities that give you energy, and that's a great step! Keep focusing on self-care and choose something uplifting from the right column to boost your mood further.`;
    } else if (energy <= 70) {
        message = `😊 You have ${energy}% energy! You're doing well by engaging in activities that bring you joy and energy. Keep it up! Remember to plan and include more energy-boosting activities in your day to maintain this positive momentum.`;
    } else {
        message = "🎉 Great job! You have a high energy level! Keep up the good work and continue doing the things that make you feel good. Your efforts are paying off, and you're in a great place!";
    }

    return <Text style={styles.motivationalMessage}>{message}</Text>;
};

const styles = StyleSheet.create({
    motivationalMessage: {
        fontSize: 16, // Font size
        color: 'black', // Text color
       // backgroundColor: '#f9f9f9', // Gainsboro background for visibility
        padding: 10, // Padding around the text
        borderRadius: 5, // Rounded corners
        marginTop: 20, // Space above the text
        textAlign: 'center', // Center the text
       /*  shadowColor: '#000', // Shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow */
    },
});

export default MotivationMessage;