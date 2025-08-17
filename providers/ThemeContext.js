import { createContext, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

const ThemeCtx = createContext(null);

const light = {
  bg: '#ffffff',
  text: '#111111',
  muted: '#6b7280',
  card: '#f3f4f6',
  border: '#e5e7eb',
  link: '#2563eb'
};

const dark = {
  bg: '#0b0f18',
  text: '#f5f5f5',
  muted: '#9ca3af',
  card: '#121826',
  border: '#1f2937',
  link: '#60a5fa'
};

export function ThemeProvider({ children }) {
  const sys = Appearance.getColorScheme();
  const [mode, setMode] = useState(sys || 'light');
  const palette = mode === 'dark' ? dark : light;
  const toggleTheme = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  const value = useMemo(() => ({ mode, toggleTheme, palette }), [mode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
