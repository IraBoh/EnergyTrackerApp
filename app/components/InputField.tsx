import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface InputFieldProps {
    newActivity: string;
    setNewActivity: (activity: string) => void;
    activityPercentage: string;
    setActivityPercentage: (percentage: string) => void;
    addActivity: (type: 'drain' | 'boost') => void;
}

const InputField: React.FC<InputFieldProps> = ({ newActivity, setNewActivity, activityPercentage, setActivityPercentage, addActivity }) => {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="Add your activity"
                value={newActivity}
                onChangeText={setNewActivity}
            />
            <TextInput
                style={styles.percentageInput}
                placeholder="Percentage"
                value={activityPercentage}
                onChangeText={setActivityPercentage}
                keyboardType="numeric"
                maxLength={2}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => addActivity('drain')} style={styles.iconButton}>
                    <Text style={styles.iconText}>🪫</Text> {/* Battery emoji for drain */}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addActivity('boost')} style={styles.iconButton}>
                    <Text style={styles.iconText}>🔋</Text> {/* Battery emoji for boost */}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: 135,
        marginBottom: 10, // Space between activity name and percentage input
    },
    percentageInput: {
        width: 100, // Set a fixed width for the percentage input
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10, // Space between percentage input and buttons
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space buttons evenly
    },
    iconButton: {
        backgroundColor: '#f0f0f0', // Light background for visibility
        padding: 15,
        borderRadius: 10, // Rounded corners
        alignItems: 'center', // Center the emoji
    },
    iconText: {
        fontSize: 30, // Adjust size of the emojis
    },
});

export default InputField;

