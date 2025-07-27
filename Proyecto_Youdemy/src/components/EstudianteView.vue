<template>
  <div class="estudiante-view">
    <header class="estudiante-header">
      <div class="header-content">
        <h1>🎓 Mis Cursos</h1>
        <nav>
          <button @click="handleLogout" class="btn btn-danger">Cerrar sesión</button>
        </nav>
      </div>
    </header>

    <main class="estudiante-content">
      <!-- Pestañas de navegación -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'disponibles' }]"
          @click="activeTab = 'disponibles'"
        >
          Cursos Disponibles
        </button>
        <button 
          :class="['tab', { active: activeTab === 'inscritos' }]"
          @click="activeTab = 'inscritos'"
        >
          Mis Inscripciones ({{ cursosInscritosList.length }})
        </button>
      </div>

      <!-- Contenido de las pestañas -->
      <div class="tab-content">
        <!-- Tab: Cursos Disponibles -->
        <div v-if="activeTab === 'disponibles'" class="cursos-grid">
          <div 
            v-for="curso in cursosDisponibles" 
            :key="curso.id" 
            class="curso-card"
          >
            <img 
              :src="curso.imagen || 'https://via.placeholder.com/300x200'" 
              :alt="curso.titulo"
              class="curso-imagen"
            >
            <div class="curso-info">
              <h3>{{ curso.titulo }}</h3>
              <p>{{ truncarTexto(curso.descripcion, 100) }}</p>
              <div class="curso-actions">
                <RouterLink 
                  :to="`/curso/${curso.id}`" 
                  class="btn btn-secondary"
                >
                  Ver detalles
                </RouterLink>
                <button 
                  v-if="!estaInscrito(curso.id)"
                  @click="inscribirseACurso(curso.id)"
                  class="btn btn-primary"
                >
                  Inscribirse
                </button>
                <span v-else class="inscrito-badge">✓ Inscrito</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Mis Inscripciones -->
        <div v-if="activeTab === 'inscritos'" class="inscritos-container">
          <div v-if="cursosInscritosList.length === 0" class="empty-state">
            <h3>📖 No tienes cursos inscritos</h3>
            <p>Explora los cursos disponibles y comienza tu aprendizaje</p>
            <button @click="activeTab = 'disponibles'" class="btn btn-primary">
              Ver cursos disponibles
            </button>
          </div>
          
          <div v-else class="cursos-inscritos">
            <div 
              v-for="curso in cursosInscritosList" 
              :key="curso.id" 
              class="curso-inscrito"
            >
              <div class="curso-header">
                <img 
                  :src="curso.imagen || 'https://via.placeholder.com/100x60'" 
                  :alt="curso.titulo"
                  class="curso-mini-imagen"
                >
                <div class="curso-title-info">
                  <h3>{{ curso.titulo }}</h3>
                  <p>{{ truncarTexto(curso.descripcion, 80) }}</p>
                </div>
              </div>
              
              <div class="curso-tareas">
                <h4>📋 Subir Tarea</h4>
                <div class="upload-section">
                  <input 
                    type="file" 
                    :id="`tarea-${curso.id}`"
                    accept=".pdf"
                    @change="(event) => handleFileUpload(event, curso.id)"
                    class="file-input"
                  >
                  <label :for="`tarea-${curso.id}`" class="file-label">
                    📄 Seleccionar PDF
                  </label>
                </div>
                
                <!-- Lista de tareas subidas -->
                <div v-if="obtenerTareas(curso.id).length > 0" class="tareas-subidas">
                  <h5>Tareas subidas:</h5>
                  <div 
                    v-for="(tarea, index) in obtenerTareas(curso.id)" 
                    :key="index"
                    class="tarea-item"
                  >
                    <span class="tarea-nombre">{{ tarea.nombre }}</span>
                    <span class="tarea-fecha">{{ formatearFecha(tarea.fecha) }}</span>
                    <button 
                      @click="eliminarTarea(curso.id, index)"
                      class="btn-eliminar-tarea"
                      title="Eliminar tarea"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div class="curso-actions">
                <RouterLink 
                  :to="`/curso/${curso.id}`" 
                  class="btn btn-secondary"
                >
                  Ver detalles
                </RouterLink>
                <button 
                  @click="desinscribirseDelCurso(curso.id)"
                  class="btn btn-danger"
                >
                  Desinscribirse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerUsuarioActual, logout } from '@/services/auth'
import { notificarCambioInscripcion } from '@/services/events'

const router = useRouter()

// Referencias reactivas
const activeTab = ref('disponibles')
const cursos = ref([])
const inscripciones = ref([])
const usuario = ref(null)

// Computed properties
const cursosDisponibles = computed(() => cursos.value)
const cursosInscritosList = computed(() => {
  return cursos.value.filter(curso => inscripciones.value.includes(curso.id))
})

// Funciones
const cargarDatos = () => {
  usuario.value = obtenerUsuarioActual()
  if (!usuario.value) {
    router.push('/login')
    return
  }
  
  // Cargar cursos
  cursos.value = JSON.parse(localStorage.getItem('cursos')) || []
  
  // Cargar inscripciones del usuario
  inscripciones.value = JSON.parse(localStorage.getItem(`inscripciones_${usuario.value.correo}`)) || []
}

const truncarTexto = (texto, limite) => {
  if (texto.length <= limite) return texto
  return texto.substring(0, limite) + '...'
}

const estaInscrito = (cursoId) => {
  return inscripciones.value.includes(cursoId)
}

const inscribirseACurso = (cursoId) => {
  if (!estaInscrito(cursoId)) {
    inscripciones.value.push(cursoId)
    localStorage.setItem(`inscripciones_${usuario.value.correo}`, JSON.stringify(inscripciones.value))
    notificarCambioInscripcion(usuario.value.correo)
    alert('¡Te has inscrito al curso exitosamente!')
  }
}

const desinscribirseDelCurso = (cursoId) => {
  const confirmacion = confirm('¿Estás seguro de que quieres desinscribirte de este curso?')
  if (confirmacion) {
    inscripciones.value = inscripciones.value.filter(id => id !== cursoId)
    localStorage.setItem(`inscripciones_${usuario.value.correo}`, JSON.stringify(inscripciones.value))
    notificarCambioInscripcion(usuario.value.correo)
    
    // También eliminar tareas asociadas
    localStorage.removeItem(`tareas_${usuario.value.correo}_${cursoId}`)
    alert('Te has desinscrito del curso')
  }
}

const handleFileUpload = (event, cursoId) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (file.type !== 'application/pdf') {
    alert('Solo se permiten archivos PDF')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB límite
    alert('El archivo es demasiado grande. Máximo 10MB.')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const tarea = {
      nombre: file.name,
      fecha: new Date().toISOString(),
      contenido: e.target.result, // Base64
      tamaño: file.size
    }
    
    // Guardar tarea
    const tareasKey = `tareas_${usuario.value.correo}_${cursoId}`
    const tareasExistentes = JSON.parse(localStorage.getItem(tareasKey)) || []
    tareasExistentes.push(tarea)
    localStorage.setItem(tareasKey, JSON.stringify(tareasExistentes))
    
    alert('Tarea subida exitosamente')
    event.target.value = '' // Limpiar input
  }
  
  reader.readAsDataURL(file)
}

const obtenerTareas = (cursoId) => {
  const tareasKey = `tareas_${usuario.value.correo}_${cursoId}`
  return JSON.parse(localStorage.getItem(tareasKey)) || []
}

const eliminarTarea = (cursoId, tareaIndex) => {
  const confirmacion = confirm('¿Estás seguro de que quieres eliminar esta tarea?')
  if (confirmacion) {
    const tareasKey = `tareas_${usuario.value.correo}_${cursoId}`
    const tareas = JSON.parse(localStorage.getItem(tareasKey)) || []
    tareas.splice(tareaIndex, 1)
    localStorage.setItem(tareasKey, JSON.stringify(tareas))
    alert('Tarea eliminada')
  }
}

const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleLogout = async () => {
  const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?')
  if (confirmLogout) {
    const resultado = logout()
    if (resultado.success) {
      router.push('/login')
    }
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
/* Componente EstudianteView usa completamente el sistema CSS modular */
/* Todos los estilos están definidos en /src/styles/components/estudiante-view.css */
</style>
