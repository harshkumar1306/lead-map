import JSZip from "jszip"
import type { BusinessResult, BusinessSnapshot } from "../types"
import { fetchBusinessSnapshot } from "./google-places"

// Generate a mock photo using canvas
async function generateMockPhotoBlob(url: string): Promise<Blob> {
  const urlParams = new URLSearchParams(url.replace("mock-photo-canvas://", ""))
  const idx = parseInt(urlParams.get("idx") || "0")
  const name = urlParams.get("name") || "Business"

  const canvas = document.createElement("canvas")
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get 2d context for canvas")
  }

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 1280, 720)
  const colorThemes = [
    ["#4f46e5", "#7c3aed"], // Indigo to Violet
    ["#06b6d4", "#3b82f6"], // Cyan to Blue
    ["#ec4899", "#8b5cf6"], // Pink to Violet
    ["#10b981", "#3b82f6"]  // Emerald to Blue
  ]
  const selectedTheme = colorThemes[idx % colorThemes.length]
  gradient.addColorStop(0, selectedTheme[0])
  gradient.addColorStop(1, selectedTheme[1])
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1280, 720)

  // Draw background details (modern tech curves)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.lineWidth = 4
  for (let r = 100; r < 1200; r += 150) {
    ctx.beginPath()
    ctx.arc(1280 / 2, 720 / 2, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Draw text info
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // Title
  ctx.font = "bold 44px 'Outfit', 'Inter', sans-serif"
  ctx.fillText(name, 1280 / 2, 720 / 2 - 40)

  // Subtitle
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
  ctx.font = "500 24px 'Outfit', 'Inter', sans-serif"
  ctx.fillText(`Business Showcase Photo ${idx + 1}`, 1280 / 2, 720 / 2 + 30)

  // Brand signature
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.font = "italic 16px 'Outfit', 'Inter', sans-serif"
  ctx.fillText("LeadMap B2B Offline Snapshot Platform", 1280 / 2, 720 / 2 + 100)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob())
    }, "image/jpeg", 0.85)
  })
}

// Generate error placeholder photo when CORS prevents fetching
async function generateErrorPhotoBlob(idx: number, originalUrl: string): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get 2d context for canvas")
  }

  ctx.fillStyle = "#1e293b" // slate-800
  ctx.fillRect(0, 0, 1280, 720)

  // Warning Icon/Shapes
  ctx.strokeStyle = "#f43f5e" // rose-500
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(1280 / 2, 180)
  ctx.lineTo(1280 / 2 - 60, 290)
  ctx.lineTo(1280 / 2 + 60, 290)
  ctx.closePath()
  ctx.stroke()

  ctx.fillStyle = "#f43f5e"
  ctx.font = "bold 40px sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("!", 1280 / 2, 270)

  // Error Text
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 32px 'Outfit', 'Inter', sans-serif"
  ctx.fillText(`Photo ${idx + 1} - Download Restricted`, 1280 / 2, 360)

  ctx.fillStyle = "#94a3b8" // slate-400
  ctx.font = "18px 'Outfit', 'Inter', sans-serif"
  ctx.fillText("Google Places image CDN limits direct client-side downloads due to CORS.", 1280 / 2, 420)
  ctx.fillText("Original image URL has been saved in the assets directory.", 1280 / 2, 460)

  ctx.fillStyle = "#64748b" // slate-500
  ctx.font = "14px monospace"
  const printUrl = originalUrl.length > 80 ? `${originalUrl.substring(0, 80)}...` : originalUrl
  ctx.fillText(printUrl, 1280 / 2, 540)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob())
    }, "image/jpeg", 0.85)
  })
}

// Download image helper with CORS proxy fallback
async function fetchPhotoBlob(idx: number, url: string): Promise<Blob> {
  if (url.startsWith("mock-photo-canvas://")) {
    return generateMockPhotoBlob(url)
  }

  // 1. Try direct fetch
  try {
    const res = await fetch(url)
    if (res.ok) {
      return await res.blob()
    }
  } catch (e) {
    console.warn(`Direct fetch failed for ${url}, trying CORS proxy fallback...`, e)
  }

  // 2. Try CORS proxy fallback
  try {
    const proxiedUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`
    const res = await fetch(proxiedUrl)
    if (res.ok) {
      return await res.blob()
    }
  } catch (e) {
    console.error(`CORS proxy fetch failed for ${url}`, e)
  }

  // 3. Fallback to generating warning placeholder jpg
  return generateErrorPhotoBlob(idx, url)
}

// Build the readable Summary Markdown
function generateSummaryMarkdown(snapshot: BusinessSnapshot): string {
  const ratingStr = snapshot.rating 
    ? `${snapshot.rating.toFixed(1)} / 5.0 ⭐` 
    : "No Rating Available"
  const reviewsStr = snapshot.reviewCount !== undefined 
    ? `(${snapshot.reviewCount.toLocaleString()} reviews)` 
    : ""
  
  const priceSymbol = snapshot.priceLevel !== undefined 
    ? "$".repeat(snapshot.priceLevel) || "Standard"
    : "Not Available"

  let markdown = `# ${snapshot.name}

${snapshot.overview ? `> ${snapshot.overview}\n` : ""}
A professional business snapshot compiled on ${new Date().toLocaleDateString()}.

## 📋 General Info
* **Category:** ${snapshot.categories.join(", ")}
* **Status:** ${snapshot.businessStatus || "Unknown"}
* **Rating:** ${ratingStr} ${reviewsStr}
* **Price Level:** ${priceSymbol}
* **Website:** ${snapshot.website ? `[${snapshot.website}](${snapshot.website})` : "N/A"}
* **Phone:** ${snapshot.phoneNumber || "N/A"}
* **International Phone:** ${snapshot.internationalPhoneNumber || "N/A"}
* **Google Maps Link:** ${snapshot.googleMapsUrl ? `[View on Google Maps](${snapshot.googleMapsUrl})` : "N/A"}
* **Address:** ${snapshot.address}
* **Coordinates:** Lat: \`${snapshot.coordinates.lat}\`, Lng: \`${snapshot.coordinates.lng}\`

`

  // Add Opening Hours
  if (snapshot.openingHours && snapshot.openingHours.weekdayText && snapshot.openingHours.weekdayText.length > 0) {
    markdown += `## 🕒 Opening Hours
${snapshot.openingHours.weekdayText.map(line => `* ${line}`).join("\n")}

`
  }

  // Add Attributes
  if (snapshot.attributes) {
    const attrs = snapshot.attributes
    const detailsList: string[] = []

    if (attrs.dineIn !== undefined) detailsList.push(`* **Dine-In:** ${attrs.dineIn ? "Yes" : "No"}`)
    if (attrs.delivery !== undefined) detailsList.push(`* **Delivery:** ${attrs.delivery ? "Yes" : "No"}`)
    if (attrs.takeout !== undefined) detailsList.push(`* **Takeout:** ${attrs.takeout ? "Yes" : "No"}`)
    if (attrs.reservable !== undefined) detailsList.push(`* **Reservable:** ${attrs.reservable ? "Yes" : "No"}`)
    if (attrs.servesBreakfast !== undefined) detailsList.push(`* **Serves Breakfast:** ${attrs.servesBreakfast ? "Yes" : "No"}`)
    if (attrs.servesLunch !== undefined) detailsList.push(`* **Serves Lunch:** ${attrs.servesLunch ? "Yes" : "No"}`)
    if (attrs.servesDinner !== undefined) detailsList.push(`* **Serves Dinner:** ${attrs.servesDinner ? "Yes" : "No"}`)
    if (attrs.servesBeer !== undefined) detailsList.push(`* **Serves Beer:** ${attrs.servesBeer ? "Yes" : "No"}`)
    if (attrs.servesWine !== undefined) detailsList.push(`* **Serves Wine:** ${attrs.servesWine ? "Yes" : "No"}`)
    if (attrs.servesVegetarianFood !== undefined) detailsList.push(`* **Vegetarian Options:** ${attrs.servesVegetarianFood ? "Yes" : "No"}`)
    if (attrs.wheelchairAccessibleEntrance !== undefined) detailsList.push(`* **Wheelchair Accessible Entrance:** ${attrs.wheelchairAccessibleEntrance ? "Yes" : "No"}`)

    if (detailsList.length > 0) {
      markdown += `## ✨ Features & Services
${detailsList.join("\n")}

`
    }
  }

  // Add URL Shortcuts
  const shortcuts: string[] = []
  if (snapshot.menuUrl) shortcuts.push(`* **Menu:** [View Menu](${snapshot.menuUrl})`)
  if (snapshot.reservationUrl) shortcuts.push(`* **Reservations:** [Book Reservation](${snapshot.reservationUrl})`)
  if (snapshot.orderingUrl) shortcuts.push(`* **Online Ordering:** [Place Order](${snapshot.orderingUrl})`)

  if (shortcuts.length > 0) {
    markdown += `## 🔗 Quick Links
${shortcuts.join("\n")}

`
  }

  // Add Reviews section
  if (snapshot.reviews && snapshot.reviews.length > 0) {
    markdown += `## 💬 Reviews (${snapshot.reviews.length} shown)
`
    snapshot.reviews.forEach((rev) => {
      const starRating = "⭐".repeat(rev.rating)
      markdown += `### ${rev.authorName} (${starRating})
*Date: ${rev.date || rev.relativeTime || "N/A"}*

${rev.text || "_No text review provided._"}

`
    })
  }

  return markdown
}

// Add all business files to a zip directory
export async function addBusinessToZip(
  zip: JSZip,
  snapshot: BusinessSnapshot,
  onProgress?: (subStep: string) => void
): Promise<void> {
  const folderName = snapshot.name.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)
  const businessFolder = zip.folder(folderName)
  if (!businessFolder) {
    throw new Error(`Failed to create ZIP folder for: ${snapshot.name}`)
  }

  // 1. Save business.json
  businessFolder.file("business.json", JSON.stringify(snapshot, null, 2))

  // 2. Save summary.md
  const summaryMarkdown = generateSummaryMarkdown(snapshot)
  businessFolder.file("summary.md", summaryMarkdown)

  // 3. Save reviews/reviews.json
  const reviewsFolder = businessFolder.folder("reviews")
  if (reviewsFolder) {
    reviewsFolder.file("reviews.json", JSON.stringify(snapshot.reviews, null, 2))
  }

  // 4. Download and save photos
  const photosFolder = businessFolder.folder("photos")
  const assetsFolder = businessFolder.folder("assets")

  if (snapshot.photos && snapshot.photos.length > 0) {
    const photoLinks: Array<{ filename: string; url: string; attributions: string[] }> = []

    for (let i = 0; i < snapshot.photos.length; i++) {
      const photo = snapshot.photos[i]
      const filename = `photo_${String(i + 1).padStart(3, "0")}.jpg`
      
      onProgress?.(`Downloading photo ${i + 1} of ${snapshot.photos.length}...`)

      try {
        const blob = await fetchPhotoBlob(i, photo.url)
        if (photosFolder) {
          photosFolder.file(filename, blob)
        }
      } catch (err) {
        console.error(`Failed to pack photo ${filename} for ${snapshot.name}:`, err)
      }

      photoLinks.push({
        filename,
        url: photo.url,
        attributions: photo.htmlAttributions || []
      })
    }

    if (assetsFolder) {
      assetsFolder.file("photo_links.json", JSON.stringify(photoLinks, null, 2))
    }
  } else {
    // If no photos, create empty folders or documentation
    if (photosFolder) {
      photosFolder.file("placeholder.txt", "No photos available for this business on Google Maps.")
    }
  }
}

// Main download snapshots orchestrator
export async function downloadSnapshots(
  businesses: BusinessResult[],
  onProgress?: (step: string, current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip()
  const total = businesses.length

  for (let i = 0; i < total; i++) {
    const business = businesses[i]
    
    onProgress?.(`Fetching details for "${business.name}"...`, i + 1, total)
    
    try {
      // Fetch full place snapshot details
      const snapshot = await fetchBusinessSnapshot(business.id, business)
      
      // Add detailed data to the ZIP structures
      await addBusinessToZip(zip, snapshot, (subStep) => {
        onProgress?.(`"${business.name}": ${subStep}`, i + 1, total)
      })
    } catch (err: any) {
      console.error(`Failed to capture snapshot for ${business.name}:`, err)
      onProgress?.(`Error: Failed to download "${business.name}" details. Skipping...`, i + 1, total)
      // Wait a moment so the error text is visible to the user
      await new Promise(r => setTimeout(r, 1200))
    }
  }

  onProgress?.("Compiling ZIP archive...", total, total)

  // Generate and download
  const content = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(content)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  
  // Naming the download ZIP
  let downloadFilename = "leadmap_snapshots.zip"
  if (total === 1) {
    const safeName = businesses[0].name.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30)
    downloadFilename = `${safeName}_snapshot.zip`
  }

  link.setAttribute("download", downloadFilename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
