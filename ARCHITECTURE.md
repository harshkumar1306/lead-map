# Architecture

LeadMap is a frontend-only single-page application. There is no server, no database, and no authentication layer. All data fetching happens directly from the browser against the Google Maps JavaScript API.

---

## High-Level Overview

```
Browser
  |
  |-- App.tsx (state root)
        |
        |-- SearchForm          <- user input
        |-- FilterBar           <- inline in App.tsx
        |-- ResultsTable        <- display + row actions
        |
        |-- lib/google-places   <- API or mock data
        |-- lib/export          <- CSV / Excel download
```

All state lives in a single `App.tsx` component. There is no external state manager (no Redux, no Zustand). This keeps the application flat and easy to trace.

---

## Data Flow

```
User fills SearchForm
        |
        v
App.tsx calls searchBusinesses(params)
        |
        |-- API key present?
        |     YES --> loadGoogleMapsScript()
        |               --> google.maps.Geocoder.geocode(location)
        |               --> google.maps.places.PlacesService.nearbySearch()
        |               --> PlacesService.getDetails() for each result (parallel)
        |               --> returns BusinessResult[]
        |
        |     NO  --> getMockSearch(params)
        |               --> filters mock templates by type keyword
        |               --> generates dynamic entries if no match
        |               --> simulates 1.2s latency
        |               --> returns BusinessResult[]
        |
        v
App.tsx stores results in useState
        |
        v
Filters applied (pure array .filter() on each render)
        |
        v
ResultsTable renders filtered list
        |
        v
User selects rows (selectedIds in useState)
        |
        v
Export triggered --> exportToCSV() or exportToExcel()
                     --> creates Blob and triggers browser download
```

---

## File Responsibilities

### `src/App.tsx`

The only stateful component. Owns:
- `businesses` — raw results from search
- `selectedIds` — currently checked row IDs
- `isLoading`, `error`, `searchPerformed` — search lifecycle flags
- `currentSearch` — last submitted params (used for export filename)
- `filters` — filter panel state
- `isDarkMode` — theme toggle

Computes `filteredBusinesses` inline on each render by chaining `.filter()` against the filter state. No memoization needed at this scale.

### `src/lib/google-places.ts`

Handles all data fetching. Two modes:

**Live mode** (API key present):
1. Dynamically injects the Maps JS script tag into `<head>` once
2. Uses `google.maps.Geocoder` to resolve the text location to `LatLng`
3. Calls `PlacesService.nearbySearch()` with type + radius
4. For each of the top 12 results, calls `PlacesService.getDetails()` in parallel to fetch phone number and website
5. Returns a normalized `BusinessResult[]`

**Mock mode** (no API key):
1. Matches input type against 20 template businesses
2. Falls back to dynamically generated entries if no template matches
3. Resolves after 1.2 seconds to simulate network latency

The script loader uses a module-level promise (`loadPromise`) so the `<script>` tag is only injected once per page session even if `searchBusinesses` is called multiple times.

### `src/lib/export.ts`

Two functions:

- `exportToCSV` — serializes `BusinessResult[]` to a UTF-8 BOM CSV string, wraps it in a `Blob`, and triggers a download via a temporary `<a>` element
- `exportToExcel` — uses the `xlsx` library to write a worksheet and calls `XLSX.writeFile()` to trigger the browser download

Neither function opens a new tab or makes a network request.

### `src/components/search-form.tsx`

Controlled form with three fields:
- Business Type: free text input
- Location: free text input
- Radius: `<select>` bound to meter values (1000, 3000, 5000, 10000)

The Search button is disabled while loading or while either text field is empty. Submits by calling `onSearch(params)` passed in from App.

### `src/components/results-table.tsx`

Renders a `<table>` using the custom Table primitives. Each row:
- Has a checkbox for selection (managed by `selectedIds` in parent)
- Displays all seven columns
- Has three icon buttons: copy phone, open Maps, open website
- Uses a module-level `copiedId` state to show a checkmark for 1.5 seconds after copy

The "select all" checkbox in the header is a controlled input whose `checked` value is `selectedIds.length === businesses.length`. Toggling it calls `onSelectChange` with all IDs or an empty array.

The empty state is rendered when `businesses.length === 0` after a search completes.

### `src/components/ui/`

Five hand-written primitive components that mirror the shadcn/ui API surface but contain no third-party radix dependency:

| Component  | HTML element  | Notes                                  |
|------------|---------------|----------------------------------------|
| Button     | `<button>`    | Variants: default, outline, ghost, etc.|
| Input      | `<input>`     | Forwards all native input props        |
| Select     | `<select>`    | Wraps a native select with a chevron   |
| Checkbox   | `<input type="checkbox">` | Minimal wrapper          |
| Table      | `<table>` + sub-elements | Full set of thead/tbody/tr/th/td |

All class logic uses `cn()` from `src/lib/utils.ts`, which wraps `clsx` + `tailwind-merge`.

---

## Styling

TailwindCSS v3 with a custom design token layer using CSS custom properties (HSL format). Tokens are declared in `src/index.css` under `:root` and `.dark`. The dark class is toggled on `<html>` by `App.tsx` based on the `isDarkMode` state.

Font: Outfit (loaded from Google Fonts in `index.css`).

---

## Type Definitions

Three interfaces in `src/types/index.ts`:

```ts
SearchParams          // businessType, location, radius
BusinessResult        // id, name, category, rating, reviewCount, phoneNumber, website, address, placeId
SearchFilterState     // hasWebsite, noWebsite, ratingAbove4, minReviews
```

All are plain data interfaces with no methods. Imported using `import type` in all consumer files to satisfy the `verbatimModuleSyntax` TypeScript compiler option.

---

## Build

| Command         | Output                                       |
|-----------------|----------------------------------------------|
| `npm run dev`   | Vite dev server at localhost:5173 with HMR   |
| `npm run build` | Production bundle in `dist/`                 |
| `npm run lint`  | ESLint with TypeScript rules                 |

The production bundle is a single JS chunk (~535 kB uncompressed, ~173 kB gzip). The large size comes from the `xlsx` library. Code splitting is not implemented for the MVP.

---

## Constraints and Limitations

- **CORS**: Direct REST calls to the Places REST API from the browser are blocked by CORS. The application avoids this by loading the Maps JavaScript SDK, which handles all network requests internally through Google's own infrastructure.
- **Quota**: Each search triggers one geocode request, one nearbySearch request, and up to 12 getDetails requests. Monitor your Google Cloud usage dashboard.
- **Legacy API**: The application uses `PlacesService` (the legacy Places JavaScript API). New Google Cloud projects must explicitly enable "Places API (Legacy)" for this to work.
- **No persistence**: Results are held in React state only. Refreshing the page clears everything.
