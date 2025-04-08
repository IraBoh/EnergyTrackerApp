import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

type EnergyInputModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: number) => void;
  activityType: 'drain' | 'boost'; // New prop for activity type
  selectedActivityPosition: { x: number; y: number }; // Position of the selected activity
};

const EnergyInputModal: React.FC<EnergyInputModalProps> = ({ visible, onClose, onSubmit, activityType, selectedActivityPosition }) => {
  const [value, setValue] = React.useState(0); // State to track the energy value

  const handleIncrease = () => {
    if (value < 10) {
      setValue(value + 1); // Increase value by 1
    }
  };

  const handleDecrease = () => {
    if (value > 0) {
      setValue(value - 1); // Decrease value by 1
    }
  };

  const handleSubmit = () => {
    onSubmit(value); // Submit the current value
    setValue(0); // Reset value after submission
    onClose(); // Close the modal
  };

  // Determine border color based on activity type
  const borderColor = activityType === 'drain' ? 'red' : 'green';

  return (
    <View style={[styles.modalContainer, { top: selectedActivityPosition.y, left: selectedActivityPosition.x }]}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>X</Text> {/* Close button */}
        </TouchableOpacity>
        <Text style={styles.title}>Adjust Energy</Text>
        <View style={styles.buttonContainer}>
          <Button title="-" onPress={handleDecrease} />
          <Text style={styles.valueText}>{value}</Text> {/* Display current value */}
          <Button title="+" onPress={handleIncrease} />
        </View>
        <View style={styles.submitContainer}>
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute', // Position the modal absolutely
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent background
    borderRadius: 10,
    elevation: 5, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 10,
    zIndex: 1000, // Ensure it appears above other elements
  },
  card: {
    width: 150, // Small width for the modal
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'black', // Color of the close button
  },
  title: {
    fontSize: 16, // Smaller title font size
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the buttons and number
    marginBottom: 10,
  },
  valueText: {
    fontSize: 24,
    marginHorizontal: 5, // Reduced margin to bring buttons closer
  },
  submitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default EnergyInputModal;

