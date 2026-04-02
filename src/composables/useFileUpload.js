import { currentCompany } from '@/utils/currentCompany.js'
import { upload } from '@/api'

/**
 * Upload a file to the backend
 * @param {File} file - The file to upload
 * @param {string} fileType - Type of file (e.g., 'USERAVATAR', 'COMPANYLOGO', 'ASSET')
 * @returns {Promise<{success: boolean, asset?: object, error?: string}>}
 */
export async function uploadFile(file, fileType = 'ASSET') {
  const companyId = currentCompany.value?.id

  if (!companyId) {
    return { success: false, error: 'Company ID is required' }
  }

  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', fileType)

  const data = await upload(`/v1/files/${companyId}/upload`, formData)

  return {
    success: true,
    asset: data.asset,
  }
}

/**
 * Open a file picker dialog and upload the selected file
 * @param {string} fileType - Type of file (e.g., 'USERAVATAR', 'COMPANYLOGO', 'ASSET')
 * @param {string} accept - Accepted file types (e.g., 'image/*')
 * @returns {Promise<{success: boolean, asset?: object, error?: string}>}
 */
export function selectAndUploadFile(fileType = 'ASSET', accept = 'image/*') {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept

    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) {
        resolve({ success: false, error: 'No file selected' })
        return
      }

      const result = await uploadFile(file, fileType)
      resolve(result)
    }

    input.oncancel = () => {
      resolve({ success: false, error: 'Upload cancelled' })
    }

    input.click()
  })
}
