import type { SearchParams, BusinessResult } from "../types"

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
