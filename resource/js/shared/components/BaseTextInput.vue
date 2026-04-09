<script setup>
import { micromark } from 'micromark'
import { XMarkIcon } from '@heroicons/vue/24/outline'

// --- Props & models ---
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  labelLeft: {
    type: Boolean,
    default: false,
  },
  labelRight: {
    type: Boolean,
    default: false,
  },
  instructions: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  errorMsg: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    validator(value) {
      return [
        'text',
        'password',
        'email',
        'datetime-local',
        'date',
        'number',
        'url',
        'checkbox',
      ].includes(value)
    },
    default: 'text',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  step: {
    type: [Number, undefined],
    default: undefined,
  },
  min: {
    type: [Number, String, undefined],
    default: undefined,
  },
  max: {
    type: [Number, undefined],
    default: undefined,
  },
  pattern: {
    type: [String, undefined],
    default: undefined,
  },
  inputClass: {
    type: String,
    default: '',
  },
  labelWrapperClass: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    validator(value) {
      return ['sm', 'md'].includes(value)
    },
    default: 'md',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  clearBtn: {
    type: Boolean,
    default: false,
  },
})

// --- Emits ---
const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

// --- Use ---
const slots = useSlots()

// --- Vars ---
const inputEl = ref(null)
// --- Handlers ---
function focus() {
  inputEl.value?.focus()
}

const showClearBtn = computed(() => {
  return props.clearBtn && Boolean(props.modelValue)
})

function clear() {
  emit('update:modelValue', '')
}

// --- Watchers & computed ---
const inline = computed(() => props.labelLeft || props.labelRight)

const cssClass = computed(() => {
  let c =
    'w-full rounded-lg border border-divider bg-sidebar text-sm text-main-text placeholder-main-text-muted transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-main-unselected'
  if (props.size === 'sm') c += ' py-1.5 text-12'
  else c += ' py-2.5'

  // Left padding - conditional based on icon slot
  if (slots.icon) {
    c += props.size === 'sm' ? ' pl-8' : ' pl-10'
  } else {
    c += ' pl-3'
  }

  // Right padding - conditional based on clear button
  if (props.clearBtn) {
    c += ' pr-10'
  } else {
    c += ' pr-3'
  }

  if (props.inputClass) c += ' ' + props.inputClass
  return c
})

// --- Lifecycle hooks & related ---
onMounted(() => {
  if (props.autofocus) {
    focus()
  }
})
defineExpose({
  inputEl,
  focus,
})
</script>

<template>
  <div :class="{ 'flex items-center': inline, 'flex-row-reverse': labelRight }">
    <div
      v-if="label || slots.label || instructions"
      :class="labelWrapperClass ? labelWrapperClass : 'mb-1'"
    >
      <label
        v-if="label || slots.label"
        class="dark:text-white"
        :class="{
          'inline-block': !inline,
          '-mb-2': !inline && size === 'md',
          'text-12': size === 'sm',
          'mr-2': labelLeft,
          'ml-2': labelRight,
        }"
        :for="name"
      >
        <slot name="label">
          {{ label }}
          <span v-if="required" class="text-red">*</span>
        </slot>
      </label>
      <div
        v-if="instructions"
        class="text-grey-5 dark:text-grey-4 max-w-none dark:prose-invert [&>p>a]:underline"
        :class="{
          'text-14 mb-4': size === 'md',
          'text-12': size === 'sm',
        }"
        v-html="micromark(instructions).replace('href=', 'target=\'_blank\' href=')"
      />
    </div>
    <div class="relative w-full">
      <div
        v-if="slots.icon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-main-text-hover z-1"
        :class="{ 'size-4': size === 'sm', 'size-5': size === 'md' }"
      >
        <slot name="icon" />
      </div>
      <input
        ref="inputEl"
        :class="cssClass"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-disabled="disabled"
        :type="type"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        dir="auto"
        autocomplete="off"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <BaseButton
        v-if="showClearBtn"
        variant="transparent"
        class="absolute right-1 top-1/2 -translate-y-1/2"
        @click="clear"
      >
        <XMarkIcon class="size-5" />
      </BaseButton>
    </div>

    <p v-if="errorMsg" class="text-14 mt-2 text-red">{{ errorMsg }}</p>
  </div>
</template>
