<template>
  <div class="student-view">
    <!-- Header -->
    <header class="student-header">
      <div class="header-content">
        <h1>Mis Cursos</h1>
        <div class="header-actions">
          <span class="welcome-text">Bienvenido, {{ userName }}</span>
          <button @click="handleLogout" class="btn btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="student-main">
      <div class="student-container">
        <!-- Tabs Navigation -->
        <div class="tabs-nav">
          <button 
            @click="activeTab = 'available'"
            :class="['tab-btn', { active: activeTab === 'available' }]"
          >
             Cursos Disponibles
          </button>
          <button 
            @click="activeTab = 'enrolled'"
            :class="['tab-btn', { active: activeTab === 'enrolled' }]"
          >
             Mis Cursos ({{ enrolledCourses.length }})
          </button>
        </div>

        <!-- Available Courses Tab -->
        <div v-if="activeTab === 'available'" class="tab-content">
          <div class="section-header">
            <h2>Mira tus cursos disponibles</h2>
          </div>
          
          <div v-if="availableCourses.length" class="courses-grid">
            <div 
              v-for="course in availableCourses" 
              :key="course.id"
              class="course-card"
              @click="viewCourseDetail(course.id)"
            >
              <div class="course-image">
                <img :src="course.image || defaultImage" :alt="course.title">
                <div v-if="course.videoUrl" class="video-badge">
                  📹 Video
                </div>
              </div>
              <div class="course-content">
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ truncateText(course.description, 100) }}</p>
                <div class="course-footer">
                  <button 
                    @click.stop="quickEnroll(course.id)"
                    class="btn btn-enroll"
                  >
                    📚 Inscribirse
                  </button>
                  <span class="course-level">🎓 Básico</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>No hay cursos disponibles</h3>
            <p>Vuelve pronto para ver nuevos cursos</p>
          </div>
        </div>

        <!-- Enrolled Courses Tab -->
        <div v-if="activeTab === 'enrolled'" class="tab-content">
          <div class="section-header">
            <h2>Mis Cursos Inscritos</h2> 

          </div>

          <div v-if="enrolledCourses.length" class="courses-grid">
            <div 
              v-for="course in enrolledCourses" 
              :key="course.id"
              class="course-card enrolled"
              @click="viewCourseDetail(course.id)"
            >
              <div class="course-image">
                <img :src="course.image || defaultImage" :alt="course.title">
                <div class="enrolled-badge">
                  ✅ Inscrito
                </div>
                <div v-if="course.videoUrl" class="video-badge">
                  📹 Video
                </div>
              </div>
              <div class="course-content">
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ truncateText(course.description, 100) }}</p>
                <div class="course-footer">
                  <button 
                    @click.stop="openUploadModal(course)"
                    class="btn btn-upload"
                  >
                    📄 Subir Tarea
                  </button>
                  <button 
                    @click.stop="unenroll(course.id)"
                    class="btn btn-unenroll"
                  >
                    ❌ Desinscribirse
                  </button>
                  <div class="progress-indicator">
                    <span class="progress-text">En progreso</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🎯</div>
            <h3>No tienes cursos inscritos</h3>
            <p>Explora los cursos disponibles y comienza tu aprendizaje</p>
            <button @click="activeTab = 'available'" class="btn btn-primary">
              Ver Cursos Disponibles
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Upload Assignment Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📚 Subir Nueva Tarea</h2>
          <p class="course-subtitle">Curso: {{ selectedCourse?.title }}</p>
          <button @click="closeUploadModal" class="btn-close">×</button>
        </div>
        
        <form @submit.prevent="uploadAssignment" class="assignment-form">
          <!-- Título de la tarea -->
          <div class="form-group">
            <label for="assignment-title">Título de la Tarea</label>
            <input 
              id="assignment-title"
              v-model="assignmentForm.title" 
              type="text" 
              required
              placeholder="Ej: Ejercicio de JavaScript - Funciones"
              maxlength="100"
            >
          </div>

          <!-- Descripción -->
          <div class="form-group">
            <label for="assignment-description">Descripción de la tarea (Opcional)</label>
            <textarea 
              id="assignment-description"
              v-model="assignmentForm.description" 
              rows="3"
              placeholder="Describe brevemente el contenido de tu tarea, metodología utilizada, conclusiones..."
              maxlength="500"
            ></textarea>
            <small class="char-count">Caracteres: {{ assignmentForm.description?.length || 0 }}/500</small>
          </div>

          <!-- Archivo PDF -->
          <div class="form-group">
            <label for="assignment-file">Archivo de la tarea</label>
            <div class="file-upload-section">
              <input 
                id="assignment-file"
                type="file" 
                accept=".pdf"
                @change="handleFileUpload"
                class="file-input"
                ref="fileInput"
                required
              >
              <label for="assignment-file" class="file-upload-label">
                📄 Seleccionar archivo PDF
              </label>
              <small class="file-help">Solo archivos PDF (máx. 10MB)</small>
              
              <!-- Vista previa del archivo -->
              <div v-if="selectedFile" class="file-preview">
                <div class="file-info">
                  <span class="file-icon">📄</span>
                  <div>
                    <p class="file-name">{{ selectedFile.name }}</p>
                    <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button type="button" @click="clearFile" class="btn-clear-file">
                  ❌ Quitar archivo
                </button>
              </div>
            </div>
          </div>

          <!-- Progress indicator -->
          <div v-if="isUploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p>Subiendo archivo...</p>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" @click="closeUploadModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="!selectedFile || isUploading"
            >
              {{ isUploading ? 'Subiendo...' : 'Subir Tarea' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerUsuarioActual, logout } from '@/services/auth'

const router = useRouter()

// Reactive data
const activeTab = ref('available')
const allCourses = ref([])
const userEnrollments = ref([])
const user = ref(null)

// Assignment upload data
const showUploadModal = ref(false)
const selectedCourse = ref(null)
const selectedFile = ref(null)
const fileInput = ref(null)
const isUploading = ref(false)
const isDragOver = ref(false)
const assignmentForm = ref({
  title: '',
  description: ''
})

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjM2NmYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q3Vyc288L3RleHQ+PC9zdmc+'

// Computed properties
const userName = computed(() => {
  return user.value?.nombre || 'Estudiante'
})

const availableCourses = computed(() => {
  return allCourses.value.filter(course => 
    !userEnrollments.value.includes(course.id)
  )
})

const enrolledCourses = computed(() => {
  return allCourses.value.filter(course => 
    userEnrollments.value.includes(course.id)
  )
})

// Assignment upload functions
const openUploadModal = (course) => {
  selectedCourse.value = course
  assignmentForm.value = {
    title: '',
    description: ''
  }
  selectedFile.value = null
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedCourse.value = null
  selectedFile.value = null
  assignmentForm.value = {
    title: '',
    description: ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar que sea PDF
  if (file.type !== 'application/pdf') {
    alert('Por favor selecciona solo archivos PDF')
    return
  }

  // Validar tamaño (10MB máximo)
  if (file.size > 10 * 1024 * 1024) {
    alert('El archivo es muy grande. El tamaño máximo es 10MB.')
    return
  }

  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Drag and Drop handlers
const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    
    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      alert('Por favor arrastra solo archivos PDF')
      return
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es muy grande. El tamaño máximo es 10MB.')
      return
    }

    selectedFile.value = file
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadAssignment = async () => {
  if (!selectedFile.value || !selectedCourse.value || !user.value || isUploading.value) return

  isUploading.value = true

  try {
    // Convertir archivo a base64 para almacenar localmente
    const base64File = await fileToBase64(selectedFile.value)
    
    const assignment = {
      id: Date.now(),
      studentId: user.value.correo,
      studentName: user.value.nombre,
      courseId: selectedCourse.value.id,
      courseName: selectedCourse.value.title,
      title: assignmentForm.value.title,
      description: assignmentForm.value.description,
      fileName: selectedFile.value.name,
      fileSize: selectedFile.value.size,
      fileData: base64File,
      uploadDate: new Date().toISOString(),
      status: 'submitted'
    }

    // Simular delay de subida para mejor UX
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Guardar en localStorage
    const existingAssignments = JSON.parse(localStorage.getItem('assignments')) || []
    existingAssignments.push(assignment)
    localStorage.setItem('assignments', JSON.stringify(existingAssignments))

    alert('✅ ¡Tarea subida exitosamente!')
    closeUploadModal()
  } catch (error) {
    console.error('Error uploading assignment:', error)
    alert('❌ Error al subir la tarea. Inténtalo de nuevo.')
  } finally {
    isUploading.value = false
  }
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Methods
const loadCourses = () => {
  const courses = JSON.parse(localStorage.getItem('cursos')) || []
  allCourses.value = courses
}

const loadUser = () => {
  user.value = obtenerUsuarioActual()
  if (user.value) {
    loadEnrollments()
  }
}

const loadEnrollments = () => {
  if (!user.value) return
  const enrollments = JSON.parse(localStorage.getItem(`inscripciones_${user.value.correo}`)) || []
  userEnrollments.value = enrollments
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

const viewCourseDetail = (courseId) => {
  router.push(`/curso/${courseId}`)
}

const quickEnroll = (courseId) => {
  if (!user.value) {
    alert('Debes iniciar sesión para inscribirte')
    return
  }

  const enrollments = [...userEnrollments.value]
  if (!enrollments.includes(courseId)) {
    enrollments.push(courseId)
    localStorage.setItem(`inscripciones_${user.value.correo}`, JSON.stringify(enrollments))
    userEnrollments.value = enrollments
    
    const course = allCourses.value.find(c => c.id === courseId)
    alert(`¡Te has inscrito exitosamente al curso "${course?.title}"!`)
  }
}

const unenroll = (courseId) => {
  const course = allCourses.value.find(c => c.id === courseId)
  
  if (confirm(`¿Estás seguro de que quieres desinscribirte del curso "${course?.title}"?`)) {
    const enrollments = userEnrollments.value.filter(id => id !== courseId)
    localStorage.setItem(`inscripciones_${user.value.correo}`, JSON.stringify(enrollments))
    userEnrollments.value = enrollments
    alert('Te has desinscrito del curso exitosamente')
  }
}

const handleLogout = async () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    await logout()
    router.push('/login')
  }
}

// Initialize
onMounted(() => {
  loadUser()
  loadCourses()
  
  // Check if user is actually a student
  if (user.value && user.value.rol !== 'estudiante') {
    router.push('/admin')
  }
})
</script>

<style scoped>
.student-view {
  min-height: 100vh;
  background: rgb(227, 227, 227);
}

.student-header {
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

.student-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  color: #ffffff;
  font-weight: 500;
}

.student-main {
  padding: 2rem 0;
}

.student-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a5568;
}

.tab-btn.active {
  background: green;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.tab-btn:hover:not(.active) {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.section-header h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  
}

.section-header p {
  margin: 0;
  color: #4a5568;
  font-size: 1.1rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
  border-color: #10b981;
}

.course-card.enrolled {
  border-color: #10b981;
}

.course-card.enrolled:hover {
  border-color: #059669;
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
  transform: scale(1.1);
}

.video-badge, .enrolled-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.video-badge {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.enrolled-badge {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.course-content {
  padding: 1.5rem;
}

.course-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.course-description {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.95rem;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.course-level {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.progress-indicator {
  text-align: right;
}

.progress-text {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
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
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 1.1rem;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-enroll {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-enroll:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.btn-unenroll {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
}

.btn-unenroll:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
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

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tabs-nav {
    flex-direction: column;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .course-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .section-header {
    padding: 1.5rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .student-container {
    padding: 0 0.5rem;
  }
}

.btn-upload {
  background: green;
  color: white;
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.btn-upload:hover {
  background: green;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  position: relative;
}

.modal-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.course-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
  font-weight: 500;
  border: 1px solid #d1d5db;
}

.btn-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.assignment-form {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.char-count {
  display: block;
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.85rem;
  text-align: right;
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
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: center;
  justify-content: center;
  border: none;
  font-size: 0.95rem;
}

.file-upload-label:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.file-help {
  color: #6b7280;
  font-size: 0.85rem;
  text-align: center;
}

.file-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #10b981;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  font-size: 2rem;
  color: #ef4444;
}

.file-name {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-weight: 600;
  word-break: break-all;
  font-size: 0.95rem;
}

.file-size {
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.btn-clear-file {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-clear-file:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* Upload Progress */
.upload-progress {
  margin: 1.5rem 0;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  width: 100%;
  animation: progressAnimation 2s ease-in-out infinite;
}

@keyframes progressAnimation {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.upload-progress p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tabs-nav {
    flex-direction: column;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .course-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .section-header {
    padding: 1.5rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-header {
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .assignment-form {
    padding: 0 1rem 1rem 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .student-container {
    padding: 0 0.5rem;
  }
  
  .course-content {
    padding: 1rem;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
