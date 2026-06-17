import * as React from "react"
import type { BusinessResult } from "../types"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "./ui/table"
import { Checkbox } from "./ui/checkbox"
import { Button } from "./ui/button"
import { Globe, MapPin, Copy, Check, Star, ExternalLink, ShieldAlert } from "lucide-react"

interface ResultsTableProps {
  businesses: BusinessResult[]
  selectedIds: string[]
  onSelectChange: (ids: string[]) => void
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  businesses,
  selectedIds,
  onSelectChange
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopyPhone = (id: string, phone?: string) => {
    if (!phone) return
    navigator.clipboard.writeText(phone)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === businesses.length) {
      onSelectChange([])
    } else {
      onSelectChange(businesses.map((b) => b.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id))
    } else {
      onSelectChange([...selectedIds, id])
    }
  }

  const getMapsUrl = (business: BusinessResult) => {
    const base = "https://www.google.com/maps/search/?api=1"
    const query = encodeURIComponent(`${business.name}, ${business.address}`)
    if (business.placeId) {
      return `${base}&query=${query}&query_place_id=${business.placeId}`
    }
    return `${base}&query=${query}`
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/80 rounded-xl bg-card">
        <div className="rounded-full bg-secondary p-3 mb-4 text-muted-foreground">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-1">No businesses found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your search criteria, enlarging the search radius, or clearing current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Mobile view: Card list */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {businesses.map((business) => {
          const isSelected = selectedIds.includes(business.id)
          return (
            <div
              key={business.id}
              className={`bg-card border rounded-xl p-4 transition-all duration-150 space-y-3 ${
                isSelected ? "border-primary/50 shadow-sm bg-primary/[0.01]" : "border-border/80"
              }`}
            >
              {/* Card Header: Checkbox, Name, Category */}
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                  <div className="pt-0.5">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelectRow(business.id)}
                      aria-label={`Select ${business.name}`}
                    />
                  </div>
                  <span className="font-semibold text-sm text-foreground leading-tight">
                    {business.name}
                  </span>
                </label>
                {business.category && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/40">
                    {business.category}
                  </span>
                )}
              </div>

              {/* Rating and Reviews */}
              {(business.rating || business.reviewCount !== undefined) && (
                <div className="flex items-center gap-2 text-xs">
                  {business.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span className="font-semibold text-foreground/90">{business.rating.toFixed(1)}</span>
                    </div>
                  ) : null}
                  {business.rating && business.reviewCount !== undefined && (
                    <span className="text-muted-foreground">•</span>
                  )}
                  {business.reviewCount !== undefined ? (
                    <span className="text-muted-foreground">{business.reviewCount.toLocaleString()} reviews</span>
                  ) : null}
                </div>
              )}

              {/* Address and Contact details */}
              <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                {business.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground/75" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground/70">Phone:</span>
                    <a href={`tel:${business.phoneNumber}`} className="text-foreground/80 hover:underline">
                      {business.phoneNumber}
                    </a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium text-foreground/70">Website:</span>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {business.website.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </div>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/40 pt-2.5">
                {business.phoneNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 bg-background"
                    onClick={() => handleCopyPhone(business.id, business.phoneNumber)}
                  >
                    {copiedId === business.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Phone</span>
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 bg-background"
                  onClick={() => window.open(getMapsUrl(business), "_blank")}
                >
                  <MapPin className="w-3 h-3" />
                  <span>Maps</span>
                </Button>

                {business.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 bg-background"
                    onClick={() => window.open(business.website!, "_blank")}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Website</span>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block w-full bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={businesses.length > 0 && selectedIds.length === businesses.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all businesses"
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">Business Name</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[90px]">Rating</TableHead>
                <TableHead className="min-w-[110px]">Reviews</TableHead>
                <TableHead className="min-w-[150px]">Phone Number</TableHead>
                <TableHead className="min-w-[180px]">Website</TableHead>
                <TableHead className="min-w-[250px]">Address</TableHead>
                <TableHead className="min-w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => {
                const isSelected = selectedIds.includes(business.id)
                return (
                  <TableRow
                    key={business.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="group hover:bg-secondary/20 transition-all duration-150"
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleSelectRow(business.id)}
                        aria-label={`Select ${business.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {business.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/40">
                        {business.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      {business.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          <span className="font-semibold text-foreground/90">{business.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {business.reviewCount !== undefined ? (
                        <span>{business.reviewCount.toLocaleString()}</span>
                      ) : (
                        <span className="text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {business.phoneNumber ? (
                        <span className="text-foreground/90 text-sm">{business.phoneNumber}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {business.website ? (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                        >
                          <span className="truncate max-w-[140px]">{business.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[250px] truncate" title={business.address}>
                      {business.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Copy Phone Number Action */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          disabled={!business.phoneNumber}
                          onClick={() => handleCopyPhone(business.id, business.phoneNumber)}
                          title="Copy Phone Number"
                        >
                          {copiedId === business.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        {/* Open Maps Action */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(getMapsUrl(business), "_blank")}
                          title="Open in Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </Button>

                        {/* Open Website Action */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          disabled={!business.website}
                          onClick={() => business.website && window.open(business.website, "_blank")}
                          title="Visit Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
