<script setup>
import { get } from '@/api'

const riskLevelId = defineModel('riskLevelId', {
  type: [String, null],
})

const riskLevels = ref([])
const loading = ref(false)

async function fetchRiskLevels() {
  const data = await get('/v1/services/riskLevels', { loader: loading })
  riskLevels.value = (data.riskLevels || []).map((r) => ({
    label: r.name,
    value: r.id,
    color: r.color,
  }))
}

onMounted(() => {
  fetchRiskLevels()
})
</script>

<template>
  <div>
    <div class="tw:text-sm tw:font-semibold tw:text-on-sidebar tw:mb-3">Risk Level</div>

    <WOptionGroup
      v-model="riskLevelId"
      :options="riskLevels"
      optionLabel="label"
      optionValue="value"
      type="radio"
      inline
      color="primary"
    />
  </div>
</template>
