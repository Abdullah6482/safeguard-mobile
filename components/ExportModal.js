import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function ExportModal({ visible, onClose, onExport }) {
  const [format, setFormat] = useState('csv');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Export Incident Reports</Text>
          <View style={styles.row}>
            {['csv', 'json'].map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFormat(f)}
                style={[styles.btnFormat, format === f && styles.btnFormatActive]}
              >
                <Text style={[styles.textFormat, format === f && styles.textFormatActive]}>
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.btnCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onExport(format)} style={styles.btnConfirm}>
              <Text style={styles.confirmText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFF',
    width: '85%',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  btnFormat: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnFormatActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  textFormat: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  textFormatActive: {
    color: '#FFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnCancel: {
    padding: 10,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  btnConfirm: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
