import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { VictoryChart, VictoryLine, VictoryAxis } from "victory-native";
import { fetchCompanyOverview, fetchDailySeries } from "../../lib/api";
import { useTheme } from "../../providers/ThemeContext";
import { useWatchlists } from "../../providers/WatchlistContext";
import AddToWatchlistModal from "../../components/AddToWatchlistModal";
import { Feather } from "@expo/vector-icons";

export default function ProductScreen() {
  const { symbol } = useLocalSearchParams();
  const router = useRouter();
  const { palette, theme, toggleTheme } = useTheme();
  const { isInAnyWatchlist } = useWatchlists();

  const [overview, setOverview] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tab, setTab] = useState("Overview");

  const inWatchlist = isInAnyWatchlist(symbol);

  // Fallback dataset
  const FALLBACK = {
    TCS: {
      Name: "Tata Consultancy Services",
      Industry: "IT Services",
      Sector: "Technology",
      MarketCapitalization: "14,00,000 Cr",
      "52WeekHigh": "4200",
      "52WeekLow": "3100",
      series: [3800, 3850, 3900, 3875, 3920, 3950],
    },
    INFY: {
      Name: "Infosys Ltd",
      Industry: "IT Services",
      Sector: "Technology",
      MarketCapitalization: "6,40,000 Cr",
      "52WeekHigh": "1700",
      "52WeekLow": "1350",
      series: [1450, 1480, 1500, 1510, 1520, 1535],
    },
    RELIANCE: {
      Name: "Reliance Industries",
      Industry: "Conglomerate",
      Sector: "Energy & Retail",
      MarketCapitalization: "18,50,000 Cr",
      "52WeekHigh": "2900",
      "52WeekLow": "2400",
      series: [2700, 2750, 2780, 2795, 2805, 2820],
    },
  };
  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);

        const [ov, ts] = await Promise.all([
          fetchCompanyOverview(symbol),
          fetchDailySeries(symbol, 120),
        ]);

        const fb = FALLBACK[symbol]; // specific fallback for some symbols

        // Overview → prefer API, fallback for missing values
        let finalOverview = {};
        if (ov && Object.keys(ov).length > 0) {
          finalOverview = { ...fb, ...ov };
        } else if (fb) {
          finalOverview = fb;
        }

        // ✅ Chart logic
        let finalSeries = [];
        if (ts && ts.length > 0) {
          // API works → use API data
          finalSeries = ts.map((p, idx) => ({ x: idx + 1, y: p.close }));
        } else {
          // API failed → choose fallback chart
          if (fb?.series) {
            // Known fallback (TCS, INFY, RELIANCE)
            finalSeries = fb.series.map((y, i) => ({ x: i + 1, y }));
          } else {
            // 👇 Default chart assignment
            if (["TCS", "INFY", "RELIANCE"].includes(symbol)) {
              finalSeries = FALLBACK[symbol].series.map((y, i) => ({
                x: i + 1,
                y,
              }));
            } else if (
              ["ADANIPORTS", "SBIN", "ITC", "WIPRO"].includes(symbol)
            ) {
              // Top losers → reuse RELIANCE chart
              finalSeries = FALLBACK.RELIANCE.series.map((y, i) => ({
                x: i + 1,
                y,
              }));
            } else {
              // Default → use TCS chart
              finalSeries = FALLBACK.TCS.series.map((y, i) => ({
                x: i + 1,
                y,
              }));
            }
          }
        }

        setOverview(finalOverview);
        setSeries(finalSeries);
      } catch (e) {
        console.log("Error fetching product data:", e.message);

        // Hard fallback
        if (FALLBACK[symbol]) {
          setOverview(FALLBACK[symbol]);
          setSeries(FALLBACK[symbol].series.map((y, i) => ({ x: i + 1, y })));
        } else {
          // totally unknown stock → default chart = TCS
          setOverview({ Name: symbol });
          setSeries(FALLBACK.TCS.series.map((y, i) => ({ x: i + 1, y })));
        }

        setError("Some data missing, showing fallback.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [symbol]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={palette.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleTheme}>
          <Feather
            name={theme === "dark" ? "sun" : "moon"}
            size={22}
            color={palette.text}
          />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} />}
      {!loading && error && <Text style={{ color: "red" }}>{error}</Text>}

      {!loading && overview && (
        <View style={{ padding: 16 }}>
          {/* Company Info */}
          <Text style={[styles.company, { color: palette.text }]}>
            {overview.Name || symbol}
          </Text>
          <Text style={[styles.price, { color: palette.text }]}>
            ₹{overview.MarketCapitalization || "-"}
          </Text>
          <Text style={{ color: "green", marginBottom: 4 }}>+2.5% (1D)</Text>

          {/* Tag */}
          <View style={[styles.chip, { borderColor: palette.border }]}>
            <Text style={{ color: palette.text }}>
              {overview.Sector || "—"}
            </Text>
          </View>

          {/* Chart */}
          <View style={[styles.card, { backgroundColor: palette.card }]}>
            <VictoryChart height={220}>
              <VictoryAxis tickFormat={() => ""} />
              <VictoryAxis dependentAxis />
              <VictoryLine
                style={{ data: { stroke: "#22c55e", strokeWidth: 2 } }}
                data={series}
              />
            </VictoryChart>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {["Overview", "News", "Events"].map((t) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)}>
                <Text
                  style={[
                    t === tab
                      ? [styles.tabActive, { color: palette.link }]
                      : [styles.tab, { color: palette.text }],
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {tab === "Overview" && (
            <View style={[styles.card, { backgroundColor: palette.card }]}>
              <Text style={{ color: palette.text }}>
                Industry:{" "}
                <Text style={{ color: palette.muted }}>
                  {overview.Industry || "-"}
                </Text>
              </Text>
              <Text style={{ color: palette.text }}>
                52W High/Low:{" "}
                <Text style={{ color: palette.muted }}>
                  {overview["52WeekHigh"]} / {overview["52WeekLow"]}
                </Text>
              </Text>
            </View>
          )}

          {tab === "News" && (
            <View style={[styles.card, { backgroundColor: palette.card }]}>
              <Text style={{ color: palette.text, marginBottom: 4 }}>
                • Infosys Q1 Earnings beat estimates 🚀
              </Text>
              <Text style={{ color: palette.text, marginBottom: 4 }}>
                • Reliance expands retail arm into FMCG 📈
              </Text>
            </View>
          )}

          {tab === "Events" && (
            <View style={[styles.card, { backgroundColor: palette.card }]}>
              <Text style={{ color: palette.text, marginBottom: 4 }}>
                • AGM on 20th Aug, 2025
              </Text>
              <Text style={{ color: palette.text, marginBottom: 4 }}>
                • Dividend payout on 30th Aug, 2025
              </Text>
            </View>
          )}

          {/* Watchlist Button */}
          {!inWatchlist && (
            <TouchableOpacity
              style={[
                styles.manageBtn,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Feather name="bookmark" size={18} color={palette.text} />
              <Text
                style={{
                  color: palette.text,
                  fontWeight: "700",
                  marginLeft: 8,
                }}
              >
                Add to Watchlist
              </Text>
            </TouchableOpacity>
          )}

          {inWatchlist && (
            <TouchableOpacity
              style={[
                styles.manageBtn,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Feather name="edit" size={18} color={palette.text} />
              <Text
                style={{
                  color: palette.text,
                  fontWeight: "700",
                  marginLeft: 8,
                }}
              >
                Manage Watchlist
              </Text>
            </TouchableOpacity>
          )}

          <AddToWatchlistModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            symbol={symbol}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 20,
  },
  company: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  price: { fontSize: 24, fontWeight: "800" },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  card: { padding: 12, borderRadius: 14, marginVertical: 12 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  tabActive: { fontWeight: "700", borderBottomWidth: 2, paddingBottom: 4 },
  tab: { color: "gray" },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    marginBottom: 32,
  },
});
