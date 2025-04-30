import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/components/energyBar.styles';

type EnergyProps = {
  energy: number; // 0–100
};

export default function EnergyBar({ energy }: EnergyProps) {
  // Determine color based on energy level
  let fillColor = '#008000';
  if (energy <= 70) fillColor = '#66CDAA';
  if (energy <= 40) fillColor = '#90EE90';
  if (energy <= 0) fillColor = 'red';

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
