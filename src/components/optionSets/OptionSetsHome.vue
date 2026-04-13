<script setup>
import { IconChecklist } from '@tabler/icons-vue'
import { isAllowed } from '@/utils/currentSession.js'

const showCreateDialog = ref(false)
const selectedOptionSetId = ref(null)

const canCreateOptionSet = computed(() => isAllowed(['optionSets:create']))
const canDeleteOptionSet = computed(() => isAllowed(['optionSets:delete']))

// Filters — drives live query re-run
const filters = ref({ search: '' })

// Live query for option sets
const optionSets = useLiveQueryWithDeps(
  [() => filters.value.search],
  async (db, [search]) => {
    let results = await db.OptionSet.where().exec()
    if (search) {
      const q = search.toLowerCase()
      results = results.filter(
        (os) =>
          os.name.toLowerCase().includes(q) || (os.description || '').toLowerCase().includes(q),
      )
    }
    return results.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
    )
  },
  { initial: [] },
)

function openDialog(id = null) {
  selectedOptionSetId.value = id
  showCreateDialog.value = true
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <IconChecklist class="tw:text-primary" :size="24" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Option Sets</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <BaseButton v-if="canCreateOptionSet" @click="openDialog()"> Create Option Set </BaseButton>
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Option Sets</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage reusable sets of options for dropdowns, radios, and checklists.
        </div>
      </div>
    </div>

    <OptionSetsFilterToolbar v-model:filters="filters" />

    <OptionSetsTable :rows="optionSets" :canDelete="canDeleteOptionSet" />
  </div>

  <!-- Create/Edit Option Set Dialog -->
  <OptionSetCreateDialog
    v-if="showCreateDialog"
    :id="selectedOptionSetId"
    v-model="showCreateDialog"
  />
</template>
