import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type ActivityProps = {
  label: string;
  onPress: () => void;
  borderColor: string;
};

const ActivityButton: React.FC<ActivityProps> = ({ label, onPress, borderColor }) => {
  return (
    <TouchableOpacity style={[styles.button, { borderColor }]} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 8,
    width: 140,
    alignItems: 'center',
    padding: 10,
  },
  text: {
    fontSize: 16,
  },
});

export default ActivityButton;

