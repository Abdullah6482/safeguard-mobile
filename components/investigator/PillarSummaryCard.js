import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function PillarSummaryCard({ scores }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>4 Pillars Risk Summary</Text>
      <View style={styles.grid}>
        <View style={styles.item}><Text style={styles.key}>People</Text><Text style={styles.val}>{scores?.people || 0}</Text></View>
        <View style={styles.item}><Text style={styles.key}>Asset</Text><Text style={styles.val}>{scores?.asset || 0}</Text></View>
        <View style={styles.item}><Text style={styles.key}>Environment</Text><Text style={styles.val}>{scores?.environment || 0}</Text></View>
        <View style={styles.item}><Text style={styles.key}>Reputation</Text><Text style={styles.val}>{scores?.reputation || 0}</Text></View>
      </View>
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
    marginVertical: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
  },
  key: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  val: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
});
