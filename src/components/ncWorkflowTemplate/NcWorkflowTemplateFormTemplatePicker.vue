<script setup>
import { IconSearch, IconFileText } from '@tabler/icons-vue'

const props = defineProps({
  stageId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
})

const formTemplateId = defineModel('formTemplateId', {
  type: String,
  default: null,
})

const search = ref('')
const previewTemplate = ref(null)
const previewOpen = ref(false)

const formTemplates = useLiveQuery(
  (db) => db.FormTemplate.where('statusId', 'ACTIVE').orderBy('name').exec(),
  {
    initial: [],
  },
)

const filteredTemplates = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return formTemplates.value
  return formTemplates.value.filter((ft) => ft.name?.toLowerCase().includes(q))
})

function openPreview(template) {
  previewTemplate.value = template
  previewOpen.value = true
}

function selectTemplate(id) {
  if (!props.canUpdate) return
  formTemplateId.value = formTemplateId.value === id ? null : id
}
</script>

<template>
  <div class="tw:space-y-3">
    <!-- Search -->
    <BaseTextInput v-model="search" placeholder="Search form templates...">
      <template #icon>
        <IconSearch :size="18" class="tw:text-secondary" />
      </template>
    </BaseTextInput>

    <!-- Form Template List -->
    <div
      class="tw:max-h-64 tw:overflow-y-auto tw:space-y-1.5 tw:border tw:border-divider tw:rounded-xl tw:p-2"
    >
      <div
        v-for="ft in filteredTemplates"
        :key="ft.id"
        class="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:rounded-lg tw:transition-colors"
        :class="
          formTemplateId === ft.id
            ? 'tw:bg-primary/10 tw:border tw:border-primary/20'
            : 'tw:hover:bg-main-hover'
        "
      >
        <IconFileText
          :size="18"
          class="tw:shrink-0"
          :class="formTemplateId === ft.id ? 'tw:text-primary' : 'tw:text-secondary'"
        />

        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:text-sm tw:font-medium tw:text-on-main tw:truncate">{{ ft.name }}</div>
          <div class="tw:text-xs tw:text-secondary">
            {{ ft.title }}
          </div>
        </div>

        <div class="tw:flex tw:items-center tw:gap-2 tw:shrink-0">
          <BaseButton variant="ghost" size="sm" @click="openPreview(ft)">Preview</BaseButton>
          <BaseButton
            :variant="formTemplateId === ft.id ? 'primary' : 'outline'"
            size="sm"
            :disabled="!canUpdate"
            @click="selectTemplate(ft.id)"
          >
            {{ formTemplateId === ft.id ? 'Selected ✓' : 'Select' }}
          </BaseButton>
        </div>
      </div>

      <BaseEmptyState v-if="filteredTemplates.length === 0" dense title="No form templates found" />
    </div>
  </div>

  <!-- Preview Panel -->
  <Teleport to="body">
    <Transition
      enterActiveClass="tw:transition-transform tw:duration-300 tw:ease-out"
      enterFromClass="tw:translate-x-full"
      enterToClass="tw:translate-x-0"
      leaveActiveClass="tw:transition-transform tw:duration-200 tw:ease-in"
      leaveFromClass="tw:translate-x-0"
      leaveToClass="tw:translate-x-full"
    >
      <div v-if="previewOpen" class="tw:fixed tw:inset-0 tw:z-50 tw:bg-sidebar">
        <FormTemplatePreview
          :schema="previewTemplate?.schema ?? []"
          :title="previewTemplate?.name ?? 'Form Template Preview'"
          readonly
          @close="previewOpen = false"
        />
      </div>
    </Transition>
  </Teleport>
</template>
