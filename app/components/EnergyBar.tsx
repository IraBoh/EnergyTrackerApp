import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/components/energyBar.styles';

type EnergyProps = {
  energy: number; // 0–100
};

export default function EnergyBar({ energy }: EnergyProps) {
  // Determine color based on energy level
  let fillColor = 'green';
  if (energy <= 60) fillColor = 'orange';
  if (energy <= 30) fillColor = 'red';

  return (
    <View style={styles.energyContainer}>
      {/* Energy bar */}
      <View style={styles.energyWrapper}>
        <View style={styles.energyBody}>
          <View
            style={[
              styles.energyFill,
              {
                width: `${energy}%`,
                backgroundColor: fillColor,
              },
            ]}
          />
        </View>
        {/* Energy cap */}
        <View style={styles.energyCap} />
      </View>
      <Text style={styles.energyText}>{energy}%</Text>
    </View>
  );
}
