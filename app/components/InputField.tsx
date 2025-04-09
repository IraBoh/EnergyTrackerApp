import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface InputFieldProps {
    newActivity: string;
    setNewActivity: (activity: string) => void;
    addActivity: (type: 'drain' | 'boost') => void;

}
const InputField: React.FC<InputFieldProps> = ({ newActivity, setNewActivity, addActivity }) => {
    return (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Add your activity"
            value={newActivity}
            onChangeText={setNewActivity}
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
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10, // Space between input and buttons
        width: 200, // Adjust width as needed
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space buttons evenly
        marginVertical: 10, // Add some vertical spacing
      },
      iconButton: {
        backgroundColor: '#f0f0f0', // Light background for visibility
        padding: 15, // Increase padding for a larger touch area
        borderRadius: 10, // Rounded corners
        alignItems: 'center', // Center the emoji
        shadowColor: '#000', // Shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
      },
      iconText: {
        fontSize: 30, // Adjust size of the emojis
      },
});

export default InputField;

