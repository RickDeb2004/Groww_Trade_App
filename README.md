# Expo Stocks App

React Native (Expo Router) assignment app for a stocks / ETFs broking platform.

## Features
- Tabs: Explore (Top Gainers/Losers) and Watchlist
- Product screen with company overview + line chart (Victory Native)
- Add to watchlist via modal (create/select list), persistent via AsyncStorage
- View All pages with pagination
- API caching with expiration + request throttling for Alpha Vantage rate limits
- Light/Dark theme toggle

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Put your Alpha Vantage API key in `app.json` under `expo.extra.ALPHA_VANTAGE_KEY`.
3. Start the app:
   ```bash
   npm start
   ```
4. Open in Expo Go or run on Android emulator:
   ```bash
   npm run android
   ```

