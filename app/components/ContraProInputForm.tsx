import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface ContraProInputFormProps {
    drainActivity: string;
    setDrainActivity: (drainActivity: string) => void;
    drainPercentage: string;
    setDrainPercentage: (drainPercentage: string) => void;
    addDrainBoostActivity: (drainActivity: string, drainPercentage: string, boostActivity: string, boostPercentage: string) => void;
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
    //addBoostActivity,
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep === 0 && drainActivity) {
            setCurrentStep(1); // Move to the next step
        } else if (currentStep === 1 && drainPercentage) {
            setCurrentStep(2); // Move to the next step
        } else if (currentStep === 2 && boostActivity) {
            setCurrentStep(3); // Move to the next step
        } else if (currentStep === 3 && boostPercentage) {
            // Add the drain activity and positive aspect to the list
            addDrainBoostActivity(drainActivity, drainPercentage, boostActivity, boostPercentage);
            setCurrentStep(4); // Move to the thank you step
        } else if (currentStep === 4) {
            // Optionally reset or finish
            setCurrentStep(0); // Reset to the first step or handle as needed
        }
    };

    return (
        <View style={styles.inputContainer}>
            {currentStep === 0 && (
                <>
                    <Text style={styles.question}> 1. What is an activity that drains you?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Add your activity"
                        value={drainActivity}
                        onChangeText={setDrainActivity}
                        onSubmitEditing={handleNext}
                    />
                    <Text style={styles.example}>Example: "Working late hours"</Text>
                </>
            )}

            {currentStep === 1 && (
                <>
                    <Text style={styles.question}> 2. How much from 0 to 100% do you think it drains you?</Text>
                    <TextInput
                        style={styles.percentageInput}
                        placeholder="Percentage"
                        value={drainPercentage}
                        onChangeText={setDrainPercentage}
                        keyboardType="numeric"
                        maxLength={2}
                        onSubmitEditing={handleNext}
                    />
                    <Text style={styles.example}>Example: "70"</Text>
                </>
            )}

            {currentStep === 2 && (
                <>
                    <Text style={styles.question}>3. What is the positive aspect or reason for doing this?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Positive Aspect"
                        value={boostActivity}
                        onChangeText={setBoostActivity}
                        onSubmitEditing={handleNext}
                    />
                    <Text style={styles.example}>Example: "I learn new skills"</Text>
                </>
            )}

            {currentStep === 3 && (
                <>
                    <Text style={styles.question}>4. How much from 0 to 100% will it make you feel good once you have done it?</Text>
                    <TextInput
                        style={styles.percentageInput}
                        placeholder="Positive Percentage"
                        value={boostPercentage}
                        onChangeText={setBoostPercentage}
                        keyboardType="numeric"
                        maxLength={2}
                        onSubmitEditing={handleNext}
                    />
                    <Text style={styles.example}>Example: "80"</Text>
                </>
            )}
                c
            {currentStep === 4 && (
                <View>
                    console.log(drainActivity, drainPercentage, boostActivity, boostPercentage);
                    <Text>Thank you for your input!</Text>
                    <Text>Your responses have been recorded and can be found at the end of the list.</Text>
                    <Text>Drain Activity: {drainActivity} ({drainPercentage}%)</Text>
                    
                    <Text>Positive Aspect: {boostActivity} ({boostPercentage}%)</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
            
                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.iconButton, { backgroundColor: '#4CAF50' }]} // Green button
                >
                    <Text style={styles.iconText}>{currentStep === 4 ? 'Finish' : 'Next'}</Text> {/* Save icon */}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
    },
    question: {
        fontSize: 20,
        marginBottom: 10,
        marginTop: 20,
        
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
        marginTop: 20,
        fontSize: 20
    },
    percentageInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
        fontSize: 20
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 5,
    },
    iconButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
    },
    example: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
    },
});

export default ContraProInputForm;