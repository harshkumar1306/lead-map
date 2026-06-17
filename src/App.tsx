import * as React from "react"
import { SearchForm } from "./components/search-form"
import { ResultsTable } from "./components/results-table"
import type { SearchParams, BusinessResult, SearchFilterState } from "./types"
import { searchBusinesses, getApiKey } from "./lib/google-places"
import { exportToCSV, exportToExcel } from "./lib/export"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Checkbox } from "./components/ui/checkbox"
import { 
  Compass, 
  Moon, 
  Sun, 
  Download, 
  AlertCircle, 
  Search, 
  Sparkles, 
  Trash2, 
  Filter,
  CheckCircle,
  Database
} from "lucide-react"

function App() {
  const [businesses, setBusinesses] = React.useState<BusinessResult[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchPerformed, setSearchPerformed] = React.useState(false)
  const [currentSearch, setCurrentSearch] = React.useState<SearchParams | null>(null)
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = React.useState(true)

  // Filter state
  const [filters, setFilters] = React.useState<SearchFilterState>({
    hasWebsite: false,
    noWebsite: false,
    ratingAbove4: false,
    minReviews: 0
  })

  // Set initial dark class on html
  React.useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDarkMode])

  const hasApiKey = getApiKey() !== undefined

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)
    setSelectedIds([])
    setCurrentSearch(params)

    try {
      const results = await searchBusinesses(params)
      setBusinesses(results)
      setSearchPerformed(true)
    } catch (err: any) {
      setError(err?.message || "An error occurred while searching for businesses.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle website filter exclusivity
  const handleWebsiteFilterChange = (type: "has" | "no") => {
    setFilters((prev) => {
      if (type === "has") {
        return {
          ...prev,
          hasWebsite: !prev.hasWebsite,
          noWebsite: false // Mutual exclusion
        }
      } else {
        return {
          ...prev,
          noWebsite: !prev.noWebsite,
          hasWebsite: false // Mutual exclusion
        }
      }
    })
  }

  const handleResetFilters = () => {
    setFilters({
      hasWebsite: false,
      noWebsite: false,
      ratingAbove4: false,
      minReviews: 0
    })
  }

  // Apply filters
  const filteredBusinesses = businesses.filter((b) => {
    if (filters.hasWebsite && !b.website) return false
    if (filters.noWebsite && b.website) return false
    if (filters.ratingAbove4 && (b.rating === undefined || b.rating <= 4.0)) return false
    if (filters.minReviews > 0 && (b.reviewCount === undefined || b.reviewCount < filters.minReviews)) return false
    return true
  })

  // Extract selected business objects
  const selectedBusinesses = businesses.filter((b) => selectedIds.includes(b.id))

  const handleExportCSV = () => {
    if (selectedBusinesses.length === 0) return
    const name = currentSearch 
      ? `scout-${currentSearch.businessType}-${currentSearch.location}.csv`.toLowerCase().replace(/\s+/g, "-")
      : "scout-leads.csv"
    exportToCSV(selectedBusinesses, name)
  }

  const handleExportExcel = () => {
    if (selectedBusinesses.length === 0) return
    const name = currentSearch
      ? `scout-${currentSearch.businessType}-${currentSearch.location}.xlsx`.toLowerCase().replace(/\s+/g, "-")
      : "scout-leads.xlsx"
    exportToExcel(selectedBusinesses, name)
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Premium Header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Compass className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Scout
              </span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase tracking-wider">
                MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-9 w-9 rounded-lg border-border/80 text-muted-foreground hover:text-foreground"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner for Mock Mode */}
        {!hasApiKey && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Demo Mode Active</h4>
                <p className="text-xs opacity-90 leading-normal">
                  No Google Maps API Key found in `.env`. Displaying realistic local mock businesses for testing.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <span className="text-[11px] font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Fully Interactive
              </span>
            </div>
          </div>
        )}

        {/* Introduction / Hero (Only shows before search) */}
        {!searchPerformed && !isLoading && (
          <div className="text-center py-12 max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/5 border border-primary/10 text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
              Premium B2B Lead Finder
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground sm:leading-none">
              Locate businesses anywhere.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Find leads, map contact cards, and filter business properties.
              Export clean formatted lists directly to Excel or CSV in seconds.
            </p>
          </div>
        )}

        {/* Search Card Section */}
        <section className="space-y-2">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Search Results Area */}
        {error && (
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {searchPerformed || isLoading ? (
          <section className="space-y-5">
            {/* Filter and Action Header */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card border border-border/80 p-5 rounded-xl shadow-sm">
              {/* Left Side: Dynamic Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span>Filters:</span>
                </div>

                {/* Has Website */}
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer bg-secondary/35 border border-border/50 hover:bg-secondary/50 rounded-lg px-2.5 py-1.5 transition-all select-none">
                  <Checkbox
                    checked={filters.hasWebsite}
                    onChange={() => handleWebsiteFilterChange("has")}
                  />
                  <span>Has Website</span>
                </label>

                {/* No Website */}
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer bg-secondary/35 border border-border/50 hover:bg-secondary/50 rounded-lg px-2.5 py-1.5 transition-all select-none">
                  <Checkbox
                    checked={filters.noWebsite}
                    onChange={() => handleWebsiteFilterChange("no")}
                  />
                  <span>No Website</span>
                </label>

                {/* Rating Above 4.0 */}
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer bg-secondary/35 border border-border/50 hover:bg-secondary/50 rounded-lg px-2.5 py-1.5 transition-all select-none">
                  <Checkbox
                    checked={filters.ratingAbove4}
                    onChange={(e) => setFilters(prev => ({ ...prev, ratingAbove4: e.target.checked }))}
                  />
                  <span>Rating &gt; 4.0</span>
                </label>

                {/* Minimum Reviews Input */}
                <div className="flex items-center gap-2 bg-secondary/35 border border-border/50 rounded-lg px-2.5 py-1">
                  <span className="text-xs font-medium text-muted-foreground">Min Reviews:</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={filters.minReviews || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, minReviews: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="h-6 w-16 px-1.5 py-0.5 text-xs text-center border-none bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:outline-none"
                  />
                </div>

                {/* Reset Filters button */}
                {(filters.hasWebsite || filters.noWebsite || filters.ratingAbove4 || filters.minReviews > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-8 text-xs font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1 px-2.5 hover:bg-destructive/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Right Side: Export Options */}
              <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-border/60">
                <div className="text-xs font-medium text-muted-foreground">
                  {selectedIds.length > 0 ? (
                    <span className="text-foreground/90 font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                      {selectedIds.length} Selected
                    </span>
                  ) : (
                    <span>Select items to export</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    onClick={handleExportCSV}
                    className="h-9 px-3 gap-1.5 text-xs font-medium bg-background border-border/80 hover:bg-secondary"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    onClick={handleExportExcel}
                    className="h-9 px-3 gap-1.5 text-xs font-medium bg-background border-border/80 hover:bg-secondary"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading / Results Switch */}
            {isLoading ? (
              <div className="w-full bg-card border border-border/80 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                  <Search className="w-5 h-5 text-indigo-500 absolute animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">Scouting businesses...</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {hasApiKey 
                      ? "Geocoding and querying Google Places API details. This may take a few seconds." 
                      : "Generating realistic local business prospects."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>
                    Showing {filteredBusinesses.length} of {businesses.length} found
                  </span>
                  {currentSearch && (
                    <span>
                      Query: <strong className="text-foreground/80">{currentSearch.businessType}</strong> in <strong className="text-foreground/80">{currentSearch.location}</strong> ({currentSearch.radius / 1000}km)
                    </span>
                  )}
                </div>
                <ResultsTable
                  businesses={filteredBusinesses}
                  selectedIds={selectedIds}
                  onSelectChange={setSelectedIds}
                />
              </div>
            )}
          </section>
        ) : (
          /* Landing page guide cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            <div className="bg-card border border-border/80 rounded-xl p-5 space-y-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h3 className="font-semibold text-base text-foreground">Specify Search Params</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Type the type of business and physical location coordinates or city names, and choose the radius span.
              </p>
            </div>
            <div className="bg-card border border-border/80 rounded-xl p-5 space-y-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h3 className="font-semibold text-base text-foreground">Apply Precise Filters</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Instantly toggle leads by website availability, minimum review volume counts, or rating threshholds.
              </p>
            </div>
            <div className="bg-card border border-border/80 rounded-xl p-5 space-y-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                3
              </span>
              <h3 className="font-semibold text-base text-foreground">One-Click Actions</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Copy phone numbers instantly, navigate to locations on Google Maps, check websites, and export.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground mt-12 bg-card/40">
        <p>Scout Lead Locator • Minimalist B2B Prospect Finder</p>
      </footer>
    </div>
  )
}

export default App
