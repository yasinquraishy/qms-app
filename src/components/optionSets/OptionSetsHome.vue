<script setup>
import { useOptionSets } from '@/composables/useOptionSets.js'
import { isAllowed } from '@/utils/currentSession.js'

const showCreateDialog = ref(false)

const { optionSets, loading, filters } = useOptionSets()

const canCreateOptionSet = computed(() => isAllowed(['optionSets:create']))
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="checklist" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Option Sets</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateOptionSet"
        label="Create Option Set"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="showCreateDialog = true"
      />
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

    <OptionSetsTable :rows="optionSets" :loading="loading" />
  </div>

  <!-- Create Option Set Dialog -->
  <OptionSetCreateDialog v-model="showCreateDialog" />
</template>

<style scoped lang="scss"></style>
