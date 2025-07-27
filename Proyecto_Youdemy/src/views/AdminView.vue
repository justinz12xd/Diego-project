<template>
  <div class="admin-view">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <h1>Panel de Administración</h1>
        <div class="header-actions">
          <button @click="handleLogout" class="btn btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="admin-main">
      <div class="admin-container">
        <!-- Add Course Button -->
        <div class="actions-bar">
          <button @click="activeSection = 'assignments'" 
                  :class="['btn', activeSection === 'assignments' ? 'btn-primary' : 'btn-secondary']">
            📋 Ver Tareas
          </button>
          <button @click="activeSection = 'courses'" 
                  :class="['btn', activeSection === 'courses' ? 'btn-primary' : 'btn-secondary']">
            📚 Gestionar Cursos
          </button>
          <button @click="openCreateModal" class="btn btn-primary" v-if="activeSection === 'courses'">
            + Crear Nuevo Curso
          </button>
        </div>

        <!-- Assignments Section -->
        <div v-if="activeSection === 'assignments'" class="assignments-section">
          <div class="section-header">
            <h2>📋 Tareas Subidas por Estudiantes</h2>
            <p>Revisa y gestiona las tareas enviadas por los estudiantes</p>
          </div>

          <div v-if="assignments.length" class="assignments-grid">
            <div 
              v-for="assignment in assignments" 
              :key="assignment.id"
              class="assignment-card"
            >
              <div class="assignment-header">
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <span class="assignment-course">{{ assignment.courseName }}</span>
              </div>
              
              <div class="assignment-content">
                <div class="student-info">
                  <p><strong>👤 Estudiante:</strong> {{ assignment.studentName }}</p>
                  <p><strong>📧 Email:</strong> {{ assignment.studentId }}</p>
                  <p><strong>📅 Fecha:</strong> {{ formatDate(assignment.uploadDate) }}</p>
                </div>
                
                <div v-if="assignment.description" class="assignment-description">
                  <p><strong>📝 Descripción:</strong></p>
                  <p>{{ assignment.description }}</p>
                </div>
                
                <div class="file-info">
                  <div class="file-details">
                    <span class="file-icon">📄</span>
                    <div>
                      <p class="file-name">{{ assignment.fileName }}</p>
                      <p class="file-size">{{ formatFileSize(assignment.fileSize) }}</p>
                    </div>
                  </div>
                  <button @click="downloadAssignment(assignment)" class="btn btn-download">
                    💾 Descargar PDF
                  </button>
                </div>
              </div>
              
              <div class="assignment-actions">
                <button @click="deleteAssignment(assignment.id)" class="btn btn-delete-assignment">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No hay tareas subidas</h3>
            <p>Los estudiantes aún no han enviado tareas</p>
          </div>
        </div>

        <!-- Courses Section -->
        <div v-if="activeSection === 'courses'">
        <!-- Courses Grid -->
        <div class="courses-grid">
          <div 
            v-for="course in courses" 
            :key="course.id"
            class="course-card"
          >
            <div class="course-image">
              <img :src="course.image || defaultImage" :alt="course.title">
              <div class="course-actions">
                <button @click="editCourse(course)" class="btn-edit">✏️</button>
                <button @click="deleteCourse(course.id)" class="btn-delete">🗑️</button>
              </div>
            </div>
            <div class="course-content">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-description">{{ course.description }}</p>
              <div class="course-meta">
                <span class="students-count">👥 {{ getStudentCount(course.id) }} estudiantes</span>
                <span class="course-status" :class="course.status">{{ course.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="courses.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>No hay cursos creados</h3>
          <p>Comienza creando tu primer curso</p>
          <button @click="openCreateModal" class="btn btn-primary">
            Crear Primer Curso
          </button>
        </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit Course Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Curso' : 'Crear Nuevo Curso' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        
        <form @submit.prevent="saveCourse" class="course-form">
          <div class="form-group">
            <label for="title">Título del Curso</label>
            <input 
              id="title"
              v-model="courseForm.title" 
              type="text" 
              required
              placeholder="Ej: Introducción a Vue.js"
            >
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea 
              id="description"
              v-model="courseForm.description" 
              required
              rows="3"
              placeholder="Describe qué aprenderán los estudiantes..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="image">Imagen del Curso</label>
            <div class="file-upload-section">
              <input 
                id="image"
                type="file" 
                accept="image/*"
                @change="handleImageUpload"
                class="file-input"
                ref="fileInput"
              >
              <label for="image" class="file-upload-label">
                📁 Seleccionar imagen desde tu computadora
              </label>
              <small class="file-help">Formatos: JPG, PNG, GIF (máx. 5MB)</small>
              
              <!-- Vista previa de la imagen -->
              <div v-if="imagePreview" class="image-preview">
                <p><strong>Vista previa:</strong></p>
                <img :src="imagePreview" alt="Vista previa" class="preview-image">
                <button type="button" @click="clearImage" class="btn-clear-image">
                  ❌ Quitar imagen
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="video">URL del Video (YouTube)</label>
            <input 
              id="video"
              v-model="courseForm.videoUrl" 
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
            >
          </div>

          <div class="form-group">
            <label for="content">Contenido del Curso</label>
            <textarea 
              id="content"
              v-model="courseForm.content" 
              required
              rows="4"
              placeholder="Tema 1, Tema 2, Tema 3..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Actualizar' : 'Crear' }} Curso
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/services/auth'

const router = useRouter()

// Reactive data
const courses = ref([])
const assignments = ref([])
const activeSection = ref('courses')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const imagePreview = ref('')
const fileInput = ref(null)

const courseForm = ref({
  title: '',
  description: '',
  image: '',
  videoUrl: '',
  content: '',
  status: 'activo'
})

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjM2NmYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q3Vyc288L3RleHQ+PC9zdmc+'

// Load assignments from localStorage
const loadAssignments = () => {
  const storedAssignments = localStorage.getItem('assignments')
  if (storedAssignments) {
    assignments.value = JSON.parse(storedAssignments)
  }
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Download assignment
const downloadAssignment = (assignment) => {
  try {
    // Crear un blob del archivo PDF
    const byteCharacters = atob(assignment.fileData.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = assignment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading file:', error)
    alert('Error al descargar el archivo')
  }
}

// Delete assignment
const deleteAssignment = (assignmentId) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    assignments.value = assignments.value.filter(a => a.id !== assignmentId)
    localStorage.setItem('assignments', JSON.stringify(assignments.value))
  }
}

// Load courses from localStorage
const loadCourses = () => {
  console.log('🔄 Cargando cursos...')
  
  // Siempre inicializar con cursos de ejemplo por ahora
  initializeSampleCourses()
  
  console.log('✅ Cursos cargados:', courses.value.length)
}

// Initialize sample courses
const initializeSampleCourses = () => {
  const sampleCourses = [
    {
      id: 1,
      title: 'HTML & CSS Fundamentals',
      description: 'Aprende los fundamentos del desarrollo web con HTML y CSS desde cero.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTc0YzNjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SFRNTCAmYW1wOyBDU1M8L3RleHQ+PC9zdmc+',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      content: 'Introducción a HTML, Etiquetas básicas, CSS básico, Responsive design',
      status: 'activo'
    },
    {
      id: 2,
      title: 'JavaScript Moderno',
      description: 'Domina JavaScript ES6+ y las mejores prácticas de programación.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjM5YzEyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SmF2YVNjcmlwdDwvdGV4dD48L3N2Zz4=',
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      content: 'Variables y funciones, DOM manipulation, Async/await, Módulos ES6',
      status: 'activo'
    },
    {
      id: 3,
      title: 'Vue.js 3 Composition API',
      description: 'Crea aplicaciones web modernas con Vue.js 3 y Composition API.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmVjYzcxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VnVlLmpzPC90ZXh0Pjwvc3ZnPg==',
      videoUrl: 'https://www.youtube.com/watch?v=example3',
      content: 'Setup de Vue, Composition API, Componentes, Router, Estado global',
      status: 'activo'
    }
  ]
  
  console.log('📚 Inicializando cursos de ejemplo...')
  console.log('Cursos creados:', sampleCourses)
  
  // Asignar a la variable reactiva
  courses.value = sampleCourses
  
  // Guardar en localStorage
  localStorage.setItem('cursos', JSON.stringify(sampleCourses))
  
  console.log('✅ Cursos guardados exitosamente!')
  console.log('📊 Total de cursos en courses.value:', courses.value.length)
}

// Get student count for a course
const getStudentCount = (courseId) => {
  // Count students enrolled in this course
  let count = 0
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('inscripciones_')) {
      const enrollments = JSON.parse(localStorage.getItem(key)) || []
      if (enrollments.includes(courseId)) count++
    }
  })
  return count
}

// Modal functions
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  imagePreview.value = ''
  courseForm.value = {
    title: '',
    description: '',
    image: '',
    videoUrl: '',
    content: '',
    status: 'activo'
  }
  showModal.value = true
}

const editCourse = (course) => {
  isEditing.value = true
  editingId.value = course.id
  courseForm.value = { ...course }
  // Mostrar imagen actual si existe
  if (course.image) {
    imagePreview.value = course.image
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
  imagePreview.value = ''
  // Limpiar el input de archivo
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Handle file upload
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
    courseForm.value.image = imageDataUrl
    imagePreview.value = imageDataUrl
  }
  reader.readAsDataURL(file)
}

// Clear selected image
const clearImage = () => {
  courseForm.value.image = ''
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Generate placeholder image
const generatePlaceholderImage = (text, color) => {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 250
  const ctx = canvas.getContext('2d')
  
  // Background color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 400, 250)
  
  // Text
  ctx.fillStyle = 'white'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 200, 125)
  
  return canvas.toDataURL('image/png')
}

// Save course
const saveCourse = () => {
  const courseData = {
    ...courseForm.value,
    id: isEditing.value ? editingId.value : Date.now(),
    // Usar placeholder si no hay imagen
    image: courseForm.value.image || generatePlaceholderImage(courseForm.value.title || 'Nuevo Curso', '#6366f1')
  }

  if (isEditing.value) {
    const index = courses.value.findIndex(c => c.id === editingId.value)
    if (index !== -1) {
      courses.value[index] = courseData
    }
  } else {
    courses.value.push(courseData)
  }

  localStorage.setItem('cursos', JSON.stringify(courses.value))
  closeModal()
}

// Delete course
const deleteCourse = (courseId) => {
  if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
    courses.value = courses.value.filter(c => c.id !== courseId)
    localStorage.setItem('cursos', JSON.stringify(courses.value))
    
    // Remove enrollments for this course
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('inscripciones_')) {
        let enrollments = JSON.parse(localStorage.getItem(key)) || []
        enrollments = enrollments.filter(id => id !== courseId)
        localStorage.setItem(key, JSON.stringify(enrollments))
      }
    })
  }
}

// Logout
const handleLogout = async () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    await logout()
    router.push('/login')
  }
}

// Initialize
onMounted(() => {
  // Forzar limpieza y regeneración de cursos
  localStorage.removeItem('cursos')
  loadCourses()
  loadAssignments()
})
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  background: rgb(227, 227, 227);
}

.admin-header {
  background: rgba(52, 52, 52, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  gap: 0.5rem;
}

.admin-main {
  padding: 2rem 0;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.course-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .course-actions {
  opacity: 1;
}

.btn-edit, .btn-delete {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-edit {
  background: red;
  color: white;
}

.btn-edit:hover {
  background: rgb(185, 1, 1);
  transform: scale(1.1);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.btn-delete:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
}

.course-content {
  padding: 1.5rem;
}

.course-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.course-description {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.students-count {
  color: #6b7280;
}

.course-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.course-status.activo {
  background: #dcfce7;
  color: #166534;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #6b7280;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.course-form {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* File upload styles */
.file-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f10101, #850000);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  justify-content: center;
}

.file-upload-label:hover {
  background: red;
  transform: translateY(-1px);
  box-shadow: rgba(0, 0, 0, 0.6);
}

.file-help {
  color: #6b7280;
  font-size: 0.85rem;
  text-align: center;
}

.image-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0;
}

.btn-clear-image {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.btn-clear-image:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: red;
  color: white;
  border: none;
  width: auto;
}

.btn-primary:hover {
  background: red;
  transform: translateY(-1px);
  box-shadow: rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-logout {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}

/* Assignment Styles */
.assignments-section {
  margin-top: 2rem;
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
}

.section-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1.1rem;
}

.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.assignment-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.assignment-header {
  background: #44b64a;
  color: white;
  padding: 1rem;
}

.assignment-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.assignment-course {
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.assignment-content {
  padding: 1.5rem;
}

.student-info {
  margin-bottom: 1rem;
}

.student-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #374151;
}

.assignment-description {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.assignment-description p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-icon {
  font-size: 2rem;
}

.file-name {
  margin: 0;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
}

.file-size {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.btn-download {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-download:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

.assignment-actions {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-delete-assignment {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-delete-assignment:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .assignments-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-bar {
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }
  
  .file-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn:not(.btn-logout) {
    width: 100%;
  }
}
</style>
