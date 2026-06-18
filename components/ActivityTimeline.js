import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { timeAgo } from '../utils/dateFormatter';

export default function ActivityTimeline({ events = [] }) {
  return (
    <View style={styles.container}>
      {events.map((evt, idx) => (
        <View key={idx} style={styles.item}>
          <View style={styles.dot} />
          <View style={styles.body}>
            <Text style={styles.action}>{evt.action}</Text>
            <Text style={styles.meta}>{evt.user} • {timeAgo(evt.timestamp)}</Text>
            {evt.details ? <Text style={styles.details}>{evt.details}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 8,
    marginVertical: 8,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 10,
  },
  body: {
    flex: 1,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  details: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 4,
  },
});
