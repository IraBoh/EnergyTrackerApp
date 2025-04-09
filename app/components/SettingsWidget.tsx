import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SettingsWidget: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Text>This is where you can adjust your settings.</Text>
      {/* Additional settings can be added here later */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default SettingsWidget;












