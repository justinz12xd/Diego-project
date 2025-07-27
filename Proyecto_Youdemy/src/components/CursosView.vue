<template>
  <div class="cursos-view">
    <header class="cursos-main-header">
      <h1>Cursos Disponibles</h1>
      <nav> 
        <button @click="handleLogout" class="btn btn-primary">Cerrar sesión</button>
      </nav>
    </header>

    <main>
      <div id="cursosContainer" class="cursos">
        <article 
          v-for="curso in cursos" 
          :key="curso.id" 
          class="curso"
        >
          <div class="curso-header">
            <h3 class="curso-titulo">{{ curso.titulo }}</h3>
            <button 
              class="btn-eliminar" 
              @click="eliminarCurso(curso.id)" 
              title="Eliminar curso"
            >
              🗑️
            </button>
          </div>
          <p class="curso-descripcion">{{ truncarTexto(curso.descripcion, 80) }}</p>
          <div class="imagen_curso">
            <img 
              :src="curso.imagen || generarImagenPlaceholder('Sin Imagen', '#cccccc')" 
              :alt="curso.titulo"
            >
            <span v-if="curso.videoUrl" class="video-badge">📹 Con video</span>
          </div>
          <RouterLink 
            :to="`/curso/${curso.id}`" 
            class="btn btn-primary curso-btn"
          >
            Ver más
          </RouterLink>
        </article>
      </div>
    </main>

    <footer class="footer">
      <button class="btn btn-success" @click="mostrarFormulario">Añadir curso</button>
    </footer>

    <div 
      v-if="mostrarForm" 
      id="formularioCurso" 
      class="modal-overlay"
      @click.self="cerrarFormulario"
    >
      <div class="formulario-curso modal-content">
        <button 
          type="button" 
          class="modal-close" 
          @click="cerrarFormulario"
        >
          ✕
        </button>
        
        <form @submit.prevent="agregarCurso">
          <h3>Nuevo curso</h3>
      
      <div class="form-group">
        <label for="titulo">Título del curso *</label>
        <input 
          id="titulo"
          v-model="formData.titulo" 
          type="text" 
          placeholder="Ej: Curso de React.js para Principiantes" 
          required
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción *</label>
        <textarea 
          id="descripcion"
          v-model="formData.descripcion" 
          placeholder="Describe qué aprenderán los estudiantes en este curso..." 
          rows="3"
          required
          class="form-control"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="imagen">Imagen del curso</label>
        <div class="imagen-options">
          <div class="upload-option">
            <label for="imagen-file" class="upload-label">
              📁 Subir imagen desde tu computadora
            </label>
            <input 
              id="imagen-file"
              type="file" 
              accept="image/*"
              @change="handleImageUpload"
              class="file-input"
            >
            <small class="file-help">Formatos: JPG, PNG, GIF (máx. 5MB)</small>
          </div>
          
          <div class="divider">
            <span>O</span>
          </div>
          
        </div>
        
        <!-- Vista previa de la imagen -->
        <div v-if="imagenPreview" class="imagen-preview">
          <p><strong>Vista previa:</strong></p>
          <img :src="imagenPreview" alt="Vista previa" class="preview-img">
          <button type="button" @click="limpiarImagen" class="btn-limpiar">❌ Quitar imagen</button>
        </div>
      </div>

      <div class="form-group">
        <label for="videoUrl">URL del video de YouTube</label>
        <input 
          id="videoUrl"
          v-model="formData.videoUrl" 
          type="url" 
          placeholder="https://www.youtube.com/watch?v=..."
          class="form-control input-youtube"
        >
        <div class="youtube-tips">
          <p><strong>💡 Tips para YouTube:</strong></p>
          <ul>
            <li>Copia la URL directamente desde YouTube</li>
            <li>Funciona con youtu.be y youtube.com</li>
            <li>Ejemplo: https://www.youtube.com/watch?v=abc123</li>
          </ul>
        </div>
      </div>

      <div class="form-group">
        <label for="contenido">Contenido del curso *</label>
        <textarea 
          id="contenido"
          v-model="formData.contenido" 
          placeholder="Separar cada tema con coma. Ej: Introducción, Variables, Funciones, Proyectos prácticos" 
          rows="4" 
          required
          class="form-control"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Guardar Curso</button>
        <button type="button" @click="cerrarFormulario" class="btn btn-secondary">Cancelar</button>
      </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import router from '@/router'
import { logout } from '@/services/auth'

// Variables reactivas
const cursos = ref([])
const mostrarForm = ref(false)
const imagenPreview = ref('')
const formData = ref({
  titulo: '',
  descripcion: '',
  imagen: '',
  videoUrl: '',
  contenido: ''
})

// Watch para actualizar vista previa cuando cambia la URL de imagen
watch(() => formData.value.imagen, (newValue) => {
  if (newValue && (newValue.startsWith('http') || newValue.startsWith('data:'))) {
    imagenPreview.value = newValue
  } else if (!newValue) {
    imagenPreview.value = ''
  }
})


// Función para truncar texto
const truncarTexto = (texto, maxLength = 80) => {
  if (texto.length <= maxLength) return texto
  return texto.substring(0, maxLength).trim() + '...'
}

// Función para generar imagen placeholder
const generarImagenPlaceholder = (texto, color) => {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 250
  const ctx = canvas.getContext('2d')
  
  // Fondo de color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 400, 250)
  
  // Texto
  ctx.fillStyle = 'white'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(texto, 200, 125)
  
  return canvas.toDataURL('image/png')
}

// Inicializar cursos por defecto si no existen
const inicializarCursos = () => {
  const cursosExistentes = JSON.parse(localStorage.getItem('cursos'))
  
  if (!cursosExistentes || cursosExistentes.length === 0) {
    const cursosDefault = [
      {
        id: 1,
        titulo: "Curso de HTML Básico",
        descripcion: "Aprende a crear páginas web con HTML desde cero. Domina las etiquetas fundamentales, estructura de documentos y mejores prácticas para el desarrollo web moderno.",
        imagen: generarImagenPlaceholder('HTML Básico', '#e74c3c'),
        videoUrl: "https://www.youtube.com/watch?v=kN1XP-Bef7w",
        contenido: ["Introducción a HTML y CSS", "Etiquetas básicas y semántica", "Formularios y tablas", "Estructura de documentos", "Mejores prácticas", "Accesibilidad web"]
      },
      {
        id: 2,
        titulo: "Curso de CSS Moderno",
        descripcion: "Domina el diseño web con estilos atractivos y modernos. Aprende Flexbox, Grid, animaciones y responsive design para crear interfaces profesionales y atractivas.",
        imagen: generarImagenPlaceholder('CSS Moderno', '#3498db'),
        videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
        contenido: ["Selectores CSS avanzados", "Flexbox y CSS Grid", "Animaciones y transiciones", "Responsive Design", "Variables CSS y custom properties", "Metodologías CSS (BEM, OOCSS)"]
      },
      {
        id: 3,
        titulo: "JavaScript Fundamentals",
        descripcion: "Aprende los fundamentos de JavaScript, el lenguaje de programación más popular del mundo. Desde variables hasta programación orientada a objetos.",
        imagen: generarImagenPlaceholder('JavaScript', '#f39c12'),
        videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
        contenido: ["Variables y tipos de datos", "Funciones y scope", "DOM manipulation", "Eventos", "Programación asíncrona", "ES6+ características"]
      },
      {
        id: 4,
        titulo: "Vue.js para Principiantes",
        descripcion: "Descubre Vue.js, el framework progresivo de JavaScript. Aprende a crear aplicaciones web interactivas y dinámicas con una de las herramientas más populares.",
        imagen: generarImagenPlaceholder('Vue.js', '#2ecc71'),
        videoUrl: "https://www.youtube.com/watch?v=qZXt1Aom3Cs",
        contenido: ["Introducción a Vue.js", "Componentes y props", "Directivas", "Vue Router", "Vuex/Pinia", "Composition API"]
      }
    ]
    localStorage.setItem('cursos', JSON.stringify(cursosDefault))
  }
}

// Mostrar todos los cursos
const mostrarCursos = () => {
  const cursosData = JSON.parse(localStorage.getItem('cursos')) || []
  cursos.value = cursosData
}

const mostrarFormulario = () => {
  mostrarForm.value = true
}

const cerrarFormulario = () => {
  mostrarForm.value = false
  imagenPreview.value = ''
  // Limpiar formulario
  formData.value = {
    titulo: '',
    descripcion: '',
    imagen: '',
    videoUrl: '',
    contenido: ''
  }
  // Limpiar el input de archivo
  const fileInput = document.getElementById('imagen-file')
  if (fileInput) fileInput.value = ''
}

const setImagenEjemplo = (url) => {
  formData.value.imagen = url
  imagenPreview.value = url
}

// Función para manejar la subida de archivos
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido')
    return
  }

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es muy grande. El tamaño máximo es 5MB.')
    return
  }

  // Convertir a base64 para almacenar localmente
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageDataUrl = e.target.result
    formData.value.imagen = imageDataUrl
    imagenPreview.value = imageDataUrl
  }
  reader.readAsDataURL(file)
}

// Función para limpiar la imagen seleccionada
const limpiarImagen = () => {
  formData.value.imagen = ''
  imagenPreview.value = ''
  // Limpiar el input de archivo
  const fileInput = document.getElementById('imagen-file')
  if (fileInput) fileInput.value = ''
}

const validarUrlYoutube = (url) => {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return regex.test(url)
}

const agregarCurso = () => {
  const { titulo, descripcion, imagen, videoUrl, contenido } = formData.value

  if (!titulo || !descripcion || !contenido) {
    alert('Por favor completa todos los campos obligatorios.')
    return
  }

  // Validar URL de YouTube si se proporciona
  if (videoUrl && !validarUrlYoutube(videoUrl)) {
    alert('Por favor ingresa una URL válida de YouTube')
    return
  }

  const nuevoCurso = {
    id: Date.now(),
    titulo,
    descripcion,
    imagen: imagen || generarImagenPlaceholder('Nuevo Curso', '#6c757d'),
    videoUrl: videoUrl || null,
    contenido: contenido.split(',').map(item => item.trim()).filter(item => item.length > 0)
  }

  const cursosData = JSON.parse(localStorage.getItem('cursos')) || []
  cursosData.push(nuevoCurso)
  localStorage.setItem('cursos', JSON.stringify(cursosData))

  alert('Curso agregado exitosamente')
  cerrarFormulario()
  mostrarCursos()
}

const eliminarCurso = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este curso?\n\nEsta acción no se puede deshacer.')) {
    let cursosData = JSON.parse(localStorage.getItem('cursos')) || []
    const cursoAEliminar = cursosData.find(curso => curso.id === id)
    
    if (cursoAEliminar) {
      // Eliminar el curso del array
      cursosData = cursosData.filter(curso => curso.id !== id)
      localStorage.setItem('cursos', JSON.stringify(cursosData))
      
      // También eliminar las inscripciones relacionadas con este curso
      eliminarInscripcionesCurso(id)
      
      alert(`Curso "${cursoAEliminar.titulo}" eliminado exitosamente`)
      mostrarCursos()
    } else {
      alert('Error: Curso no encontrado')
    }
  }
}

const eliminarInscripcionesCurso = (cursoId) => {
  // Obtener todas las claves del localStorage que contengan inscripciones
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('inscripciones_')) {
      let inscripciones = JSON.parse(localStorage.getItem(key)) || []
      // Filtrar las inscripciones para eliminar las del curso eliminado
      inscripciones = inscripciones.filter(id => id !== cursoId)
      localStorage.setItem(key, JSON.stringify(inscripciones))
    }
  })
}

const handleLogout = async () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    await logout()
    router.push('/login')
  }
}

// Ejecutar al montar el componente
onMounted(() => {
  inicializarCursos()
  mostrarCursos()
})
</script>

<style scoped>
/* Componente CursosView usa completamente el sistema CSS modular */
/* Todos los estilos están definidos en /src/styles/components/cursos-view.css */
</style>
