<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import WBtn from '../button/WBtn'
import { useAuthStore } from '@/stores/account'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  tableKey: {
    type: String,
    required: true,
  },
})

const selected = defineModel({
  type: Array,
  required: true,
})

const authStore = useAuthStore()
const $q = useQuasar()
const open = ref(false)

const userId = computed(() => authStore.user?.id)

const key = computed(() => {
  return `${userId.value}-${props.tableKey}`
})

const options = computed(() => {
  return props.columns
    .filter((column) => !column.required)
    .map((column) => {
      return {
        label: column.label,
        value: column.name,
      }
    })
})

function boot() {
  const savedColumns = $q.localStorage.getItem(key.value)
  if (savedColumns) {
    selected.value = savedColumns
  } else {
    selected.value = options.value.map((option) => option.value)
  }
}

function saveColumns() {
  $q.localStorage.set(key.value, selected.value)
}

watch([options, key], () => {
  boot()
})

boot()
</script>

<template>
  <WBtn flat round>
    <QIcon
      name="sym_r_settings"
      size="18px"
      :class="`q-select__dropdown-icon ${open ? 'rotate-180 text-primary' : ''}`"
    />
    <QMenu v-model="open" style="min-inline-size: 150px">
      <QOptionGroup
        v-model="selected"
        :options="options"
        type="checkbox"
        @update:modelValue="saveColumns"
      />
    </QMenu>
  </WBtn>
</template>
