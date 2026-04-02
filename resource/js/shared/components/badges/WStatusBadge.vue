<script setup>
/**
 * WStatusBadge — Unified status badge component
 *
 * Replaces all 6+ disparate badge implementations with a single,
 * parameterized component that uses design tokens for consistent
 * rendering across the entire application.
 *
 * Usage:
 *   <WStatusBadge status="DRAFT" />
 *   <WStatusBadge status="APPROVED" variant="document" />
 *   <WStatusBadge status="ACTIVE" variant="formTemplate" showDot />
 *   <WStatusBadge status="PUBLISHED" variant="workflow" showIcon />
 *   <WStatusBadge status="IN_REVIEW" version="1.2" showIcon />
 */

const props = defineProps({
  /** Status ID string (e.g., 'DRAFT', 'APPROVED', 'IN_REVIEW') */
  status: {
    type: String,
    default: '',
  },
  /** Optional variant to provide domain-specific label overrides */
  variant: {
    type: String,
    default: 'default',
    validator: (v) =>
      [
        'default',
        'document',
        'formTemplate',
        'documentTemplate',
        'record',
        'workflow',
        'step',
        'task',
      ].includes(v),
  },
  /** Show colored dot indicator */
  showDot: {
    type: Boolean,
    default: false,
  },
  /** Show icon */
  showIcon: {
    type: Boolean,
    default: false,
  },
  /** Hide text label (useful with showDot for compact display) */
  hideLabel: {
    type: Boolean,
    default: false,
  },
  /** Optional version prefix (e.g., "1.2" → shows "v1.2") */
  version: {
    type: String,
    default: '',
  },
  /** Override default label */
  label: {
    type: String,
    default: '',
  },
})

/**
 * Color scheme definitions using design token classes.
 * Each scheme maps to: background, text, border, dot color.
 */
const colorSchemes = {
  neutral: {
    classes: 'tw:bg-neutral-100 tw:text-neutral-700 tw:border-neutral-200',
    dot: 'tw:bg-neutral-400',
  },
  neutralMuted: {
    classes: 'tw:bg-neutral-100 tw:text-neutral-500 tw:border-neutral-200',
    dot: 'tw:bg-neutral-300',
  },
  success: {
    classes: 'tw:bg-success-50 tw:text-success-700 tw:border-success-100',
    dot: 'tw:bg-success-500',
  },
  warning: {
    classes: 'tw:bg-warning-50 tw:text-warning-700 tw:border-warning-100',
    dot: 'tw:bg-warning-500',
  },
  danger: {
    classes: 'tw:bg-danger-50 tw:text-danger-700 tw:border-danger-100',
    dot: 'tw:bg-danger-500',
  },
  info: {
    classes: 'tw:bg-info-50 tw:text-info-700 tw:border-info-100',
    dot: 'tw:bg-info-500',
  },
  changes: {
    classes: 'tw:bg-changes-50 tw:text-changes-700 tw:border-changes-50',
    dot: 'tw:bg-changes-500',
  },
  primary: {
    classes: 'tw:bg-info-50 tw:text-info-700 tw:border-info-100',
    dot: 'tw:bg-info-600',
  },
}

/**
 * Status → color scheme + label + icon mapping.
 * Variant overrides allow domain-specific labels while maintaining
 * a unified visual language.
 */
const statusDefinitions = {
  // === Draft / Pending / New ===
  DRAFT: { scheme: 'neutral', icon: 'edit_note', label: 'Draft' },
  PENDING: { scheme: 'warning', icon: 'schedule', label: 'Pending' },
  NEW: { scheme: 'info', icon: 'fiber_new', label: 'New' },

  // === Active / In Progress ===
  ACTIVE: { scheme: 'success', icon: 'check_circle', label: 'Active' },
  IN_PROGRESS: { scheme: 'info', icon: 'sync', label: 'In Progress' },
  IN_REVIEW: { scheme: 'warning', icon: 'rate_review', label: 'In Review' },
  REVIEW: { scheme: 'warning', icon: 'rate_review', label: 'In Review' },
  ASSIGNED: { scheme: 'info', icon: 'person', label: 'Assigned' },

  // === Approved / Success ===
  APPROVED: { scheme: 'success', icon: 'check_circle', label: 'Approved' },
  PUBLISHED: { scheme: 'success', icon: 'publish', label: 'Published' },
  EFFECTIVE: { scheme: 'primary', icon: 'verified', label: 'Effective' },

  // === Rejected / Failed ===
  REJECTED: { scheme: 'danger', icon: 'cancel', label: 'Rejected' },
  DELETED: { scheme: 'danger', icon: 'delete', label: 'Deleted' },
  FAILED: { scheme: 'danger', icon: 'error', label: 'Failed' },

  // === Changes Requested ===
  CHANGES_REQUESTED: { scheme: 'changes', icon: 'edit_note', label: 'Changes Requested' },

  // === Archived / Inactive / Retired ===
  ARCHIVED: { scheme: 'neutralMuted', icon: 'inventory_2', label: 'Archived' },
  INACTIVE: { scheme: 'neutralMuted', icon: 'block', label: 'Inactive' },
  OBSOLETE: { scheme: 'neutralMuted', icon: 'archive', label: 'Obsolete' },
  RETIRED: { scheme: 'neutralMuted', icon: 'event_busy', label: 'Retired' },
  CANCELLED: { scheme: 'neutralMuted', icon: 'cancel', label: 'Cancelled' },

  // === Waiting / Default ===
  WAITING: { scheme: 'neutral', icon: 'hourglass_empty', label: 'Waiting' },
}

/**
 * Variant-specific label overrides.
 * Only the label is overridden — colors and icons stay consistent.
 */
const variantLabelOverrides = {
  step: {
    APPROVED: 'Completed',
    IN_PROGRESS: 'Active',
    DEFAULT: 'Waiting',
  },
  record: {
    DRAFT: 'Draft',
    APPROVED: 'Approved',
    DELETED: 'Deleted',
  },
}

const config = computed(() => {
  const statusKey = props.status?.toUpperCase() || ''
  const definition = statusDefinitions[statusKey] || {
    scheme: 'neutral',
    icon: 'help',
    label: props.status || 'Unknown',
  }

  // Apply variant label overrides
  const overrides = variantLabelOverrides[props.variant]
  const label = props.label || (overrides && overrides[statusKey]) || definition.label

  const scheme = colorSchemes[definition.scheme] || colorSchemes.neutral

  return {
    ...definition,
    ...scheme,
    label,
  }
})
</script>

<template>
  <span
    class="tw:inline-flex tw:items-center tw:gap-1 tw:border tw:font-semibold tw:leading-none tw:whitespace-nowrap"
    :class="[
      config.classes,
      hideLabel && showDot
        ? 'tw:rounded-full tw:p-1'
        : 'tw:rounded-md tw:px-2 tw:py-1 tw:text-[11px] tw:tracking-[0.03em]',
    ]"
  >
    <!-- Dot indicator -->
    <span
      v-if="showDot"
      class="tw:inline-block tw:size-2 tw:rounded-full tw:shrink-0"
      :class="config.dot"
    />

    <!-- Icon -->
    <WIcon v-if="showIcon && !hideLabel" :name="config.icon" size="14px" class="tw:shrink-0" />

    <!-- Version prefix -->
    <span v-if="version && !hideLabel">v{{ version }}</span>

    <!-- Label -->
    <span v-if="!hideLabel">{{ config.label }}</span>
  </span>
</template>
