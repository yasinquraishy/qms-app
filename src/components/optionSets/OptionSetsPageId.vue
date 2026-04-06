<script setup>
import { useOptionSets } from '@/composables/useOptionSets.js'
import { isAllowed } from '@/utils/currentSession'
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { fetchOptionSet, updateOptionSet, currentOptionSet, loading } = useOptionSets()

const form = ref({
  name: '',
  description: '',
  options: [],
})

const isSaving = ref(false)

const isEditingName = ref(false)
const isEditingDescription = ref(false)
const nameInputRef = ref(null)
const descriptionInputRef = ref(null)

const editingOptionIndex = ref(-1)
const optionInputRefs = ref([])

const breadcrumbs = computed(() => [
  { label: 'Option Sets', to: getCompanyPath('/option-sets') },
  { label: form.value.name || 'Edit Option Set' },
])
const canUpdate = computed(() => isAllowed(['optionSets:update']))

async function startEditOption(index) {
  editingOptionIndex.value = index
  await nextTick()
  // WInput might expose focus directly or via internal ref
  const inputComp = optionInputRefs.value[index]
  if (inputComp?.focus) {
    inputComp.focus()
  }
}

function stopEditOption() {
  editingOptionIndex.value = -1
}

async function startEditName() {
  isEditingName.value = true
  await nextTick()
  // Try to focus the input
  if (nameInputRef.value?.focus) {
    nameInputRef.value.focus()
  }
}

function stopEditName() {
  isEditingName.value = false
}

async function startEditDescription() {
  isEditingDescription.value = true
  await nextTick()
  if (descriptionInputRef.value?.focus) {
    descriptionInputRef.value.focus()
  }
}

function stopEditDescription() {
  isEditingDescription.value = false
}

async function loadData() {
  const data = await fetchOptionSet(props.id)
  if (data) {
    form.value = {
      name: data.name,
      description: data.description,
      options: Array.isArray(data.options) ? [...data.options] : [],
    }
  }
}

onMounted(() => {
  loadData()
})

watch(() => props.id, loadData)

function addOption() {
  form.value.options.push('')
  startEditOption(form.value.options.length - 1)
}

function removeOption(index) {
  form.value.options.splice(index, 1)
}

async function handleSave() {
  isSaving.value = true
  try {
    // Filter empty options
    const cleanOptions = form.value.options.filter((opt) => opt && opt.trim() !== '')

    await updateOptionSet(props.id, {
      ...form.value,
      options: cleanOptions,
    })

    // Refresh local form with cleaned options
    form.value.options = cleanOptions
    goBack()
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  // Go up one level (remove ID)
  const currentPath = router.currentRoute.value.path
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
  router.push(parentPath)
}
</script>

<template>
  <div class="tw:p-5">
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <SafeTeleport v-if="canUpdate" to="#main-header-actions">
      <WBtn
        label="Save Changes"
        icon="save"
        color="primary"
        unelevated
        class="tw:font-medium"
        :loading="isSaving"
        @click="handleSave"
      />
    </SafeTeleport>

    <div v-if="loading && !currentOptionSet" class="tw:flex tw:justify-center tw:py-12">
      <QSpinner size="40px" color="primary" />
    </div>

    <div v-else class="tw:flex tw:flex-col tw:gap-4 tw:max-w-5xl tw:mx-auto">
      <!-- Header -->
      <div class="tw:flex tw:items-center tw:px-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-main">Edit Option Set</div>
      </div>

      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-4">
        <!-- Main Content -->
        <div class="tw:md:col-span-2 tw:flex tw:flex-col tw:gap-8">
          <!-- Options Manager -->
          <WCard flat bordered class="tw:rounded-xl">
            <QCardSection>
              <div class="tw:flex tw:items-center tw:justify-between tw:mb-4">
                <div class="tw:text-xl tw:font-bold tw:text-on-main">Options</div>
                <WBtn
                  v-if="canUpdate"
                  flat
                  icon="add"
                  label="Add Option"
                  color="primary"
                  size="sm"
                  @click="addOption"
                />
              </div>

              <div
                v-if="form.options.length === 0"
                class="tw:text-secondary tw:text-center tw:p-12 tw:bg-main-hover tw:rounded-xl tw:border-2 tw:border-dashed tw:border-divider"
              >
                No options added yet. Click "Add Option" to start.
              </div>

              <div v-else class="tw:flex tw:flex-col">
                <div
                  v-for="(opt, idx) in form.options"
                  :key="idx"
                  class="tw:flex tw:items-center tw:gap-1 tw:group"
                >
                  <!-- Number -->
                  <div class="tw:w-6 tw:text-secondary tw:text-xs tw:font-mono">{{ idx + 1 }}.</div>

                  <!-- Option Content -->
                  <div class="tw:flex-1">
                    <!-- Display Mode -->
                    <div
                      v-if="editingOptionIndex !== idx"
                      class="tw:text-base tw:px-2 tw:py-1 tw:rounded-lg tw:transition-all tw:duration-200 tw:text-on-main tw:flex tw:items-center tw:justify-between"
                      :class="{
                        'tw:text-secondary tw:italic': !form.options[idx],
                        'tw:cursor-pointer tw:hover:bg-main-hover': canUpdate,
                      }"
                      @click="canUpdate && startEditOption(idx)"
                    >
                      <span>{{ form.options[idx] || 'Empty option' }}</span>
                      <WIcon
                        v-if="canUpdate"
                        icon="edit"
                        size="18px"
                        color="grey-5"
                        class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity"
                      />
                    </div>

                    <!-- Edit Mode -->
                    <WInput
                      v-else
                      :ref="(el) => (optionInputRefs[idx] = el)"
                      v-model="form.options[idx]"
                      placeholder="Option value"
                      dense
                      autofocus
                      @blur="stopEditOption"
                      @keyup.enter="stopEditOption"
                    />
                  </div>

                  <!-- Actions -->
                  <WBtn
                    v-if="canUpdate"
                    flat
                    round
                    icon="delete_outline"
                    size="sm"
                    class="tw:opacity-0 tw:group-hover:opacity-100 tw:hover:text-bad tw:hover:bg-red-50 tw:transition-all tw:text-bad!"
                    @click="removeOption(idx)"
                  />
                </div>
              </div>
            </QCardSection>
          </WCard>
        </div>

        <!-- Sidebar Config -->
        <aside class="tw:flex! tw:flex-col tw:gap-6">
          <WCard flat bordered class="tw:rounded-xl">
            <QCardSection class="tw:flex tw:flex-col tw:gap-6">
              <div class="tw:text-lg tw:font-bold tw:text-on-main">Settings</div>

              <!-- Name Field -->
              <div class="tw:flex tw:flex-col tw:gap-2">
                <div class="ds-label-sm tw:text-secondary">Name</div>
                <div
                  v-if="!isEditingName"
                  class="tw:text-base tw:p-3 tw:rounded-lg tw:transition-all tw:duration-200 tw:text-on-main tw:flex tw:items-center tw:justify-between tw:group"
                  :class="{
                    'tw:text-secondary tw:italic': !form.name,
                    'tw:cursor-pointer tw:hover:bg-main-hover': canUpdate,
                  }"
                  @click="canUpdate && startEditName()"
                >
                  <span>{{ form.name || 'Click to add name' }}</span>
                  <WIcon
                    v-if="canUpdate"
                    icon="edit"
                    size="18px"
                    color="grey-5"
                    class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity"
                  />
                </div>
                <WInput
                  v-else
                  ref="nameInputRef"
                  v-model="form.name"
                  dense
                  @blur="stopEditName"
                  @keyup.enter="stopEditName"
                />
              </div>

              <!-- Description Field -->
              <div class="tw:flex tw:flex-col tw:gap-2">
                <div class="ds-label-sm tw:text-secondary">Description</div>
                <div
                  v-if="!isEditingDescription"
                  class="tw:text-sm tw:leading-relaxed tw:p-3 tw:rounded-lg tw:transition-all tw:duration-200 tw:text-on-main tw:flex tw:items-center tw:justify-between tw:group"
                  :class="{
                    'tw:text-secondary tw:italic': !form.description,
                    'tw:cursor-pointer tw:hover:bg-main-hover': canUpdate,
                  }"
                  @click="canUpdate && startEditDescription()"
                >
                  <span>{{ form.description || 'Click to add description' }}</span>
                  <WIcon
                    v-if="canUpdate"
                    icon="edit"
                    size="18px"
                    color="grey-5"
                    class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity"
                  />
                </div>
                <WInput
                  v-else
                  ref="descriptionInputRef"
                  v-model="form.description"
                  type="textarea"
                  dense
                  @blur="stopEditDescription"
                />
              </div>
            </QCardSection>
          </WCard>

          <div class="tw:bg-primary/5 tw:p-6 tw:rounded-xl tw:border tw:border-primary/10">
            <div class="tw:flex tw:items-center tw:gap-2 tw:text-primary tw:mb-2">
              <WIcon icon="info" size="18px" />
              <div class="tw:text-sm tw:font-bold">Pro Tip</div>
            </div>
            <div class="tw:text-sm tw:text-secondary tw:leading-relaxed">
              Options are saved in the order they appear here. You can leave entries blank to remove
              them on save.
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
