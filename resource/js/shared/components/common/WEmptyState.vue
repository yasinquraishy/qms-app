<script setup>
/**
 * WEmptyState — Unified empty state component
 *
 * Provides a consistent empty/no-data display across all tables,
 * lists, and content areas. Replaces the ad-hoc empty states
 * scattered throughout the application.
 *
 * Usage:
 *   <WEmptyState icon="description" title="No documents found" />
 *   <WEmptyState
 *     icon="add_circle_outline"
 *     title="No records yet"
 *     description="Create your first record to get started."
 *     actionLabel="Create Record"
 *     @action="handleCreate"
 *   />
 */

defineProps({
  /** Material icon name */
  icon: {
    type: String,
    default: 'search_off',
  },
  /** Primary heading text */
  title: {
    type: String,
    default: 'No results found',
  },
  /** Optional description text */
  description: {
    type: String,
    default: '',
  },
  /** Optional CTA button label */
  actionLabel: {
    type: String,
    default: '',
  },
  /** Optional CTA button icon */
  actionIcon: {
    type: String,
    default: '',
  },
  /** Icon size */
  iconSize: {
    type: String,
    default: '64px',
  },
  /** Compact mode for use inside tables */
  compact: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['action'])
</script>

<template>
  <div
    class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-center"
    :class="compact ? 'tw:py-8 tw:px-4' : 'tw:py-16 tw:px-6 tw:min-h-[280px]'"
  >
    <!-- Icon -->
    <div
      class="tw:flex tw:items-center tw:justify-center tw:rounded-2xl tw:mb-4"
      :class="compact ? 'tw:size-16 tw:bg-neutral-100' : 'tw:size-24 tw:bg-neutral-100'"
    >
      <WIcon :name="icon" :size="compact ? '32px' : iconSize" class="tw:text-neutral-400" />
    </div>

    <!-- Title -->
    <h3
      class="tw:font-semibold tw:text-neutral-800 tw:mb-1"
      :class="compact ? 'tw:text-base' : 'tw:text-lg'"
    >
      {{ title }}
    </h3>

    <!-- Description -->
    <p
      v-if="description"
      class="tw:text-sm tw:text-neutral-500 tw:max-w-sm tw:mb-0"
      :class="{ 'tw:mb-4': actionLabel }"
    >
      {{ description }}
    </p>

    <!-- CTA Button -->
    <WBtn
      v-if="actionLabel"
      color="primary"
      unelevated
      noCaps
      :icon="actionIcon"
      :label="actionLabel"
      class="tw:mt-4 tw:font-medium"
      @click="$emit('action')"
    />

    <!-- Custom slot for additional content -->
    <slot />
  </div>
</template>
