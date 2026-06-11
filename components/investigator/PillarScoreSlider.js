import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function PillarScoreSlider({ label, value, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} (Score: {value})</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map(num => (
          <TouchableOpacity
            key={num}
            onPress={() => onChange(num)}
            style={[styles.btn, value === num && styles.btnActive]}
          >
            <Text style={[styles.btnText, value === num && styles.textActive]}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  btnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  textActive: {
    color: '#FFF',
  },
});
