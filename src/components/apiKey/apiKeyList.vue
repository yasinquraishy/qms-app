<script setup>
import { useQuasar } from 'quasar'

const emit = defineEmits(['create'])

const { apiKeys, loading, revokeApiKey, deleteApiKey } = useApiKeys()
const $q = useQuasar()

function handleRevoke(apiKey) {
  $q.dialog({
    title: 'Revoke API Key',
    message: `Are you sure you want to revoke "${apiKey.name}"? This key will no longer be able to authenticate requests.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await revokeApiKey(apiKey.id)
    if (result?.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'API key revoked successfully' })
    }
  })
}

function handleDelete(apiKey) {
  $q.dialog({
    title: 'Delete API Key',
    message: `Are you sure you want to delete "${apiKey.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteApiKey(apiKey.id)
    if (result?.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'API key deleted successfully' })
    }
  })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-2">
    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-12">
      <QSpinner color="primary" size="48px" />
    </div>

    <!-- Empty State -->
    <WEmptyState
      v-else-if="!apiKeys || apiKeys.length === 0"
      icon="sym_o_key"
      title="No API keys yet"
      description="Create an API key to get started."
      actionLabel="Create API Key"
      actionIcon="sym_o_add"
      compact
      @action="emit('create')"
    />

    <!-- Key Cards -->
    <ApiKeyListItem
      v-for="key in apiKeys"
      :key="key.id"
      :apiKey="key"
      @revoke="handleRevoke"
      @delete="handleDelete"
    />
  </div>
</template>
