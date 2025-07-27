<template>
  <div class="login-view">
    <LoginComponent />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import LoginComponent from '@/components/login.vue'

// Asegurar que no haya scroll cuando estemos en la vista de login
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.login-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 1rem;
  box-sizing: border-box;
}
</style>
