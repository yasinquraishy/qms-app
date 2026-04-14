<script setup>
const props = defineProps({
  typeId: { type: String, default: null },
})

const type = useLiveQueryWithDeps(
  [() => props.typeId],
  async (db, [typeId]) => {
    if (!typeId) return null
    return db.AssetRequestType.findByPk(typeId)
  },
  { initial: { id: props.typeId } },
)
</script>

<template>
  <AssetRequestTypeBadge v-if="typeId" :type="type" v-bind="$attrs" />
</template>
