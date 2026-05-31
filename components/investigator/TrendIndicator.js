import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function TrendIndicator({ percentage, isIncreaseBad = true }) {
  const isUp = percentage >= 0;
  const isGood = isIncreaseBad ? !isUp : isUp;
  const color = isGood ? Colors.success : Colors.danger;

  return (
    <View style={[styles.container, { backgroundColor: isGood ? '#ECFDF5' : '#FEF2F2' }]}>
      <Text style={[styles.text, { color }]}>
        {isUp ? '↑' : '↓'} {Math.abs(percentage)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
