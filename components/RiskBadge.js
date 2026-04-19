import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateRiskScore } from '../lib/riskCalculator';

export default function RiskBadge({ probability, severity }) {
  const { score, level, color } = calculateRiskScore(probability, severity);

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{level} ({score})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
