<template>
  <div class="home-container">
    <header class="home-header">
      <h1>Youdemy</h1>
        <nav class="nav-desktop" aria-label="Navegación principal">
          <RouterLink to="/">Inicio</RouterLink>
          <RouterLink v-if="esProfesor()" to="/cursos">Gestión Cursos</RouterLink>
          <RouterLink v-if="esEstudiante()" to="/estudiante">Mis Cursos</RouterLink>
          <button @click="handleLogout" class="btn btn-logout">Cerrar sesión</button>
        </nav>      <!-- Menú hamburguesa para móvil -->
      <button class="menu-toggle" @click="toggleMobileMenu" :class="{ active: mobileMenuOpen }" aria-label="Abrir menú de navegación">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <!-- Menú móvil -->
      <nav class="nav-mobile" :class="{ active: mobileMenuOpen }" aria-label="Navegación móvil">
        <RouterLink to="/" @click="closeMobileMenu">Inicio</RouterLink>
        <RouterLink v-if="esProfesor()" to="/cursos" @click="closeMobileMenu">Gestión Cursos</RouterLink>
        <RouterLink v-if="esEstudiante()" to="/estudiante" @click="closeMobileMenu">Mis Cursos</RouterLink>
        <button @click="handleLogout" class="btn btn-logout">Cerrar sesión</button>
      </nav>
    </header>

    <main class="bienvenida">
      <div class="welcome-content">
        <h2>¡Bienvenido de vuelta, <span class="nombre-usuario">{{ usuarioNombre }}</span>!</h2>
        <p class="welcome-description">{{ mensajeBienvenida }}</p>
        <RouterLink v-if="esProfesor()" class="btn btn-primary" to="/cursos">Gestionar Cursos</RouterLink>
        <RouterLink v-if="esEstudiante()" class="btn btn-primary" to="/estudiante">Ver Mis Cursos</RouterLink>
      </div>
      
      <div class="stats-container">
        <div class="stats-card">
          <h3>{{ esProfesor() ? 'Panel de Profesor' : 'Tus Estadísticas' }}</h3>
          <div class="stats-grid">
            <div v-if="esEstudiante()" class="stat-item">
              <span class="stat-icon">📚</span>
              <span class="stat-label">Cursos inscritos:</span>
              <span class="stat-value">{{ cursosInscritos }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <span class="stat-label">{{ motivationalMessage }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerUsuarioActual, logout, esProfesor, esEstudiante } from '@/services/auth.js'
import { inscripcionesActualizadas, actualizarContadorInscripciones } from '@/services/events.js'

const router = useRouter()

// Referencias reactivas
const usuarioNombre = ref('Usuario')
const cursosInscritos = ref(0)
const mobileMenuOpen = ref(false)
const usuarioEmail = ref('')

// Computed para mensaje motivacional
const motivationalMessage = computed(() => {
  if (cursosInscritos.value === 0) {
    return '¡Comienza tu primer curso hoy!'
  }
  const plural = cursosInscritos.value > 1 ? 's' : ''
  return `¡Sigue aprendiendo! Tienes ${cursosInscritos.value} curso${plural} en progreso`
})

// Computed para mensaje de bienvenida según el rol
const mensajeBienvenida = computed(() => {
  if (esProfesor()) {
    return 'Gestiona tus cursos y ayuda a los estudiantes en su aprendizaje.'
  } else if (esEstudiante()) {
    return 'Explora nuestros cursos disponibles y comienza tu aprendizaje.'
  }
  return 'Bienvenido a Youdemy'
})

// Funciones
const loadUserData = () => {
  const usuario = obtenerUsuarioActual()
  
  if (usuario) {
    usuarioNombre.value = usuario.nombre
    usuarioEmail.value = usuario.correo
    
    // Solo cargar inscripciones si es estudiante
    if (esEstudiante()) {
      const inscripciones = JSON.parse(localStorage.getItem(`inscripciones_${usuarioEmail.value}`)) || []
      cursosInscritos.value = inscripciones.length
      actualizarContadorInscripciones(usuarioEmail.value)
    } else {
      cursosInscritos.value = 0
    }
  } else {
    // Si no hay usuario autenticado, redirigir al login
    router.push('/login')
  }
}

// Watcher para actualizar automáticamente cuando cambien las inscripciones
watch(inscripcionesActualizadas, (nuevoValor) => {
  cursosInscritos.value = nuevoValor
})

const handleLogout = async () => {
  const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?')
  if (confirmLogout) {
    const resultado = logout()
    if (resultado.success) {
      router.push('/login')
    }
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>

<style>
@import '@/styles/home.css';
</style>