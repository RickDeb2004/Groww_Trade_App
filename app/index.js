import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchTopGainersLosers, cacheGet, cacheSet } from "../lib/api";
import SearchBar from "../components/SearchBar";
import { useTheme } from "../providers/ThemeContext";
import { Feather } from "@expo/vector-icons";
const SECTION_KEY = "TOP_GL_CACHE";
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_DATA = {
  top_gainers: [
    { ticker: "TCS", price: "3850", change_percentage: "+3.2%" },
    { ticker: "INFY", price: "1520", change_percentage: "+2.8%" },
    { ticker: "HDFCBANK", price: "1725", change_percentage: "+2.1%" },
    { ticker: "RELIANCE", price: "2805", change_percentage: "+1.9%" },
  ],
  top_losers: [
    { ticker: "ADANIPORTS", price: "1210", change_percentage: "-3.4%" },
    { ticker: "SBIN", price: "645", change_percentage: "-2.7%" },
    { ticker: "ITC", price: "439", change_percentage: "-2.2%" },
    { ticker: "WIPRO", price: "492", change_percentage: "-1.8%" },
  ],
};
export default function ExploreScreen() {
  const router = useRouter();
  const { theme, toggleTheme, palette } = useTheme();
  const [data, setData] = useState({ top_gainers: [], top_losers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (force = false) => {
      try {
        setError(null);
        setLoading(!refreshing);
        const cached = await cacheGet(SECTION_KEY, TTL_MS);
        if (cached && !force) {
          setData(cached);
        } else {
          const fresh = await fetchTopGainersLosers();
          if (!fresh || !fresh.top_gainers?.length) {
            console.warn("API limit reached → showing fallback data");
            setData(FALLBACK_DATA);
          } else {
            setData(fresh);
            await cacheSet(SECTION_KEY, fresh);
          }
        }
      } catch (e) {
        console.warn("Fetch failed → showing fallback data", e);
        setError(null); // don’t show red error
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshing]
  );

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: palette.card }]}
      onPress={() =>
        router.push({
          pathname: "/product/[symbol]",
          params: { symbol: item.ticker },
        })
      }
    >
      <Text style={[styles.ticker, { color: palette.text }]}>
        {item.ticker}
      </Text>
      <Text style={{ color: palette.muted }}>
        {item.price ? `$${item.price}` : "-"}
      </Text>
      <Text
        style={{
          color: item.change_percentage?.startsWith("-")
            ? "#d9534f"
            : "#28a745",
        }}
      >
        {item.change_percentage || "-"}
      </Text>
    </TouchableOpacity>
  );

  const Section = ({ title, list, type }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: "/view-all/[type]", params: { type } })
        }
      >
        <Text style={{ color: palette.link }}>View All</Text>
      </TouchableOpacity>
    </View>
    <FlatList
      data={list.slice(0, 4)}   // 👈 only 4 cards now
      keyExtractor={(item) => item.ticker}
      numColumns={2}
      columnWrapperStyle={{ gap: 16 }}
       ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
      renderItem={renderCard}
      contentContainerStyle={{ rowGap: 18 }}
    />
  </View>
);
  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <SearchBar />
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: palette.text }]}>Explore</Text>

        <TouchableOpacity onPress={toggleTheme} style={{ padding: 6 }}>
          <Feather
            name={theme === "dark" ? "sun" : "moon"} 
            size={22}
            color={palette.link}
          />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ color: palette.muted }}>Loading…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={{ color: "#d9534f" }}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={[
            {
              key: "gainers",
              title: "Top Gainers",
              list: data.top_gainers,
              type: "gainers",
            },
            {
              key: "losers",
              title: "Top Losers",
              list: data.top_losers,
              type: "losers",
            },
          ]}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => (
            <Section title={item.title} list={item.list} type={item.type} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 }, 
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "700" },
  section: { marginTop: 20 }, 
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "600" },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "white",
    elevation: 2, // shadow on Android
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    
  },
  ticker: { fontSize: 18, fontWeight: "700" },
});
