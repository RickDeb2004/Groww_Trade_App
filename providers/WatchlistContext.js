// providers/WatchlistContext.js
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "WATCHLISTS_V1";
const Ctx = createContext(null);

export function WatchlistProvider({ children }) {
  const [lists, setLists] = useState({});

  const loadLists = async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      setLists(raw ? JSON.parse(raw) : {});
    } catch {
      setLists({});
    }
  };

  const persist = async (next) => {
    setLists(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  const addToWatchlist = async (name, symbol) => {
    const next = { ...(lists || {}) };
    if (!next[name]) next[name] = [];
    if (!next[name].includes(symbol)) next[name].push(symbol);
    await persist(next);
  };

  // NEW: remove from a specific list
  const removeFromWatchlist = async (name, symbol) => {
    const next = { ...(lists || {}) };
    if (next[name]) {
      next[name] = next[name].filter((s) => s !== symbol);
      await persist(next);
    }
  };

  // Existing: remove from ALL lists
  const removeFromWatchlists = async (symbol) => {
    const next = { ...(lists || {}) };
    for (const k of Object.keys(next))
      next[k] = next[k].filter((s) => s !== symbol);
    await persist(next);
  };

  const isInAnyWatchlist = (symbol) => {
    if (!lists) return false;
    return Object.values(lists).some((arr) => arr.includes(symbol));
  };

  const deleteList = async (name) => {
    if (!lists[name]) return;
    const next = { ...lists };
    delete next[name];
    await save(next);
  };

  useEffect(() => {
    loadLists();
  }, []);

  return (
    <Ctx.Provider
      value={{
        lists,
        loadLists,
        addToWatchlist,
        removeFromWatchlist,
        removeFromWatchlists, 
        isInAnyWatchlist,
        deleteList,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWatchlists() {
  return useContext(Ctx);
}
