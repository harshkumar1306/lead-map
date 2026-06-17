# Scout

A minimalist single-page application for finding local businesses using the Google Places API.

---

## Purpose

Scout helps you locate businesses in a specific area, extract their contact details, apply filters, and export the results as a spreadsheet. It is designed as a lightweight prospecting tool with no backend, no database, and no login.

---

## Features

- Search businesses by type, location, and radius
- Display results in a clean table with name, category, rating, reviews, phone, website, and address
- Filter results by website presence, rating threshold, and minimum review count
- Copy phone numbers, open Google Maps, and visit websites directly from the table
- Select any subset of results and export to CSV or Excel
- Demo mode with realistic mock data when no API key is configured

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | React 19 with TypeScript          |
| Build tool  | Vite 8                            |
| Styling     | TailwindCSS 3.4                   |
| Components  | Custom shadcn-style primitives    |
| Data source | Google Maps JavaScript API (Places legacy) |
| Export      | xlsx library                      |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

Rename `.env.example` to `.env` and fill in your key:

```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

If the key is left empty, the application runs in **Demo Mode** and returns realistic mock data so you can evaluate the UI immediately without any credentials.

### 3. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

---

## Google Cloud APIs Required

All three of the following APIs must be enabled on the same Google Cloud project as your key:

| API                           | Purpose                                           |
|-------------------------------|---------------------------------------------------|
| Maps JavaScript API           | Loads the Places SDK in the browser               |
| Geocoding API                 | Converts text locations to latitude/longitude     |
| Places API (Legacy)           | Runs nearbySearch and getDetails place queries    |

Enable them at: https://console.cloud.google.com/apis/library

---

## Environment Variables

| Variable                    | Required | Description                        |
|-----------------------------|----------|------------------------------------|
| VITE_GOOGLE_MAPS_API_KEY    | No       | Google Maps API key. If empty, Demo Mode activates. |

---

## Usage

1. Enter a **business type** (e.g. Dentist, Cafe, Plumber)
2. Enter a **location** (e.g. San Francisco, CA)
3. Select a **radius** from the dropdown (1 km to 10 km)
4. Click **Search**
5. Use the filter bar to narrow results by website, rating, or review count
6. Check rows you want to keep
7. Click **CSV** or **Excel** to download the selection

---

## Project Structure

```
lead-map/
├── .env                        # API key configuration
├── .env.example                # Template for env setup
├── index.html                  # HTML entry point
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── vite.config.ts              # Vite configuration
├── tsconfig.app.json           # TypeScript configuration
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Root component with all state
    ├── index.css               # Global styles and CSS variables
    ├── types/
    │   └── index.ts            # TypeScript interfaces
    ├── lib/
    │   ├── utils.ts            # Class name utility (cn)
    │   ├── google-places.ts    # Google Maps API integration and mock fallback
    │   └── export.ts           # CSV and Excel export logic
    └── components/
        ├── search-form.tsx     # Search input form
        ├── results-table.tsx   # Business results table
        └── ui/
            ├── button.tsx
            ├── input.tsx
            ├── select.tsx
            ├── checkbox.tsx
            └── table.tsx
```

---

## License

MIT
