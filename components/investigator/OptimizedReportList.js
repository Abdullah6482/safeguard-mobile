import React, { memo } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import RiskBadge from '../RiskBadge';

const ITEM_HEIGHT = 80;

const MemoizedReportCard = memo(({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(item)}>
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <RiskBadge probability={item.probability || 2} severity={item.severity || 2} />
    </View>
    <Text style={styles.meta}>{item.incidentType} • {item.location}</Text>
  </TouchableOpacity>
));

export default function OptimizedReportList({ reports = [], onSelectReport }) {
  return (
    <FlatList
      data={reports}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => <MemoizedReportCard item={item} onPress={onSelectReport} />}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    height: ITEM_HEIGHT - 8,
    backgroundColor: '#FFF',
    marginVertical: 4,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
