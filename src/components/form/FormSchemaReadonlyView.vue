<script setup>
import { IconStarFilled, IconStar } from '@tabler/icons-vue'
import { DateTime } from 'luxon'

const props = defineProps({
  fields: { type: Array, required: true },
  values: { type: Object, default: () => ({}) },
})

// ─── Option set resolution ────────────────────────────────────────────────────
const optionSetIds = computed(() => {
  const ids = new Set()
  function collect(fields) {
    for (const f of fields) {
      if (f.optionSetId) ids.add(f.optionSetId)
      if (f.children) collect(f.children)
      if (f.template) collect(f.template)
    }
  }
  collect(props.fields)
  return [...ids]
})

const optionSets = useLiveQueryWithDeps(
  [() => optionSetIds.value.join(',')],
  async (db, [idsStr]) => {
    if (!idsStr) return {}
    const ids = idsStr.split(',')
    const results = await Promise.all(ids.map((id) => db.OptionSet.findByPk(id)))
    const map = {}
    for (const os of results) {
      if (os) map[os.id] = os
    }
    return map
  },
  { initial: {} },
)

// ─── Value resolution helpers ─────────────────────────────────────────────────
function getFieldValue(field) {
  if (!field.name) return null
  return props.values?.[field.name] ?? null
}

function resolveOptionLabel(field, val) {
  if (val == null) return '—'

  // Check optionSet first
  if (field.optionSetId && optionSets.value[field.optionSetId]) {
    const options = optionSets.value[field.optionSetId].options || []
    for (const opt of options) {
      if (typeof opt === 'string' && opt === val) return opt
      if (opt.value === val || opt.id === val) return opt.label || opt.name || String(val)
    }
  }

  // Check inline options
  if (field.options) {
    for (const opt of field.options) {
      if (typeof opt === 'string' && opt === val) return opt
      if (opt.value === val || opt.id === val) return opt.label || opt.name || String(val)
    }
  }

  return String(val)
}

function formatDisplayValue(field, rawVal) {
  if (rawVal == null || rawVal === '') return '—'

  switch (field.type) {
    case 'input':
    case 'password':
    case 'textarea':
    case 'number':
    case 'slider':
      return String(rawVal)

    case 'textEditor':
      return rawVal // will be rendered with v-html

    case 'select':
    case 'radio':
    case 'optionGroup':
      if (Array.isArray(rawVal)) {
        return rawVal.map((v) => resolveOptionLabel(field, v)).join(', ') || '—'
      }
      return resolveOptionLabel(field, rawVal)

    case 'checkbox':
    case 'toggle':
      return rawVal ? 'Yes' : 'No'

    case 'datetime': {
      if (!rawVal) return '—'
      const mode = field.mode || 'datetime'
      if (mode === 'time' && typeof rawVal === 'number') {
        const hrs = Math.floor(rawVal / 60)
        const mins = rawVal % 60
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      }
      const dt = DateTime.fromISO(rawVal)
      if (dt.isValid) {
        if (mode === 'date') return dt.toLocaleString(DateTime.DATE_MED)
        return dt.toLocaleString(DateTime.DATETIME_MED)
      }
      return String(rawVal)
    }

    case 'rating':
      return rawVal // handled specially in template

    default:
      if (typeof rawVal === 'object') return JSON.stringify(rawVal)
      return String(rawVal)
  }
}

function isHtmlField(field) {
  return field.type === 'textEditor'
}

function isRatingField(field) {
  return field.type === 'rating'
}

function isFileField(field) {
  return field.type === 'file'
}

function isSectionField(field) {
  return field.type === 'section'
}

function isRepeaterField(field) {
  return field.type === 'repeater'
}

function isRenderableField(field) {
  return (
    field.name &&
    !isSectionField(field) &&
    !isRepeaterField(field) &&
    field.type !== 'checklist' &&
    field.type !== 'photo'
  )
}

function getVisibleFields(fields) {
  const result = []
  for (const field of fields) {
    if (isSectionField(field)) {
      if (field.children?.length) {
        result.push(field)
      }
    } else if (isRepeaterField(field)) {
      result.push(field)
    } else if (field.name) {
      result.push(field)
    }
  }
  return result
}
</script>

<template>
  <div class="tw:grid tw:grid-cols-3 tw:gap-3">
    <template v-for="field in getVisibleFields(fields)" :key="field.name || field.label">
      <!-- Section with children (full-width) -->
      <template v-if="isSectionField(field)">
        <div class="tw:col-span-3">
          <div
            v-if="field.label"
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:mt-1 tw:mb-2"
          >
            {{ field.label }}
          </div>
          <FormSchemaReadonlyView :fields="field.children" :values="values" />
        </div>
      </template>

      <!-- Repeater (full-width) -->
      <template v-else-if="isRepeaterField(field)">
        <div class="tw:col-span-3">
          <div
            v-if="field.label"
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:mt-1 tw:mb-2"
          >
            {{ field.label }}
          </div>
          <template v-if="Array.isArray(getFieldValue(field)) && getFieldValue(field).length">
            <div
              v-for="(item, idx) in getFieldValue(field)"
              :key="idx"
              class="tw:border tw:border-divider tw:rounded-md tw:p-3 tw:mb-2"
            >
              <div class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2">
                #{{ idx + 1 }}
              </div>
              <FormSchemaReadonlyView :fields="field.template || []" :values="item || {}" />
            </div>
          </template>
          <span v-else class="tw:text-sm tw:text-secondary">—</span>
        </div>
      </template>

      <!-- Rating field (full-width) -->
      <div v-else-if="isRatingField(field)" class="tw:col-span-3 tw:flex tw:flex-col tw:gap-0.5">
        <div class="tw:text-[11px] tw:text-secondary tw:font-medium">{{ field.label }}</div>
        <div class="tw:flex tw:gap-0.5">
          <component
            :is="i <= (getFieldValue(field) || 0) ? IconStarFilled : IconStar"
            v-for="i in field.max || 5"
            :key="i"
            :size="16"
            :class="i <= (getFieldValue(field) || 0) ? 'tw:text-amber-400' : 'tw:text-gray-300'"
          />
        </div>
      </div>

      <!-- HTML / textEditor field (full-width) -->
      <div v-else-if="isHtmlField(field)" class="tw:col-span-3 tw:flex tw:flex-col tw:gap-0.5">
        <div class="tw:text-[11px] tw:text-secondary tw:font-medium">{{ field.label }}</div>
        <div
          v-if="getFieldValue(field)"
          class="tw:text-sm tw:text-on-main tw:leading-relaxed"
          v-html="getFieldValue(field)"
        />
        <span v-else class="tw:text-sm tw:text-secondary">—</span>
      </div>

      <!-- Textarea field (full-width) -->
      <div
        v-else-if="field.type === 'textarea'"
        class="tw:col-span-3 tw:flex tw:flex-col tw:gap-0.5"
      >
        <div class="tw:text-[11px] tw:text-secondary tw:font-medium">{{ field.label }}</div>
        <p class="tw:text-sm tw:text-on-main tw:leading-relaxed">
          {{ getFieldValue(field) || '—' }}
        </p>
      </div>

      <!-- File field (full-width) -->
      <div v-else-if="isFileField(field)" class="tw:col-span-3 tw:flex tw:flex-col tw:gap-0.5">
        <div class="tw:text-[11px] tw:text-secondary tw:font-medium">{{ field.label }}</div>
        <template v-if="Array.isArray(getFieldValue(field)) && getFieldValue(field).length">
          <div
            v-for="(file, fi) in getFieldValue(field)"
            :key="fi"
            class="tw:text-sm tw:text-primary"
          >
            {{ typeof file === 'string' ? file : file?.name || file?.fileName || 'File' }}
          </div>
        </template>
        <span v-else class="tw:text-sm tw:text-secondary">—</span>
      </div>

      <!-- Standard field (grid cell) -->
      <div v-else-if="isRenderableField(field)" class="tw:flex tw:flex-col tw:gap-0.5">
        <div class="tw:text-[11px] tw:text-secondary tw:font-medium">{{ field.label }}</div>
        <span class="tw:text-sm tw:font-medium tw:text-on-main">
          {{ formatDisplayValue(field, getFieldValue(field)) }}
        </span>
      </div>
    </template>
  </div>
</template>
