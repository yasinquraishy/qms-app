import { post } from '@/api'

export function useDocuments() {
  async function submitForReview(versionId) {
    const data = await post('/v1/services/workflowInstances/submit', {
      resourceType: 'DocumentVersion',
      resourceId: versionId,
    })
    return { workflowInstance: data.workflowInstance }
  }

  async function cancelReview(instanceId) {
    const data = await post(`/v1/services/workflowInstances/${instanceId}/cancel`, {})
    return { workflowInstance: data.workflowInstance }
  }

  async function setEffective(documentId, versionId) {
    const data = await post(
      `/v1/services/documents/${documentId}/versions/${versionId}/setEffective`,
      {},
    )
    return { version: data.version }
  }

  return { submitForReview, cancelReview, setEffective }
}
