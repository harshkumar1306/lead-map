# Agent Guide

This file describes what Scout does, how it is structured, and what a developer or AI agent needs to know to make changes to it safely.

---

## What This Application Does

Scout is a single-page tool that takes three inputs — business type, location, and radius — and returns a list of matching local businesses. Users can filter the list, act on individual rows, and export a selection to a spreadsheet.

There is no backend. The application runs entirely in the browser and talks directly to the Google Maps JavaScript API.

---

## Key Files to Know

| File                              | Role                                                         |
|-----------------------------------|--------------------------------------------------------------|
| `src/App.tsx`                     | Root component. All state lives here.                        |
| `src/lib/google-places.ts`        | Fetches data. Contains both live and mock implementations.   |
| `src/lib/export.ts`               | Produces CSV and Excel downloads.                            |
| `src/types/index.ts`              | All TypeScript interfaces.                                   |
| `src/components/search-form.tsx`  | The search input panel.                                      |
| `src/components/results-table.tsx`| The results display and row actions.                         |
| `src/components/ui/`             | Primitive UI components (Button, Input, Select, etc.)        |
| `.env`                            | Holds the Google Maps API key.                               |

---

## State Map

All state is in `App.tsx`. There are no context providers, stores, or reducers.

| State variable    | Type                  | Purpose                                      |
|-------------------|-----------------------|----------------------------------------------|
| `businesses`      | `BusinessResult[]`    | Raw results from the last search             |
| `selectedIds`     | `string[]`            | IDs of currently checked rows                |
| `isLoading`       | `boolean`             | True while a search is in flight             |
| `error`           | `string \| null`      | Error message if search fails                |
| `searchPerformed` | `boolean`             | Whether any search has been submitted        |
| `currentSearch`   | `SearchParams \| null`| The last submitted search params             |
| `filters`         | `SearchFilterState`   | Current filter panel values                  |
| `isDarkMode`      | `boolean`             | Controls dark class on `<html>`              |

`filteredBusinesses` is derived from `businesses + filters` on every render. It is not stored in state.

---

## How to Add a New Filter

1. Add the new field to `SearchFilterState` in `src/types/index.ts`
2. Add a default value in the `useState<SearchFilterState>` initializer in `App.tsx`
3. Add the filter UI element in the filter bar section of `App.tsx`
4. Add the `.filter()` condition inside the `filteredBusinesses` derivation in `App.tsx`

No other files need to change.

---

## How to Add a New Table Column

1. Add the field to `BusinessResult` in `src/types/index.ts` (mark optional with `?` if not always present)
2. Populate the field in `searchBusinesses()` inside `src/lib/google-places.ts` (both live and mock paths)
3. Add a `<TableHead>` column in `src/components/results-table.tsx`
4. Add the corresponding `<TableCell>` inside the row map

If it is an optional field, follow the existing pattern of rendering `—` when the value is undefined.

---

## How to Add a New Export Format

1. Add the new export function to `src/lib/export.ts`
2. Add a handler function in `App.tsx` (following the pattern of `handleExportCSV`)
3. Add a new Button in the export section of the filter bar in `App.tsx`

---

## How the Mock System Works

When `VITE_GOOGLE_MAPS_API_KEY` is empty or unset, `getApiKey()` returns `undefined` and `searchBusinesses()` falls into `getMockSearch()`.

Mock search behavior:
- Filters 20 predefined business templates by matching the input type against name and category fields
- If no template matches, generates five dynamic entries using the input type string
- Assigns addresses using the input location string as the city name
- Resolves after a 1.2-second timeout to simulate network latency

To add more mock businesses, append entries to `MOCK_BUSINESS_TEMPLATES` in `src/lib/google-places.ts`.

---

## How the Google Maps Script Loads

The Maps JS SDK is loaded lazily — only when the first search is triggered. The loader in `loadGoogleMapsScript()` creates a `<script>` tag and appends it to `<head>`. A module-level `loadPromise` variable ensures the script is only injected once, even if `searchBusinesses` is called multiple times.

Subsequent calls to `loadGoogleMapsScript()` return the same promise and resolve immediately if the script is already present.

---

## Environment Variable

The application reads one variable from `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=
```

Vite exposes this to the browser as `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`. Any variable without the `VITE_` prefix is not exposed to the client bundle.

Changing this variable requires a server restart (`npm run dev`) for the new value to take effect.

---

## Google APIs Required

The following three APIs must all be active on the same Google Cloud project as the key:

- Maps JavaScript API
- Geocoding API
- Places API (Legacy)

The legacy designation matters: the application uses `google.maps.places.PlacesService`, which requires the Legacy backend to be explicitly enabled for projects created after March 2025.

---

## TypeScript Rules

The project uses `verbatimModuleSyntax: true`. This requires all type-only imports to use `import type`:

```ts
// correct
import type { BusinessResult } from "../types"

// will fail to compile
import { BusinessResult } from "../types"
```

All value imports (functions, classes, constants) use standard `import`.

---

## Running the Application

```bash
npm install          # install dependencies
npm run dev          # start development server on port 5173
npm run build        # compile and bundle for production
npm run lint         # run ESLint
```

---

## What This Application Does Not Do

- No user accounts or login
- No server-side processing
- No database or persistence layer
- No analytics or tracking
- No AI or language model integration
- No web scraping or screenshot capture
- No lead management or CRM features
- No crawling
