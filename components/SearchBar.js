import { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../providers/ThemeContext";
import { searchTickers } from "../lib/api";
import { useRouter } from "expo-router";

export default function SearchBar() {
  const { palette } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const list = await searchTickers(q.trim());
    setRes(list);
    setLoading(false);
  };

  return (
    <View style={{ marginBottom: 8 }}>
      <TextInput
        placeholder="Search tickers"
        placeholderTextColor={palette.muted}
        value={q}
        onChangeText={(text) => {
          setQ(text);
          if (!text.trim()) {
            setRes([]); 
          }
        }}
        onSubmitEditing={onSubmit}
        style={[
          styles.input,
          { borderColor: palette.border, color: palette.text },
        ]}
      />

      {!!res.length && (
        <FlatList
          data={res}
          keyExtractor={(i) => i.symbol}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/product/[symbol]",
                  params: { symbol: item.symbol },
                })
              }
              style={{ paddingVertical: 6 }}
            >
              <Text style={{ color: palette.link }}>
                {item.symbol} — {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
  },
});
