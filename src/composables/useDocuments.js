import { currentCompany } from '@/utils/currentCompany.js'
import { get, post } from '@/api'

export function useDocuments() {
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

  return { submitForReview, cancelReview, setEffective, previewWorkflow }
}
