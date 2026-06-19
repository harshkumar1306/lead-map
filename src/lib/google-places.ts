import type { SearchParams, BusinessResult, BusinessSnapshot, BusinessReview, BusinessPhoto } from "../types"

let loadPromise: Promise<void> | null = null

// Check if API Key exists and is valid (not empty placeholder)
export function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!key || key.trim() === "" || key.includes("your_")) {
    return undefined
  }
  return key
}

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      if ((window as any).google?.maps?.places) {
        resolve()
      } else {
        reject(new Error("Google Maps Places library not found on load."))
      }
    }

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps script."))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

// Generate high quality mock data for local testing
const MOCK_BUSINESS_TEMPLATES = [
  { name: "Blue Bottle Coffee", category: "Cafe", rating: 4.6, reviewCount: 420, hasWebsite: true, phoneSuffix: "555-0192" },
  { name: "Apex Dental Care", category: "Dentist", rating: 4.8, reviewCount: 89, hasWebsite: true, phoneSuffix: "555-0143" },
  { name: "Metro Plumbing Solutions", category: "Plumber", rating: 4.2, reviewCount: 56, hasWebsite: false, phoneSuffix: "555-0187" },
  { name: "Summit Law Group", category: "Lawyer", rating: 4.9, reviewCount: 112, hasWebsite: true, phoneSuffix: "555-0111" },
  { name: "The Green Bistro", category: "Restaurant", rating: 4.5, reviewCount: 630, hasWebsite: true, phoneSuffix: "555-0156" },
  { name: "Precision Auto Works", category: "Auto Repair", rating: 4.4, reviewCount: 145, hasWebsite: false, phoneSuffix: "555-0162" },
  { name: "Sparkle Dry Cleaners", category: "Dry Cleaning", rating: 3.8, reviewCount: 22, hasWebsite: false, phoneSuffix: "555-0129" },
  { name: "Vanguard Wealth Management", category: "Financial Advisor", rating: 4.7, reviewCount: 47, hasWebsite: true, phoneSuffix: "555-0178" },
  { name: "Elevate Fitness Studio", category: "Gym", rating: 4.9, reviewCount: 210, hasWebsite: true, phoneSuffix: "555-0134" },
  { name: "Core Chiropractic Clinic", category: "Chiropractor", rating: 4.1, reviewCount: 38, hasWebsite: true, phoneSuffix: "555-0145" },
  { name: "Pristine Dental Care", category: "Dentist", rating: 4.7, reviewCount: 75, hasWebsite: true, phoneSuffix: "555-0199" },
  { name: "Rapid Rooter Plumbing", category: "Plumber", rating: 3.9, reviewCount: 110, hasWebsite: true, phoneSuffix: "555-0212" },
  { name: "Golden Wok", category: "Restaurant", rating: 4.3, reviewCount: 320, hasWebsite: false, phoneSuffix: "555-0234" },
  { name: "Fit & Fuel Café", category: "Cafe", rating: 4.5, reviewCount: 180, hasWebsite: true, phoneSuffix: "555-0245" },
  { name: "Downtown Law Partners", category: "Lawyer", rating: 4.3, reviewCount: 34, hasWebsite: true, phoneSuffix: "555-0256" },
  { name: "Ironclad Gym", category: "Gym", rating: 4.8, reviewCount: 195, hasWebsite: false, phoneSuffix: "555-0267" },
  { name: "Speedy Lube & Tune", category: "Auto Repair", rating: 4.0, reviewCount: 88, hasWebsite: true, phoneSuffix: "555-0278" },
  { name: "White Glove Cleaners", category: "Dry Cleaning", rating: 4.1, reviewCount: 15, hasWebsite: false, phoneSuffix: "555-0289" },
  { name: "Ocean Breeze Seafood", category: "Restaurant", rating: 4.6, reviewCount: 490, hasWebsite: true, phoneSuffix: "555-0301" },
  { name: "Beacon Wealth Advisors", category: "Financial Advisor", rating: 4.5, reviewCount: 28, hasWebsite: true, phoneSuffix: "555-0312" }
]

function getMockSearch(params: SearchParams): Promise<BusinessResult[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const locationName = params.location || "Local Area"
      const typeQuery = params.businessType.toLowerCase()

      // Filter templates based on type matches, or return a dynamic subset
      let filteredTemplates = MOCK_BUSINESS_TEMPLATES.filter(
        t => t.name.toLowerCase().includes(typeQuery) ||
             t.category.toLowerCase().includes(typeQuery)
      )

      // If no templates match the specific keyword, generate dynamic ones based on input
      if (filteredTemplates.length === 0) {
        const capitalizedType = params.businessType.charAt(0).toUpperCase() + params.businessType.slice(1)
        filteredTemplates = [
          { name: `Elite ${capitalizedType}`, category: capitalizedType, rating: 4.8, reviewCount: 120, hasWebsite: true, phoneSuffix: "555-9081" },
          { name: `${capitalizedType} Express`, category: capitalizedType, rating: 4.2, reviewCount: 45, hasWebsite: false, phoneSuffix: "555-9082" },
          { name: `The Local ${capitalizedType}`, category: capitalizedType, rating: 4.5, reviewCount: 88, hasWebsite: true, phoneSuffix: "555-9083" },
          { name: `Metro ${capitalizedType} & Co`, category: capitalizedType, rating: 3.9, reviewCount: 24, hasWebsite: false, phoneSuffix: "555-9084" },
          { name: `Apex ${capitalizedType} Solutions`, category: capitalizedType, rating: 4.7, reviewCount: 160, hasWebsite: true, phoneSuffix: "555-9085" },
        ]
      }

      // Add radius-specific distance variations or addresses
      const results: BusinessResult[] = filteredTemplates.map((item, index) => {
        const id = `mock-place-${index}-${Date.now()}`
        const streetNumber = 100 + index * 12
        const streetNames = ["Main St", "Broadway", "Pine St", "Oak Ave", "Maple Rd", "5th Ave", "Market St"]
        const street = streetNames[index % streetNames.length]
        
        return {
          id,
          name: item.name,
          category: item.category,
          rating: item.rating,
          reviewCount: item.reviewCount,
          phoneNumber: `(415) ${item.phoneSuffix}`,
          website: item.hasWebsite ? `https://www.${item.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : undefined,
          address: `${streetNumber} ${street}, ${locationName}`,
          placeId: id
        }
      })

      resolve(results)
    }, 1200) // Simulated network latency
  })
}

// Live search implementation
export async function searchBusinesses(params: SearchParams): Promise<BusinessResult[]> {
  const apiKey = getApiKey()
  
  if (!apiKey) {
    return getMockSearch(params)
  }

  try {
    await loadGoogleMapsScript(apiKey)
  } catch (error) {
    console.error("Google Maps API script load error, falling back to mock search:", error)
    return getMockSearch(params)
  }

  return new Promise((resolve, reject) => {
    // Create a temporary element to host the PlacesService (required by Maps JS API)
    const mapDiv = document.createElement("div")
    const geocoder = new google.maps.Geocoder()
    
    geocoder.geocode({ address: params.location }, (geocodeResults, geocodeStatus) => {
      if (geocodeStatus !== "OK" || !geocodeResults || !geocodeResults[0]?.geometry?.location) {
        reject(new Error(`Failed to geocode location: "${params.location}". Status: ${geocodeStatus}`))
        return
      }

      const locationLatLng = geocodeResults[0].geometry.location
      const service = new google.maps.places.PlacesService(mapDiv)

      const request: google.maps.places.PlaceSearchRequest = {
        location: locationLatLng,
        radius: params.radius,
        keyword: params.businessType
      }

      service.nearbySearch(request, async (nearbyResults, searchStatus) => {
        if (searchStatus === "ZERO_RESULTS" || !nearbyResults) {
          resolve([])
          return
        }

        if (searchStatus !== "OK") {
          reject(new Error(`Places Search failed with status: ${searchStatus}`))
          return
        }

        // Limit detail requests to top 12 results to keep latency and quota impact low
        const limitedResults = nearbyResults.slice(0, 12)
        const detailedBusinesses: BusinessResult[] = []

        // Resolve details in parallel
        const detailsPromises = limitedResults.map((place) => {
          if (!place.place_id) return Promise.resolve(null)
          
          return new Promise<google.maps.places.PlaceResult | null>((detailResolve) => {
            service.getDetails(
              {
                placeId: place.place_id!,
                fields: [
                  "name",
                  "formatted_phone_number",
                  "website",
                  "rating",
                  "user_ratings_total",
                  "formatted_address",
                  "types",
                  "place_id"
                ]
              },
              (detailResult, detailStatus) => {
                if (detailStatus === "OK" && detailResult) {
                  detailResolve(detailResult)
                } else {
                  // Fall back to basic info from search if detail fails
                  detailResolve(null)
                }
              }
            )
          })
        })

        const detailsResults = await Promise.all(detailsPromises)

        for (let i = 0; i < limitedResults.length; i++) {
          const basic = limitedResults[i]
          const detailed = detailsResults[i]

          const category = detailed?.types && detailed.types.length > 0 
            ? detailed.types[0].replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
            : (basic.types && basic.types.length > 0
                ? basic.types[0].replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                : "Business")

          detailedBusinesses.push({
            id: basic.place_id || `google-place-${i}-${Date.now()}`,
            name: detailed?.name || basic.name || "Unknown Business",
            category,
            rating: detailed?.rating ?? basic.rating,
            reviewCount: detailed?.user_ratings_total ?? basic.user_ratings_total,
            phoneNumber: detailed?.formatted_phone_number,
            website: detailed?.website,
            address: detailed?.formatted_address || basic.vicinity || "No Address Available",
            placeId: basic.place_id
          })
        }

        resolve(detailedBusinesses)
      })
    })
  })
}

const MOCK_REVIEWS_POOL = [
  {
    authorName: "Sarah Jenkins",
    rating: 5,
    text: "Absolutely fantastic experience here! The staff was welcoming, the ambiance was top-notch, and the service was prompt. I will definitely be coming back here soon. Highly recommended!",
    relativeTime: "2 days ago"
  },
  {
    authorName: "David Chen",
    rating: 4,
    text: "Very solid place. The quality is outstanding, though it gets quite busy during peak hours so you might have to wait a bit. Clean facilities and helpful staff.",
    relativeTime: "1 week ago"
  },
  {
    authorName: "Emily Rodriguez",
    rating: 5,
    text: "One of my favorite spots in town! Everything is curated perfectly. I love the layout and the atmosphere is very relaxing. 10/10.",
    relativeTime: "3 weeks ago"
  },
  {
    authorName: "Marcus Thorne",
    rating: 3,
    text: "Decent overall, but a bit overpriced for what you get. The service was a bit slow, but the employees were polite. Might give it another try on a weekday.",
    relativeTime: "1 month ago"
  },
  {
    authorName: "Alina Petrova",
    rating: 5,
    text: "I was super impressed by the attention to detail. Extremely clean, professional, and overall a wonderful visit. Five stars!",
    relativeTime: "2 months ago"
  }
]

export function getMockBusinessSnapshot(placeId: string, basicInfo: BusinessResult): Promise<BusinessSnapshot> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lat = 37.7749 + (basicInfo.name.length % 10) * 0.005
      const lng = -122.4194 - (basicInfo.name.length % 7) * 0.005

      const reviews: BusinessReview[] = MOCK_REVIEWS_POOL.map((rev, index) => {
        const date = new Date(Date.now() - index * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        return {
          authorName: rev.authorName,
          rating: rev.rating,
          text: rev.text,
          relativeTime: rev.relativeTime,
          date,
          profilePhotoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.authorName)}`
        }
      })

      const photos: BusinessPhoto[] = [0, 1, 2].map((idx) => {
        return {
          url: `mock-photo-canvas://idx=${idx}&name=${encodeURIComponent(basicInfo.name)}`,
          width: 1280,
          height: 720,
          htmlAttributions: ["LeadMap Mock Media"]
        }
      })

      const weekdayText = [
        "Monday: 8:00 AM – 6:00 PM",
        "Tuesday: 8:00 AM – 6:00 PM",
        "Wednesday: 8:00 AM – 6:00 PM",
        "Thursday: 8:00 AM – 8:00 PM",
        "Friday: 8:00 AM – 8:00 PM",
        "Saturday: 9:00 AM – 5:00 PM",
        "Sunday: Closed"
      ]

      const attributes = {
        dineIn: basicInfo.category === "Restaurant" || basicInfo.category === "Cafe",
        delivery: basicInfo.category === "Restaurant" || basicInfo.category === "Plumber" || basicInfo.category === "Auto Repair",
        takeout: basicInfo.category === "Restaurant" || basicInfo.category === "Cafe",
        reservable: basicInfo.category === "Restaurant" || basicInfo.category === "Dentist" || basicInfo.category === "Lawyer",
        wheelchairAccessibleEntrance: true
      }

      const snapshot: BusinessSnapshot = {
        id: placeId,
        name: basicInfo.name,
        placeId,
        address: basicInfo.address,
        coordinates: { lat, lng },
        phoneNumber: basicInfo.phoneNumber || "(555) 019-2834",
        internationalPhoneNumber: `+1 ${basicInfo.phoneNumber || "(555) 019-2834"}`,
        website: basicInfo.website || `https://www.${basicInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        categories: [basicInfo.category || "Business"],
        businessStatus: "OPERATIONAL",
        openingHours: {
          isOpen: true,
          weekdayText,
          periods: [
            { open: { day: 1, time: "0800" }, close: { day: 1, time: "1800" } },
            { open: { day: 2, time: "0800" }, close: { day: 2, time: "1800" } },
            { open: { day: 3, time: "0800" }, close: { day: 3, time: "1800" } },
            { open: { day: 4, time: "0800" }, close: { day: 4, time: "2000" } },
            { open: { day: 5, time: "0800" }, close: { day: 5, time: "2000" } },
            { open: { day: 6, time: "0900" }, close: { day: 6, time: "1700" } }
          ]
        },
        rating: basicInfo.rating || 4.5,
        reviewCount: basicInfo.reviewCount || 120,
        priceLevel: 2,
        googleMapsUrl: `https://maps.google.com/?cid=${placeId}`,
        overview: `A premier locally-owned ${basicInfo.category.toLowerCase()} offering premium quality products and professional customer service in the local area.`,
        attributes,
        menuUrl: basicInfo.category === "Restaurant" || basicInfo.category === "Cafe" ? `${basicInfo.website || "https://example.com"}/menu` : undefined,
        reservationUrl: basicInfo.category === "Restaurant" || basicInfo.category === "Dentist" || basicInfo.category === "Lawyer" ? `${basicInfo.website || "https://example.com"}/reserve` : undefined,
        orderingUrl: basicInfo.category === "Restaurant" || basicInfo.category === "Cafe" ? `${basicInfo.website || "https://example.com"}/order` : undefined,
        reviews,
        photos
      }

      resolve(snapshot)
    }, 800)
  })
}

export async function fetchBusinessSnapshot(placeId: string, basicInfo: BusinessResult): Promise<BusinessSnapshot> {
  const apiKey = getApiKey()
  
  if (!apiKey) {
    return getMockBusinessSnapshot(placeId, basicInfo)
  }

  try {
    await loadGoogleMapsScript(apiKey)
  } catch (error) {
    console.error("Google Maps API script load error, falling back to mock snapshot:", error)
    return getMockBusinessSnapshot(placeId, basicInfo)
  }

  return new Promise((resolve, reject) => {
    const mapDiv = document.createElement("div")
    const service = new google.maps.places.PlacesService(mapDiv)

    service.getDetails(
      {
        placeId: placeId,
        fields: [
          "name",
          "place_id",
          "formatted_address",
          "geometry",
          "formatted_phone_number",
          "international_phone_number",
          "website",
          "types",
          "business_status",
          "opening_hours",
          "rating",
          "user_ratings_total",
          "price_level",
          "url",
          "editorial_summary",
          "reviews",
          "photos",
          "dine_in",
          "delivery",
          "takeout",
          "reservable",
          "serves_beer",
          "serves_breakfast",
          "serves_brunch",
          "serves_dinner",
          "serves_lunch",
          "serves_vegetarian_food",
          "serves_wine",
          "wheelchair_accessible_entrance"
        ] as any
      },
      (detailResult, detailStatus) => {
        if (detailStatus !== "OK" || !detailResult) {
          reject(new Error(`Failed to fetch place details. Status: ${detailStatus}`))
          return
        }

        const lat = detailResult.geometry?.location?.lat() ?? 0
        const lng = detailResult.geometry?.location?.lng() ?? 0

        const categories = detailResult.types && detailResult.types.length > 0
          ? detailResult.types.map(t => t.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()))
          : (basicInfo.category ? [basicInfo.category] : ["Business"])

        const reviews: BusinessReview[] = (detailResult.reviews || []).map((rev) => {
          const date = rev.time ? new Date(rev.time * 1000).toISOString().split('T')[0] : ""
          return {
            authorName: rev.author_name || "Anonymous",
            rating: rev.rating ?? 0,
            text: rev.text || "",
            relativeTime: rev.relative_time_description,
            date,
            profilePhotoUrl: rev.profile_photo_url
          }
        })

        const photos: BusinessPhoto[] = (detailResult.photos || []).map((photo) => {
          return {
            url: photo.getUrl({ maxWidth: photo.width || 1600, maxHeight: photo.height || 1600 }),
            width: photo.width || 0,
            height: photo.height || 0,
            htmlAttributions: photo.html_attributions
          }
        })

        const attributes = {
          dineIn: (detailResult as any).dine_in ?? undefined,
          delivery: (detailResult as any).delivery ?? undefined,
          takeout: (detailResult as any).takeout ?? undefined,
          reservable: (detailResult as any).reservable ?? undefined,
          servesBeer: (detailResult as any).serves_beer ?? undefined,
          servesBreakfast: (detailResult as any).serves_breakfast ?? undefined,
          servesBrunch: (detailResult as any).serves_brunch ?? undefined,
          servesDinner: (detailResult as any).serves_dinner ?? undefined,
          servesLunch: (detailResult as any).serves_lunch ?? undefined,
          servesVegetarianFood: (detailResult as any).serves_vegetarian_food ?? undefined,
          servesWine: (detailResult as any).serves_wine ?? undefined,
          wheelchairAccessibleEntrance: (detailResult as any).wheelchair_accessible_entrance ?? undefined,
        }

        const snapshot: BusinessSnapshot = {
          id: detailResult.place_id || placeId,
          name: detailResult.name || basicInfo.name,
          placeId: detailResult.place_id || placeId,
          address: detailResult.formatted_address || basicInfo.address,
          coordinates: { lat, lng },
          phoneNumber: detailResult.formatted_phone_number || basicInfo.phoneNumber,
          internationalPhoneNumber: (detailResult as any).international_phone_number,
          website: detailResult.website || basicInfo.website,
          categories,
          businessStatus: detailResult.business_status,
          openingHours: detailResult.opening_hours ? {
            isOpen: typeof detailResult.opening_hours.isOpen === "function" ? detailResult.opening_hours.isOpen() : (detailResult.opening_hours as any).isOpen,
            weekdayText: detailResult.opening_hours.weekday_text || [],
            periods: detailResult.opening_hours.periods as any
          } : undefined,
          rating: detailResult.rating ?? basicInfo.rating,
          reviewCount: detailResult.user_ratings_total ?? basicInfo.reviewCount,
          priceLevel: detailResult.price_level,
          googleMapsUrl: detailResult.url,
          overview: (detailResult as any).editorial_summary?.overview,
          attributes,
          reviews,
          photos
        }

        resolve(snapshot)
      }
    )
  })
}
