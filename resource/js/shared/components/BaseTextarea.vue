<script setup>
// --- Props & models ---
const props = defineProps({
  modelValue: {
    type: String,
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
  id: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  errorMsg: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 1,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  autosize: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: [Object, String],
    default: '',
  },
  maxlength: {
    type: [Number, null],
    default: null,
  },
  showFocusRing: {
    type: Boolean,
    default: false,
  },
})

// --- Emits ---
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// --- Use ---
const slots = useSlots()

// --- Vars ---
const inputEl = ref(undefined)
const isFocused = ref(false)

function handleFocus() {
  isFocused.value = true
  emit('focus')
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}
// --- Handlers ---
function focus() {
  inputEl.value?.focus()
}

if (props.autosize) {
  useTextareaAutosize({
    element: inputEl,
    // Provide a getter that returns the value to watch.
    // Previously the function had a block body but did not return anything,
    // so Vue's watch couldn't track changes and a watcher callback could throw.
    watch: () => props.modelValue,
  })
}

// --- Watchers & computed ---
const inline = computed(() => props.labelLeft || props.labelRight)

// min height allows us to have initial height determined by the rows prop
// but still allow the textarea to grow
const minHeight = computed(() => {
  if (!props.autosize) {
    return 'auto'
  }
  // first row is 40px, each additional row is 24px
  const firstRowHeight = 24
  return `${(props.rows - 1) * 24 + firstRowHeight}px`
})

// --- Lifecycle hooks & related ---
onMounted(() => {
  if (props.autofocus) {
    focus()
  }
})
defineExpose({
  inputEl,
})
</script>

<template>
  <div :class="{ flex: inline, 'flex-row-reverse': labelRight }">
    <div v-if="label || slots.label || instructions" class="mb-4">
      <label
        v-if="label || slots.label"
        class="dark:text-white"
        :class="{ 'inline-block': inline }"
        :for="name"
      >
        <slot name="label">
          {{ label }}
          <span v-if="required" class="text-red">*</span>
        </slot>
      </label>
      <p v-if="instructions" class="text-14 text-grey-5 dark:text-grey-4 mb-2">
        {{ instructions }}
      </p>
    </div>
    <div
      v-if="showFocusRing"
      class="relative rounded-xl transition-all duration-300"
      :class="isFocused ? 'ring-2 ring-primary/20 bg-main/50' : 'bg-main/30'"
    >
      <textarea
        :id="id"
        ref="inputEl"
        class="disabled:text-grey-5 w-full resize-none rounded-xl border-none bg-transparent focus:ring-0 focus:outline-0 disabled:cursor-not-allowed transition-[border,box-shadow] duration-300"
        :class="inputClass"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-disabled="disabled"
        :required="required"
        :rows="rows"
        :style="`min-height: ${minHeight}`"
        dir="auto"
        autocomplete="off"
        :maxlength="maxlength"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <slot name="indicator" />
    </div>
    <textarea
      v-else
      :id="id"
      ref="inputEl"
      class="disabled:text-grey-5 w-full resize-none rounded-xl border border-divider bg-transparent focus:ring-0 focus:outline-0 disabled:cursor-not-allowed transition-[border,box-shadow] duration-300"
      :class="inputClass"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-disabled="disabled"
      :required="required"
      :rows="rows"
      :style="`min-height: ${minHeight}`"
      dir="auto"
      autocomplete="off"
      :maxlength="maxlength"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <p v-if="errorMsg" class="text-12 mt-2 text-red">{{ errorMsg }}</p>
  </div>
</template>
