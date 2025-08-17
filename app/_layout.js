import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ThemeProvider } from "../providers/ThemeContext";
import { WatchlistProvider } from "../providers/WatchlistContext";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <WatchlistProvider>
        <Tabs screenOptions={{ headerShown: false }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Explore",
              tabBarIcon: ({ color, size }) => (
                <Feather name="compass" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="watchlist"
            options={{
              title: "Watchlist",
              tabBarIcon: ({ color, size }) => (
                <Feather name="star" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Feather name="user" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <Feather name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
        <StatusBar />
      </WatchlistProvider>
    </ThemeProvider>
  );
}
