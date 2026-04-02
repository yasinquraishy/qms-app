<script setup>
const conditions = defineModel('conditions', { type: Array, default: () => [] })

const conditionFieldOptions = [
  { label: 'Risk Level', value: 'risk_level' },
  { label: 'Impact Area', value: 'impact_area' },
  { label: 'Document Value', value: 'document_value' },
  { label: 'Department', value: 'department' },
  { label: 'Priority', value: 'priority' },
]

const conditionOperatorOptions = [
  { label: 'IS', value: 'IS' },
  { label: 'IS NOT', value: 'IS_NOT' },
  { label: 'CONTAINS', value: 'CONTAINS' },
  { label: 'GREATER THAN', value: 'GREATER_THAN' },
  { label: 'LESS THAN', value: 'LESS_THAN' },
]

const actionTypeOptions = [
  { label: 'Add Role', value: 'ADD_ROLE' },
  { label: 'Add User', value: 'ADD_USER' },
]

function addCondition() {
  conditions.value.push({
    conditionField: '',
    conditionOperator: 'IS',
    conditionValue: '',
    actionType: 'ADD_ROLE',
    actionRoleId: null,
    actionUserId: null,
  })
}

function removeCondition(index) {
  conditions.value.splice(index, 1)
}
</script>

<template>
  <div
    class="tw:bg-main-hover tw:border tw:border-dashed tw:border-divider tw:p-6 tw:rounded-2xl tw:space-y-4"
  >
    <!-- Condition Rows -->
    <div
      v-for="(condition, index) in conditions"
      :key="index"
      class="tw:flex tw:flex-wrap tw:items-center tw:gap-3"
    >
      <span class="tw:text-xs tw:font-bold tw:text-secondary">IF</span>

      <WSelect
        v-model="condition.conditionField"
        :options="conditionFieldOptions"
        optionLabel="label"
        optionValue="value"
        emitValue
        mapOptions
        dense
        placeholder="Select field"
        class="tw:w-40"
      />

      <WSelect
        v-model="condition.conditionOperator"
        :options="conditionOperatorOptions"
        optionLabel="label"
        optionValue="value"
        emitValue
        mapOptions
        dense
        class="tw:w-36"
      />

      <WInput v-model="condition.conditionValue" placeholder="Value" dense class="tw:w-32" />

      <span class="tw:text-xs tw:font-bold tw:text-secondary">THEN</span>

      <WSelect
        v-model="condition.actionType"
        :options="actionTypeOptions"
        optionLabel="label"
        optionValue="value"
        emitValue
        mapOptions
        dense
        class="tw:w-32"
      />

      <!-- Action Target - shows inline text for now, role/user selection handled by parent -->
      <div
        class="tw:flex tw:items-center tw:gap-2 tw:bg-primary/10 tw:text-primary tw:border tw:border-primary/20 tw:rounded-lg tw:px-3 tw:py-1 tw:text-xs tw:font-bold"
      >
        <span>{{ condition.actionType === 'ADD_ROLE' ? 'Role' : 'User' }}</span>
      </div>

      <button
        class="tw:ml-auto tw:text-secondary tw:hover:text-bad tw:transition-colors"
        @click="removeCondition(index)"
      >
        <WIcon icon="delete" size="20px" />
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="conditions.length === 0" class="tw:text-center tw:py-4 tw:text-sm tw:text-secondary">
      No conditions defined. Add a rule to conditionally assign approvers.
    </div>

    <!-- Add Button -->
    <button
      class="tw:text-xs tw:font-bold tw:text-primary tw:flex tw:items-center tw:gap-1 tw:hover:underline"
      @click="addCondition"
    >
      <WIcon icon="add" size="16px" />
      Add another logic rule
    </button>
  </div>
</template>
