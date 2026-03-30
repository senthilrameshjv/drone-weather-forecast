# UAV Forecast — Implementation Plan

## Context
Build a web app that helps drone pilots decide if flying conditions are safe at their location — similar to UAVForecast. Start with current conditions and add a forecast mode. The directory was empty; this is a greenfield project.

---

## Tech Stack
- **Vite + React + TypeScript** — fast dev build, strong typing
- **Tailwind CSS** — utility-first, mobile-first styling
- **Open-Meteo API** — free, no API key, covers current + hourly + daily weather
- **Nominatim (OpenStreetMap)** — free reverse geocoding for location name display
- **`vite-plugin-mkcert`** — HTTPS on the dev server via locally-trusted cert (required for geolocation on Firefox/Safari; no browser warnings after first run)
- No backend needed — pure frontend hitting public APIs

---

## Project Structure
```
uav-forecast/
├── index.html
├── package.json              # react, react-dom, typescript, vite, tailwindcss
├── vite.config.ts
├── tsconfig.json
├── CLAUDE.md                 # project instructions for Claude
├── docs/
│   └── implementation-plan.md
└── src/
    ├── main.tsx
    ├── App.tsx               # Root: holds all state, coordinates hooks
    ├── index.css             # Tailwind directives
    ├── types/
    │   ├── weather.ts        # Raw Open-Meteo response types
    │   └── forecast.ts       # Internal types: HourlySlot, DayForecast, GoNoGoResult
    ├── api/
    │   ├── openMeteo.ts      # URL builder, fetch, array-zip parsers
    │   └── geocoding.ts      # Nominatim reverse geocode
    ├── hooks/
    │   ├── useGeolocation.ts # Browser Geolocation API wrapper
    │   ├── useWeather.ts     # Fetches data, in-memory cache, loading/error
    │   └── useGoNoGo.ts      # useMemo scoring over weather data
    ├── scoring/
    │   └── goNoGo.ts         # Pure scoring functions, thresholds, hard overrides
    ├── components/
    │   ├── layout/           # Header, Footer
    │   ├── location/         # LocationBar
    │   ├── gonogo/           # GoNoGoBadge, ScoreBreakdown
    │   ├── current/          # CurrentConditions, WeatherStatCard
    │   ├── hourly/           # HourlyForecast, HourlyCard
    │   ├── daily/            # DailyForecast, DayRow
    │   └── shared/           # LoadingSpinner, ErrorMessage, WindDirectionArrow, WeatherIcon
    └── utils/
        ├── units.ts          # metersToMiles, celsiusToFahrenheit
        ├── formatters.ts     # formatHour, formatDay using Intl.DateTimeFormat
        └── wmoCode.ts        # WMO weather code → description + emoji
```

---

## Open-Meteo API

Single request covers current, hourly (48h), and daily (7 days):
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &current=temperature_2m,relative_humidity_2m,precipitation,weather_code,
           cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m
  &hourly=temperature_2m,precipitation_probability,precipitation,weather_code,
          cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m
  &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,
         wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant
  &wind_speed_unit=mph&timezone=auto&forecast_days=7&forecast_hours=48
```

Key notes:
- `wind_speed_unit=mph` → all wind values arrive in mph
- `timezone=auto` → hourly times are local, no client-side conversion
- Visibility returns in **meters** always → divide by 1609.34 for miles
- Open-Meteo returns parallel arrays; `parseHourly()` must zip them into per-hour objects

---

## Go/No-Go Scoring Logic

| Parameter | GOOD (100pts) | CAUTION (50pts) | NO-GO (0pts) | Weight |
|---|---|---|---|---|
| Wind speed (mph) | < 15 | 15–20 | > 20 | 35% |
| Wind gusts (mph) | < 18 | 18–25 | > 25 | 25% |
| Precipitation (mm/hr) | 0 | 0.1–0.5 | > 0.5 | 20% |
| Visibility (miles) | > 3 | 1–3 | < 1 | 10% |
| Cloud cover (%) | < 50 | 50–80 | > 80 | 5% |
| Temperature (°C) | 10–35 | 5–10 or 35–40 | < 5 or > 40 | 5% |

Hard overrides → instant NO-GO:
- Wind gusts > 30 mph
- Precipitation > 1 mm/hr
- Visibility < 0.5 miles
- WMO code: thunderstorm (95–99) or heavy snow (71–77)

Result thresholds: score ≥ 75 → GO | score ≥ 45 → CAUTION | < 45 → NO-GO

---

## UI Layout (dark theme, mobile-first)

```
Header: App name + [📍 City, State] [Detect Location ⊕]
──────────────────────────────────────
Weather description + last updated time
──────────────────────────────────────
██  GO TO FLY  (score: 82/100)  ██     ← GoNoGoBadge (green/yellow/red)
──────────────────────────────────────
Score Breakdown (collapsible)
  ✅ Wind 12mph  ⚠️ Gusts 19mph  ✅ Rain: None
──────────────────────────────────────
Current Conditions  [Wind] [Gust] [Rain] [Clouds] [Humidity] [Temp]
──────────────────────────────────────
48-Hour Forecast →→→ [2PM🟢][3PM🟢][4PM🟡][5PM🔴]  (horizontal scroll)
──────────────────────────────────────
7-Day Forecast
  Today    ⛅ 72°/55°F  Wind 14mph  🟢 GO
  Tomorrow 🌧 65°/50°F  Wind 22mph  🔴 NO-GO
```

---

## Cross-Browser / Mobile Access

### Why HTTPS is required
Firefox and Safari (desktop and mobile) block the Geolocation API over plain HTTP on any non-`localhost` address. This means accessing the app via a local network IP (`192.168.x.x`) fails silently or shows a permission error.

Chrome is the only browser that allows geolocation over plain HTTP on local network addresses.

### Solution: `vite-plugin-mkcert`
Added to `vite.config.ts`. Uses `mkcert` to generate a **locally-trusted** certificate signed by a root CA that is installed into the system trust store (and Firefox's NSS store via the `nss` brew package). Unlike self-signed certs, this produces **zero browser warnings** in Chrome, Firefox, and Safari after the one-time setup.

**One-time setup (already done on this machine):**
```bash
brew install mkcert nss   # nss enables Firefox trust store support
```
On first `npm run dev`, mkcert will prompt for your Mac password to install the root CA. After that, all browsers trust the cert permanently.

### Accessing from mobile (all browsers)
1. Run `npm run dev`
2. Note the `Network:` URL printed (e.g. `https://192.168.0.143:3000`)
3. Open that URL on your phone — both Mac and phone must be on the **same Wi-Fi**
4. Accept the self-signed certificate warning (tap "Advanced → Proceed")
5. Allow location permission when prompted

### Browser compatibility matrix
| Browser | localhost | Local network IP (HTTP) | Local network IP (HTTPS) |
|---|---|---|---|
| Chrome (desktop/Android) | ✅ | ✅ | ✅ |
| Firefox (desktop/Android) | ✅ | ❌ blocked | ✅ with cert warning |
| Safari (iOS/macOS) | ✅ | ❌ blocked | ✅ with cert warning |
| Zen (Firefox-based) | ✅ | ❌ blocked | ✅ with cert warning |

---

## Potential Future Enhancements
- Manual location search (Nominatim forward geocoding)
- AGL (above ground level) wind layer toggle
- KP index for GPS interference
- Saved favorite locations
- PWA / offline support
- Airspace check integration (FAA B4UFLY API)
