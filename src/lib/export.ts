import * as XLSX from "xlsx"
import type { BusinessResult } from "../types"

/**
 * Escapes fields and formats a list of businesses into a downloadable CSV file.
 */
export function exportToCSV(businesses: BusinessResult[], filename = "scout-businesses.csv") {
  const headers = ["Business Name", "Category", "Rating", "Review Count", "Phone Number", "Website", "Address"]
  const rows = businesses.map(b => [
    b.name,
    b.category,
    b.rating !== undefined ? b.rating : "",
    b.reviewCount !== undefined ? b.reviewCount : "",
    b.phoneNumber || "",
    b.website || "",
    b.address
  ])

  const escapeCSV = (val: any) => {
    const stringified = String(val === null || val === undefined ? "" : val)
    const escaped = stringified.replace(/"/g, '""')
    if (escaped.includes(",") || escaped.includes("\n") || escaped.includes("\r") || escaped.includes('"')) {
      return `"${escaped}"`
    }
    return escaped
  }

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map(row => row.map(escapeCSV).join(","))
  ].join("\r\n")

  // Add UTF-8 BOM so Excel decodes it correctly
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Compiles a list of businesses into a worksheet and downloads as an .xlsx Excel file.
 */
export function exportToExcel(businesses: BusinessResult[], filename = "scout-businesses.xlsx") {
  const data = businesses.map(b => ({
    "Business Name": b.name,
    "Category": b.category,
    "Rating": b.rating !== undefined ? b.rating : null,
    "Review Count": b.reviewCount !== undefined ? b.reviewCount : null,
    "Phone Number": b.phoneNumber || "",
    "Website": b.website || "",
    "Address": b.address
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Businesses")
  
  XLSX.writeFile(workbook, filename)
}
