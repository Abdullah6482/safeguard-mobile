import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';

export default function CustomButton({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        isOutline ? styles.btnOutline : styles.btnFilled,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : '#FFF'} />
      ) : (
        <Text style={[styles.btnText, isOutline ? styles.textOutline : styles.textFilled]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  btnFilled: {
    backgroundColor: Colors.primary,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textFilled: {
    color: '#FFF',
  },
  textOutline: {
    color: Colors.primary,
  },
});
