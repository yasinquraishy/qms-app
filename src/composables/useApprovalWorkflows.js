import { post } from '@/api'

export function useApprovalWorkflows() {
  // Create a new DRAFT version — server copies all steps/users/roles from the current version
  async function createDraftVersion(workflowId, payload = {}) {
    const data = await post(`/v1/services/approvalWorkflows/${workflowId}/versions`, payload)
    return data.version
  }

  return { createDraftVersion }
}
