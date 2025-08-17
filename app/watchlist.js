import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useWatchlists } from "../providers/WatchlistContext";
import { useTheme } from "../providers/ThemeContext";
import { fetchCompanyOverview, fetchDailySeries } from "../lib/api";


const FALLBACK_QUOTES = {
  TCS: {
    symbol: "TCS",
    price: 3850,
    change: 120,
    changePercent: 3.2,
    exchange: "NSE",
  },
  INFY: {
    symbol: "INFY",
    price: 1520,
    change: 40,
    changePercent: 2.8,
    exchange: "NSE",
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    price: 1725,
    change: 35,
    changePercent: 2.1,
    exchange: "NSE",
  },
  RELIANCE: {
    symbol: "RELIANCE",
    price: 2805,
    change: 52,
    changePercent: 1.9,
    exchange: "BSE",
  },
  ADANIPORTS: {
    symbol: "ADANIPORTS",
    price: 1210,
    change: -42,
    changePercent: -3.4,
    exchange: "NSE",
  },
  SBIN: {
    symbol: "SBIN",
    price: 645,
    change: -18,
    changePercent: -2.7,
    exchange: "NSE",
  },
  ITC: {
    symbol: "ITC",
    price: 439,
    change: -10,
    changePercent: -2.2,
    exchange: "BSE",
  },
  WIPRO: {
    symbol: "WIPRO",
    price: 492,
    change: -9,
    changePercent: -1.8,
    exchange: "NSE",
  },
};

export default function WatchlistScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const { lists, loadLists, deleteList } = useWatchlists(); 
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  
  const indicesRow1 = [
    {
      symbol: "SENSEX",
      price: "80,957.66",
      change: "+57.75",
      changePercent: "+0.07%",
    },
    {
      symbol: "NIFTY",
      price: "24,631.30",
      change: "+11.95",
      changePercent: "+0.05%",
    },
    {
      symbol: "BANKNIFTY",
      price: "61,625.39",
      change: "+11.45",
      changePercent: "+0.02%",
    },
    {
      symbol: "MIDCAP",
      price: "45,120.22",
      change: "-95.35",
      changePercent: "-0.21%",
    },
    {
      symbol: "SMALLCAP",
      price: "15,890.42",
      change: "+44.20",
      changePercent: "+0.19%",
    },
    {
      symbol: "FINNIFTY",
      price: "20,210.18",
      change: "+25.60",
      changePercent: "+0.12%",
    },
  ];
  const indicesRow2 = [
    {
      symbol: "IT",
      price: "38,240.15",
      change: "-180.55",
      changePercent: "-0.47%",
    },
    {
      symbol: "AUTO",
      price: "34,512.98",
      change: "+88.15",
      changePercent: "+0.25%",
    },
    {
      symbol: "PHARMA",
      price: "14,220.77",
      change: "+50.20",
      changePercent: "+0.35%",
    },
    {
      symbol: "REALTY",
      price: "8,310.65",
      change: "-25.80",
      changePercent: "-0.31%",
    },
    {
      symbol: "PSUBANK",
      price: "6,140.44",
      change: "+19.30",
      changePercent: "+0.21%",
    },
    {
      symbol: "ENERGY",
      price: "22,520.55",
      change: "+64.40",
      changePercent: "+0.28%",
    },
  ];

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (!lists) return;
    const allSymbols = Object.values(lists).flat();

    const load = async () => {
      setLoading(true);
      const result = {};

      for (const symbol of allSymbols) {
        try {
          const overview = await fetchCompanyOverview(symbol);
          const series = await fetchDailySeries(symbol, 2);

          if (series && series.length >= 2) {
            const today = Number(series[0].close);
            const prev = Number(series[1].close);
            const change = Number((today - prev).toFixed(2));
            const changePct = Number(
              (((today - prev) / prev) * 100).toFixed(2)
            );
            result[symbol] = {
              symbol,
              price: today,
              change,
              changePercent: changePct,
              exchange: overview?.Exchange || "NSE",
            };
          } else {
           
            if (FALLBACK_QUOTES[symbol]) {
              result[symbol] = FALLBACK_QUOTES[symbol];
            } else {
              
              result[symbol] = {
                symbol,
                price: "-",
                change: "-",
                changePercent: "-",
                exchange: "NSE",
              };
            }
          }
        } catch {
         
          if (FALLBACK_QUOTES[symbol]) {
            result[symbol] = FALLBACK_QUOTES[symbol];
          } else {
            result[symbol] = {
              symbol,
              price: "-",
              change: "-",
              changePercent: "-",
              exchange: "NSE",
            };
          }
        }
      }

      setQuotes(result);
      setLoading(false);
    };

    load();
  }, [lists]);


  useEffect(() => {
    let index1 = 0,
      index2 = indicesRow2.length - 1;
    const interval = setInterval(() => {
      if (scrollRef1.current) {
        index1 = (index1 + 1) % indicesRow1.length;
        scrollRef1.current.scrollTo({ x: index1 * 120, animated: true });
      }
      if (scrollRef2.current) {
        index2 = (index2 - 1 + indicesRow2.length) % indicesRow2.length;
        scrollRef2.current.scrollTo({ x: index2 * 120, animated: true });
      }
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const empty =
    !lists || Object.keys(lists).filter((k) => k !== "Default").length === 0;

  const renderStock = (symbol) => {
    const q = quotes[symbol];
    if (!q) return null;
    return (
      <TouchableOpacity
        style={[styles.row, { borderColor: palette.border }]}
        onPress={() =>
          router.push({ pathname: "/product/[symbol]", params: { symbol } })
        }
      >
        <View>
          <Text style={[styles.symbol, { color: palette.text }]}>{symbol}</Text>
          <Text style={{ color: palette.muted, fontSize: 12 }}>
            {q.exchange}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.price, { color: palette.text }]}>
            ₹{q.price}
          </Text>
          <Text
            style={{ color: q.change >= 0 ? "green" : "red", fontSize: 12 }}
          >
            {q.change} ({q.changePercent}%)
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      
      <View style={{ gap: 12, marginTop: 20 }}>
        <ScrollView
          ref={scrollRef1}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.indicesRow}
        >
          {indicesRow1.map((idx, i) => (
            <View
              key={i}
              style={[styles.indexCard, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.indexName, { color: palette.text }]}>
                {idx.symbol}
              </Text>
              <Text style={[styles.indexPrice, { color: palette.text }]}>
                {idx.price}
              </Text>
              <Text
                style={{
                  color: idx.change.startsWith("+") ? "green" : "red",
                  fontSize: 11,
                }}
              >
                {idx.change} ({idx.changePercent})
              </Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView
          ref={scrollRef2}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.indicesRow}
        >
          {indicesRow2.map((idx, i) => (
            <View
              key={i}
              style={[styles.indexCard, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.indexName, { color: palette.text }]}>
                {idx.symbol}
              </Text>
              <Text style={[styles.indexPrice, { color: palette.text }]}>
                {idx.price}
              </Text>
              <Text
                style={{
                  color: idx.change.startsWith("+") ? "green" : "red",
                  fontSize: 11,
                }}
              >
                {idx.change} ({idx.changePercent})
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>


      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : empty ? (
        <View style={styles.empty}>
          <Text style={{ color: palette.muted, fontSize: 16 }}>
            Your watchlist is empty. Add some stocks to get started 📈
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.keys(lists).filter((name) => name !== "Default")} 
          keyExtractor={(k) => k}
          renderItem={({ item: name }) => (
            <View>
              <View style={styles.listHeader}>
                <Text style={[styles.listName, { color: palette.text }]}>
                  {name}
                </Text>
                <TouchableOpacity onPress={() => deleteList(name)}>
                  <Feather name="trash-2" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
              {lists[name].map(renderStock)}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  indicesRow: { paddingHorizontal: 12, gap: 10 },
  indexCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 110,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  indexName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  indexPrice: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  symbol: { fontSize: 16, fontWeight: "600" },
  price: { fontSize: 16, fontWeight: "600" },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 45,
    marginBottom: 6,
    marginLeft: 12,
    marginRight: 12,
  },
  listName: { fontSize: 18, fontWeight: "700" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
