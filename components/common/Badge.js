import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function Badge({ label, variant = 'primary', style }) {
  const bgColors = {
    primary: Colors.primary,
    success: Colors.success,
    warning: Colors.warning,
    danger: Colors.danger,
  };
  return (
    <View style={[styles.badge, { backgroundColor: bgColors[variant] || Colors.primary }, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
