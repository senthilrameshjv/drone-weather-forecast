# UAV Forecast — CLAUDE.md

## Project Overview
A drone flight conditions web app. Pure frontend — no backend, no API keys required.
Checks real-time and forecast weather at the user's GPS location and returns a **GO / CAUTION / NO-GO** verdict.

## Tech Stack
- **Vite + React + TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.ts` needed)
- **Open-Meteo API** — free, no auth, browser-safe CORS
- **Nominatim (OSM)** — free reverse geocoding

## Dev Commands
```bash
npm run dev     # start dev server at http://localhost:3000
npm run build   # production build to dist/
npm run preview # preview production build
npx tsc --noEmit  # type check without emitting
```

## Key Architecture Decisions

### Scoring Engine (`src/scoring/goNoGo.ts`)
Pure functions — no React, fully testable in isolation.
- `scoreConditions(input)` → `GoNoGoResult` — used for both current weather and hourly slots
- `scoreHour(slot)` / `scoreDay(day)` — thin wrappers
- Hard overrides (gusts >30mph, precip >1mm/hr, visibility <0.5mi, thunderstorm/heavy snow codes) bypass scoring and return instant NO-GO

### Open-Meteo Data Shape
The API returns **parallel arrays**, not arrays of objects:
```json
{ "hourly": { "time": [...], "wind_speed_10m": [...] } }
```
`parseHourly()` in `src/api/openMeteo.ts` zips these into per-slot objects. Don't forget this when adding new hourly fields.

### Visibility Unit Gotcha
Visibility is always returned in **meters** from Open-Meteo, regardless of `wind_speed_unit=mph`. Always use `metersToMiles()` from `src/utils/units.ts`.

### State Management
No external state library. All state lives in `App.tsx` via custom hooks:
- `useGeolocation` → coords (never auto-triggered; only on button click)
- `useWeather(coords)` → raw API data + location name (5-min in-memory cache)
- `useGoNoGo(data)` → scored results via `useMemo`

## Context Map

Key files: src/scoring/goNoGo.ts, src/api/openMeteo.ts, docs/implementation-plan.md

```
src/
  api/          openMeteo.ts, geocoding.ts
  components/   layout/, location/, gonogo/, current/, hourly/, daily/, shared/
  hooks/        useGeolocation.ts, useWeather.ts, useGoNoGo.ts
  scoring/      goNoGo.ts  ← core scoring engine; pure functions, no React
  types/        weather.ts (API shapes), forecast.ts (internal types)
  utils/        units.ts, formatters.ts, wmoCode.ts
docs/
  implementation-plan.md  ← implementation plan and feature roadmap
```

## Adding New Weather Parameters
1. Add the field to `OpenMeteoHourlyRaw` / `OpenMeteoDailyRaw` in `src/types/weather.ts`
2. Add it to the `hourly=` or `daily=` param list in `buildUrl()` in `src/api/openMeteo.ts`
3. Add it to `HourlySlot` / `DayForecast` in `src/types/forecast.ts`
4. Add scoring logic in `src/scoring/goNoGo.ts`
5. Render it in the relevant component

## Do Not
- Add a backend — everything is client-side
- Add API keys — Open-Meteo is completely free
- Auto-trigger geolocation on page load — always require a user gesture
