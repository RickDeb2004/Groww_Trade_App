import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_KEY =
  Constants?.expoConfig?.extra?.ALPHA_VANTAGE_KEY ||
  Constants?.manifest?.extra?.ALPHA_VANTAGE_KEY ||
  "";
const BASE_URL = "https://www.alphavantage.co/query";

// Basic throttling to respect 5 req/min on free tier
let queue = [];
let isRunning = false;

async function throttledFetch(config) {
  return new Promise((resolve, reject) => {
    queue.push({ config, resolve, reject });
    runQueue();
  });
}

async function runQueue() {
  if (isRunning) return;
  isRunning = true;
  while (queue.length) {
    const { config, resolve, reject } = queue.shift();
    try {
      const res = await axios(config);
      resolve(res);
    } catch (e) {
      reject(e);
    }
    // Wait ~13s between calls to stay under 5/min
    await new Promise((r) => setTimeout(r, 13000));
  }
  isRunning = false;
}

// Cache helpers
export async function cacheGet(key, ttlMs) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > ttlMs) return null;
    return v;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value) {
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ t: Date.now(), v: value })
    );
  } catch {}
}

// API functions
export async function fetchTopGainersLosers() {
  const url = `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`;
  const { data } = await throttledFetch({ method: "GET", url });
  // Normalize to match fields used in UI
  const top_gainers = (data?.top_gainers || []).map((x) => ({
    ticker: x.ticker || x.symbol || x.ticker_symbol,
    price: x.price,
    change_percentage: x.change_percentage,
  }));
  const top_losers = (data?.top_losers || []).map((x) => ({
    ticker: x.ticker || x.symbol || x.ticker_symbol,
    price: x.price,
    change_percentage: x.change_percentage,
  }));
  return { top_gainers, top_losers };
}

export async function fetchCompanyOverview(symbol) {
  const key = `OVERVIEW_${symbol}`;
  const cached = await cacheGet(key, 24 * 60 * 60 * 1000);
  if (cached) return cached;
  const url = `${BASE_URL}?function=OVERVIEW&symbol=${encodeURIComponent(
    symbol
  )}&apikey=${API_KEY}`;
  const { data } = await throttledFetch({ method: "GET", url });
  await cacheSet(key, data || {});
  return data || {};
}

export async function fetchDailySeries(symbol, limit = 120) {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${process.env.EXPO_PUBLIC_ALPHA_KEY}`
    );
    const json = await res.json();

    const raw = json["Time Series (Daily)"];
    if (!raw) return [];

    const dates = Object.keys(raw).slice(0, limit).reverse();
    return dates.map((date, i) => ({
      x: i + 1,
      y: parseFloat(raw[date]["4. close"]),
    }));
  } catch (e) {
    console.log("fetchDailySeries error:", e);
    return [];
  }
}

export async function searchTickers(keywords) {
  const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`;
  const { data } = await throttledFetch({ method: "GET", url });
  return (data?.bestMatches || []).map((m) => ({
    symbol: m["1. symbol"],
    name: m["2. name"],
    region: m["4. region"],
    currency: m["8. currency"],
  }));
}

export async function fetchQuote(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();

    if (!json || !json["Global Quote"]) {
      throw new Error("No quote data");
    }

    const q = json["Global Quote"];

    return {
      symbol: q["01. symbol"],
      price: parseFloat(q["05. price"]).toFixed(2),
      change: parseFloat(q["09. change"]).toFixed(2),
      changePercent: parseFloat(q["10. change percent"]),
      exchange: symbol.includes(".") ? symbol.split(".")[1] : "NSE", // crude check
    };
  } catch (err) {
    console.error("fetchQuote error", err);
    return { symbol, price: "-", change: 0, changePercent: 0, exchange: "N/A" };
  }
}

export async function fetchTopMovers(type) {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${process.env.EXPO_PUBLIC_ALPHA_KEY}`
    );
    const json = await res.json();

    if (type === "gainers" && json?.top_gainers) {
      return json.top_gainers.map((i) => ({
        ticker: i.ticker,
        price: i.price,
        change_percentage: i.change_percentage,
      }));
    }

    if (type === "losers" && json?.top_losers) {
      return json.top_losers.map((i) => ({
        ticker: i.ticker,
        price: i.price,
        change_percentage: i.change_percentage,
      }));
    }

    return [];
  } catch (e) {
    console.log("Error fetching top movers:", e.message);
    return [];
  }
}
