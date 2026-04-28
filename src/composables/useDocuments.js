import { post } from '@/api'

export function useDocuments() {
  async function setEffective(documentId, versionId) {
    const data = await post(
      `/v1/services/documents/${documentId}/versions/${versionId}/setEffective`,
      {},
    )
    return { version: data.version }
  }

  async function submitForReview(documentId, versionId) {
    const data = await post(
      `/v1/services/documents/${documentId}/versions/${versionId}/submitForReview`,
      {},
    )
    return { version: data.version }
  }

  async function cancelReview(documentId, versionId) {
    const data = await post(
      `/v1/services/documents/${documentId}/versions/${versionId}/cancelReview`,
      {},
    )
    return { version: data.version }
  }

  return { setEffective, submitForReview, cancelReview }
}
