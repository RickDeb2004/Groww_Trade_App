// // app/view-all/[type].js
// import { useLocalSearchParams, useRouter } from "expo-router";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import { useTheme } from "../../providers/ThemeContext";
// // move fallback into a file if you prefer

// export default function ViewAllScreen() {
//   const { type } = useLocalSearchParams();
//   const { palette } = useTheme();
//   const router = useRouter();
//   const FALLBACK_DATA = {
//     top_gainers: [
//       { ticker: "TCS", price: "3850", change_percentage: "+3.2%" },
//       { ticker: "INFY", price: "1520", change_percentage: "+2.8%" },
//       { ticker: "HDFCBANK", price: "1725", change_percentage: "+2.1%" },
//       { ticker: "RELIANCE", price: "2805", change_percentage: "+1.9%" },
//     ],
//     top_losers: [
//       { ticker: "ADANIPORTS", price: "1210", change_percentage: "-3.4%" },
//       { ticker: "SBIN", price: "645", change_percentage: "-2.7%" },
//       { ticker: "ITC", price: "439", change_percentage: "-2.2%" },
//       { ticker: "WIPRO", price: "492", change_percentage: "-1.8%" },
//     ],
//   };

//   const list =
//     type === "gainers" ? FALLBACK_DATA.top_gainers : FALLBACK_DATA.top_losers;

//   return (
//     <View style={[styles.container, { backgroundColor: palette.bg }]}>
//       <Text style={[styles.title, { color: palette.text }]}>
//         {type === "gainers" ? "All Top Gainers" : "All Top Losers"}
//       </Text>
//       <FlatList
//         data={list}
//         keyExtractor={(i) => i.ticker}
//         numColumns={2}
//         columnWrapperStyle={{ gap: 16 }}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={[styles.card, { backgroundColor: palette.card }]}
//             onPress={() =>
//               router.push({
//                 pathname: "/product/[symbol]",
//                 params: { symbol: item.ticker },
//               })
//             }
//           >
//             <Text style={[styles.ticker, { color: palette.text }]}>
//               {item.ticker}
//             </Text>
//             <Text style={{ color: palette.muted }}>₹{item.price}</Text>
//             <Text
//               style={{
//                 color: item.change_percentage.startsWith("-") ? "red" : "green",
//               }}
//             >
//               {item.change_percentage}
//             </Text>
//           </TouchableOpacity>
//         )}
//         contentContainerStyle={{ padding: 16, rowGap: 18 }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   title: { fontSize: 22, fontWeight: "700", margin: 16 },
//   card: { flex: 1, padding: 16, borderRadius: 14, elevation: 2 },
//   ticker: { fontSize: 18, fontWeight: "700" },
// });

// app/view-all/[type].js
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../providers/ThemeContext";
import { useEffect, useState } from "react";
import { fetchTopMovers } from "../../lib/api"; // 👈 we'll write this

export default function ViewAllScreen() {
  const { type } = useLocalSearchParams();
  const { palette } = useTheme();
  const router = useRouter();

  // Local state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback
  const FALLBACK_DATA = {
    gainers: [
      { ticker: "TCS", price: "3850", change_percentage: "+3.2%" },
      { ticker: "INFY", price: "1520", change_percentage: "+2.8%" },
      { ticker: "HDFCBANK", price: "1725", change_percentage: "+2.1%" },
      { ticker: "RELIANCE", price: "2805", change_percentage: "+1.9%" },
    ],
    losers: [
      { ticker: "ADANIPORTS", price: "1210", change_percentage: "-3.4%" },
      { ticker: "SBIN", price: "645", change_percentage: "-2.7%" },
      { ticker: "ITC", price: "439", change_percentage: "-2.2%" },
      { ticker: "WIPRO", price: "492", change_percentage: "-1.8%" },
    ],
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const apiData = await fetchTopMovers(type); // 👈 API call
        if (apiData?.length) {
          setData(apiData);
        } else {
          setData(FALLBACK_DATA[type] || []);
        }
      } catch (e) {
        console.log("Error fetching top movers:", e.message);
        setData(FALLBACK_DATA[type] || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.title, { color: palette.text }]}>
        {type === "gainers" ? "All Top Gainers" : "All Top Losers"}
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.ticker}
          numColumns={2}
          columnWrapperStyle={{ gap: 16 }}
          renderItem={({ item }) => (
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
              <Text style={{ color: palette.muted }}>₹{item.price}</Text>
              <Text
                style={{
                  color: item.change_percentage.startsWith("-")
                    ? "red"
                    : "green",
                }}
              >
                {item.change_percentage}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 16, rowGap: 18 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", margin: 16 },
  card: { flex: 1, padding: 16, borderRadius: 14, elevation: 2 },
  ticker: { fontSize: 18, fontWeight: "700" },
});
