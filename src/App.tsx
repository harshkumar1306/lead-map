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
  Database,
  FileDown
} from "lucide-react"
import { downloadSnapshots } from "./lib/snapshot"

function App() {
  const [businesses, setBusinesses] = React.useState<BusinessResult[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchPerformed, setSearchPerformed] = React.useState(false)
  const [currentSearch, setCurrentSearch] = React.useState<SearchParams | null>(null)
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = React.useState(true)

  // Download progress state
  const [downloadProgress, setDownloadProgress] = React.useState<{
    active: boolean
    step: string
    current: number
    total: number
  } | null>(null)

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
      ? `leadmap-${currentSearch.businessType}-${currentSearch.location}.csv`.toLowerCase().replace(/\s+/g, "-")
      : "leadmap-leads.csv"
    exportToCSV(selectedBusinesses, name)
  }

  const handleExportExcel = () => {
    if (selectedBusinesses.length === 0) return
    const name = currentSearch
      ? `leadmap-${currentSearch.businessType}-${currentSearch.location}.xlsx`.toLowerCase().replace(/\s+/g, "-")
      : "leadmap-leads.xlsx"
    exportToExcel(selectedBusinesses, name)
  }

  const handleDownloadSnapshot = async (business: BusinessResult) => {
    setDownloadProgress({
      active: true,
      step: "Initializing snapshot...",
      current: 0,
      total: 1
    })
    try {
      await downloadSnapshots([business], (step, current, total) => {
        setDownloadProgress({ active: true, step, current, total })
      })
      setTimeout(() => {
        setDownloadProgress(null)
      }, 1500)
    } catch (err) {
      console.error(err)
      setDownloadProgress({
        active: true,
        step: "Download failed. Please check your network or try again.",
        current: 1,
        total: 1
      })
    }
  }

  const handleDownloadBulkSnapshots = async () => {
    if (selectedBusinesses.length === 0) return
    setDownloadProgress({
      active: true,
      step: "Initializing multi-snapshot download...",
      current: 0,
      total: selectedBusinesses.length
    })
    try {
      await downloadSnapshots(selectedBusinesses, (step, current, total) => {
        setDownloadProgress({ active: true, step, current, total })
      })
      setTimeout(() => {
        setDownloadProgress(null)
      }, 1500)
    } catch (err) {
      console.error(err)
      setDownloadProgress({
        active: true,
        step: "Download failed. Please check your network or try again.",
        current: selectedBusinesses.length,
        total: selectedBusinesses.length
      })
    }
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
                LeadMap
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
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-border/60">
                <div className="flex items-center gap-3">
                  {/* Select All checkbox for Mobile only */}
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none md:hidden bg-secondary/35 border border-border/50 hover:bg-secondary/50 rounded-lg px-2.5 py-1.5 transition-all">
                    <Checkbox
                      checked={filteredBusinesses.length > 0 && selectedIds.length === filteredBusinesses.length}
                      onChange={() => {
                        if (selectedIds.length === filteredBusinesses.length) {
                          setSelectedIds([])
                        } else {
                          setSelectedIds(filteredBusinesses.map((b) => b.id))
                        }
                      }}
                    />
                    <span>All</span>
                  </label>

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
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    onClick={handleDownloadBulkSnapshots}
                    className="h-9 px-3 gap-1.5 text-xs font-semibold text-indigo-500 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-400 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20"
                    title="Download full business snapshot data for selected items"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Data</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading / Results Switch */}
            {isLoading ? (
              <div className="w-full bg-card border border-border/80 rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                  <Search className="w-5 h-5 text-indigo-500 absolute animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">Mapping leads...</h3>
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
                  onDownloadSnapshot={handleDownloadSnapshot}
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
        <p>LeadMap • Minimalist B2B Prospect Finder</p>
      </footer>

      {/* Premium Glassmorphic Progress Modal */}
      {downloadProgress && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-md transition-opacity duration-300">
          <div className="w-full max-w-md bg-card/85 dark:bg-card/75 border border-border/60 shadow-2xl rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl animate-fade-in">
            {/* Ambient background glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-violet-500/15 rounded-full blur-2xl"></div>

            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              {/* Status Graphic */}
              {downloadProgress.current === downloadProgress.total && 
              (downloadProgress.step.includes("Compiling") || downloadProgress.step.includes("finished") || downloadProgress.current > 0 && !downloadProgress.step.includes("Download") && !downloadProgress.step.includes("photo") && !downloadProgress.step.includes("Fetch")) ? (
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
                  <CheckCircle className="w-7 h-7" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                  <FileDown className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
                </div>
              )}

              {/* Progress Labels */}
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-foreground">
                  {downloadProgress.current === downloadProgress.total && 
                  (downloadProgress.step.includes("Compiling") || downloadProgress.step.includes("finished") || downloadProgress.current > 0 && !downloadProgress.step.includes("Download") && !downloadProgress.step.includes("photo") && !downloadProgress.step.includes("Fetch"))
                    ? "Snapshot Package Ready!"
                    : "Capturing Snapshots..."}
                </h3>
                <p className="text-xs text-muted-foreground/80 max-w-xs h-8 flex items-center justify-center font-medium">
                  {downloadProgress.step}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-1.5">
                <div className="w-full bg-secondary/60 h-2.5 rounded-full overflow-hidden border border-border/20">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${downloadProgress.total > 0 ? (downloadProgress.current / downloadProgress.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                  <span>Business {downloadProgress.current} of {downloadProgress.total}</span>
                  <span>{downloadProgress.total > 0 ? Math.round((downloadProgress.current / downloadProgress.total) * 100) : 0}%</span>
                </div>
              </div>

              {/* Success / Done button if complete, otherwise info text */}
              {(downloadProgress.current === downloadProgress.total && 
              (downloadProgress.step.includes("Compiling") || downloadProgress.step.includes("finished") || downloadProgress.current > 0 && !downloadProgress.step.includes("Download") && !downloadProgress.step.includes("photo") && !downloadProgress.step.includes("Fetch"))) || 
              downloadProgress.step.includes("failed") ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDownloadProgress(null)}
                  className="mt-2 h-8 px-4 text-xs font-semibold text-indigo-600 bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 dark:text-indigo-400"
                >
                  Dismiss
                </Button>
              ) : (
                <div className="text-[10px] text-muted-foreground/60 italic pt-1">
                  Do not refresh the page while packing files.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
