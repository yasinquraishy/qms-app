<script setup>
import {
  getCategoryLabel,
  getCategoryIcon,
  getCategoryDescription,
  formatActionLabel,
} from '@/utils/categoryConfig.js'

defineProps({
  permissionActions: { type: Array, required: true },
  isSelected: { type: Function, required: true },
  togglePermission: { type: Function, required: true },
  getPermissionForAction: { type: Function, required: true },
  canUpdateRole: { type: Boolean, default: false },
})

const model = defineModel({
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3">
    <!-- Section Header -->
    <div class="tw:flex tw:items-center tw:gap-3">
      <WIcon icon="category" size="20px" class="tw:text-secondary" />
      <h4 class="tw:font-bold tw:text-on-sidebar">
        {{ model.name }}
      </h4>
    </div>

    <!-- Category Items -->
    <div class="tw:flex tw:flex-col tw:gap-3">
      <div
        v-for="item in model.items"
        :key="item.key"
        class="tw:bg-layer tw:rounded-xl tw:border tw:border-sidebar tw:overflow-hidden tw:shadow-sm"
      >
        <!-- Item Header -->
        <div
          class="tw:bg-sidebar/30 tw:px-5 tw:py-3 tw:border-b tw:border-sidebar tw:flex tw:items-center tw:gap-3"
        >
          <WIcon :icon="getCategoryIcon(item.key)" size="20px" class="tw:text-secondary" />
          <div>
            <p class="tw:text-sm tw:font-semibold tw:text-on-sidebar">
              {{ getCategoryLabel(item.key) }}
            </p>
            <p class="tw:text-xs tw:text-secondary">
              {{ getCategoryDescription(item.key) }}
            </p>
          </div>
        </div>

        <!-- Item Body - Checkboxes in a wrapping row -->
        <div class="tw:px-5 tw:py-3 tw:flex tw:flex-wrap tw:gap-x-6 tw:gap-y-1">
          <template v-for="action in permissionActions" :key="`${item.key}-${action}`">
            <QCheckbox
              v-if="getPermissionForAction(item.group.permissions, action)"
              :modelValue="isSelected(getPermissionForAction(item.group.permissions, action))"
              :label="formatActionLabel(action)"
              color="primary"
              :disable="!canUpdateRole"
              @update:modelValue="
                togglePermission(getPermissionForAction(item.group.permissions, action))
              "
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
