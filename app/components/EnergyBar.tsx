import React from 'react';
import { View, Text } from 'react-native';
import { energyBarStyles } from '../styles/components/energyBar.styles';

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
    <View style={energyBarStyles.energyContainer}>
      {/* Energy bar */}
      <View style={energyBarStyles.energyWrapper}>
        <View style={energyBarStyles.energyBody}>
          <View
            style={[
              energyBarStyles.energyFill,
              {
                width: `${energy}%`,
                backgroundColor: fillColor,
              },
            ]}
          />
        </View>
        {/* Energy cap */}
        <View style={energyBarStyles.energyCap} />
      </View>
      <Text style={energyBarStyles.energyText}>{energy}%</Text>
    </View>
  );
}
