<script setup>
import { computed, useAttrs } from 'vue'
defineOptions({
  name: 'TableSkeletonLoader',
})

const props = defineProps({
  cols: {
    type: [Number, String],
    default: 6,
  },
  rows: {
    type: [Number, String],
    default: 5,
  },
  separator: {
    type: String,
    default: 'none',
  },
})

const attrs = useAttrs()

const tableProps = computed(() => {
  return {
    ...attrs,
    class: undefined,
    style: undefined,
    separator: props.separator,
  }
})
</script>

<template>
  <div class="q-pa-md">
    <QMarkupTable v-bind="tableProps">
      <thead>
        <tr>
          <th
            v-for="col in Number(cols)"
            :key="`header-${col}`"
            :class="col === 1 ? 'text-left' : 'text-right'"
          >
            <QSkeleton animation="blink" type="text" />
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in Number(rows)" :key="`row-${row}`">
          <td
            v-for="col in Number(cols)"
            :key="`cell-${row}-${col}`"
            :class="col === 1 ? 'text-left' : 'text-right'"
          >
            <QSkeleton animation="blink" type="text" />
          </td>
        </tr>
      </tbody>
    </QMarkupTable>
  </div>
</template>
