<script setup>
const pageInfo = usePageInfo()
pageInfo.value = {
  showHeader: true,
}
</script>

<template>
  <WorkflowTemplatesIndex :id="$route.params.id" />
</template>
