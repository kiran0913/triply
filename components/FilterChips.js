import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { INTEREST_TAGS } from "../utils/constants";

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  scroll: { paddingHorizontal: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  chipActive: { backgroundColor: "#2196F3" },
  chipText: { fontSize: 14, color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
});

export default function FilterChips({ selectedTag, onSelectTag }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={[styles.chip, !selectedTag && styles.chipActive]}
          onPress={() => onSelectTag(null)}
        >
          <Text style={[styles.chipText, !selectedTag && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {INTEREST_TAGS.map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelectTag(isActive ? null : tag)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
