<template>
  <router-view />
</template>
<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

onMounted(() => {
  useAuthStore().checkLogin()
})
</script>
<style>
body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
#app { min-height: 100vh; }
</style>
