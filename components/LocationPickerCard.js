import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { formatCoordinates } from '../utils/locationHelper';

export default function LocationPickerCard({ latitude, longitude, onRefresh }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Incident Location</Text>
      <Text style={styles.coords}>{formatCoordinates(latitude, longitude)}</Text>
      {onRefresh && (
        <TouchableOpacity onPress={onRefresh} style={styles.btn}>
          <Text style={styles.btnText}>Update GPS</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  coords: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  btnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
