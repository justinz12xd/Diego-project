<template>
  <div class="home-view">
    <HomeComponent />
  </div>
</template>

<script setup>
import HomeComponent from '@/components/home.vue'
</script>

<style scoped>
/* Asegurar que la vista ocupe todo el espacio disponible */
.home-view {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
}
</style>
