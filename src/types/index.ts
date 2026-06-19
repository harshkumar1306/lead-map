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

export interface BusinessReview {
  authorName: string
  rating: number
  text: string
  relativeTime?: string
  date: string
  profilePhotoUrl?: string
}

export interface BusinessPhoto {
  url: string
  width: number
  height: number
  htmlAttributions?: string[]
}

export interface BusinessSnapshot {
  id: string
  name: string
  placeId?: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  phoneNumber?: string
  internationalPhoneNumber?: string
  website?: string
  categories: string[]
  businessStatus?: string
  openingHours?: {
    isOpen?: boolean
    weekdayText: string[]
    periods?: Array<{
      open: { day: number; time: string }
      close?: { day: number; time: string }
    }>
  }
  rating?: number
  reviewCount?: number
  priceLevel?: number
  googleMapsUrl?: string
  overview?: string
  popularTimes?: any
  attributes?: {
    dineIn?: boolean
    delivery?: boolean
    takeout?: boolean
    reservable?: boolean
    servesBeer?: boolean
    servesBreakfast?: boolean
    servesBrunch?: boolean
    servesDinner?: boolean
    servesLunch?: boolean
    servesVegetarianFood?: boolean
    servesWine?: boolean
    wheelchairAccessibleEntrance?: boolean
  }
  menuUrl?: string
  reservationUrl?: string
  orderingUrl?: string
  reviews: BusinessReview[]
  photos: BusinessPhoto[]
}

