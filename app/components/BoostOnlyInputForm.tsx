import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface BoostOnlyInputFormProps {
    onlyBoostActivity: string;
    setOnlyBoostActivity: (onlyBoostActivity: string) => void;
    onlyBoostPercentage: string;
    setOnlyBoostPercentage: (onlyBoostPercentage: string) => void;
    addOnlyBoostActivity: (onlyBoostActivity: string, onlyBoostPercentage: string) => void;
    triggerRefreshBoostList: () => void;
}

const BoostOnlyInputForm: React.FC<BoostOnlyInputFormProps> = ({
    onlyBoostActivity: onlyBoostActivity,
    setOnlyBoostActivity,
    onlyBoostPercentage: onlyBoostPercentage,
    setOnlyBoostPercentage,
    addOnlyBoostActivity,
    triggerRefreshBoostList,
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep === 0 && onlyBoostActivity) {
            setCurrentStep(1); // Go to percentage
        } else if (currentStep === 1 && onlyBoostPercentage) {
            addOnlyBoostActivity(onlyBoostActivity, onlyBoostPercentage);
            setCurrentStep(2); // Go to thank you
        } else if (currentStep === 2) {
            // Reset form
            setOnlyBoostActivity('');
            setOnlyBoostPercentage('');
            setCurrentStep(0);
        }
    };

    return (
        <View style={styles.inputContainer}>
            {currentStep === 0 && (
                <>
                    <Text style={styles.question}>1. What activity gives/gave you energy or makes/made you feel good?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E.g., Walk outside, call a friend"
                        value={onlyBoostActivity}
                        onChangeText={setOnlyBoostActivity}
                        onSubmitEditing={handleNext}
                    />
                </>
            )}

            {currentStep === 1 && (
                <>
                    <Text style={styles.question}>2. From 0 to 100%, how much will it boost your energy?</Text>
                    <TextInput
                        style={styles.percentageInput}
                        placeholder="e.g., 40"
                        value={onlyBoostPercentage}
                        onChangeText={setOnlyBoostPercentage}
                        keyboardType="numeric"
                        maxLength={3}
                        onSubmitEditing={handleNext}
            
                    />
                </>
            )}

            {currentStep === 2 && (
                <View>
                    <Text style={styles.thankYou}>✅ Thank you!</Text>
                    <Text>Boost Activity: {onlyBoostActivity} ({onlyBoostPercentage}%)</Text>
                   
                    <Text>Your entry will be saved at the end of the list.</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => {
                        handleNext();
                        triggerRefreshBoostList();
                    }}
                    style={[styles.button]} // Blue button
                >
                    <Text style={styles.buttonText}>{currentStep === 2 ? 'Finish' : 'Next'}</Text>
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
        marginBottom: 10,
        fontSize: 20,
        backgroundColor: '#f9f9f9',
    },
    percentageInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
        fontSize: 20,
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
   
    iconText: {
        fontSize: 20,
        color: '#fff',
    },
    thankYou: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#4CAF50',
    },
});

export default BoostOnlyInputForm;
