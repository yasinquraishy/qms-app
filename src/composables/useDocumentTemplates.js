import { get, post, put } from '@/api'

const symbol = Symbol('useDocumentTemplates')

function DocumentTemplatesState() {
  const documentTemplates = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ── List ──────────────────────────────────────────────────────────────────
  async function fetchDocumentTemplates() {
    error.value = null

    const data = await get('/v1/services/documentTemplates', {
      loader: loading,
    })
    documentTemplates.value = data.documentTemplates || []
  }

  // ── Single document template ──────────────────────────────────────────────
  async function fetchDocumentTemplate(id) {
    const data = await get(`/v1/services/documentTemplates/${id}`, {})
    return { documentTemplate: data.documentTemplate }
  }

  // ── Check prefix availability ─────────────────────────────────────────────
  async function checkPrefixAvailability(prefix) {
    try {
      const data = await get(
        `/v1/services/documentTemplates/checkPrefix/${encodeURIComponent(prefix)}`,
        {
          showError: false,
        },
      )
      return { available: data.available }
    } catch (err) {
      return { available: false, error: err.message }
    }
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async function createDocumentTemplate(templateData) {
    const data = await post(
      '/v1/services/documentTemplates',
      {
        ...templateData,
      },
      {
        loader: loading,
      },
    )

    await fetchDocumentTemplates()
    return { documentTemplate: data.documentTemplate }
  }

  // ── Update ────────────────────────────────────────────────────────────────
  async function updateDocumentTemplate(id, templateData) {
    const data = await put(`/v1/services/documentTemplates/${id}`, templateData, {
      loader: loading,
    })

    await fetchDocumentTemplates()
    return { documentTemplate: data.documentTemplate }
  }

  return {
    documentTemplates,
    loading,
    error,
    fetchDocumentTemplates,
    fetchDocumentTemplate,
    checkPrefixAvailability,
    createDocumentTemplate,
    updateDocumentTemplate,
  }
}

export function provideDocumentTemplates() {
  const state = DocumentTemplatesState()
  provide(symbol, state)
  return state
}

/**
 *
 * @returns {ReturnType<typeof DocumentTemplatesState>}
 */
export function useDocumentTemplates() {
  const state = inject(symbol)
  if (!state) {
    throw new Error('useDocumentTemplates must be used within provideDocumentTemplates')
  }
  return state
}
