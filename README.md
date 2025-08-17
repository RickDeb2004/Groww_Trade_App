
---

# 📈 Stock Tracker App

A **React Native (Expo)** app for tracking stocks, viewing top gainers/losers, company details, charts, and managing watchlists.

---

## ✅ Functional Requirements

* [x] Explore screen showing top gainers & losers
* [x] Watchlist screen with persistent storage (AsyncStorage)
* [x] Add/remove stocks to custom watchlists
* [x] Company detail page (`/product/[symbol]`) with overview, chart & tabs (Overview / News / Events)
* [x] Dark & light theme toggle
* [x] Search stocks by ticker or company name
* [x] Fallback data when API fails (ensures UI never breaks)
* [x] Caching of API responses to reduce quota usage
* [x] Tab navigation with icons (Explore, Watchlist, Profile, Settings)

### ⭐ Brownie Points

* [x] Throttled API calls (respecting 5 req/min limit of AlphaVantage free tier)
* [x] Chart visualization using `victory-native`
* [x] Manage multiple watchlists (create, delete, add/remove stocks)
* [x] Local persistent storage (watchlists & cached API data survive app restart)
* [x] Optimized dark/light theming across all screens

---

## 🚀 Features Implemented

### 1. **Explore Screen**

* Displays **Top Gainers** and **Top Losers** from AlphaVantage API.
* Falls back to curated local dataset when API limit is reached.
* “View All” expands the list into grid format.

### 2. **Search**

* Search for tickers using AlphaVantage Symbol Search API.
* Auto-clears results when input is empty.
* Direct navigation to company detail screen on selection.

### 3. **Company Detail (Product Screen)**

* Shows **Company Overview**, **Chart**, **News**, and **Events**.
* Chart uses either API data (Daily Adjusted) or fallback if not available.
* Add/Manage Watchlist button.
* Theme toggle (☀️/🌙).

### 4. **Watchlist Management**

* Create custom watchlists.
* Add/remove tickers to/from watchlists.
* Persisted in `AsyncStorage`.
* One symbol can exist in multiple lists.

### 5. **Fallback + Caching**

* API responses cached for **24h** to reduce quota.
* If API fails/missing data → fallback dataset is shown (TCS, INFY, Reliance, etc.).
* Ensures **app never breaks** even under API quota issues.

### 6. **Theming**

* Dark & light theme with dynamic palette via `ThemeContext`.
* All UI (cards, text, charts) respects current theme.

---

## 🛠️ Problems Solved

* **Caching:** Reduced API hits by saving data in AsyncStorage.
* **Fallback:** Preloaded stock data ensures app works offline or when API fails.
* **Throttling:** Implemented request queue to respect AlphaVantage free tier (5 calls/min).
* **Persistent Watchlists:** Users’ watchlists are stored locally and survive restarts.
* **Clean Navigation:** Handled unwanted tab exposure (like `/product/[symbol]`) using `_layout`.

---

## ⚠️ Current Issues / Limitations

* **Premium Endpoint Unavailable:** AlphaVantage’s premium **TIME\_SERIES\_INTRADAY** or **extended historical data** cannot be used. → We fallback to static chart series for now.

* **API Key Limit:** Free API allows **25 requests/day** + **5 requests/min** → caching + fallback are essential.
<img width="1901" height="792" alt="image" src="https://github.com/user-attachments/assets/64e24584-920d-47fb-a301-691dd5eed8ec" />

* **Chart Data:** Since `TIME_SERIES_DAILY_ADJUSTED` consumes quota heavily, fallback charts (TCS for gainers, Infosys/others for losers) are used.
* **Real-time News/Events:** Currently mocked (static data).

---

## 📦 Tech Stack

* **React Native + Expo Router**
* **AlphaVantage API** (stock data)
* **Victory Native** (charts)
* **AsyncStorage** (persistent caching & watchlists)
* **Feather Icons** (UI icons)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stock-tracker.git
cd stock-tracker
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure API Key

You need an [AlphaVantage API Key](https://www.alphavantage.co/support/#api-key) (free).

Create a file `app.config.js` in the root:

```js
export default {
  expo: {
    name: "Stock Tracker",
    slug: "stock-tracker",
    version: "1.0.0",
    extra: {
      ALPHA_VANTAGE_KEY: "YOUR_API_KEY_HERE"
    }
  }
};
```

Or use environment variables:

```bash
EXPO_PUBLIC_ALPHA_KEY=YOUR_API_KEY_HERE
```

### 4. Run the App

```bash
npx expo start
```

Scan the QR code in the **Expo Go** app (Android/iOS) to run it on your device.

---

## 📸 Screenshots (to add)
* **Screenshots** : https://www.figma.com/board/p7prGHd1GJ0fIpb47ovTBN/Concept-map--Community-?node-id=0-1&t=D2XSRltp2L75rLyY-1
* **ScreeRecording** : 

https://github.com/user-attachments/assets/e7f11094-4cdd-471c-a8c0-af927c6e51d3


In case this attached not working go through this : https://drive.google.com/file/d/11-cG-e-LVgP7vom94-O0N9wODGdWezHz/view?usp=sharing

---

## 👨‍💻 Authors

* Debanjan Mukherjee

---


