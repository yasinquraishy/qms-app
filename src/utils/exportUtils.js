/**
 * Export Utilities
 * Reusable functions to export table data to various formats (CSV, Excel, PDF)
 */

/**
 * Convert table data to CSV and trigger download
 * @param {Array} rows - Array of data rows
 * @param {Array} columns - Array of column definitions with name, label, and field properties
 * @param {String} filename - Name of the file without extension
 */
export function exportToCSV(rows, columns, filename = 'export') {
  if (!rows || rows.length === 0) {
    console.warn('No data to export')
    return
  }

  // Extract headers from columns
  const headers = columns.map((col) => col.label || col.name)

  // Extract data rows
  const csvRows = rows.map((row) => {
    return columns.map((col) => {
      let value

      // Handle field as function or property name
      if (typeof col.field === 'function') {
        value = col.field(row)
      } else {
        value = row[col.field] || row[col.name]
      }

      // Convert value to string and escape
      if (value === null || value === undefined) {
        return ''
      }

      // Handle objects and arrays
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }

      // Convert to string and escape quotes
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      return stringValue
    })
  })

  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convert table data to Excel and trigger download
 * Requires: npm install xlsx
 * @param {Array} rows - Array of data rows
 * @param {Array} columns - Array of column definitions with name, label, and field properties
 * @param {String} filename - Name of the file without extension
 * @param {String} sheetName - Name of the worksheet
 */
export async function exportToExcel(rows, columns, filename = 'export', sheetName = 'Sheet1') {
  if (!rows || rows.length === 0) {
    console.warn('No data to export')
    return
  }

  try {
    // Dynamically import xlsx (requires: npm install xlsx)
    const XLSX = await import('xlsx')

    // Prepare data for Excel
    const headers = columns.map((col) => col.label || col.name)

    const data = rows.map((row) => {
      const rowData = {}
      columns.forEach((col) => {
        const header = col.label || col.name
        let value

        // Handle field as function or property name
        if (typeof col.field === 'function') {
          value = col.field(row)
        } else {
          value = row[col.field] || row[col.name]
        }

        // Handle objects and arrays
        if (value && typeof value === 'object') {
          value = JSON.stringify(value)
        }

        rowData[header] = value ?? ''
      })
      return rowData
    })

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers })

    // Set fixed column widths with text wrapping
    const fixedColumnWidth = 25
    const colWidths = Array(headers.length).fill({ wch: fixedColumnWidth })
    worksheet['!cols'] = colWidths

    // Apply text wrapping and center alignment to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_col(col) + (row + 1)
        if (!worksheet[cellAddress]) continue

        worksheet[cellAddress].s = {
          alignment: {
            wrapText: true,
            vertical: 'top',
            horizontal: 'left',
          },
        }
      }
    }

    // Set automatic row heights for wrapped content
    const rowHeights = Array(data.length + 1).fill({ hpx: 30 })
    worksheet['!rows'] = rowHeights

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Write file
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Excel export failed:', error)
    if (error.message.includes('Cannot find module')) {
      console.error('Please install xlsx package: npm install xlsx or pnpm add xlsx')
    }
    throw error
  }
}

/**
 * Convert table data to PDF and trigger download
 * Requires: npm install jspdf jspdf-autotable
 * @param {Array} rows - Array of data rows
 * @param {Array} columns - Array of column definitions with name, label, and field properties
 * @param {String} filename - Name of the file without extension
 * @param {Object} options - Additional options (title, orientation, etc.)
 */
export async function exportToPDF(rows, columns, filename = 'export', options = {}) {
  if (!rows || rows.length === 0) {
    console.warn('No data to export')
    return
  }

  try {
    // Dynamically import jsPDF and autoTable
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF
    const { applyPlugin } = await import('jspdf-autotable')

    applyPlugin(jsPDF)

    const {
      title = 'Report',
      orientation = 'landscape',
      pageSize = 'a4',
      showHeader = true,
    } = options

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    })

    // Add title if provided
    if (title && showHeader) {
      doc.setFontSize(16)
      doc.text(title, 14, 15)
    }

    // Prepare table headers
    const headers = columns.map((col) => col.label || col.name)

    // Prepare table body
    const body = rows.map((row) => {
      return columns.map((col) => {
        let value

        // Handle field as function or property name
        if (typeof col.field === 'function') {
          value = col.field(row)
        } else {
          value = row[col.field] || row[col.name]
        }

        // Handle objects and arrays
        if (value && typeof value === 'object') {
          return JSON.stringify(value)
        }

        return value ?? ''
      })
    })

    // Add table to PDF using autoTable
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [headers],
        body: body,
        startY: title && showHeader ? 22 : 10,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10 },
      })
    } else {
      throw new Error('autoTable plugin not properly loaded')
    }

    // Save PDF
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    if (error.message.includes('Cannot find module')) {
      console.error(
        'Please install required packages: npm install jspdf jspdf-autotable or pnpm add jspdf jspdf-autotable',
      )
    }
    throw error
  }
}

/**
 * Export table data with format auto-detection
 * @param {String} format - Format type: 'csv', 'excel', or 'pdf'
 * @param {Array} rows - Array of data rows
 * @param {Array} columns - Array of column definitions
 * @param {String} filename - Name of the file without extension
 * @param {Object} options - Additional options for PDF export
 */
export async function exportTableData(format, rows, columns, filename = 'export', options = {}) {
  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(rows, columns, filename)
      break
    case 'excel':
    case 'xlsx':
      await exportToExcel(rows, columns, filename, options.sheetName)
      break
    case 'pdf':
      await exportToPDF(rows, columns, filename, options)
      break
    default:
      console.error(`Unsupported export format: ${format}`)
      throw new Error(`Unsupported export format: ${format}`)
  }
}
