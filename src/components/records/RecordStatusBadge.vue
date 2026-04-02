<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const statusConfig = {
  DRAFT: {
    color: 'grey-3',
    textColor: 'grey-9',
    icon: 'edit',
    label: 'Draft',
  },
  APPROVED: {
    color: 'positive',
    textColor: 'white',
    icon: 'check_circle',
    label: 'Approved',
  },
  DELETED: {
    color: 'negative',
    textColor: 'white',
    icon: 'delete',
    label: 'Deleted',
  },
}

const config = computed(() => statusConfig[props.status] || statusConfig.DRAFT)
</script>

<template>
  <QBadge
    :color="config.color"
    :textColor="config.textColor"
    class="tw:py-1.5! tw:px-2! tw:rounded-2xl!"
  >
    <template #default>
      <div class="tw:flex tw:items-center tw:gap-1">
        <QIcon :name="config.icon" size="14px" />
        <span>{{ config.label }}</span>
      </div>
    </template>
  </QBadge>
</template>
