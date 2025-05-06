import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface ContraProInputFormProps {
  drainActivity: string;
  setDrainActivity: (drainActivity: string) => void;
  drainPercentage: string;
  setDrainPercentage: (drainPercentage: string) => void;
  addDrainBoostActivity: (
    drainActivity: string,
    drainPercentage: string,
    boostActivity: string,
    boostPercentage: string
  ) => void;
  boostActivity: string;
  setBoostActivity: (boostActivity: string) => void;
  boostPercentage: string;
  setBoostPercentage: (boostPercentage: string) => void;
}

const ContraProInputForm: React.FC<ContraProInputFormProps> = ({
  drainActivity,
  setDrainActivity,
  drainPercentage,
  setDrainPercentage,
  addDrainBoostActivity,
  boostActivity,
  setBoostActivity,
  boostPercentage,
  setBoostPercentage,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === 0 && drainActivity) {
      setCurrentStep(1);
    } else if (currentStep === 1 && drainPercentage) {
      setCurrentStep(2);
    } else if (currentStep === 2 && boostActivity) {
      setCurrentStep(3);
    } else if (currentStep === 3 && boostPercentage) {
      addDrainBoostActivity(drainActivity, drainPercentage, boostActivity, boostPercentage);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(0);
    }
  };

  return (
    <View style={styles.inputContainer}>
      {currentStep === 0 && (
        <>
          <Text style={styles.question}>1. What is an activity that drains you?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Working late hours"
            value={drainActivity}
            onChangeText={setDrainActivity}
            onSubmitEditing={handleNext}
            placeholderTextColor="#aaa"
          />
        </>
      )}

      {currentStep === 1 && (
        <>
          <Text style={styles.question}>2. How much from 0 to 100% does it drain you?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 70"
            value={drainPercentage}
            onChangeText={setDrainPercentage}
            keyboardType="numeric"
            maxLength={2}
            onSubmitEditing={handleNext}
            placeholderTextColor="#aaa"
          />
        </>
      )}

      {currentStep === 2 && (
        <>
          <Text style={styles.question}>3. What's the positive aspect or reason for doing this?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. I learn new skills"
            value={boostActivity}
            onChangeText={setBoostActivity}
            onSubmitEditing={handleNext}
            placeholderTextColor="#aaa"
          />
        </>
      )}

      {currentStep === 3 && (
        <>
          <Text style={styles.question}>4. How much from 0 to 100% does that benefit make you feel good?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 80"
            value={boostPercentage}
            onChangeText={setBoostPercentage}
            keyboardType="numeric"
            maxLength={3}
            onSubmitEditing={handleNext}
            placeholderTextColor="#aaa"
          />
        </>
      )}

      {currentStep === 4 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.thankYou}>🎉 Thank you for your input! You can find your activities in the list below.</Text>
          <Text style={styles.summary}>Drain Activity: {drainActivity} ({drainPercentage}%)</Text>
          <Text style={styles.summary}>Positive Aspect: {boostActivity} ({boostPercentage}%)</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>{currentStep === 4 ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    margin: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingVertical: 10,
  },
  thankYou: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
});

export default ContraProInputForm;
