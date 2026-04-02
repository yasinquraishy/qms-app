<script setup>
const color = defineModel({
  type: String,
  default: '#2563eb',
})
</script>

<template>
  <div class="cursor-pointer w-color-picker q-pa-xs">
    <div
      :style="{ backgroundColor: color, width: '100%', height: '100%', borderRadius: '2px' }"
    ></div>
    <QPopupProxy transitionShow="scale" transitionHide="scale">
      <QColor v-model="color" style="width: 300px" noHeaderTabs />
    </QPopupProxy>
  </div>
</template>

<style scoped>
.w-color-picker {
  width: 50px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.w-color-picker:hover {
  border-color: var(--q-primary);
  box-shadow:
    0 1px 5px rgba(0, 0, 0, 0.2),
    0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.w-color-picker:active {
  transform: scale(0.95);
  box-shadow: none;
}
</style>
