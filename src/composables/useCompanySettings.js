import { currentCompany } from '@/utils/currentCompany.js'
import { get, patch } from '@/api'

const symbol = Symbol('useCompanySettings')

function CompanySettingsState() {
  const formData = ref({
    name: '',
    code: '',
    defaultTimeZone: '',
    defaultFirstDayOfWeek: null,
    companyIconUrl: '',
    companyDarkIconUrl: '',
    subscriptionState: '',
    stateId: '',
    createdAt: null,
    updatedAt: null,
    settings: {
      defaultSla: null,
      defaultApprovalWorkflowApprovalRule: 'ALL',
      defaultApprovalWorkflowRequireSignature: false,
      defaultApprovalWorkflowRequireComment: false,
      defaultDocumentTemplatePeriodicReviewMonths: 12,
      defaultDocumentTemplateReviewLimitDays: 14,
      defaultDocumentTemplateApprovalLimitDays: 7,
      defaultDocumentTemplateTrainingAvailable: true,
      defaultDocumentTemplateRetrainingOnVersion: true,
      defaultDocumentTemplateAutoEffectiveOnApproval: true,
      defaultAssetRequestDueDays: null,
    },
  })

  const originalData = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  // Check if form has unsaved changes
  const isDirty = computed(() => {
    if (!originalData.value) return false
    return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
  })

  // Fetch company settings
  async function fetchSettings() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get(`/v1/services/companies/${companyId}`, {
      loader: loading,
    })
    const company = data.company

    formData.value = {
      name: company.name || '',
      code: company.code || '',
      defaultTimeZone: company.defaultTimeZone || '',
      defaultFirstDayOfWeek: company.defaultFirstDayOfWeek,
      companyIconUrl: company.companyIconUrl || '',
      companyDarkIconUrl: company.companyDarkIconUrl || '',
      subscriptionState: company.subscriptionState || '',
      stateId: company.stateId || '',
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      settings: {
        defaultSla: company.settings?.defaultSla ?? null,
        defaultApprovalWorkflowApprovalRule:
          company.settings?.defaultApprovalWorkflowApprovalRule ?? 'ALL',
        defaultApprovalWorkflowRequireSignature:
          company.settings?.defaultApprovalWorkflowRequireSignature ?? false,
        defaultApprovalWorkflowRequireComment:
          company.settings?.defaultApprovalWorkflowRequireComment ?? false,
        defaultDocumentTemplatePeriodicReviewMonths:
          company.settings?.defaultDocumentTemplatePeriodicReviewMonths ?? 12,
        defaultDocumentTemplateReviewLimitDays:
          company.settings?.defaultDocumentTemplateReviewLimitDays ?? 14,
        defaultDocumentTemplateApprovalLimitDays:
          company.settings?.defaultDocumentTemplateApprovalLimitDays ?? 7,
        defaultDocumentTemplateTrainingAvailable:
          company.settings?.defaultDocumentTemplateTrainingAvailable ?? true,
        defaultDocumentTemplateRetrainingOnVersion:
          company.settings?.defaultDocumentTemplateRetrainingOnVersion ?? true,
        defaultDocumentTemplateAutoEffectiveOnApproval:
          company.settings?.defaultDocumentTemplateAutoEffectiveOnApproval ?? true,
        defaultAssetRequestDueDays: company.settings?.defaultAssetRequestDueDays ?? null,
      },
    }

    originalData.value = JSON.parse(JSON.stringify(formData.value))

    if (currentCompany.value) {
      currentCompany.value.settings = company.settings
    }
  }

  // Save company settings
  async function saveSettings() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return false
    }

    error.value = null

    const data = await patch(
      `/v1/services/companies/${companyId}`,
      {
        name: formData.value.name,
        defaultTimeZone: formData.value.defaultTimeZone,
        defaultFirstDayOfWeek: formData.value.defaultFirstDayOfWeek,
        companyIconUrl: formData.value.companyIconUrl,
        companyDarkIconUrl: formData.value.companyDarkIconUrl,
        settings: formData.value.settings,
      },
      {
        loader: saving,
      },
    )

    const company = data.company

    formData.value = {
      name: company.name || '',
      code: company.code || '',
      defaultTimeZone: company.defaultTimeZone || '',
      defaultFirstDayOfWeek: company.defaultFirstDayOfWeek,
      companyIconUrl: company.companyIconUrl || '',
      companyDarkIconUrl: company.companyDarkIconUrl || '',
      subscriptionState: company.subscriptionState || '',
      stateId: company.stateId || '',
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      settings: {
        defaultSla: company.settings?.defaultSla ?? null,
        defaultApprovalWorkflowApprovalRule:
          company.settings?.defaultApprovalWorkflowApprovalRule ?? 'ALL',
        defaultApprovalWorkflowRequireSignature:
          company.settings?.defaultApprovalWorkflowRequireSignature ?? false,
        defaultApprovalWorkflowRequireComment:
          company.settings?.defaultApprovalWorkflowRequireComment ?? false,
        defaultDocumentTemplatePeriodicReviewMonths:
          company.settings?.defaultDocumentTemplatePeriodicReviewMonths ?? 12,
        defaultDocumentTemplateReviewLimitDays:
          company.settings?.defaultDocumentTemplateReviewLimitDays ?? 14,
        defaultDocumentTemplateApprovalLimitDays:
          company.settings?.defaultDocumentTemplateApprovalLimitDays ?? 7,
        defaultDocumentTemplateTrainingAvailable:
          company.settings?.defaultDocumentTemplateTrainingAvailable ?? true,
        defaultDocumentTemplateRetrainingOnVersion:
          company.settings?.defaultDocumentTemplateRetrainingOnVersion ?? true,
        defaultDocumentTemplateAutoEffectiveOnApproval:
          company.settings?.defaultDocumentTemplateAutoEffectiveOnApproval ?? true,
        defaultAssetRequestDueDays: company.settings?.defaultAssetRequestDueDays ?? null,
      },
    }

    originalData.value = JSON.parse(JSON.stringify(formData.value))

    if (currentCompany.value) {
      currentCompany.value.name = company.name
      currentCompany.value.code = company.code
      currentCompany.value.defaultTimeZone = company.defaultTimeZone
      currentCompany.value.defaultFirstDayOfWeek = company.defaultFirstDayOfWeek
      currentCompany.value.companyIconUrl = company.companyIconUrl
      currentCompany.value.companyDarkIconUrl = company.companyDarkIconUrl
      currentCompany.value.settings = company.settings
    }

    return true
  }

  // Discard changes and reset to original data
  function discardChanges() {
    if (originalData.value) {
      formData.value = JSON.parse(JSON.stringify(originalData.value))
    }
  }

  // Watch for company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchSettings()
      }
    },
    { immediate: true },
  )

  return {
    formData,
    originalData,
    loading,
    saving,
    error,
    isDirty,
    fetchSettings,
    saveSettings,
    discardChanges,
  }
}

export function provideCompanySettings() {
  const state = CompanySettingsState()
  provide(symbol, state)
  return state
}

export function useCompanySettings() {
  return inject(symbol)
}
