<script setup>
const pageInfo = usePageInfo()
pageInfo.value = {
  showHeader: true,
}
</script>

<template>
  <ApprovalWorkflowsIndex :id="$route.params.id" />
</template>
