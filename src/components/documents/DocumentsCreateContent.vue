<script setup>
const props = defineProps({
  selectedTemplate: {
    type: Object,
    default: null,
  },
})

const form = defineModel('form', {
  type: Object,
  required: true,
})

// Sections inherited from a template are read-only in the create form.
function isReadonly(section) {
  return section?.isAddOn === false
}

// Watch for template changes and copy sections
watch(
  () => props.selectedTemplate,
  (template) => {
    if (template) {
      form.value.sections = template.sections.map((section) => ({
        ...section,
        isAddOn: false,
        id: crypto.randomUUID(),
      }))
    } else {
      form.value.sections = []
    }
  },
)
</script>

<template>
  <div class="tw:space-y-6">
    <!-- Section Builder -->
    <DocumentSectionsEditor v-model="form.sections" :readonly="isReadonly" />
  </div>
</template>
