// components/AddToWatchlistModal.jsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../providers/ThemeContext";
import { useWatchlists } from "../providers/WatchlistContext";

export default function AddToWatchlistModal({ visible, onClose, symbol }) {
  const { palette } = useTheme();
  const { lists, addToWatchlist, removeFromWatchlists, isInAnyWatchlist } =
    useWatchlists();

  const inAny = isInAnyWatchlist(symbol);
  const [newListName, setNewListName] = useState("");
  const [mode, setMode] = useState("add"); // "add" | "manage"

  const handleCreateNew = async () => {
    if (!newListName.trim()) return;
    await addToWatchlist(newListName.trim(), symbol);
    setNewListName("");
    setMode("manage");
  };

  const handleAddExisting = async (name) => {
    await addToWatchlist(name, symbol);
    setMode("manage");
  };

  const handleRemoveAll = async () => {
    await removeFromWatchlists(symbol);
    setMode("add");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: palette.card }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>
            {mode === "add" ? "Add to Watchlist" : "Manage Watchlist"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={22} color={palette.text} />
          </TouchableOpacity>
        </View>

        {/* Add Mode */}
        {mode === "add" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            {/* Create new list */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: palette.text, marginBottom: 6 }}>
                Create new list
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  placeholder="Enter list name"
                  placeholderTextColor={palette.muted}
                  value={newListName}
                  onChangeText={setNewListName}
                  style={[
                    styles.input,
                    { borderColor: palette.border, color: palette.text },
                  ]}
                />
                <TouchableOpacity
                  style={[styles.primary, { backgroundColor: "#22c55e" }]}
                  onPress={handleCreateNew}
                >
                  <Text style={styles.primaryText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Add to existing lists */}
            {lists && Object.keys(lists).length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: palette.text, marginBottom: 6 }}>
                  Or add to existing:
                </Text>
                {Object.keys(lists).map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.row, { borderColor: palette.border }]}
                    onPress={() => handleAddExisting(name)}
                  >
                    <Text style={[styles.rowText, { color: palette.text }]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Manage Mode */}
        {mode === "manage" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={{ color: palette.text, marginBottom: 10 }}>
              This stock is in your watchlist(s).
            </Text>

            {Object.keys(lists).map((name) => {
              const inList = (lists[name] || []).includes(symbol);
              if (!inList) return null;
              return (
                <View
                  key={name}
                  style={[styles.row, { borderColor: palette.border }]}
                >
                  <Text style={[styles.rowText, { color: palette.text }]}>
                    {name}
                  </Text>
                </View>
              );
            })}

            {/* Remove all */}
            {inAny && (
              <TouchableOpacity
                style={[styles.destructive, { borderColor: "#ef4444" }]}
                onPress={handleRemoveAll}
              >
                <Feather name="trash-2" size={18} color="#ef4444" />
                <Text style={styles.destructiveText}>
                  Remove from all watchlists
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flex: 1,
  },
  primary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryText: { color: "white", fontWeight: "700" },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: { fontSize: 15, fontWeight: "500" },
  destructive: {
    marginTop: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  destructiveText: { color: "#ef4444", fontWeight: "700" },
});
