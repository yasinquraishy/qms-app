/**
 * Export records as individual PDF files bundled in a ZIP.
 * Each PDF renders the full form schema with the record's data,
 * producing a document that mirrors the DynamicForm layout.
 *
 * Requires: jspdf, jszip
 */

import { DateTime } from 'luxon'

/**
 * @param {Array} records   – array of record objects ({ id, recordNumber, payload, user, createdAt, statusId, ... })
 * @param {Array} schema    – the full form‐template schema (same array passed to DynamicForm)
 * @param {String} templateName – human‑readable template name (used in header & filenames)
 */
export async function exportRecordPDFs(records, schema, templateName) {
  const [jsPDFModule, JSZipModule] = await Promise.all([import('jspdf'), import('jszip')])

  const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF
  const JSZip = JSZipModule.default

  const zip = new JSZip()

  for (const record of records) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const renderer = new FormPDFRenderer(doc, record.payload || {})

    renderer.renderHeader(templateName, record)
    renderer.renderSchema(schema)

    const pdfBlob = doc.output('blob')
    const safeName = String(record.recordNumber || record.id || 'record').replace(
      /[/\\:*?"<>|]/g,
      '_',
    )
    zip.file(`${safeName}.pdf`, pdfBlob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const dateStr = new Date().toISOString().split('T')[0]
  downloadBlob(zipBlob, `${templateName}_records_${dateStr}.zip`)
}

// ---------------------------------------------------------------------------
// PDF Renderer – walks the schema tree and paints a form‑like layout
// ---------------------------------------------------------------------------

class FormPDFRenderer {
  constructor(doc, payload) {
    this.doc = doc
    this.payload = payload
    this.y = 15
    this.marginLeft = 15
    this.marginRight = 15
    this.pageWidth = doc.internal.pageSize.getWidth()
    this.pageHeight = doc.internal.pageSize.getHeight()
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight
    this.indentLevel = 0
  }

  // -- helpers --------------------------------------------------------------

  get currentX() {
    return this.marginLeft + this.indentLevel * 5
  }

  get availableWidth() {
    return this.contentWidth - this.indentLevel * 5
  }

  checkPageBreak(needed = 10) {
    if (this.y + needed > this.pageHeight - 15) {
      this.doc.addPage()
      this.y = 15
    }
  }

  getPayloadValue(path) {
    if (!this.payload || !path) return undefined
    const parts = path.split('.')
    let value = this.payload
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }
    return value
  }

  formatValue(value, fieldType) {
    if (value === null || value === undefined || value === '') return '-'

    if (fieldType === 'checkbox' || fieldType === 'toggle') {
      return value ? 'Yes' : 'No'
    }

    if (fieldType === 'datetime') {
      try {
        return value.toLocaleString(DateTime.DATETIME_MED)
      } catch {
        return String(value)
      }
    }

    if (fieldType === 'rating') {
      return `${value} / 5`
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '-'
      return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ')
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }

    return String(value)
  }

  // -- header ---------------------------------------------------------------

  renderHeader(templateName, record) {
    // Title
    this.doc.setFontSize(16)
    this.doc.setFont(undefined, 'bold')
    this.doc.text(templateName, this.marginLeft, this.y)
    this.y += 8

    // Meta row
    this.doc.setFontSize(9)
    this.doc.setFont(undefined, 'normal')
    this.doc.setTextColor(100)

    const metaParts = []
    if (record.recordNumber) metaParts.push(`Record: ${record.recordNumber}`)
    if (record.statusId) metaParts.push(`Status: ${record.statusId}`)
    if (record.user) {
      metaParts.push(`By: ${record.user.firstName} ${record.user.lastName}`)
    }
    if (record.createdAt) {
      metaParts.push(`Date: ${record.createdAt.toLocaleString(DateTime.DATETIME_MED)}`)
    }

    if (metaParts.length > 0) {
      this.doc.text(metaParts.join('   |   '), this.marginLeft, this.y)
      this.y += 5
    }

    // Divider
    this.doc.setTextColor(0)
    this.doc.setDrawColor(180)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.marginLeft, this.y, this.pageWidth - this.marginRight, this.y)
    this.y += 8
  }

  // -- schema traversal -----------------------------------------------------

  renderSchema(schema) {
    if (!schema || !Array.isArray(schema)) return
    schema.forEach((item) => this.renderField(item, []))
  }

  renderField(field, ancestors) {
    if (field.type === 'separator') {
      this.renderSeparator()
      return
    }

    const newAncestors = field.name ? [...ancestors, field.name] : ancestors

    if (field.type === 'section') {
      this.renderSection(field, newAncestors)
      return
    }

    if (field.type === 'row' || field.type === 'column') {
      if (field.children) {
        field.children.forEach((child) => this.renderField(child, newAncestors))
      }
      return
    }

    if (field.type === 'repeater') {
      this.renderRepeater(field, newAncestors)
      return
    }

    // Leaf field
    if (field.name) {
      this.renderLeafField(field, newAncestors)
    }
  }

  // -- individual renderers -------------------------------------------------

  renderSeparator() {
    this.checkPageBreak(6)
    this.y += 2
    this.doc.setDrawColor(220)
    this.doc.setLineWidth(0.2)
    this.doc.line(this.currentX, this.y, this.currentX + this.availableWidth, this.y)
    this.y += 4
  }

  renderSection(field, ancestors) {
    this.checkPageBreak(20)

    if (field.label) {
      // Section header bar
      this.doc.setFillColor(235, 235, 235)
      this.doc.roundedRect(this.currentX, this.y - 4, this.availableWidth, 8, 1, 1, 'F')
      this.doc.setFontSize(11)
      this.doc.setFont(undefined, 'bold')
      this.doc.text(field.label, this.currentX + 3, this.y + 1)
      this.y += 8
      this.doc.setFont(undefined, 'normal')
    }

    if (field.children) {
      this.indentLevel++
      field.children.forEach((child) => this.renderField(child, ancestors))
      this.indentLevel--
    }

    this.y += 3
  }

  renderRepeater(field, ancestors) {
    const path = ancestors.join('.')
    const items = this.getPayloadValue(path)

    // Repeater heading
    if (field.label) {
      this.checkPageBreak(12)
      this.doc.setFontSize(10)
      this.doc.setFont(undefined, 'bold')
      this.doc.text(field.label, this.currentX, this.y)
      this.y += 6
      this.doc.setFont(undefined, 'normal')
    }

    if (!Array.isArray(items) || items.length === 0) {
      this.doc.setFontSize(9)
      this.doc.setTextColor(150)
      this.doc.text('No items', this.currentX + 3, this.y)
      this.doc.setTextColor(0)
      this.y += 6
      return
    }

    items.forEach((item, idx) => {
      this.checkPageBreak(15)

      // Item header
      const itemLabel = field.itemLabel || 'Item'
      this.doc.setFontSize(9)
      this.doc.setFont(undefined, 'bold')
      this.doc.setTextColor(80)
      this.doc.text(`${itemLabel} ${idx + 1}`, this.currentX + 3, this.y)
      this.doc.setTextColor(0)
      this.doc.setFont(undefined, 'normal')
      this.y += 5

      // Remember where the item card starts
      const itemStartY = this.y - 2

      // Render template fields using the indexed path (e.g., "section.repeater.0")
      this.indentLevel++
      if (field.template) {
        field.template.forEach((templateField) => {
          this.renderField(templateField, [...ancestors, String(idx)])
        })
      }
      this.indentLevel--

      // Draw a rounded border around the item
      const itemHeight = this.y - itemStartY + 1
      this.doc.setDrawColor(210)
      this.doc.setLineWidth(0.2)
      this.doc.roundedRect(
        this.currentX,
        itemStartY,
        this.availableWidth,
        itemHeight,
        1.5,
        1.5,
        'S',
      )
      this.y += 4
    })
  }

  renderLeafField(field, ancestors) {
    this.checkPageBreak(12)

    const path = ancestors.join('.')
    const value = this.getPayloadValue(path)
    const displayValue = this.formatValue(value, field.type)
    const label = field.label || field.name

    // Label (small, muted)
    this.doc.setFontSize(8)
    this.doc.setTextColor(120)
    this.doc.text(label, this.currentX, this.y)
    this.y += 3.5

    // Value (normal size, with wrapping)
    this.doc.setFontSize(10)
    this.doc.setTextColor(0)

    const lines = this.doc.splitTextToSize(displayValue, this.availableWidth)
    for (const line of lines) {
      this.checkPageBreak(5)
      this.doc.text(line, this.currentX, this.y)
      this.y += 4.5
    }

    this.y += 2
  }
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

function downloadBlob(blob, filename) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
