<script setup>
const pageInfo = usePageInfo()
pageInfo.value = { showHeader: true }
</script>

<template>
  <NcWorkflowTemplatesIndex :id="$route.params.id" />
</template>
