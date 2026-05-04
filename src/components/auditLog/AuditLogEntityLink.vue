<script setup>
const props = defineProps({
  entityType: { type: String, default: null },
  entityId: { type: String, default: null },
  contextLabel: { type: String, default: null },
  companyCode: { type: String, default: null },
})

const ENTITY_ROUTES = {
  Document: (id, code) => `/${code}/documents/${id}`,
  Workflow: (id, code) => `/${code}/workflows/${id}`,
  WorkflowInstance: (id, code) => `/${code}/workflows/instances/${id}`,
  Nonconformance: (id, code) => `/${code}/nonconformances/${id}`,
  Supplier: (id, code) => `/${code}/suppliers/${id}`,
  AssetRequest: (id, code) => `/${code}/asset-requests/${id}`,
  FormTemplate: (id, code) => `/${code}/form-templates/${id}`,
}

const href = computed(() => {
  if (!props.entityType || !props.entityId || !props.companyCode) return null
  const routeFn = ENTITY_ROUTES[props.entityType]
  return routeFn ? routeFn(props.entityId, props.companyCode) : null
})

const displayLabel = computed(() => props.contextLabel || props.entityType || props.entityId)
</script>

<template>
  <RouterLink
    v-if="href"
    :to="href"
    class="tw:text-primary tw:hover:underline tw:font-medium tw:text-sm"
  >
    {{ displayLabel }}
  </RouterLink>
  <span v-else class="tw:font-medium tw:text-sm tw:text-on-main">{{ displayLabel }}</span>
</template>
