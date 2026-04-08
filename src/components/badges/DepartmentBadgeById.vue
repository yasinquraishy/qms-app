<script setup>
const props = defineProps({
  departmentId: {
    type: String,
    default: null,
  },
})

const department = useLiveQueryWithDeps(
  [() => props.departmentId],
  async (db, [departmentId]) => {
    if (!departmentId) return null
    return db.Department.findByPk(departmentId)
  },
  { initial: null },
)
</script>

<template>
  <DepartmentBadge v-if="department" :department="department" v-bind="$attrs" />
</template>
