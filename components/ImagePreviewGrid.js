import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function ImagePreviewGrid({ images = [], onRemove, onAdd }) {
  return (
    <View style={styles.container}>
      {images.map((uri, index) => (
        <View key={index} style={styles.thumbnailWrapper}>
          <Image source={{ uri }} style={styles.thumbnail} />
          {onRemove && (
            <TouchableOpacity onPress={() => onRemove(index)} style={styles.deleteBadge}>
              <Text style={styles.deleteText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {onAdd && (
        <TouchableOpacity onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addText}>+ Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -2,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
