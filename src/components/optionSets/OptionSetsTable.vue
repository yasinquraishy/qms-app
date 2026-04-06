<script setup>
import { useOptionSets } from '@/composables/useOptionSets.js'
import { isAllowed } from '@/utils/currentSession.js'
import { useQuasar } from 'quasar'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { deleteOptionSet } = useOptionSets()

const canUpdateOptionSet = computed(() => isAllowed(['optionSets:update']))
const canDeleteOptionSet = computed(() => isAllowed(['optionSets:delete']))

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'optionsCount', label: 'Options', field: 'optionsCount', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

function handleRowClick(evt, row) {
  router.push({ params: { ...route.params, id: row.id } })
}

function onEdit(row) {
  router.push({ params: { ...route.params, id: row.id } })
}

function confirmDelete(row) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete the option set "${row.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteOptionSet(row.id)
  })
}
</script>

<template>
  <WTable
    :rows="rows"
    :columns="columns"
    :loading="loading"
    rowKey="id"
    class="tw:rounded-lg"
    hideTop
    @rowClick="handleRowClick"
  >
    <template #body-cell-optionsCount="props">
      <QTd :props="props">
        <QBadge color="blue-1" textColor="blue-7" class="tw:px-2 tw:py-1 tw:font-bold" rounded>
          {{ props.value || 0 }}
        </QBadge>
      </QTd>
    </template>

    <template #body-cell-actions="props">
      <QTd :props="props">
        <div v-if="canUpdateOptionSet || canDeleteOptionSet" class="tw:flex tw:justify-end">
          <WBtn flat round dense color="grey-6" icon="more_vert" @click.prevent.stop>
            <QMenu>
              <QList dense style="min-width: 140px">
                <QItem v-if="canUpdateOptionSet" v-close-popup clickable @click="onEdit(props.row)">
                  <QItemSection>
                    <div class="tw:flex tw:items-center tw:gap-2">
                      <WIcon name="edit" size="20px" color="primary" />
                      <div>Edit</div>
                    </div>
                  </QItemSection>
                </QItem>

                <QItem
                  v-if="canDeleteOptionSet"
                  v-close-popup
                  clickable
                  class="tw:text-bad"
                  @click="confirmDelete(props.row)"
                >
                  <QItemSection>
                    <div class="tw:flex tw:items-center tw:gap-2">
                      <WIcon name="delete" size="20px" />
                      <div>Delete</div>
                    </div>
                  </QItemSection>
                </QItem>
              </QList>
            </QMenu>
          </WBtn>
        </div>
      </QTd>
    </template>
  </WTable>
</template>

<style scoped></style>
