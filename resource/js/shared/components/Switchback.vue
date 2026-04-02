<script setup>
defineOptions({
  name: 'AppSwitchback',
})
import { ref } from 'vue'
import { useLoginStore } from '@/stores/account'
import { Cache } from '@/cache'

const accountStore = useLoginStore()
const pageLoader = ref(false)

const redirectToParent = async () => {
  try {
    pageLoader.value = true

    const err = await accountStore.switchbackAccount(Cache.redirectGuid)
    // Assuming switchbackAccount returns undefined/null on success
    if (!err) {
      window.location.href = '/app/'
    } else {
      pageLoader.value = false
    }
  } catch (error) {
    pageLoader.value = false
    console.error('Error switching back account:', error)
  }
}
</script>

<template>
  <WBtn color="primary" tonal @click="redirectToParent"> Switch Back </WBtn>
</template>

<style lang="scss">
.notification-section {
  padding: 24px !important; // Converting to Quasar's spacing system
}
</style>
