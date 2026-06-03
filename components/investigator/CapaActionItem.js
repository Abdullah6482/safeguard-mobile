import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function CapaActionItem({ action, onToggleStatus }) {
  const isDone = action.status === 'completed';

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      <TouchableOpacity onPress={() => onToggleStatus && onToggleStatus(action.id)} style={styles.check}>
        <Text style={styles.checkText}>{isDone ? '✓' : '○'}</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, isDone && styles.textDone]}>{action.title}</Text>
        <Text style={styles.meta}>Assignee: {action.assignedTo || 'Unassigned'} • Due: {action.dueDate || 'N/A'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 4,
  },
  cardDone: {
    backgroundColor: '#F8FAFC',
    opacity: 0.8,
  },
  check: {
    marginRight: 12,
  },
  checkText: {
    fontSize: 20,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
