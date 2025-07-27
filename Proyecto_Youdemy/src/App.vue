<template>
  <router-view></router-view>
</template>

<style>
/* Reset global para asegurar que las vistas ocupen todo el espacio */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  position: relative;
}

#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
}

/* Eliminar cualquier espacio en blanco específico */
.home-view {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>