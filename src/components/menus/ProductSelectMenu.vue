<script setup>
defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

const modelValue = defineModel({
  type: [String, Array, null],
  default: null,
})

const products = useLiveQuery(async (db) => db.Product.where().exec(), { initial: [] })

function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}
</script>

<template>
  <BaseSelectMenu v-model="modelValue" :items="products" :required="required" :multiple="multiple">
    <template #button="scope">
      <slot name="button" v-bind="scope">
        <!-- MULTIPLE MODE -->
        <template v-if="multiple">
          <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
            <ProductBadgeById
              v-for="id in getArray()"
              :key="id"
              :productId="id"
              :clearable="!required || getArray().length > 1"
              @clear="() => scope.clear(id)"
            />
          </div>

          <BaseBadge v-else selectable>Select Products</BaseBadge>
        </template>

        <!-- SINGLE MODE -->
        <template v-else>
          <ProductBadgeById
            v-if="modelValue"
            :productId="modelValue"
            :clearable="!required"
            selectable
            @clear="() => scope.clear(modelValue)"
          />
          <BaseBadge v-else selectable>Select Product</BaseBadge>
        </template>
      </slot>
    </template>
  </BaseSelectMenu>
</template>
