import { currentCompany } from '@/utils/currentCompany.js'
import { useDebounceFn } from '@vueuse/core'
import { get, post, put } from '@/api'

export function useTemplateForm() {
  // Document type options - loaded from API
  const documentTypeOptions = ref([])
  const loadingDocumentTypes = ref(false)

  // Form status options - loaded from API
  const statusOptions = ref([])
  const loadingStatuses = ref(false)

  // Fetch document types
  async function fetchDocumentTypes() {
    if (documentTypeOptions.value.length > 0) return // Already loaded

    const data = await get('/v1/services/documentTypes', {
      loader: loadingDocumentTypes,
    })
    documentTypeOptions.value = data.documentTypes
  }

  // Fetch form statuses
  async function fetchFormStatuses() {
    if (statusOptions.value.length > 0) return // Already loaded

    const data = await get('/v1/services/formStatuses', {
      loader: loadingStatuses,
    })
    statusOptions.value = data.formStatuses
  }

  // Form state
  const templateForm = reactive({
    title: '',
    code: '',
    documentTypeId: null,
    status: 'DRAFT',
    trainingRequired: false,
    retrainingOnRevision: false,
    selectedSites: [],
    schema: [],
    isAvailable: null,
    isChecking: false,
    isSubmitting: false,
    submitted: false,
    isValid: computed(() => {
      const titleValid = templateForm.title.trim().length > 0
      const codeValid = /^[a-z0-9-_]+$/i.test(templateForm.code.trim())
      const documentTypeValid = templateForm.documentTypeId !== null
      return titleValid && codeValid && documentTypeValid && templateForm.code.trim().length >= 2
    }),
  })

  // Flag to track if code change was triggered by title change
  const isCodeChangeFromTitle = ref(false)

  async function createTemplate() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      return { error: 'Company ID is required' }
    }

    if (!templateForm.isValid) {
      return { error: 'Form is invalid' }
    }

    templateForm.isSubmitting = true

    try {
      const data = await post('/v1/services/formTemplates', {
        companyId,
        title: templateForm.title,
        code: templateForm.code,
        documentTypeId: templateForm.documentTypeId,
        statusId: templateForm.status,
        schema: templateForm.schema || [],
        siteIds: templateForm.selectedSites,
        config: {
          trainingRequired: templateForm.trainingRequired,
          retrainingOnRevision: templateForm.retrainingOnRevision,
        },
      })

      templateForm.submitted = true
      return { error: null, template: data.formTemplate }
    } finally {
      templateForm.isSubmitting = false
    }
  }

  async function checkTemplateCode(isNameCheck = false) {
    const code = templateForm.code.trim()
    const title = templateForm.title.trim()
    const companyId = currentCompany.value?.id

    if (!companyId) {
      return { error: 'Company ID is required' }
    }

    if (isNameCheck && !title) {
      templateForm.isAvailable = null
      return { error: 'Invalid title' }
    }

    if (!isNameCheck && (!code || !/^[a-z0-9-_]+$/i.test(code))) {
      templateForm.isAvailable = null
      return { error: 'Invalid code format' }
    }

    if (!isNameCheck && code.length < 2) {
      templateForm.isAvailable = null
      return { error: 'Code must be at least 2 characters long' }
    }

    templateForm.isChecking = true

    try {
      const data = await put(
        '/v1/services/formTemplates/checkcode',
        {
          code,
          title,
          companyId,
          isNameCheck,
        },
        {
          showError: false,
        },
      )

      if (isNameCheck) {
        if (data.suggestedCode) {
          isCodeChangeFromTitle.value = true
          templateForm.code = data.suggestedCode
          templateForm.isAvailable = data.isSuggestedCodeAvailable
        }
      } else {
        if (data.message === 'invalid') {
          templateForm.isAvailable = false
          return { error: data.reason }
        }
        templateForm.isAvailable = data.message === 'available'
      }

      return { error: null }
    } catch {
      templateForm.isAvailable = null
      return { error: 'Server error' }
    } finally {
      templateForm.isChecking = false
    }
  }

  // Debounced template code check
  const checkTemplateCodeDebounced = useDebounceFn(
    (isNameCheck = false) => checkTemplateCode(isNameCheck),
    500,
  )

  // Watch for code changes
  watch(
    () => templateForm.code,
    (newValue) => {
      if (newValue && !isCodeChangeFromTitle.value) {
        checkTemplateCodeDebounced(false)
      }
      isCodeChangeFromTitle.value = false
    },
  )

  // Watch for title changes
  watch(
    () => templateForm.title,
    (newValue) => {
      if (newValue) {
        checkTemplateCodeDebounced(true)
      }
    },
  )

  onMounted(() => {
    fetchDocumentTypes()
    fetchFormStatuses()
  })

  // Reset form
  function resetForm() {
    templateForm.title = ''
    templateForm.code = ''
    templateForm.documentType = null
    templateForm.status = 'DRAFT'
    templateForm.trainingRequired = false
    templateForm.retrainingOnRevision = false
    templateForm.selectedSites = []
    templateForm.isAvailable = null
    templateForm.isChecking = false
    templateForm.submitted = false
  }

  return {
    templateForm,
    documentTypeOptions,
    loadingDocumentTypes,
    statusOptions,
    loadingStatuses,
    fetchDocumentTypes,
    fetchFormStatuses,
    checkTemplateCode,
    createTemplate,
    resetForm,
  }
}
