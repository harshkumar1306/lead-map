export interface SearchParams {
  businessType: string
  location: string
  radius: number // in meters (e.g., 1000, 3000, 5000, 10000)
}

export interface BusinessResult {
  id: string
  name: string
  category: string
  rating?: number
  reviewCount?: number
  phoneNumber?: string
  website?: string
  address: string
  placeId?: string
}

export interface SearchFilterState {
  hasWebsite: boolean
  noWebsite: boolean
  ratingAbove4: boolean
  minReviews: number
}
