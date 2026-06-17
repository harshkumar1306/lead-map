import * as React from "react"
import type { SearchParams } from "../types"
import { Input } from "./ui/input"
import { Select } from "./ui/select"
import { Button } from "./ui/button"
import { Search, MapPin, Compass, Loader2 } from "lucide-react"

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [businessType, setBusinessType] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [radius, setRadius] = React.useState(3000) // Default 3km

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType.trim() || !location.trim()) return
    onSearch({
      businessType: businessType.trim(),
      location: location.trim(),
      radius
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-card border border-border/80 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        {/* Business Type Input */}
        <div className="md:col-span-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            Business Type
          </label>
          <Input
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="e.g. Dentist, Cafe, Plumber"
            required
            className="bg-secondary/30 border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all hover:bg-secondary/50 duration-200"
          />
        </div>

        {/* Location Input */}
        <div className="md:col-span-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Location
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. San Francisco, CA"
            required
            className="bg-secondary/30 border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all hover:bg-secondary/50 duration-200"
          />
        </div>

        {/* Radius Select */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Radius
          </label>
          <Select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-secondary/30 border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all hover:bg-secondary/50 duration-200"
          >
            <option value={1000}>1 km</option>
            <option value={3000}>3 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
          </Select>
        </div>

        {/* Search Button */}
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={isLoading || !businessType.trim() || !location.trim()}
            className="w-full h-10 font-medium tracking-wide flex items-center justify-center gap-2 group transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Search</span>
                <Search className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
