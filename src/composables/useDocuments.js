import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useDocuments')

function DocumentsState() {
  const documents = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Stats
  const stats = ref([])
  const statsTotal = ref(0)
  const statsLoading = ref(false)

  // Filters
  const filters = ref({
    search: '',
    documentTypeId: null,
    documentTemplateId: null,
    departmentId: null,
    statusId: null,
  })

  function buildFilterParams() {
    const companyId = currentCompany.value?.id
    const params = { companyId }

    Object.keys(filters.value).forEach((key) => {
      const value = filters.value[key]
      if (value !== null && value !== '' && value !== undefined) {
        params[key] = typeof value === 'string' ? value.trim() : value
      }
    })

    return params
  }

  // ── List ──────────────────────────────────────────────────────────────────
  async function fetchDocuments() {
    const companyId = currentCompany.value?.id
    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/documents', {
      params: buildFilterParams(),
      loader: loading,
    })
    documents.value = data.documents || []
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  async function fetchStats() {
    const companyId = currentCompany.value?.id
    if (!companyId) return

    const data = await get('/v1/services/documentStats', {
      params: { companyId },
      loader: statsLoading,
    })
    stats.value = data.stats || []
    statsTotal.value = data.total || 0
  }

  // ── Single document ───────────────────────────────────────────────────────
  async function fetchDocument(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await get(`/v1/services/documents/${id}`, {
      params: { companyId },
    })
    return { document: data.document }
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async function createDocument(docData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/documents', { ...docData, companyId })

    await fetchDocuments()
    await fetchStats()

    return { document: data.document }
  }

  // ── Update ────────────────────────────────────────────────────────────────
  async function updateDocument(id, docData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await put(`/v1/services/documents/${id}`, docData, {
      params: { companyId },
    })

    await fetchDocuments()

    return { document: data.document }
  }

  // ── Archive ───────────────────────────────────────────────────────────────
  async function archiveDocument(id) {
    await updateDocument(id, { statusId: 'ARCHIVE' })
    await fetchStats()

    return { success: true }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function deleteDocument(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/documents/${id}`, {
      params: { companyId },
    })

    await fetchDocuments()
    await fetchStats()

    return { success: true }
  }

  // ── Versions ──────────────────────────────────────────────────────────────
  async function fetchVersions(documentId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await get(`/v1/services/documents/${documentId}/versions`, {
      params: { companyId },
    })
    return { versions: data.versions || [] }
  }

  async function fetchVersionDetail(documentId, versionId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await get(`/v1/services/documents/${documentId}/versions/${versionId}`, {
      params: { companyId },
    })
    return { version: data.version }
  }

  async function createVersion(documentId, versionData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post(`/v1/services/documents/${documentId}/versions`, versionData, {
      params: { companyId },
    })
    return { version: data.version }
  }

  async function updateVersion(documentId, versionId, versionData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await put(
      `/v1/services/documents/${documentId}/versions/${versionId}`,
      versionData,
      { params: { companyId } },
    )
    return { version: data.version }
  }

  async function deleteVersion(documentId, versionId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/documents/${documentId}/versions/${versionId}`, {
      params: { companyId },
    })
    return { success: true }
  }

  // ── Review / Approval ─────────────────────────────────────────────────────
  async function submitForReview(documentId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post(
      '/v1/services/workflowInstances/submit',
      { resourceType: 'Document', resourceId: documentId },
      { params: { companyId } },
    )
    return { workflowInstance: data.workflowInstance }
  }

  async function cancelReview(instanceId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post(
      `/v1/services/workflowInstances/${instanceId}/cancel`,
      {},
      { params: { companyId } },
    )
    return { workflowInstance: data.workflowInstance }
  }

  async function setEffective(documentId, versionId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post(
      `/v1/services/documents/${documentId}/versions/${versionId}/setEffective`,
      {},
      { params: { companyId } },
    )
    return { version: data.version }
  }

  async function previewWorkflow(documentId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await get('/v1/services/workflowInstances/preview', {
      params: { companyId, resourceType: 'Document', resourceId: documentId },
    })
    return data
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────
  async function fetchAuditLogs(documentId, versionId = null) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const params = { companyId }
    if (versionId) params.versionId = versionId

    const data = await get(`/v1/services/documents/${documentId}/auditLogs`, { params })
    return { auditLogs: data.auditLogs || [] }
  }

  // ── Links ─────────────────────────────────────────────────────────────────
  async function createLink(documentId, linkData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post(`/v1/services/documents/${documentId}/links`, linkData, {
      params: { companyId },
    })
    return { link: data.link }
  }

  async function deleteLink(documentId, linkId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/documents/${documentId}/links/${linkId}`, {
      params: { companyId },
    })
    return { success: true }
  }

  // ── Watchers ──────────────────────────────────────────────────────────────
  watch(
    filters,
    () => {
      fetchDocuments()
    },
    { deep: true },
  )

  return {
    documents,
    loading,
    error,
    stats,
    statsTotal,
    statsLoading,
    filters,
    fetchDocuments,
    fetchStats,
    fetchDocument,
    createDocument,
    updateDocument,
    archiveDocument,
    deleteDocument,
    fetchVersions,
    fetchVersionDetail,
    createVersion,
    updateVersion,
    deleteVersion,
    submitForReview,
    cancelReview,
    setEffective,
    fetchAuditLogs,
    createLink,
    deleteLink,
    previewWorkflow,
  }
}

/**
 * @returns {ReturnType<typeof DocumentsState>}
 */
export function useDocuments() {
  const state = inject(symbol, null)
  if (!state) {
    return DocumentsState()
  }
  return state
}

export function provideDocuments() {
  const state = DocumentsState()
  provide(symbol, state)
  return state
}
