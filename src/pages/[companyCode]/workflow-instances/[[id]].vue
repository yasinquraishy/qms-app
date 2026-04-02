<script setup>
const pageInfo = usePageInfo()
pageInfo.value = {
  showHeader: true,
}
</script>

<template>
  <ApprovalWorkflowInstanceIndex :id="$route.params.id" />
</template>
