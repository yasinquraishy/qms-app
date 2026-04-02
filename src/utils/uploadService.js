import { upload, del } from '@/api'

/**
 * Upload a single file to the server
 * @param {File} file - The file object to upload
 * @param {string} companyId - The company ID for file organization
 * @param {string} fileType - The file type category (ASSET, COMPANYLOGO, USERAVATAR, etc.)
 * @param {Function} onProgress - Callback for progress updates (optional)
 * @returns {Promise<Object>} - The asset data returned from server
 */
export async function uploadFile(file, companyId, fileType, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', fileType)

  const data = await upload(`/v1/files/${companyId}/upload`, formData, {
    onUpload: onProgress
      ? (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          onProgress({ progress: percent, status: percent === 100 ? 'success' : 'uploading' })
        }
      : undefined,
  })

  // Complete progress
  if (onProgress) {
    onProgress({ progress: 100, status: 'success' })
  }

  return data.asset
}

/**
 * Upload multiple files sequentially
 * @param {Array<File>} files - Array of file objects to upload
 * @param {string} companyId - The company ID for file organization
 * @param {string} fileType - The file type category
 * @param {Function} onFileProgress - Callback for individual file progress ({fileName, progress, status, error})
 * @returns {Promise<Object>} - Summary of upload results {successful, failed, errors}
 */
export async function uploadFiles(files, companyId, fileType, onFileProgress) {
  const results = {
    successful: [],
    failed: [],
    errors: [],
  }

  for (const file of files) {
    if (onFileProgress) {
      onFileProgress({ fileName: file.name, status: 'uploading', progress: 0 })
    }

    const asset = await uploadFile(file, companyId, fileType, (progress) => {
      if (onFileProgress) {
        onFileProgress({ fileName: file.name, ...progress })
      }
    })

    results.successful.push(asset)
    if (onFileProgress) {
      onFileProgress({ fileName: file.name, status: 'success', progress: 100 })
    }
  }

  return results
}

/**
 * Delete a file from the server
 * @param {string} fileName - The file name to delete
 * @param {string} companyId - The company ID
 * @param {boolean} deleteFromStorage - Whether to also delete from S3 storage (default: true)
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function deleteFile(fileName, companyId, deleteFromStorage = true) {
  await del(`/v1/files/${companyId}/delete`, {
    data: { fileName, deleteFromStorage },
  })
  return true
}
